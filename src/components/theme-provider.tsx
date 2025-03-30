"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  enableSystem?: boolean;
  enableColorScheme?: boolean;
  disableTransitionOnChange?: boolean;
  themes?: string[];
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
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