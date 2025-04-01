"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingScreen from "@/components/ui/loading-screen";

interface AuthGuardProps {
  children: ReactNode;
  requireVerifiedEmail?: boolean;
}

/**
 * Composant de garde d'authentification pour protéger les routes
 * 
 * Utilisation:
 * <AuthGuard>
 *   <ContenuProtégé />
 * </AuthGuard>
 */
export default function AuthGuard({ 
  children, 
  requireVerifiedEmail = false 
}: AuthGuardProps) {
  const { user, loading, isEmailVerified } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Ne rien faire pendant le chargement
    if (loading) return;

    // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
    if (!user) {
      // Enregistrer l'URL actuelle pour rediriger après connexion
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    // Si la vérification d'email est requise et que l'email n'est pas vérifié
    if (requireVerifiedEmail && !isEmailVerified) {
      router.push('/auth/verify');
    }
  }, [user, loading, requireVerifiedEmail, isEmailVerified, router, pathname]);

  // Afficher l'indicateur de chargement pendant la vérification
  if (loading) {
    return <LoadingScreen message="Vérification de l'authentification..." />;
  }

  // Si l'utilisateur n'est pas connecté, ne rien afficher (redirection en cours)
  if (!user) {
    return <LoadingScreen message="Redirection..." />;
  }

  // Si la vérification d'email est requise et que l'email n'est pas vérifié
  if (requireVerifiedEmail && !isEmailVerified) {
    return <LoadingScreen message="Vérification de l'email requise, redirection..." />;
  }

  // Utilisateur authentifié, afficher les enfants
  return <>{children}</>;
} 