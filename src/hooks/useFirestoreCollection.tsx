import { useState, useEffect } from 'react';
import { subscribeToCollection, QueryOptions } from '@/services/firestore-service';

/**
 * Hook pour récupérer et observer une collection Firestore en temps réel
 * 
 * @param collectionPath Chemin de la collection Firestore
 * @param options Options de requête (filtres, tri, limite)
 * @returns État de chargement, erreurs et données de la collection
 */
export function useFirestoreCollection<T>(
  collectionPath: string, 
  options: QueryOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // S'abonner aux changements de la collection
      const unsubscribe = subscribeToCollection<T>(
        collectionPath,
        options,
        (newData) => {
          setData(newData);
          setLoading(false);
        }
      );

      // Nettoyer l'abonnement quand le composant est démonté
      // ou quand les dépendances changent
      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error(`Erreur lors de l'abonnement à ${collectionPath}:`, err);
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      setLoading(false);
      return () => {}; // Retourner une fonction de nettoyage vide en cas d'erreur
    }
  }, [collectionPath, JSON.stringify(options)]);

  return { data, loading, error };
} 