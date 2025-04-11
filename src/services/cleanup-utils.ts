/**
 * Utilitaires pour le nettoyage et la documentation des services obsolètes
 * 
 * Ce fichier contient des fonctions et des informations pour faciliter
 * la migration des composants vers les nouveaux services consolidés.
 */

// Liste des fichiers obsolètes et leurs remplacements
export const obsoleteServices = {
  // Services de contrat
  'contractArticlesService.ts': 'contract-articles-service.ts',
  'article6RemunerationService.ts': 'contract-articles-service.ts',
  'article7BenefitsService.ts': 'contract-articles-service.ts',
  'article8LeavesService.ts': 'contract-articles-service.ts',
  'article9DataProtectionService.ts': 'contract-articles-service.ts',
  'article10ConductService.ts': 'contract-articles-service.ts',
  'article11ConfidentialityService.ts': 'contract-articles-service.ts',
  'article12NonCompeteService.ts': 'contract-articles-service.ts',
  'article13TeleworkingService.ts': 'contract-articles-service.ts',
  'article14TerminationService.ts': 'contract-articles-service.ts',
  'contractArticlesSaveService.ts': 'contract-articles-service.ts',
  
  // Services d'entreprise et d'employé
  'companyService.ts': 'company-service.ts',
  'employeeService.ts': 'employee-service.ts'
};

// Guide de migration pour les composants
export const migrationGuide = {
  // Guide pour les imports
  imports: {
    // Anciennes importations -> Nouvelles importations
    'import { getArticle1Nature } from "@/services/contractArticlesService"': 
      'import { ContractArticlesService } from "@/services"',
    'import { getUserCompanies } from "@/services/companyService"': 
      'import { CompanyService } from "@/services"',
    'import { getUserEmployees } from "@/services/employeeService"': 
      'import { EmployeeService } from "@/services"'
  },
  
  // Guide pour les appels de fonction
  functionCalls: {
    // Anciens appels de fonction -> Nouveaux appels de fonction
    'getArticle1Nature(userId, contractId)': 
      'ContractArticlesService.getArticle1Nature(userId, contractId)',
    'getUserCompanies(userId)': 
      'CompanyService.getUserCompanies(userId)',
    'getUserEmployees(userId)': 
      'EmployeeService.getUserEmployees(userId)'
  }
};

/**
 * Génère un rapport sur les services obsolètes
 * 
 * Cette fonction est destinée à être appelée depuis la console du développeur
 * pour obtenir un rapport sur les services obsolètes encore utilisés dans le projet.
 */
export function generateObsoleteServicesReport(): string {
  // Cette fonction est destinée à être utilisée manuellement pour générer un rapport
  const report = `
# Rapport sur les services obsolètes

## Services obsolètes

${Object.entries(obsoleteServices)
  .map(([obsolete, replacement]) => `- \`${obsolete}\` -> \`${replacement}\``)
  .join('\n')}

## Guide de migration

### Imports

${Object.entries(migrationGuide.imports)
  .map(([obsolete, replacement]) => `- \`${obsolete}\` -> \`${replacement}\``)
  .join('\n')}

### Appels de fonction

${Object.entries(migrationGuide.functionCalls)
  .map(([obsolete, replacement]) => `- \`${obsolete}\` -> \`${replacement}\``)
  .join('\n')}
`;

  return report;
} 