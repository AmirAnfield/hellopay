/**
 * Types partagés pour les réponses API
 * Partie du projet d'uniformisation des types (MVP 0.24)
 */

// Types de base pour les réponses API
export type ApiStatus = 'success' | 'error' | 'warning' | 'info';

// Type pour les données de pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  [key: string]: unknown; // Pour compatibilité avec Record<string, unknown>
}

// Type de base pour une réponse API
export interface ApiResponseBase<T = unknown> {
  success: boolean;
  status: ApiStatus;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

// Type pour les réponses avec succès
export interface ApiSuccessResponse<T = unknown> extends ApiResponseBase<T> {
  success: true;
  status: Extract<ApiStatus, 'success' | 'info' | 'warning'>;
  data: T;
}

// Type pour les réponses paginées
export interface PaginatedResponse<T = unknown> extends ApiSuccessResponse<T[]> {
  meta: PaginationMeta & Record<string, unknown>;
}

// Type pour les réponses d'erreur
export interface ApiErrorResponse extends ApiResponseBase {
  success: false;
  status: Extract<ApiStatus, 'error'>;
  message: string;
  code?: string;
  details?: unknown;
}

// Codes d'erreur spécifiques
export type ErrorCode = 
  | 'AUTH_REQUIRED'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_VERIFIED'
  | 'TOKEN_EXPIRED'
  | 'FORBIDDEN' 
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'RATE_LIMIT_EXCEEDED'; 