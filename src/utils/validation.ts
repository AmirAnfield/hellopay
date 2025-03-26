export const validateSiret = (siret: string): boolean => {
  // Format SIRET : 14 chiffres
  return /^\d{14}$/.test(siret);
};

export const validateUrssaf = (urssaf: string): boolean => {
  // Format URSSAF : 9 chiffres
  return /^\d{9}$/.test(urssaf);
};

export const validateNir = (nir: string): boolean => {
  // Format NIR : 15 chiffres
  return /^\d{15}$/.test(nir);
};

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