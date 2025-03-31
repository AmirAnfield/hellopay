'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { getStorage, ref, listAll } from 'firebase/storage';
import { auth, appCheck } from '@/lib/firebase';

export default function TestAppCheckPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const testAppCheck = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Vérifier si l'AppCheck est initialisé
      if (!appCheck && typeof window !== 'undefined') {
        setResult({
          success: false,
          message: "App Check n'est pas initialisé. La requête risque d'échouer."
        });
      }

      // Vérifier si l'utilisateur est connecté
      if (!user) {
        setResult({
          success: false,
          message: "Utilisateur non authentifié. Veuillez vous connecter d'abord."
        });
        setIsLoading(false);
        return;
      }

      // Tenter d'accéder au stockage
      const storage = getStorage();
      const storageRef = ref(storage, `users/${user.uid}`);
      
      // Essayer de lister les fichiers
      await listAll(storageRef);
      
      setResult({
        success: true,
        message: "La requête a réussi! App Check fonctionne correctement."
      });
    } catch (error) {
      console.error('Erreur lors du test App Check:', error);
      setResult({
        success: false,
        message: `Erreur: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test Firebase App Check</CardTitle>
          <CardDescription>
            Cette page vérifie si votre intégration d'App Check fonctionne correctement
            en tentant d'accéder au stockage Firebase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-800 text-sm">
              <strong>Note:</strong> Pour que ce test fonctionne, vous devez être connecté
              et App Check doit être correctement configuré dans Firebase Console.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-xs">
              <Button
                onClick={testAppCheck}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  'Tester App Check'
                )}
              </Button>
            </div>

            {result && (
              <div className={`mt-4 p-4 border rounded-md w-full ${
                result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                      {result.success ? 'Succès!' : 'Échec'}
                    </p>
                    <p className="text-sm mt-1">
                      {result.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4 mt-6">
            <h3 className="font-medium mb-2">Statut actuel</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="font-medium">App Check initialisé:</span>
                {typeof appCheck !== 'undefined' && appCheck !== null ? (
                  <span className="text-green-600">Oui</span>
                ) : (
                  <span className="text-red-600">Non</span>
                )}
              </li>
              <li className="flex items-center gap-2">
                <span className="font-medium">Utilisateur connecté:</span>
                {user ? (
                  <span className="text-green-600">Oui ({user.email})</span>
                ) : (
                  <span className="text-amber-600">Non</span>
                )}
              </li>
              <li className="flex items-center gap-2">
                <span className="font-medium">Mode développement:</span>
                <span className="text-blue-600">
                  {process.env.NODE_ENV === 'development' ? 'Oui (jeton de débogage actif)' : 'Non'}
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 