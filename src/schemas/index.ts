/**
 * Index centralisé pour tous les schémas de validation
 * 
 * Ce fichier permet d'importer tous les schémas de validation
 * depuis un seul point d'accès, facilitant leur maintenance et leur utilisation.
 */

// Exporter tous les schémas de validation existants
export * from './validation-schemas';

// TODO: À mesure que le projet évolue, les schémas devraient être
// réorganisés dans des fichiers séparés par domaine (auth.ts, user.ts, etc.) 