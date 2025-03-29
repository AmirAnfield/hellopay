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
    '/api/auth/register'
  ];
  
  // Vérifier si le chemin actuel est public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith('/api/auth') || path.includes('.')
  );

  // Définir les chemins protégés (nécessitant authentification)
  const protectedPaths = ['/dashboard', '/payslip', '/profile', '/payslips'];

  // Chemins accessibles avec connexion mais sans vérification d'email
  const emailVerificationExemptPaths = [
    '/auth/verify/pending',
    '/auth/verify/send',
    '/profile/settings',
    '/api/auth/verify/send',
  ];

  // Récupérer le token de la session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Si le chemin demandé est protégé et qu'aucun token n'existe, rediriger vers login
  const isProtectedPath = protectedPaths.some(protectedPath => path.startsWith(protectedPath));
  
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
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
  if ((path.startsWith('/auth/login') || path.startsWith('/auth/register')) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
} 