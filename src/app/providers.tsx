"use client";

import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  // Nous utilisons NextAuth pour l'authentification
  // Ce composant est maintenu pour compatibilité structurelle
  // mais ne contient plus de logique d'authentification personnalisée
  return <>{children}</>;
} 