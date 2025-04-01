import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { FirebaseError } from 'firebase-admin';

// Définir les chemins publics (accessibles sans connexion)
const publicPaths = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/error',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify',
  '/auth/verify-email',
  '/auth/verify/success',
  '/auth/verify/pending',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify',
  '/api/auth/session',
  '/tarifs',
  '/contact',
  '/mentions-legales',
  '/confidentialite',
  '/faq'
];

// Définir les chemins protégés (nécessitant authentification)
const protectedPaths = [
  '/dashboard', 
  '/payslip', 
  '/profile', 
  '/payslips',
  '/api/payslips',
  '/api/employees',
  '/api/companies',
  '/api/contracts',
  '/certificates'
];

// Chemins exemptés de la vérification d'email
const emailVerificationExemptPaths = [
  '/auth/verify-email',
  '/auth/verify/pending',
  '/auth/verify/send',
  '/profile/settings',
  '/api/auth/verify/send',
  '/api/auth/send-verification',
  '/api/auth/logout'
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Vérifier si le chemin actuel est public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith('/api/auth') || 
    path.includes('.') ||
    path.startsWith('/_next')
  );

  // Vérifier si le chemin est protégé
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  );

  // Vérifier si le chemin est exempté de la vérification d'email
  const isEmailVerificationExempt = emailVerificationExemptPaths.some(exemptPath => 
    path.startsWith(exemptPath)
  );

  // Si c'est un chemin public, on laisse passer
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Récupérer le cookie de session
  const sessionCookie = request.cookies.get('session')?.value;

  // Si le chemin demandé est protégé et qu'aucun cookie n'existe, rediriger vers login
  if (isProtectedPath && !sessionCookie) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Si un cookie de session existe, vérifier sa validité
  if (sessionCookie) {
    try {
      // Vérifier le cookie de session avec Firebase Admin
      const decodedClaims = await auth.verifySessionCookie(sessionCookie);
      
      // Vérifier si l'utilisateur a vérifié son email
      if (!decodedClaims.email_verified && !isEmailVerificationExempt) {
        // Rediriger vers la page de vérification d'email
        return NextResponse.redirect(new URL('/auth/verify-email', request.url));
      }
      
      // Vérifier les rôles pour les chemins admin
      if (path.startsWith('/admin')) {
        const customClaims = decodedClaims.customClaims || {};
        if (customClaims.role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
      
      // Si l'utilisateur est connecté et tente d'accéder à une page auth, rediriger vers dashboard
      if (!isProtectedPath && (path.startsWith('/auth/login') || path.startsWith('/auth/register'))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error: unknown) {
      console.error('Erreur de validation de session:', 
        error instanceof Error ? error.message : 'Erreur inconnue');
      // Cookie invalide ou expiré, le supprimer
      const response = NextResponse.next();
      response.cookies.delete('session');
      
      // Rediriger vers login si on est sur un chemin protégé
      if (isProtectedPath) {
        const redirectUrl = new URL('/auth/login', request.url);
        redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }
      
      return response;
    }
  }

  // Préparer la réponse avec les en-têtes de sécurité
  const response = NextResponse.next();
  
  // Ajout d'en-têtes de sécurité de base
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Politique de référencement
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  // Ajuster selon les besoins de l'application et pour inclure les domaines Firebase
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://js.stripe.com https://apis.google.com https://*.firebaseio.com",
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
    "img-src 'self' data: https://*.stripe.com https://*.firebaseio.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.stripe.com https://*.firebaseio.com https://*.googleapis.com",
    "frame-src https://js.stripe.com https://*.firebaseapp.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  
  // N'activer CSP qu'en production pour éviter les problèmes en développement
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', cspDirectives.join('; '));
  }
  
  return response;
} 