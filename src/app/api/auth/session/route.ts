import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { admin } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { createSessionCookie, verifyIdToken, verifySessionCookie } from '@/lib/firebase-admin-node';

// Durée d'expiration du cookie de session (1 semaine)
const SESSION_EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes

/**
 * POST /api/auth/session - Créer une session utilisateur
 * Attend un token ID Firebase dans le corps de la requête
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'Token d\'identité manquant' },
        { status: 400 }
      );
    }

    try {
      // Vérifier le token
      await verifyIdToken(idToken);
      
      // Créer un cookie de session (5 jours)
      const expiresIn = 60 * 60 * 24 * 5 * 1000;
      const sessionCookie = await createSessionCookie(idToken, expiresIn);

      // Configurer le cookie HTTP-only avec expiration
      const cookiesStore = cookies();
      const options = {
        name: 'session',
        value: sessionCookie,
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax' as const,
      };

      // Définir le cookie
      cookiesStore.set(options);

      return NextResponse.json({ status: 'success' });
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      return NextResponse.json(
        { error: 'Token d\'identité non valide' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la création de la session:', error);
    return NextResponse.json(
      { error: 'Erreur de serveur interne' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/session - Vérifier une session utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    const cookiesStore = cookies();
    const sessionCookie = cookiesStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { 
          error: 'Non authentifié',
          authenticated: false 
        },
        { status: 401 }
      );
    }

    try {
      // Vérifier la validité du cookie de session
      const decodedClaims = await verifySessionCookie(sessionCookie);
      
      // Renvoyer les informations utilisateur
      return NextResponse.json({
        authenticated: true,
        user: {
          uid: decodedClaims.uid,
          email: decodedClaims.email,
          emailVerified: decodedClaims.email_verified,
          displayName: decodedClaims.name,
          photoURL: decodedClaims.picture,
        }
      });
    } catch (error) {
      console.error('Session invalide:', error);
      
      // Supprimer le cookie invalide
      cookiesStore.delete('session');
      
      return NextResponse.json(
        { error: 'Session invalide', authenticated: false },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return NextResponse.json(
      { error: 'Erreur de serveur interne', authenticated: false },
      { status: 500 }
    );
  }
} 