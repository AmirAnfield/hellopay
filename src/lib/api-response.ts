/**
 * Utilitaires de réponse d'API standardisées
 */
import { NextResponse } from 'next/server';
import { ApiErrorResponse, handleApiError } from './error-handler';

// Types de statut standardisés
type StatusType = 'success' | 'error' | 'warning' | 'info';

// Type pour les données de pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  [key: string]: unknown; // Pour rendre compatible avec Record<string, unknown>
}

// Type de base pour une réponse d'API
interface ApiResponseBase<T = unknown> {
  success: boolean;
  status: StatusType;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

// Types spécifiques pour les réponses
export type ApiSuccessResponse<T = unknown> = ApiResponseBase<T> & {
  success: true;
  status: 'success' | 'info' | 'warning';
  data: T;
};

// Export du type d'erreur déjà défini dans error-handler.ts
export type { ApiErrorResponse } from './error-handler';

/**
 * Crée une réponse API standard en cas de succès
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  meta?: Record<string, unknown>,
  statusCode = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      status: 'success',
      message,
      data,
      meta
    },
    { status: statusCode }
  );
}

/**
 * Crée une réponse API standardisée pour une liste paginée
 */
export function createPaginatedResponse<T>(
  data: T[],
  meta: PaginationMeta,
  message?: string,
  statusCode = 200
): NextResponse<ApiSuccessResponse<T[]>> {
  return NextResponse.json(
    {
      success: true,
      status: 'success',
      message,
      data,
      meta
    },
    { status: statusCode }
  );
}

/**
 * Crée une réponse API standard en cas d'avertissement
 * Utilisé lorsque la requête réussit mais avec certaines conditions
 */
export function createWarningResponse<T>(
  data: T,
  message: string,
  meta?: Record<string, unknown>,
  statusCode = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      status: 'warning',
      message,
      data,
      meta
    },
    { status: statusCode }
  );
}

/**
 * Crée une réponse d'erreur standardisée
 */
export function createErrorResponse(
  error: unknown,
  statusCode = 500
): NextResponse<ApiErrorResponse> {
  const errorResponse = handleApiError(error);
  
  return NextResponse.json(
    errorResponse,
    { status: statusCode }
  );
}

/**
 * Crée une réponse 404 standardisée
 */
export function createNotFoundResponse(
  message = 'Ressource non trouvée'
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      code: 'NOT_FOUND'
    },
    { status: 404 }
  );
}

/**
 * Crée une réponse 401 standardisée
 */
export function createUnauthorizedResponse(
  message = 'Authentification requise'
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      code: 'AUTH_REQUIRED'
    },
    { status: 401 }
  );
}

/**
 * Crée une réponse 403 standardisée
 */
export function createForbiddenResponse(
  message = 'Accès refusé'
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      code: 'FORBIDDEN'
    },
    { status: 403 }
  );
}

/**
 * Crée une réponse d'erreur de validation standardisée
 */
export function createValidationErrorResponse(
  details: Record<string, string[]> | string | unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      message: 'Erreur de validation des données',
      code: 'VALIDATION_ERROR',
      details
    },
    { status: 422 }
  );
} 