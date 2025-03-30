import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Définir les chemins publics (accessibles sans connexion)
  const publicPaths = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/error',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify',
    '/auth/verify/success',
    '/auth/verify/pending',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/verify',
    '/tarifs',
    '/contact',
    '/mentions-legales',
    '/confidentialite',
    '/faq'
  ];
  
  // Vérifier si le chemin actuel est public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith('/api/auth') || 
    path.includes('.') ||
    path.startsWith('/_next')
  );

  // Définir les chemins protégés (nécessitant authentification)
  const protectedPaths = [
    '/dashboard', 
    '/payslip', 
    '/profile', 
    '/payslips',
    '/api/payslips',
    '/api/employees',
    '/api/companies',
    '/api/contracts'
  ];

  // Chemins accessibles avec connexion mais sans vérification d'email
  const emailVerificationExemptPaths = [
    '/auth/verify/pending',
    '/auth/verify/send',
    '/profile/settings',
    '/api/auth/verify/send',
    '/api/auth/send-verification'
  ];

  // Récupérer le token de la session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Si le chemin demandé est protégé et qu'aucun token n'existe, rediriger vers login
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  );
  
  if (isProtectedPath && !token) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Vérifier si l'utilisateur a vérifié son email
  if (token && !token.emailVerified && isProtectedPath) {
    // Vérifier si le chemin est exempté de la vérification d'email
    const isExempt = emailVerificationExemptPaths.some(exemptPath => 
      path.startsWith(exemptPath)
    );
    
    if (!isExempt) {
      return NextResponse.redirect(new URL('/auth/verify/pending', request.url));
    }
  }

  // Si l'utilisateur est connecté et tente d'accéder à une page auth, rediriger vers dashboard
  if (token && !isProtectedPath && (path.startsWith('/auth/login') || path.startsWith('/auth/register'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si le chemin est public ou que l'utilisateur est authentifié correctement, autoriser
  if (isPublicPath || (isProtectedPath && token)) {
    const response = NextResponse.next();
    
    // Ajout d'en-têtes de sécurité
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    return response;
  }

  return NextResponse.next();
} 