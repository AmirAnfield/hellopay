import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware pour valider le corps de la requête avec un schéma Zod
 * @param schema Schéma Zod pour la validation
 * @returns Handler pour Next.js API route
 */
export function validateBody<T extends z.ZodType>(schema: T) {
  return async (req: NextRequest, next: () => Promise<NextResponse>) => {
    try {
      // Extraire le corps de la requête
      const body = await req.json();
      
      // Valider avec le schéma Zod
      const validatedData = schema.parse(body);
      
      // Créer une nouvelle requête avec les données validées
      const validatedRequest = new NextRequest(req.url, {
        headers: req.headers,
        method: req.method,
        body: JSON.stringify(validatedData),
        credentials: 'include',
      });
      
      // Passer à l'étape suivante avec les données validées
      return next();
    } catch (error) {
      // En cas d'erreur de validation Zod
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            success: false, 
            errors: error.errors,
            message: 'Validation failed',
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message
            }))
          }, 
          { status: 400 }
        );
      }
      
      // Autres erreurs
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid request'
        },
        { status: 400 }
      );
    }
  };
}

/**
 * Middleware pour valider les paramètres de requête avec un schéma Zod
 * @param schema Schéma Zod pour la validation
 * @returns Handler pour Next.js API route
 */
export function validateQuery<T extends z.ZodType>(schema: T) {
  return async (req: NextRequest, next: () => Promise<NextResponse>) => {
    try {
      const url = new URL(req.url);
      const queryParams: Record<string, string> = {};
      
      // Convertir l'objet URLSearchParams en objet simple
      url.searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });
      
      // Valider avec le schéma Zod
      schema.parse(queryParams);
      
      // Passer à l'étape suivante si la validation réussit
      return next();
    } catch (error) {
      // En cas d'erreur de validation Zod
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            success: false, 
            errors: error.errors,
            message: 'Query validation failed',
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message
            }))
          }, 
          { status: 400 }
        );
      }
      
      // Autres erreurs
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid query parameters'
        },
        { status: 400 }
      );
    }
  };
}

/**
 * Fonction d'aide qui combine plusieurs validateurs
 * @param validators Liste de validateurs à appliquer
 */
export function withValidation(...validators: Array<(req: NextRequest, next: () => Promise<NextResponse>) => Promise<NextResponse>>) {
  return async (req: NextRequest) => {
    let currentReq = req;
    
    // Appliquer chaque validateur en séquence
    for (const validator of validators) {
      const result = await validator(currentReq, async () => {
        // Simuler le passage à l'étape suivante
        return new NextResponse(null, { status: 200 });
      });
      
      // Si le validateur renvoie une erreur, la propager
      if (result.status !== 200) {
        return result;
      }
      
      // Mettre à jour la requête pour le prochain validateur
      currentReq = result instanceof NextRequest ? result : currentReq;
    }
    
    // Tous les validateurs ont réussi
    return NextResponse.next();
  };
} 