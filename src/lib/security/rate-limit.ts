/**
 * Système de limitation de taux de requêtes (rate limiting)
 * Protège l'API contre les abus, attaques par force brute et certains types de DoS
 * 
 * NOTE: Nécessite l'installation du package @upstash/redis:
 * npm install @upstash/redis
 */

import { NextRequest, NextResponse } from 'next/server';

// Type de remplacement pour Redis en attendant l'installation du package
interface RedisClient {
  get(key: string): Promise<number | null>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<boolean>;
}

// Délai de rétention des données de limitation (en secondes)
const WINDOW_SIZE_IN_SECONDS = 60;

// Nombre maximum de requêtes par fenêtre de temps
const MAX_REQUESTS_PER_WINDOW = {
  // Routes d'authentification - plus restreintes pour éviter les attaques par force brute
  auth: 20,
  // Routes API standards
  api: 100,
  // Routes publiques
  public: 200
};

// Déterminer la catégorie d'une route
function getRouteCategory(path: string): 'auth' | 'api' | 'public' {
  if (path.startsWith('/api/auth') || path.includes('/login') || path.includes('/register')) {
    return 'auth';
  }
  if (path.startsWith('/api/')) {
    return 'api';
  }
  return 'public';
}

/**
 * Récupère un client Redis
 * Note: Cette implémentation est un placeholder qui sera remplacé
 * une fois que @upstash/redis sera installé
 */
let redisClient: RedisClient | null = null;

function getRedisClient(): RedisClient {
  if (!redisClient) {
    // Placeholder jusqu'à l'installation du package
    // À remplacer par l'initialisation réelle une fois le package installé:
    /*
    redisClient = new Redis({
      url: process.env.REDIS_URL || '',
      token: process.env.REDIS_TOKEN || '',
    });
    */
    
    // Client factice pour la compilation
    redisClient = {
      get: async (_key: string) => 0,
      incr: async (_key: string) => 1,
      expire: async (_key: string, _seconds: number) => true
    };
  }
  return redisClient;
}

/**
 * Middleware de limitation de taux de requêtes
 */
export async function rateLimiter(request: NextRequest, options?: {
  customLimits?: Record<string, number>;
  skipRateLimiting?: boolean;
}): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  response?: NextResponse;
}> {
  // Ignorer si en mode développement ou si l'option de désactivation est définie
  if (process.env.NODE_ENV === 'development' || options?.skipRateLimiting) {
    return { success: true, limit: 999, remaining: 999 };
  }

  try {
    // Récupérer l'adresse IP (utiliser X-Forwarded-For si disponible)
    const ip = request.headers.get('x-forwarded-for') || 
               'unknown';
           
    const path = request.nextUrl.pathname;
    const routeCategory = getRouteCategory(path);
    
    // Définir la limite en fonction de la catégorie ou des options personnalisées
    const limit = options?.customLimits?.[routeCategory] || 
                  MAX_REQUESTS_PER_WINDOW[routeCategory];
    
    // Créer une clé unique pour cette IP et ce chemin
    const key = `rate-limit:${ip}:${routeCategory}`;
    
    const redis = getRedisClient();
    
    // Récupérer le compteur actuel pour cette clé
    const currentCount = await redis.get(key) || 0;
    
    // Si le compteur dépasse la limite, rejeter la requête
    if (currentCount >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        response: new NextResponse(
          JSON.stringify({
            success: false,
            message: 'Trop de requêtes. Veuillez réessayer plus tard.',
            code: 'RATE_LIMIT_EXCEEDED'
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': (Math.ceil(Date.now() / 1000) + WINDOW_SIZE_IN_SECONDS).toString(),
              'Retry-After': WINDOW_SIZE_IN_SECONDS.toString()
            }
          }
        )
      };
    }
    
    // Incrémenter le compteur et définir son expiration
    await redis.incr(key);
    await redis.expire(key, WINDOW_SIZE_IN_SECONDS);
    
    return {
      success: true,
      limit,
      remaining: limit - (currentCount + 1)
    };
  } catch (error) {
    // En cas d'erreur, ne pas bloquer la requête pour éviter les perturbations
    console.error('Erreur lors de la limitation de débit:', error);
    return { success: true, limit: 999, remaining: 999 };
  }
}

/**
 * Middleware pour utiliser dans les routes API
 */
export function withRateLimit(
  handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>,
  options?: {
    customLimits?: Record<string, number>;
  }
) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const result = await rateLimiter(request, options);
    
    if (!result.success) {
      return result.response;
    }
    
    // Ajouter les en-têtes de rate limit à la réponse originale
    const response = await handler(request, ...args);
    
    if (response instanceof NextResponse) {
      response.headers.set('X-RateLimit-Limit', result.limit.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', (Math.ceil(Date.now() / 1000) + WINDOW_SIZE_IN_SECONDS).toString());
    }
    
    return response;
  };
} 