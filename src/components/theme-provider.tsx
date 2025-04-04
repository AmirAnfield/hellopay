"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type Attribute = "class" | "data-theme" | "data-mode";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  enableSystem?: boolean;
  enableColorScheme?: boolean;
  disableTransitionOnChange?: boolean;
  themes?: string[];
  attribute?: Attribute | Attribute[];
}

/**
 * Fournisseur de thème amélioré pour gérer les thèmes clair/sombre
 * - Ajoute une transition douce entre les thèmes
 * - Persiste la préférence de l'utilisateur
 * - Respecte la préférence système par défaut
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  // Nécessaire car next-themes fonctionne côté client uniquement
  React.useEffect(() => {
    setMounted(true);

    // Ajouter la classe pour les transitions fluides une fois que le thème est chargé
    const timer = setTimeout(() => {
      document.documentElement.classList.add('theme-transition');
    }, 300);

    return () => {
      clearTimeout(timer);
      document.documentElement.classList.remove('theme-transition');
    };
  }, []);

  // Éviter le clignotement lors du changement de thème en rendant l'application
  // uniquement après que le thème ait été déterminé
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            // Il s'agit d'un script inline qui s'exécute immédiatement pour éviter le scintillement
            try {
              const systemPrefers = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              const userTheme = localStorage.getItem('theme');
              
              const theme = userTheme === 'light' || userTheme === 'dark'
                ? userTheme
                : userTheme === 'system'
                  ? systemPrefers
                  : systemPrefers;
              
              // Appliquer le thème immédiatement
              document.documentElement.classList.toggle('dark', theme === 'dark');
              document.documentElement.style.colorScheme = theme;
            } catch (e) {
              console.error('Erreur lors de l\'application du thème:', e);
            }
          })();
        `,
      }}
    />
  );
} 