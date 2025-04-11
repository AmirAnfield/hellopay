/**
 * Service pour optimiser les requêtes Firestore
 * 
 * Ce service fournit des méthodes optimisées pour interagir avec Firestore
 * avec des fonctionnalités comme :
 * - Mise en cache des résultats
 * - Pagination efficace
 * - Sélection de champs spécifiques
 * - Journalisation des performances
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  DocumentData,
  QueryConstraint,
  Firestore
} from 'firebase/firestore';
import { firestore as db } from '@/lib/firebase/config';
import { QueryCache, optimizeFirestoreData } from '@/utils/performance-utils';

// Type pour les options de requête
interface QueryOptions {
  limit?: number;
  startAfter?: DocumentData;
  fields?: string[];
  useCache?: boolean;
  cacheTTL?: number;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  whereConditions?: Array<{
    field: string;
    operator: string;
    value: unknown;
  }>;
}

/**
 * Effectue une requête paginée et optimisée sur Firestore
 * 
 * @param path Chemin de la collection
 * @param options Options de la requête
 * @returns Données et dernier document pour la pagination
 */
export async function fetchOptimizedData<T = Record<string, unknown>>(
  path: string,
  options: QueryOptions = {}
): Promise<{ data: T[]; lastDoc: DocumentData | null }> {
  // Créer une clé de cache basée sur le chemin et les options
  const cacheKey = `${path}_${JSON.stringify(options)}`;
  
  // Utiliser le cache si demandé
  if (options.useCache !== false) {
    try {
      return await QueryCache.get(
        cacheKey,
        () => executeQuery<T>(db, path, options),
        options.cacheTTL
      );
    } catch (error) {
      // Si une erreur se produit avec le cache, exécuter la requête directement
      console.error("Erreur avec le cache, exécution directe:", error);
      return executeQuery<T>(db, path, options);
    }
  }
  
  // Exécuter la requête sans cache
  return executeQuery<T>(db, path, options);
}

/**
 * Exécute une requête Firestore avec les options spécifiées
 * 
 * @param firestore Instance Firestore
 * @param path Chemin de la collection
 * @param options Options de la requête
 * @returns Données et dernier document pour la pagination
 */
async function executeQuery<T = Record<string, unknown>>(
  firestore: Firestore,
  path: string,
  options: QueryOptions
): Promise<{ data: T[]; lastDoc: DocumentData | null }> {
  const startTime = performance.now();
  const constraints: QueryConstraint[] = [];
  
  // Ajouter les conditions where
  if (options.whereConditions && options.whereConditions.length > 0) {
    options.whereConditions.forEach(condition => {
      constraints.push(where(condition.field, condition.operator as any, condition.value));
    });
  }
  
  // Ajouter le tri
  if (options.orderByField) {
    constraints.push(orderBy(options.orderByField, options.orderDirection || 'asc'));
  }
  
  // Ajouter la pagination
  if (options.limit) {
    constraints.push(limit(options.limit));
  } else {
    // Limiter par défaut à 20 documents pour éviter les requêtes trop lourdes
    constraints.push(limit(20));
  }
  
  // Ajouter le point de départ pour la pagination
  if (options.startAfter) {
    constraints.push(startAfter(options.startAfter));
  }
  
  // Note: La fonction select() n'est pas disponible directement dans firebase/firestore
  // On utilisera uniquement les champs spécifiés après avoir récupéré les documents
  
  // Créer la requête
  const q = query(collection(firestore, path), ...constraints);
  
  // Exécuter la requête
  const snapshot = await getDocs(q);
  
  // Obtenir le dernier document pour la pagination
  const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
  
  // Convertir les documents en objets
  let data = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as T[];
  
  // Filtrer les champs si nécessaire
  if (options.fields && options.fields.length > 0) {
    data = data.map(item => {
      const filteredItem = { id: (item as any).id } as any;
      options.fields?.forEach(field => {
        if (field in item) {
          filteredItem[field] = (item as any)[field];
        }
      });
      return filteredItem as T;
    });
  }
  
  // Mesurer le temps d'exécution
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Journaliser les performances si le temps d'exécution est supérieur à 200ms
  if (duration > 200) {
    const warning = `⚠️ Requête lente (${duration.toFixed(2)}ms): ${path} avec ${data.length} résultats`;
    if (duration > 500) {
      console.warn(warning);
    }
  }
  
  return { data, lastDoc };
}

/**
 * Crée une fonction de recherche optimisée pour une collection
 * 
 * @param basePath Chemin de base de la collection
 * @returns Fonction de recherche optimisée
 */
export function createOptimizedSearch<T = Record<string, unknown>>(
  basePath: string
) {
  return async (
    searchText: string,
    fields: string[] = ['name', 'title', 'description'],
    additionalOptions: Partial<QueryOptions> = {}
  ): Promise<T[]> => {
    // Si la recherche est vide, retourner une liste vide
    if (!searchText || searchText.trim() === '') {
      return [];
    }
    
    // Normaliser le texte de recherche
    const normalizedSearch = searchText.toLowerCase().trim();
    
    // Préparer la recherche avec le sufixe Unicode pour le filtrage par préfixe
    const endText = normalizedSearch + '\uf8ff';
    
    // Obtenir les résultats pour chaque champ
    const results = await Promise.all(
      fields.map(field => 
        fetchOptimizedData<T>(basePath, {
          whereConditions: [
            {
              field,
              operator: '>=',
              value: normalizedSearch
            },
            {
              field,
              operator: '<=',
              value: endText
            }
          ],
          limit: 10,
          ...additionalOptions
        })
      )
    );
    
    // Fusionner les résultats et supprimer les doublons
    const combinedResults = results.flatMap(r => r.data);
    const uniqueResults = Array.from(
      new Map(combinedResults.map(item => [(item as Record<string, unknown>).id, item])).values()
    );
    
    return uniqueResults;
  };
}

/**
 * Obtient un document par ID avec mise en cache
 * 
 * @param path Chemin de la collection
 * @param id ID du document
 * @param options Options (cache, sélection de champs)
 * @returns Document ou null si non trouvé
 */
export async function getDocumentById<T = Record<string, unknown>>(
  path: string,
  id: string,
  options: Pick<QueryOptions, 'useCache' | 'cacheTTL' | 'fields'> = {}
): Promise<T | null> {
  // Créer une clé de cache
  const cacheKey = `${path}_${id}_${JSON.stringify(options.fields || [])}`;
  
  // Fonction pour récupérer le document
  const fetchDoc = async (): Promise<T | null> => {
    try {
      const docRef = doc(db, path, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = {
        id: docSnap.id,
        ...docSnap.data()
      } as Record<string, unknown> as T;
      
      // Filtrer les champs si nécessaire
      if (options.fields && options.fields.length > 0) {
        const filteredData = { id: docSnap.id } as Record<string, unknown>;
        
        options.fields.forEach(field => {
          const record = data as Record<string, unknown>;
          if (field in record) {
            filteredData[field] = record[field];
          }
        });
        
        return filteredData as T;
      }
      
      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du document ${path}/${id}:`, error);
      return null;
    }
  };
  
  // Utiliser le cache si demandé
  if (options.useCache !== false) {
    return QueryCache.get(cacheKey, fetchDoc, options.cacheTTL);
  }
  
  // Sinon, récupérer directement
  return fetchDoc();
}

// Exporter les fonctions et classes utilisées
export { QueryCache, optimizeFirestoreData }; 