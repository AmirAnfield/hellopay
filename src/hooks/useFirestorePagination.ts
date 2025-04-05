import { useCallback, useEffect, useRef, useState } from 'react';
import { DocumentData, DocumentSnapshot } from 'firebase/firestore';
import { getPaginatedCollection, getCollectionCount } from '@/services/firestore-service';
import { FirestorePaginationParams } from '@/types/pagination';

interface UseFirestorePaginationOptions extends FirestorePaginationParams {
  /** Activer le chargement automatique au montage du composant */
  autoLoad?: boolean;
  /** Obtenir le compte total (opération potentiellement coûteuse) */
  fetchTotalCount?: boolean;
}

interface UseFirestorePaginationResult<T> {
  /** Données actuellement chargées */
  data: T[];
  /** État de chargement */
  loading: boolean;
  /** Erreur survenue pendant le chargement */
  error: Error | null;
  /** Indique s'il y a plus de données à charger */
  hasMore: boolean;
  /** Nombre total d'éléments (si fetchTotalCount=true) */
  totalCount: number | null;
  /** Fonction pour charger la page suivante */
  loadMore: () => Promise<void>;
  /** Fonction pour recharger les données depuis le début */
  refresh: () => Promise<void>;
  /** Fonction pour réinitialiser l'état */
  reset: () => void;
}

/**
 * Hook pour la pagination avec Firestore utilisant des curseurs
 * 
 * @param collectionPath Chemin de la collection Firestore
 * @param options Options de pagination (limit, whereConditions, sortBy, etc.)
 * @returns États, données et fonctions pour gérer la pagination
 */
export function useFirestorePagination<T extends DocumentData>(
  collectionPath: string,
  options: UseFirestorePaginationOptions = {}
): UseFirestorePaginationResult<T> {
  // État pour stocker les données
  const [data, setData] = useState<T[]>([]);
  // État pour le chargement
  const [loading, setLoading] = useState(false);
  // État pour les erreurs
  const [error, setError] = useState<Error | null>(null);
  // État pour indiquer s'il y a plus de données
  const [hasMore, setHasMore] = useState(true);
  // État pour le nombre total d'éléments
  const [totalCount, setTotalCount] = useState<number | null>(null);
  
  // Référence pour stocker le dernier document visible pour la pagination
  const lastVisibleRef = useRef<DocumentSnapshot | null>(null);
  // Référence pour conserver les options de pagination
  const optionsRef = useRef(options);
  
  // Mettre à jour les options lorsqu'elles changent
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  
  // Fonction pour charger le décompte total d'éléments
  const loadTotalCount = useCallback(async () => {
    if (!optionsRef.current.fetchTotalCount) return;
    
    try {
      const count = await getCollectionCount(collectionPath, optionsRef.current.whereConditions);
      setTotalCount(count);
    } catch (err) {
      console.error('Erreur lors du chargement du décompte total:', err);
    }
  }, [collectionPath]);
  
  // Fonction pour charger la prochaine page de données
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const paginationParams: FirestorePaginationParams = {
        ...optionsRef.current,
        lastVisible: lastVisibleRef.current
      };
      
      const result = await getPaginatedCollection<T>(collectionPath, paginationParams);
      
      setData(prevData => [...prevData, ...result.data]);
      setHasMore(result.hasMore);
      lastVisibleRef.current = result.lastVisible;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue');
      setError(error);
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  }, [collectionPath, loading, hasMore]);
  
  // Fonction pour recharger les données depuis le début
  const refresh = useCallback(async () => {
    setData([]);
    setHasMore(true);
    setError(null);
    lastVisibleRef.current = null;
    
    try {
      // Charger le décompte en parallèle
      if (optionsRef.current.fetchTotalCount) {
        loadTotalCount();
      }
      
      // Charger la première page
      await loadMore();
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des données:', err);
    }
  }, [loadMore, loadTotalCount]);
  
  // Fonction pour réinitialiser l'état
  const reset = useCallback(() => {
    setData([]);
    setLoading(false);
    setError(null);
    setHasMore(true);
    lastVisibleRef.current = null;
  }, []);
  
  // Effet pour charger les données au montage du composant (si autoLoad=true)
  useEffect(() => {
    if (optionsRef.current.autoLoad !== false) {
      refresh();
    }
    // Ne pas inclure refresh dans les dépendances pour éviter les boucles infinies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return {
    data,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore,
    refresh,
    reset
  };
} 