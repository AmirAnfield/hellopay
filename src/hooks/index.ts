/**
 * Index centralisé pour tous les hooks personnalisés
 * 
 * Ce fichier permet d'importer tous les hooks personnalisés
 * depuis un seul point d'accès, facilitant leur maintenance et leur utilisation.
 */

// Hooks Firestore
export { useFirestoreDocument } from './useFirestoreDocument';
export { useFirestoreCollection } from './useFirestoreCollection';
export { useFirestorePagination } from './useFirestorePagination';

// Hooks métier
export { useAuth } from './useAuth';
export { useEmployees } from './useEmployees';
export { useAIContractMemory } from './useAIContractMemory';
export { useCompanyEmployees } from './useCompanyEmployees';
export { useCompanyCache } from './useCompanyCache';

// Hooks utilitaires
export { useRecaptcha } from './useRecaptcha';
export { useErrorHandler } from './use-error-handler'; 