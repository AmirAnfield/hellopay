import { Timestamp } from 'firebase/firestore';

// Type de base pour tous les documents Firestore
export interface FirestoreDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Entreprise
export interface Company extends FirestoreDocument {
  name: string;
  siret: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  email?: string;
  phoneNumber?: string;
  activityCode?: string;
  urssafNumber?: string;
  legalForm?: string;
  ownerId: string;
  userId?: string;
  legalName?: string;
  phone?: string;
  website?: string;
  vatNumber?: string;
  legalStatus?: string;
  registrationNumber?: string;
  logoUrl?: string;
  settings?: {
    billingAddress?: string;
    paymentTerms?: number;
    defaultTaxRate?: number;
    displayBankInfo?: boolean;
    bankInfo?: {
      bankName?: string;
      iban?: string;
      bic?: string;
    };
  };
}

// Employé
export interface Employee extends FirestoreDocument {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phoneNumber?: string;
  birthDate?: Timestamp;
  socialSecurityNumber?: string;
  employmentDate?: Timestamp;
  companyId: string;
  contractType: string;
  position: string;
  departmentId?: string;
  status: 'active' | 'inactive' | 'pending';
  iban?: string;
  bic?: string;
  userId?: string;
  birthPlace?: string;
  nationality?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  photoUrl?: string;
  phone?: string;
  department?: string;
  documents?: {
    contractUrl?: string;
    idCardUrl?: string;
    vitalCardUrl?: string;
    bankDetailsUrl?: string;
    otherDocuments?: Array<{
      name: string;
      url: string;
      uploadedAt: Date | string;
    }>;
  };
}

// Utilisateur avec rôles
export interface User extends FirestoreDocument {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'user';
  phoneNumber?: string;
  lastLoginAt?: Timestamp;
  emailVerified?: boolean;
  subscription?: {
    tier: 'free' | 'premium' | 'enterprise';
    validUntil: Timestamp;
    paymentId?: string;
  };
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
  };
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
}

// Attestation
export interface Certificate extends FirestoreDocument {
  employeeId: string;
  companyId: string;
  userId: string;  // créateur
  
  type: 'attestation-travail';  // pour l'instant, un seul type
  
  status: 'draft' | 'generated' | 'signed';
  
  // Contenu brut de l'attestation si besoin
  content: string;
  
  // URL du PDF stocké dans Firebase Storage
  pdfUrl?: string;
}

// Type pour la validation des données
export type ValidationSchema<T> = {
  [K in keyof T]?: {
    required?: boolean;
    type?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    min?: number;
    max?: number;
    custom?: (value: unknown) => boolean;
  };
}; 