import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { admin } from '@/lib/firebase-admin';

// Routes accessibles sans authentification
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify',
  '/api/auth/session',
  '/api/auth/logout'
];

// Vérifier si une route est publique
const isPublicRoute = (path: string) => {
  return publicRoutes.some(route => path === route || path.startsWith(`${route}/`));
};

// Vérifier si une route est une ressource statique
const isStaticAsset = (path: string) => {
  return path.startsWith('/_next/') || 
         path.includes('/favicon.') || 
         path.endsWith('.svg') || 
         path.endsWith('.png') || 
         path.endsWith('.jpg') || 
         path.endsWith('.jpeg') || 
         path.endsWith('.ico');
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ne pas appliquer le middleware aux ressources statiques
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }
  
  // Pour les routes publiques, pas besoin de vérifier l'authentification
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  // Récupérer le cookie de session
  const sessionCookie = request.cookies.get('session')?.value;
  
  // Si pas de cookie de session, rediriger vers la page de connexion
  if (!sessionCookie) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }
  
  try {
    // Vérifier le cookie de session avec Firebase Admin
    await getAuth(admin).verifySessionCookie(sessionCookie, true);
    
    // Session valide, permettre l'accès
    return NextResponse.next();
  } catch (error) {
    console.error('Erreur middleware:', error);
    
    // Session invalide, supprimer le cookie et rediriger vers la page de connexion
    const response = NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url)
    );
    
    // Effacer le cookie de session
    response.cookies.delete('session');
    
    return response;
  }
}

// Configurer les routes sur lesquelles le middleware s'applique
export const config = {
  matcher: [
    // Ne pas appliquer aux routes API spécifiques nécessitant un accès public
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 