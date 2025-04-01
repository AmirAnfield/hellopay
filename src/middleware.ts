import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionCookie } from '@/lib/firebase-admin-node';

// Configuration: routes qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/auth/verify',
  '/api/auth/session',
  '/api/auth/logout',
  '/api/auth/verify',
  '/api/auth',
];

// Ressources statiques à ignorer
const STATIC_RESOURCES = [
  '/_next',
  '/favicon.ico',
  '/images',
  '/fonts',
  '/static',
];

/**
 * Journalise le processus d'authentification
 */
const logAuthProcess = (message: string, request: NextRequest, error?: any) => {
  const timestamp = new Date().toISOString();
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get('session')?.value ? 'Présent' : 'Absent';
  
  if (error) {
    console.error(`🔒 [${timestamp}] Auth Middleware - ${message} - Chemin: ${path}, Cookie: ${sessionCookie}`);
    console.error(`   Erreur: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    console.error(`   Stack: ${error instanceof Error && error.stack ? error.stack : 'Non disponible'}`);
  } else {
    console.log(`🔒 [${timestamp}] Auth Middleware - ${message} - Chemin: ${path}, Cookie: ${sessionCookie}`);
  }
};

/**
 * Middleware Next.js pour gérer l'authentification
 * Vérifie les sessions et protège les routes qui nécessitent une authentification
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  try {
    // Ignorer les ressources statiques
    if (STATIC_RESOURCES.some(resource => pathname.startsWith(resource))) {
      return NextResponse.next();
    }
    
    // Autoriser l'accès aux routes publiques
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
      logAuthProcess("Accès à une route publique, autorisation accordée", request);
      return NextResponse.next();
    }

    // Récupérer le cookie de session
    const sessionCookie = request.cookies.get('session')?.value;
    
    // Si pas de cookie de session, rediriger vers la page de connexion
    if (!sessionCookie) {
      logAuthProcess("Cookie de session absent, redirection vers login", request);
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', encodeURIComponent(pathname));
      return NextResponse.redirect(loginUrl);
    }

    // Vérifier la validité du cookie de session avec Firebase Admin
    logAuthProcess("Vérification du cookie de session", request);
    const decodedClaim = await verifySessionCookie(sessionCookie);
    
    // Si null est retourné par verifySessionCookie, la session est invalide
    if (!decodedClaim) {
      logAuthProcess("Session invalide ou expirée", request);
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', encodeURIComponent(pathname));
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('session');
      return response;
    }
    
    // Session valide, continuer
    logAuthProcess(`Session valide pour l'utilisateur ${decodedClaim.uid}`, request);
    return NextResponse.next();
  
  } catch (error) {
    // Gérer toutes les erreurs imprévues
    logAuthProcess("Erreur critique dans le middleware d'authentification", request, error);
    
    // Dans un environnement de production, rediriger vers la page de connexion
    // En développement, on pourrait laisser passer pour faciliter le débogage
    if (process.env.NODE_ENV === 'production') {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', encodeURIComponent(pathname));
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('session');
      return response;
    } else {
      console.warn("Mode développement: autorisation accordée malgré l'erreur");
      return NextResponse.next();
    }
  }
}

export const config = {
  matcher: ['/((?!api/public|_next/static|_next/image|_next/webpack|favicon.ico).*)'],
} 