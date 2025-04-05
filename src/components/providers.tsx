"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme-provider";
import { NotificationProvider } from "@/components/ui/notification-bar";

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
        <NotificationProvider>
          <Toaster position="top-right" closeButton richColors />
          {children}
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 