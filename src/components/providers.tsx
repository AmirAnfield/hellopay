"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme-provider";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Composant qui regroupe tous les fournisseurs (providers) globaux
 * nécessaires pour l'application
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <Toaster position="top-right" closeButton richColors />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
} 