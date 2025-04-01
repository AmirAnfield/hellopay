import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { admin } from '@/lib/firebase-admin';

// Durée d'expiration du cookie de session (1 semaine)
const SESSION_EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes

/**
 * POST /api/auth/session - Créer une session utilisateur
 * Attend un token ID Firebase dans le corps de la requête
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      );
    }

    // Vérifier et décoder le token
    const decodedToken = await getAuth(admin).verifyIdToken(idToken);
    const { uid, email, email_verified } = decodedToken;

    // Créer un cookie de session sécurisé
    const sessionCookie = await getAuth(admin).createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRATION_TIME
    });

    // Configurer le cookie
    const cookieStore = cookies();
    cookieStore.set('session', sessionCookie, {
      maxAge: SESSION_EXPIRATION_TIME / 1000, // convertir en secondes
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax'
    });

    return NextResponse.json(
      { success: true, uid, email, emailVerified: email_verified },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur de création de session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session' },
      { status: 401 }
    );
  }
}

/**
 * GET /api/auth/session - Vérifier une session utilisateur
 */
export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Vérifier le cookie de session
    const decodedClaims = await getAuth(admin).verifySessionCookie(sessionCookie, true);
    
    return NextResponse.json({
      authenticated: true,
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        emailVerified: decodedClaims.email_verified,
        displayName: decodedClaims.name
      }
    });
  } catch (error) {
    console.error('Erreur de vérification de session:', error);
    
    // Supprimer le cookie invalide
    const cookieStore = cookies();
    cookieStore.delete('session');
    
    return NextResponse.json(
      { authenticated: false, error: 'Session invalide ou expirée' },
      { status: 401 }
    );
  }
} 