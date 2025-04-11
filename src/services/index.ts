/**
 * Point d'entrée centralisé pour tous les services
 * 
 * Ce fichier exporte tous les services de l'application pour faciliter
 * leur importation et leur utilisation dans les composants.
 */

// Services d'authentification
import * as AuthService from './auth-service';

// Services de gestion des documents
import * as DocumentsService from './documents-service';
import * as CertificateService from './certificate-service';

// Services de gestion des données
import * as CompanyService from './company-service';
import * as EmployeeService from './employee-service';

// Services de stockage
import * as StorageService from './storage-service';

// Service Firestore de base
import * as FirestoreService from './firestore-service';

// Service consolidé pour les articles de contrat
import * as ContractArticlesService from './contract-articles-service';

// Service de génération PDF
import * as PDFService from './pdf-generation-service';

// Service consolidé pour les contrats
import * as ContractService from './contract-service';

// Services du contrat existants encore utilisés - À DÉPRÉCIER
// Ces imports seront supprimés dans les prochaines versions
// Utilisez ContractService à la place
export * from './contractService';
export * from './contractFinalizeService';
export * from './userDataService';

// Export du service d'articles de contrat consolidé
export { ContractArticlesService };

// Export du service de génération PDF
export { PDFService };

// Export du service de contrat consolidé
export { ContractService };

// Exportation regroupée par domaine
export {
  AuthService,
  DocumentsService,
  CertificateService,
  CompanyService,
  EmployeeService,
  StorageService,
  FirestoreService
}; 