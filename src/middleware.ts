import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify',
  '/auth/error',
  '/api/auth',
];

// Routes à protéger (nécessitent une authentification)
const protectedPrefixes = [
  '/dashboard',
  '/api/dashboard',
  '/api/employees',
  '/api/payslips',
  '/api/reports',
  '/api/settings',
];

// Routes qui nécessitent un rôle administrateur
const adminRoutes = [
  '/dashboard/admin',
  '/api/admin',
];

/**
 * Vérifie si une route correspond à un préfixe ou un chemin exact
 */
function matchesPath(path: string, patterns: string[]): boolean {
  return patterns.some(pattern => 
    path === pattern || 
    path.startsWith(`${pattern}/`) || 
    (pattern.endsWith('*') && path.startsWith(pattern.slice(0, -1)))
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ignorer les requêtes de ressources statiques
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/assets') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }
  
  // Pour les routes publiques, pas besoin de vérification
  if (matchesPath(pathname, publicRoutes)) {
    return NextResponse.next();
  }
  
  // Pour les routes protégées, vérifier l'authentification
  if (matchesPath(pathname, protectedPrefixes)) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    // Si pas de token, rediriger vers la page de connexion
    if (!token) {
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      console.log(`Redirection: Accès non autorisé à ${pathname} - redirection vers login`);
      return NextResponse.redirect(url);
    }
    
    // Pour les routes admin, vérifier le rôle
    if (matchesPath(pathname, adminRoutes) && token.role !== 'admin') {
      console.log(`Accès refusé: Tentative d'accès à ${pathname} avec rôle ${token.role}`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // DÉSACTIVÉ POUR LES TESTS UTILISATEURS: Vérification de l'email
    // Si l'email n'est pas vérifié et que ce n'est pas une route d'onboarding
    /*
    if (!token.emailVerified && !pathname.includes('/auth/verify') && !pathname.includes('/dashboard/onboarding')) {
      console.log(`Redirection: Email non vérifié pour ${token.email}`);
      return NextResponse.redirect(new URL('/dashboard/onboarding', request.url));
    }
    */
  }
  
  // Par défaut, laisser passer la requête
  return NextResponse.next();
}

// Configuration pour indiquer sur quels chemins le middleware doit s'exécuter
export const config = {
  matcher: [
    /*
     * Correspond à tous les chemins sauf:
     * 1. Tous les chemins qui commencent par /_next (ressources statiques Next.js)
     * 2. Tous les chemins qui commencent par /static (ressources statiques personnalisées)
     * 3. Tous les chemins avec une extension (.png, .jpg, etc.)
     */
    '/((?!_next|static|.*\\.).)*',
    '/dashboard/:path*',
    '/api/:path*',
  ],
}; 