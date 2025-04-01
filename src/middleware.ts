import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Configuration: routes qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/auth/verify',
  '/auth/forgot-password',
  '/test-firebase',
  '/workflow-test',
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
const logAuthProcess = (message: string, request: NextRequest, error?: unknown) => {
  const timestamp = new Date().toISOString();
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get('session')?.value ? 'Présent' : 'Absent';
  
  if (error) {
    console.error(`🔒 [${timestamp}] Auth Middleware - ${message} - Chemin: ${path}, Cookie: ${sessionCookie}`);
    console.error(`   Erreur: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
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
    if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route))) {
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

    // Session valide, continuer
    logAuthProcess(`Session validée`, request);
    return NextResponse.next();
  
  } catch (error) {
    // Gérer toutes les erreurs imprévues
    logAuthProcess("Erreur critique dans le middleware d'authentification", request, error);
    
    // En mode développement, on autorise malgré l'erreur
    if (process.env.NODE_ENV === 'development') {
      console.warn("Mode développement: autorisation accordée malgré l'erreur");
      return NextResponse.next();
    } else {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', encodeURIComponent(pathname));
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('session');
      return response;
    }
  }
}

export const config = {
  matcher: ['/((?!api/public|_next/static|_next/image|_next/webpack|favicon.ico).*)'],
} 