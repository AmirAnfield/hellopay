'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  // Journalisation de l'erreur côté client
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <div className="max-w-md space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-red-100 p-4">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
              
              <h1 className="text-3xl font-bold">Erreur critique</h1>
              
              <p className="text-gray-500">
                Une erreur inattendue est survenue dans l&apos;application. Nous nous excusons pour ce désagrément.
              </p>
            </div>
            
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0 justify-center">
              <Button
                onClick={reset}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </Button>
              <Button
                variant="outline"
                asChild
              >
                <Link href="/">
                  Retour à l&apos;accueil
                </Link>
              </Button>
            </div>

            <div className="text-sm text-gray-500">
              <p>
                Si le problème persiste, veuillez contacter notre support technique.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 