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