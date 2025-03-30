'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bug, RefreshCw } from 'lucide-react';
import { AppError } from '@/lib/error-handler';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error | AppError;
  reset: () => void;
}) {
  // Journalisation de l'erreur côté client
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  const isAppError = error instanceof AppError;
  const errorCode = isAppError ? error.code : 'UNKNOWN_ERROR';
  const errorDetails = isAppError ? error.details : null;

  // Déterminer le message d'erreur à afficher
  const getErrorMessage = () => {
    if (error.message) {
      return error.message;
    }

    switch (errorCode) {
      case 'AUTH_REQUIRED':
        return 'Vous devez être connecté pour accéder à cette page.';
      case 'FORBIDDEN':
        return 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource.';
      case 'SERVER_ERROR':
        return 'Une erreur est survenue sur notre serveur.';
      case 'NETWORK_ERROR':
        return 'Problème de connexion au serveur. Vérifiez votre connexion internet.';
      default:
        return 'Une erreur inattendue est survenue.';
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold">Une erreur est survenue</h1>
          
          <p className="text-muted-foreground">
            {getErrorMessage()}
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 rounded-lg border bg-muted p-4 text-left">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                <p className="text-sm font-medium">Détails de l&apos;erreur (mode développement)</p>
              </div>
              <pre className="mt-2 max-h-96 overflow-auto rounded bg-card p-2 text-xs">
                {error.stack || String(error)}
              </pre>
              {errorDetails && (
                <pre className="mt-2 max-h-40 overflow-auto rounded bg-card p-2 text-xs">
                  {typeof errorDetails === 'object' 
                    ? JSON.stringify(errorDetails, null, 2) 
                    : String(errorDetails)}
                </pre>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
          <Button
            onClick={reset}
            className="w-full gap-2 sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            asChild
          >
            <Link href="/">
              Retour à l&apos;accueil
            </Link>
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            Si le problème persiste, veuillez contacter notre support technique ou{' '}
            <Link href="/dashboard/diagnostics" className="text-primary underline-offset-4 hover:underline">
              utiliser notre outil de diagnostic
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
} 