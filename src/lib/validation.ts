/**
 * Fonctions de validation pour les formulaires de l'application
 */

/**
 * Valide un numéro SIRET (14 chiffres)
 * @param siret Numéro SIRET à valider
 * @returns true si le format est valide
 */
export const validateSiret = (siret: string): boolean => {
  // Format SIRET : 14 chiffres
  return /^\d{14}$/.test(siret);
};

/**
 * Valide un numéro URSSAF (9 chiffres)
 * @param urssaf Numéro URSSAF à valider
 * @returns true si le format est valide
 */
export const validateUrssaf = (urssaf: string): boolean => {
  // Format URSSAF : 9 chiffres
  return /^\d{9}$/.test(urssaf);
};

/**
 * Valide un numéro de sécurité sociale (NIR - 15 chiffres)
 * @param nir Numéro de sécurité sociale à valider
 * @returns true si le format est valide
 */
export const validateNir = (nir: string): boolean => {
  // Format NIR : 15 chiffres
  return /^\d{15}$/.test(nir);
};

/**
 * Récupère un message de validation pour un champ donné
 * @param field Nom du champ à valider
 * @param value Valeur du champ
 * @returns Message d'erreur ou null si valide
 */
export const getValidationMessage = (field: string, value: string): string | null => {
  switch (field) {
    case 'employerSiret':
      return validateSiret(value) ? null : 'Le numéro SIRET doit contenir exactement 14 chiffres';
    case 'employerUrssaf':
      return validateUrssaf(value) ? null : 'Le numéro URSSAF doit contenir exactement 9 chiffres';
    case 'employeeSocialSecurityNumber':
      return validateNir(value) ? null : 'Le numéro de sécurité sociale doit contenir exactement 15 chiffres';
    default:
      return null;
  }
}; 