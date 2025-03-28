/**
 * Fonction utilitaire pour valider les champs du formulaire de fiche de paie
 * @param field - Le nom du champ à valider
 * @param value - La valeur du champ à valider
 * @returns Un message d'erreur ou null si le champ est valide
 */
export function getValidationMessage(field: string, value: string): string | null {
  // Si la valeur est vide, pas d'erreur de validation spécifique (on utilise required dans le HTML)
  if (!value.trim()) return null;

  switch (field) {
    case 'employerSiret':
      // Valider le format SIRET (14 chiffres)
      if (!/^\d{14}$/.test(value.replace(/\s/g, ''))) {
        return 'Le numéro SIRET doit contenir 14 chiffres';
      }
      break;
    
    case 'employerUrssaf':
      // Valider le format URSSAF (généralement 18 caractères)
      if (!/^\d{18}$/.test(value.replace(/\s/g, ''))) {
        return 'Le numéro URSSAF doit contenir 18 chiffres';
      }
      break;
    
    case 'employeeSocialSecurityNumber':
      // Valider le format numéro de sécurité sociale français (15 chiffres)
      if (!/^\d{15}$/.test(value.replace(/\s/g, ''))) {
        return 'Le numéro de sécurité sociale doit contenir 15 chiffres';
      }
      break;
    
    case 'hourlyRate':
      // Valider que le taux horaire est un nombre positif
      const hourlyRate = parseFloat(value);
      if (isNaN(hourlyRate) || hourlyRate <= 0) {
        return 'Le taux horaire doit être un nombre positif';
      }
      break;
    
    case 'hoursWorked':
      // Valider que le nombre d'heures travaillées est un nombre positif
      const hoursWorked = parseFloat(value);
      if (isNaN(hoursWorked) || hoursWorked <= 0) {
        return 'Le nombre d\'heures travaillées doit être un nombre positif';
      }
      break;
    
    case 'periodStart':
    case 'periodEnd':
    case 'paymentDate':
      // Valider que la date est au format ISO
      if (isNaN(Date.parse(value))) {
        return 'La date n\'est pas valide';
      }
      break;
  }

  return null;
} 