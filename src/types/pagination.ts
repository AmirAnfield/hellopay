/**
 * Types pour la gestion de la pagination
 * Fichier centralisé pour toutes les interfaces liées à la pagination
 */

import { DocumentSnapshot } from 'firebase/firestore';

/**
 * Paramètres de base pour la pagination
 */
export interface PaginationParams {
  /** Nombre d'éléments par page */
  limit?: number;
  /** Dernier document visible pour la pagination basée sur les curseurs */
  lastVisible?: DocumentSnapshot | null;
  /** Champ sur lequel trier les résultats */
  sortBy?: string;
  /** Direction du tri */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Paramètres de pagination pour les requêtes Firestore
 */
export interface FirestorePaginationParams extends PaginationParams {
  /** Conditions de filtrage (where) */
  whereConditions?: Array<{
    field: string;
    operator: '==' | '!=' | '>' | '>=' | '<' | '<=';
    value: unknown;
  }>;
}

/**
 * Résultat paginé générique
 */
export interface PaginatedResult<T> {
  /** Données de la page courante */
  data: T[];
  /** Indique s'il y a plus de résultats disponibles */
  hasMore: boolean;
  /** Dernier document visible pour la pagination suivante */
  lastVisible: DocumentSnapshot | null;
  /** Nombre total d'éléments (si disponible) */
  totalCount?: number;
}

/**
 * Props pour le composant de pagination
 */
export interface PaginationProps {
  /** Page courante (commence à 1) */
  currentPage: number;
  /** Nombre total de pages */
  totalPages: number;
  /** Nombre d'éléments par page */
  pageSize?: number;
  /** Fonction appelée lors du changement de page */
  onPageChange: (page: number) => void;
  /** Afficher les boutons de première/dernière page */
  showFirstLast?: boolean;
  /** Nombre de pages affichées autour de la page courante */
  siblingCount?: number;
  /** Classe CSS additionnelle */
  className?: string;
} 