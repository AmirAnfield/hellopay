'use client';

import React from 'react';
import { Toaster } from "sonner";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Impossible d'exporter des métadonnées dans un composant 'use client'
// Les métadonnées doivent être dans un composant serveur

export default function ContractCreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Header minimal avec juste le bouton retour */}
      <header className="sticky top-0 z-40 w-full border-b bg-background p-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/documents">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </header>
      
      {/* Contenu principal */}
      {children}
      
      <Toaster richColors position="top-right" />
    </>
  );
} 