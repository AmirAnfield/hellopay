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
    '/api/auth/register'
  ];
  
  // Vérifier si le chemin actuel est public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith('/api/auth') || path.includes('.')
  );

  // Définir les chemins protégés (nécessitant authentification)
  const protectedPaths = ['/dashboard', '/payslip', '/profile', '/payslips'];

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

  // Si l'utilisateur est connecté et tente d'accéder à une page auth, rediriger vers dashboard
  if ((path.startsWith('/auth/login') || path.startsWith('/auth/register')) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
} 