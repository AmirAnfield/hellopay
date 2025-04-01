import { useState, useEffect } from 'react';
import { subscribeToDocument } from '@/services/firestore-service';

/**
 * Hook pour récupérer et observer un document Firestore en temps réel
 * 
 * @param collectionPath Chemin de la collection Firestore
 * @param documentId ID du document à observer
 * @returns État de chargement, erreurs et données du document
 */
export function useFirestoreDocument<T>(
  collectionPath: string, 
  documentId: string | null
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Si l'ID est null ou vide, ne pas effectuer de requête
    if (!documentId) {
      setData(null);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    setError(null);

    try {
      // S'abonner aux changements du document
      const unsubscribe = subscribeToDocument<T>(
        collectionPath,
        documentId,
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
      console.error(`Erreur lors de l'abonnement à ${collectionPath}/${documentId}:`, err);
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      setLoading(false);
      return () => {}; // Retourner une fonction de nettoyage vide en cas d'erreur
    }
  }, [collectionPath, documentId]);

  return { data, loading, error };
} 