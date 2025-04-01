import { ValidationSchema } from "@/types/firebase";

/**
 * Valide un objet selon un schéma de validation
 * @param data L'objet à valider
 * @param schema Le schéma de validation
 * @returns Un objet avec les propriétés isValid et errors
 */
export function validateData<T>(
  data: Partial<T>,
  schema: ValidationSchema<T>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  Object.entries(schema).forEach(([field, rules]) => {
    const value = data[field as keyof T];
    
    // Vérifier si le champ est requis
    if (rules?.required && (value === undefined || value === null || value === "")) {
      errors[field] = `Le champ ${field} est requis`;
      return;
    }

    // Si la valeur est undefined ou null et pas requise, on passe
    if (value === undefined || value === null) {
      return;
    }

    // Vérifier le type
    if (rules?.type) {
      const actualType = typeof value;
      if (rules.type !== actualType) {
        errors[field] = `Le champ ${field} doit être de type ${rules.type}`;
      }
    }

    // Vérifier la longueur minimale (pour les chaînes)
    if (rules?.minLength !== undefined && typeof value === "string" && value.length < rules.minLength) {
      errors[field] = `Le champ ${field} doit contenir au moins ${rules.minLength} caractères`;
    }

    // Vérifier la longueur maximale (pour les chaînes)
    if (rules?.maxLength !== undefined && typeof value === "string" && value.length > rules.maxLength) {
      errors[field] = `Le champ ${field} ne doit pas dépasser ${rules.maxLength} caractères`;
    }

    // Vérifier le pattern (pour les chaînes)
    if (rules?.pattern && typeof value === "string" && !rules.pattern.test(value)) {
      errors[field] = `Le format du champ ${field} est invalide`;
    }

    // Vérifier la valeur minimale (pour les nombres)
    if (rules?.min !== undefined && typeof value === "number" && value < rules.min) {
      errors[field] = `Le champ ${field} doit être supérieur ou égal à ${rules.min}`;
    }

    // Vérifier la valeur maximale (pour les nombres)
    if (rules?.max !== undefined && typeof value === "number" && value > rules.max) {
      errors[field] = `Le champ ${field} doit être inférieur ou égal à ${rules.max}`;
    }

    // Vérifier avec une fonction personnalisée
    if (rules?.custom && !rules.custom(value)) {
      errors[field] = `Le champ ${field} est invalide`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Nettoie les données selon un schéma avant de les envoyer à Firestore
 * @param data Les données à nettoyer
 * @param schema Le schéma de validation
 * @returns Les données nettoyées
 */
export function sanitizeData<T>(
  data: Partial<T>,
  schema: ValidationSchema<T>
): Partial<T> {
  const sanitized: Partial<T> = {};

  // Ne garde que les champs définis dans le schéma
  Object.keys(schema).forEach((field) => {
    const key = field as keyof T;
    if (data[key] !== undefined) {
      sanitized[key] = data[key];
    }
  });

  return sanitized;
}

/**
 * Lance une erreur si les données ne sont pas valides
 * @param data Les données à valider
 * @param schema Le schéma de validation
 * @throws Error si les données ne sont pas valides
 */
export function validateOrThrow<T>(data: Partial<T>, schema: ValidationSchema<T>): void {
  const { isValid, errors } = validateData(data, schema);
  
  if (!isValid) {
    const errorMessage = Object.entries(errors)
      .map(([field, message]) => `${message}`)
      .join(", ");
    
    throw new Error(`Validation failed: ${errorMessage}`);
  }
} 