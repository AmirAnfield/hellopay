/**
 * Export central de tous les types partagés
 * Partie du projet d'uniformisation des types (MVP 0.24)
 */

// Types API
export * from './shared/api';

// Types Authentification
export * from './auth/user';

// Types Entreprises
export * from './companies/company';

// Types Employés
export * from './employees/employee';

// Types Bulletins de paie
export * from './payslips/payslip';

// Remarque: pour les imports dans l'application, vous pouvez soit:
// 1. Importer depuis ce point central: import { Employee } from '@/lib/types';
// 2. Importer directement depuis le module spécifique: import { Employee } from '@/lib/types/employees/employee';
//
// L'approche 1 est plus simple mais peut augmenter la taille du bundle si Tree-shaking ne fonctionne pas correctement.
// L'approche 2 est plus explicite et garantit que seuls les types nécessaires sont importés. 