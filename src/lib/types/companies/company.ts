/**
 * Types pour le module Entreprises
 * Partie du projet d'uniformisation des types (MVP 0.24)
 */

/**
 * Interface de base commune pour les entreprises
 * Utilisée à la fois par le front-end et le back-end
 */
export interface Company {
  id: string;
  name: string;
  siret: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phoneNumber?: string | null;
  email?: string | null;
  website?: string | null;
  logo?: string | null;
  active: boolean;
}

/**
 * Type pour le modèle de données de la base de données
 */
export interface CompanyModel extends Company {
  createdAt: Date;
  updatedAt: Date;
  userId: string; // Utilisateur propriétaire
  
  // Informations légales et administratives
  legalForm?: string | null;
  taxId?: string | null;
  vatNumber?: string | null;
  registrationNumber?: string | null;
  
  // Informations URSSAF et cotisations
  urssafId?: string | null;
  socialContributionRate?: number | null;
  
  // Paramètres métier
  defaultPaymentTerms?: number | null;
  accountingCode?: string | null;
  notes?: string | null;
}

/**
 * DTO pour la création d'une entreprise
 */
export type CompanyCreateRequestDTO = Omit<Company, 'id'> & {
  legalForm?: string | null;
  taxId?: string | null;
  vatNumber?: string | null;
  registrationNumber?: string | null;
  urssafId?: string | null;
  socialContributionRate?: number | null;
};

/**
 * DTO pour la mise à jour d'une entreprise
 */
export type CompanyUpdateRequestDTO = Partial<CompanyCreateRequestDTO> & {
  id: string;
};

/**
 * DTO pour la réponse contenant une entreprise
 */
export interface CompanyResponseDTO extends Company {
  // Informations légales et administratives
  legalForm?: string | null;
  taxId?: string | null;
  vatNumber?: string | null;
  registrationNumber?: string | null;
  
  // Informations URSSAF et cotisations
  urssafId?: string | null;
  socialContributionRate?: number | null;
  
  // Statistiques
  employeeCount?: number;
  activeEmployeeCount?: number;
  
  // Relations
  owner?: {
    id: string;
    email: string;
  };
}

/**
 * Type pour les données de formulaire d'entreprise
 * Utilisé dans le composant CompanyForm
 */
export interface CompanyFormData {
  name: string;
  siret: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phoneNumber: string;
  email: string;
  website: string;
  
  // Informations légales
  legalForm: string;
  taxId: string;
  vatNumber: string;
  registrationNumber: string;
  
  // Informations URSSAF
  urssafId: string;
  socialContributionRate: string; // Format string pour faciliter la saisie dans un champ input
  
  // Options
  active: boolean;
  logo: string;
} 