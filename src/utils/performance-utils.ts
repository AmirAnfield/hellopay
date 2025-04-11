/**
 * Utilitaires pour l'optimisation des performances
 * 
 * Ce fichier contient des fonctions et des outils pour améliorer
 * les performances de l'application.
 */

import { collection, query, limit, getDocs, startAfter, DocumentData, QueryConstraint } from 'firebase/firestore';
import { firestore as db } from '@/lib/firebase/config';

/**
 * Configuration pour les requêtes paginées
 */
export interface PaginatedQueryConfig {
  pageSize?: number;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  whereConditions?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
}

/**
 * Effectue une requête paginée optimisée
 * 
 * @param collectionPath Chemin de la collection Firestore
 * @param config Configuration de la requête
 * @param lastDoc Dernier document pour la pagination (optionnel)
 * @returns Liste des documents et le dernier document pour la pagination suivante
 */
export async function fetchPaginatedData(
  collectionPath: string,
  config: PaginatedQueryConfig = {},
  lastDoc?: DocumentData
): Promise<{ data: DocumentData[]; lastDoc: DocumentData | null }> {
  try {
    const {
      pageSize = 10,
      orderByField = 'createdAt',
      orderDirection = 'desc',
      whereConditions = []
    } = config;

    // Construire les contraintes de la requête
    const constraints: QueryConstraint[] = [];

    // Ajouter les conditions where
    whereConditions.forEach(condition => {
      // À implémenter selon les besoins spécifiques
    });

    // Ajouter la pagination
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    constraints.push(limit(pageSize));

    // Construire et exécuter la requête
    const collectionRef = collection(db, collectionPath);
    const q = query(collectionRef, ...constraints);
    
    const snapshot = await getDocs(q);
    const data: DocumentData[] = [];
    
    snapshot.forEach(doc => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Retourner les données et le dernier document
    const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    
    return {
      data,
      lastDoc: newLastDoc
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données paginées:', error);
    throw new Error('Impossible de récupérer les données. Veuillez réessayer.');
  }
}

/**
 * Fonction pour mettre en cache les résultats des requêtes
 * Utilise un cache en mémoire avec expiration
 */
export class QueryCache {
  private static cache: Map<string, { data: any; timestamp: number }> = new Map();
  private static TTL = 5 * 60 * 1000; // 5 minutes par défaut
  
  /**
   * Récupère des données du cache ou exécute la fonction si le cache est expiré
   * 
   * @param key Clé du cache
   * @param fetchFn Fonction à exécuter si le cache est expiré
   * @param ttl Durée de vie du cache en millisecondes (optionnel)
   * @returns Données du cache ou résultat de la fonction
   */
  static async get<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    const now = Date.now();
    const cacheTTL = ttl || this.TTL;
    
    // Vérifier si les données sont en cache et non expirées
    const cached = this.cache.get(key);
    if (cached && now - cached.timestamp < cacheTTL) {
      return cached.data as T;
    }
    
    // Exécuter la fonction et mettre en cache le résultat
    const data = await fetchFn();
    
    this.cache.set(key, {
      data,
      timestamp: now
    });
    
    return data;
  }
  
  /**
   * Invalide une entrée du cache
   * 
   * @param key Clé du cache à invalider
   */
  static invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Invalide tout le cache
   */
  static clear(): void {
    this.cache.clear();
  }
}

/**
 * Configuration pour le chargement paresseux
 */
export const lazyLoadingConfig = {
  // Liste des composants à charger paresseusement
  lazyComponents: [
    'DashboardCompany',
    'DashboardEmployee',
    'ContractForm',
    'PayslipGenerator'
  ],
  
  // Préfixe à ajouter aux imports dynamiques
  importPrefix: '@/components/dashboard/'
};

/**
 * Optimise les requêtes Firestore en réduisant les données récupérées
 * 
 * @param data Données complètes à optimiser
 * @param fields Champs à conserver
 * @returns Données optimisées
 */
export function optimizeFirestoreData<T extends Record<string, any>>(
  data: T[],
  fields: string[]
): Partial<T>[] {
  return data.map(item => {
    const optimized: Partial<T> = {};
    
    fields.forEach(field => {
      if (field in item) {
        optimized[field as keyof T] = item[field];
      }
    });
    
    // Toujours inclure l'ID
    if ('id' in item) {
      optimized['id' as keyof T] = item['id'];
    }
    
    return optimized;
  });
}

/**
 * Analyse les dépendances du projet pour identifier celles qui ne sont pas utilisées
 * 
 * @returns Liste des dépendances inutilisées
 */
export function analyzeUnusedDependencies(): string[] {
  // Cette fonction est un placeholder pour une analyse réelle
  // qui serait effectuée par un outil comme depcheck
  
  return [
    '@vitejs/plugin-react',
    'jsdom',
    'playwright',
    'tw-animate-css',
    'assert',
    'buffer',
    'crypto-browserify',
    'process',
    'stream-browserify'
  ];
}

/**
 * Recommande des optimisations de dépendances
 * 
 * @returns Recommandations d'optimisation
 */
export function getDependencyOptimizationRecommendations(): Record<string, string> {
  return {
    'firebase': 'Utiliser l\'importation sélective pour réduire la taille du bundle',
    'react-pdf/renderer': 'Charger paresseusement avec dynamic import',
    'date-fns': 'Importer uniquement les fonctions utilisées au lieu de tout le package',
    'lucide-react': 'Importer uniquement les icônes utilisées au lieu de tout le package',
    'puppeteer': 'Déplacer vers les dépendances de développement ou le remplacer par une API serveur'
  };
}

/**
 * Génère un rapport d'optimisation des performances
 * 
 * @returns Rapport d'optimisation
 */
export function generatePerformanceReport(): string {
  const unusedDeps = analyzeUnusedDependencies();
  const recommendations = getDependencyOptimizationRecommendations();
  
  return `
# Rapport d'optimisation des performances

## Dépendances inutilisées
${unusedDeps.map(dep => `- \`${dep}\``).join('\n')}

## Recommandations d'optimisation des dépendances
${Object.entries(recommendations).map(([dep, rec]) => `- \`${dep}\`: ${rec}`).join('\n')}

## Stratégies d'optimisation des requêtes Firestore
- Utiliser la pagination pour limiter le nombre de documents récupérés
- Créer des index composites pour les requêtes complexes
- Mettre en cache les résultats des requêtes fréquentes
- Limiter les champs récupérés avec \`select()\`
- Utiliser des transactions pour les opérations multiples

## Stratégies de chargement paresseux
- Implémenter le chargement paresseux des composants lourds
- Charger les images progressivement
- Différer le chargement des ressources non critiques
- Utiliser l'intersection observer pour le chargement à la demande
`;
} 