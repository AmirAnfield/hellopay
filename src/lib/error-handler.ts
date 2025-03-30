/**
 * Gestionnaire d'erreurs centralisé pour l'application
 */

// Types d'erreurs courants
export type ApiErrorResponse = {
  success: false;
  message: string;
  code?: string;
  details?: unknown;
};

// Types d'erreurs spécifiques à l'application
export type ErrorCode = 
  | 'AUTH_REQUIRED'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_VERIFIED'
  | 'TOKEN_EXPIRED'
  | 'FORBIDDEN' 
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR';

// Classe d'erreur spécifique à l'application
export class AppError extends Error {
  code: ErrorCode;
  details?: unknown;
  
  constructor(message: string, code: ErrorCode, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    
    // Capture de la stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

// Messages d'erreur par défaut
const defaultErrorMessages: Record<ErrorCode, string> = {
  AUTH_REQUIRED: 'Authentification requise pour accéder à cette ressource',
  INVALID_CREDENTIALS: 'Identifiants invalides',
  EMAIL_NOT_VERIFIED: 'Veuillez vérifier votre adresse email',
  TOKEN_EXPIRED: 'Votre session a expiré, veuillez vous reconnecter',
  FORBIDDEN: 'Vous n\'avez pas les permissions nécessaires',
  NOT_FOUND: 'La ressource demandée n\'existe pas',
  VALIDATION_ERROR: 'Données invalides',
  SERVER_ERROR: 'Une erreur est survenue sur le serveur',
  NETWORK_ERROR: 'Problème de connexion au serveur'
};

// Fonction pour créer une erreur d'application
export function createAppError(
  code: ErrorCode, 
  customMessage?: string, 
  details?: unknown
): AppError {
  const message = customMessage || defaultErrorMessages[code];
  return new AppError(message, code, details);
}

// Fonction pour gérer les erreurs d'API
export function handleApiError(error: unknown): ApiErrorResponse {
  console.error('API Error:', error);
  
  // Si c'est une erreur d'application
  if (error instanceof AppError) {
    return {
      success: false,
      message: error.message,
      code: error.code,
      details: error.details
    };
  }
  
  // Pour les erreurs standards
  if (error instanceof Error) {
    // Pour les erreurs réseau
    if (error.name === 'NetworkError' || error.message?.includes('network')) {
      return {
        success: false,
        message: defaultErrorMessages.NETWORK_ERROR,
        code: 'NETWORK_ERROR'
      };
    }
    
    return {
      success: false,
      message: error.message || 'Une erreur inattendue est survenue',
      code: 'SERVER_ERROR'
    };
  }
  
  // Erreur par défaut pour tout autre type
  return {
    success: false,
    message: 'Une erreur inattendue est survenue',
    code: 'SERVER_ERROR'
  };
}

// Fonction pour journaliser les erreurs
export function logError(error: Error | AppError, context?: Record<string, unknown>): void {
  if (error instanceof AppError) {
    console.error(`[AppError][${error.code}] ${error.message}`, {
      details: error.details,
      context,
      stack: error.stack
    });
  } else {
    console.error(`[Error][${error.name}] ${error.message}`, {
      context,
      stack: error.stack
    });
  }
  
  // Ici on pourrait ajouter une logique pour envoyer l'erreur à un service externe
  // comme Sentry, LogRocket, etc.
} 