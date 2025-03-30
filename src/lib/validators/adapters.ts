import { z } from 'zod';

/**
 * Adaptateur pour valider le corps de la requête avec un schéma Zod pour les routes API
 * @param schema Schéma Zod pour la validation
 * @returns Handler pour Next.js API route
 */
export function validateRouteBody<T extends z.ZodType>(schema: T) {
  return async (req: Request) => {
    try {
      // Extraire le corps de la requête
      const body = await req.json();
      
      // Valider avec le schéma Zod
      const validatedData = schema.parse(body);
      
      // Retourner les données validées
      return { success: true, data: validatedData };
    } catch (error) {
      // En cas d'erreur de validation Zod
      if (error instanceof z.ZodError) {
        return { 
          success: false, 
          error: {
            message: 'Validation failed',
            errors: error.errors,
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message
            }))
          }
        };
      }
      
      // Autres erreurs
      return { 
        success: false, 
        error: {
          message: 'Invalid request'
        }
      };
    }
  };
}

/**
 * Adaptateur pour valider les paramètres de requête avec un schéma Zod pour les routes API
 * @param schema Schéma Zod pour la validation
 * @returns Handler pour Next.js API route
 */
export function validateRouteQuery<T extends z.ZodType>(schema: T) {
  return (searchParams: URLSearchParams) => {
    try {
      const queryParams: Record<string, string> = {};
      
      // Convertir l'objet URLSearchParams en objet simple
      searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });
      
      // Valider avec le schéma Zod
      const validatedData = schema.parse(queryParams);
      
      // Retourner les données validées
      return { success: true, data: validatedData };
    } catch (error) {
      // En cas d'erreur de validation Zod
      if (error instanceof z.ZodError) {
        return { 
          success: false, 
          error: {
            message: 'Query validation failed',
            errors: error.errors,
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message
            }))
          }
        };
      }
      
      // Autres erreurs
      return { 
        success: false, 
        error: {
          message: 'Invalid query parameters'
        }
      };
    }
  };
} 