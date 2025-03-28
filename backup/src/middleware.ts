import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Création du client Supabase pour le middleware
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Vérification de la session
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  // URLs publiques (ne nécessitant pas d'authentification)
  const publicUrls = ['/login', '/register', '/', '/about']
  const isPublicUrl = publicUrls.some(url => req.nextUrl.pathname.startsWith(url))
  
  // Redirection vers la page de connexion si l'utilisateur n'est pas authentifié
  // et essaie d'accéder à une page protégée
  if (!session && !isPublicUrl) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Redirection vers le tableau de bord si l'utilisateur est déjà authentifié
  // et tente d'accéder à la page de connexion ou d'inscription
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  return res
}

// Définir sur quelles routes le middleware sera appliqué
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 