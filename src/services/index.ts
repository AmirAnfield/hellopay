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

// Services du contrat
export * from './contractService';
// Export sélectif pour éviter les conflits
export { 
  getArticle1Nature,
  getArticle2EntryDate, 
  getArticle2CDDEntry,
  getArticle3Functions,
  getArticle4Workplace,
  getArticle5WorkingSchedule
} from './contractArticlesService';

export * from './contractFinalizeService';

// Export sélectif pour éviter les conflits
export { 
  getArticle6Remuneration 
} from './article6RemunerationService';

export {
  getArticle7Benefits
} from './article7BenefitsService';

export {
  getArticle8Leaves
} from './article8LeavesService';

export * from './userDataService';

// Service de sauvegarde des articles
export {
  saveArticle1Nature,
  saveArticle2EntryDate,
  saveArticle2CDDEntry,
  saveArticle3Functions,
  saveArticle4Workplace,
  saveArticle5WorkingSchedule,
  saveArticle6Remuneration,
  saveArticle7Benefits,
  saveArticle8Leaves,
  saveArticle9DataProtection,
  saveArticle10Conduct,
  saveArticle11Confidentiality,
  saveArticle12NonCompete,
  saveArticle13Teleworking,
  saveArticle14Termination
} from './contractArticlesSaveService';

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