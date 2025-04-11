import { NextRequest, NextResponse } from "next/server";

/**
 * Niveaux de journalisation
 */
export enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG"
}

/**
 * Type d'événement de sécurité
 */
export enum SecurityEvent {
  INFO = "INFO",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILED = "LOGIN_FAILED",
  REGISTRATION = "REGISTRATION",
  PASSWORD_RESET_REQUEST = "PASSWORD_RESET_REQUEST",
  PASSWORD_RESET_SUCCESS = "PASSWORD_RESET_SUCCESS",
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  SERVER_ERROR = "SERVER_ERROR"
}

/**
 * Interface pour un log de sécurité
 */
interface SecurityLog {
  timestamp: string;
  level: LogLevel;
  event: SecurityEvent;
  userId?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Fonction pour enregistrer un événement de sécurité
 */
export async function logSecurityEvent(
  event: SecurityEvent,
  message: string,
  level: LogLevel = LogLevel.INFO,
  details: Record<string, unknown> = {}
): Promise<void> {
  // Créer l'objet de log
  const log: SecurityLog = {
    timestamp: new Date().toISOString(),
    level,
    event,
    message,
    ...details
  };

  // Dans un environnement de production, vous voudrez peut-être:
  // 1. Stocker les logs dans une base de données
  // 2. Envoyer les logs à un service externe comme Sentry
  // 3. Envoyer les logs à un service de gestion de logs comme Elasticsearch/Logstash

  // Pour le moment, nous allons simplement les afficher dans la console
  if (process.env.NODE_ENV === "development") {
  } else {
    // En production, formater le log en JSON pour faciliter son traitement
  }
}

/**
 * Middleware pour journaliser les requêtes API
 */
export function loggerMiddleware() {
  return async (req: NextRequest, next: () => Promise<NextResponse>) => {
    const startTime = Date.now();
    const path = req.nextUrl.pathname;
    const method = req.method;
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Appeler le gestionnaire suivant
    try {
      const response = await next();
      
      // Calculer le temps de réponse
      const responseTime = Date.now() - startTime;
      
      // Journaliser la requête réussie
      const level = response.status >= 400 
        ? (response.status >= 500 ? LogLevel.ERROR : LogLevel.WARN)
        : LogLevel.INFO;
      
      // Déterminer l'événement en fonction du statut
      let event = SecurityEvent.INFO;
      if (response.status === 401) event = SecurityEvent.UNAUTHORIZED_ACCESS;
      else if (response.status === 429) event = SecurityEvent.RATE_LIMIT_EXCEEDED;
      else if (response.status >= 400 && response.status < 500) event = SecurityEvent.VALIDATION_ERROR;
      else if (response.status >= 500) event = SecurityEvent.SERVER_ERROR;
      
      await logSecurityEvent(
        event,
        `${method} ${path} ${response.status}`,
        level,
        {
          path,
          method,
          ip,
          userAgent,
          statusCode: response.status,
          responseTime
        }
      );
      
      return response;
    } catch (error) {
      // Journaliser l'erreur
      await logSecurityEvent(
        SecurityEvent.SERVER_ERROR,
        `Error processing ${method} ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        LogLevel.ERROR,
        {
          path,
          method,
          ip,
          userAgent,
          error: error instanceof Error ? error.stack : String(error)
        }
      );
      
      // Renvoyer une réponse d'erreur
      return NextResponse.json(
        { success: false, message: "Une erreur serveur est survenue" },
        { status: 500 }
      );
    }
  };
}

/**
 * Adaptateur pour journaliser les événements dans les routes API
 */
export function logAPIEvent(
  req: Request, 
  event: SecurityEvent, 
  message: string,
  level: LogLevel = LogLevel.INFO,
  additionalDetails: Record<string, unknown> = {}
): void {
  const headers = new Headers(req.headers);
  const url = new URL(req.url);
  
  logSecurityEvent(
    event,
    message,
    level,
    {
      path: url.pathname,
      method: req.method,
      ip: headers.get('x-forwarded-for') || 'unknown',
      userAgent: headers.get('user-agent') || 'unknown',
      ...additionalDetails
    }
  );
} 