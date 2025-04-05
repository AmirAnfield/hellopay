import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie, verifyIdToken } from '@/lib/firebase/admin';

// Configuration de la route pour être dynamique
export const dynamic = "force-dynamic";

/**
 * Route pour créer une session et un cookie à partir d'un token d'ID Firebase
 * @param request Requête avec le token d'ID dans le corps
 * @returns Réponse avec le cookie de session
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier si la requête est valide
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('Erreur de parsing JSON:', e);
      return NextResponse.json(
        { error: 'Format de requête invalide' },
        { status: 400 }
      );
    }
    
    const { idToken } = body;
    
    if (!idToken) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      );
    }
    
    // Vérifier le token d'ID
    try {
      await verifyIdToken(idToken);
    } catch (e) {
      console.error('Erreur de validation du token:', e);
      return NextResponse.json(
        { error: 'Token invalide', details: e instanceof Error ? e.message : 'Erreur inconnue' },
        { status: 401 }
      );
    }
    
    // Créer un cookie de session (5 jours par défaut)
    const expiresIn = 5 * 24 * 60 * 60 * 1000; // 5 jours en millisecondes
    const sessionCookie = await createSessionCookie(idToken, expiresIn);
    
    // Configuration du cookie de session
    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict' as const
    };
    
    // Créer la réponse avec le cookie
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );
    
    // Ajouter le cookie à la réponse
    response.cookies.set(options);
    
    return response;
  } catch (error) {
    console.error('Erreur de création de session:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur d\'authentification', 
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

/**
 * Route pour vérifier une session existante
 * @param request Requête avec le cookie de session
 * @returns État de la session et informations utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }
    
    // Vérifier le cookie de session
    const decodedClaims = await verifyIdToken(sessionCookie);
    
    return NextResponse.json({
      authenticated: true,
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        emailVerified: decodedClaims.email_verified,
        displayName: decodedClaims.name,
        photoURL: decodedClaims.picture
      }
    });
  } catch (error) {
    console.error('Erreur de vérification de session:', error);
    
    return NextResponse.json(
      { authenticated: false, error: 'Session invalide' },
      { status: 200 }
    );
  }
} 