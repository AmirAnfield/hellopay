'use client';

import React from 'react';
import { Toaster } from "sonner";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Check } from 'lucide-react';

// Impossible d'exporter des métadonnées dans un composant 'use client'
// Les métadonnées doivent être dans un composant serveur

export default function ContractCreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Header avec tous les boutons d'action et texte à droite */}
      <header className="sticky top-0 z-40 w-full border-b bg-background py-3 px-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild title="Retour">
              <Link href="/dashboard/documents">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button variant="ghost" size="sm" form="contract-form" type="button" title="Sauvegarder">
              <Save className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              form="contract-form" 
              type="submit"
              title="Valider"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-right">
            <h1 className="text-lg font-semibold leading-tight">Créez votre</h1>
            <p className="text-sm text-muted-foreground">contrat de travail</p>
          </div>
        </div>
      </header>
      
      {/* Contenu principal */}
      {children}
      
      <Toaster richColors position="top-right" />
    </>
  );
} 