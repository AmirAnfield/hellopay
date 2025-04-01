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
  salaryBase?: number;
  salaryFrequency?: 'monthly' | 'hourly' | 'yearly';
  workingHours?: number;
  status: 'active' | 'inactive' | 'pending';
  iban?: string;
  bic?: string;
  userId?: string;
  birthPlace?: string;
  nationality?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  hourlyRate?: number;
  monthlyHours?: number;
  isExecutive?: boolean;
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

// Bulletin de paie
export interface Payslip extends FirestoreDocument {
  employeeId: string;
  companyId: string;
  month: number;
  year: number;
  grossAmount: number;
  netAmount: number;
  taxAmount: number;
  otherDeductions?: number;
  pdfUrl?: string;
  status: 'draft' | 'final' | 'generated' | 'sent' | 'paid';
  paymentDate?: Timestamp;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  lineItems?: PayslipLineItem[];
  userId?: string;
  hourlyRate?: number;
  hoursWorked?: number;
  employerCost?: number;
  contributionsDetails?: string;
  locked?: boolean;
  paidLeaveAcquired?: number;
  paidLeaveTaken?: number;
  paidLeaveRemaining?: number;
  cumulativeGrossSalary?: number;
  cumulativeNetSalary?: number;
  cumulativePeriodStart?: Timestamp;
  cumulativePeriodEnd?: Timestamp;
  employerName?: string;
  employerAddress?: string;
  employerSiret?: string;
  employerUrssaf?: string;
  employeeName?: string;
  employeeAddress?: string;
  employeePosition?: string;
  employeeSocialSecurityNumber?: string;
  isExecutive?: boolean;
  validatedAt?: Timestamp;
  validatedBy?: string;
}

// Ligne de bulletin
export interface PayslipLineItem {
  label: string;
  amount: number;
  type: 'earning' | 'deduction' | 'tax' | 'employer_contribution' | 'addition';
  quantity?: number;
  rate?: number;
  baseAmount?: number;
}

// Département/service dans une entreprise
export interface Department extends FirestoreDocument {
  name: string;
  companyId: string;
  managerId?: string;
  description?: string;
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

// Modèle de bulletin de paie
export interface PayslipTemplate extends FirestoreDocument {
  companyId: string;
  name: string;
  html: string;
  css?: string;
  isDefault: boolean;
} 