/**
 * Types pour le module Bulletins de paie
 * Partie du projet d'uniformisation des types (MVP 0.24)
 */
import { ContractType } from '../employees/employee';

/**
 * Interface de base commune pour les bulletins de paie
 * Utilisée à la fois par le front-end et le back-end
 */
export interface Payslip {
  id: string;
  periodStart: string; // Format ISO
  periodEnd: string; // Format ISO;
  paymentDate: string; // Format ISO
  grossSalary: number;
  netSalary: number;
  hoursWorked: number;
  status: PayslipStatus;
  pdfUrl?: string | null;
  comments?: string | null;
}

/**
 * Statut possible d'un bulletin de paie
 */
export type PayslipStatus = 'draft' | 'final' | 'paid' | 'canceled';

/**
 * Type pour le modèle de données Prisma/base de données
 */
export interface PayslipModel extends Payslip {
  createdAt: Date;
  updatedAt: Date;
  employeeId: string;
  companyId: string;
  
  // Données de calcul
  baseSalary: number;
  overtimePay?: number | null;
  bonusPay?: number | null;
  otherPay?: number | null;
  
  // Déductions et contributions
  socialContributions: number;
  healthInsurance: number;
  retirementContribution: number;
  unemploymentInsurance: number;
  otherContributions?: number | null;
  incomeTax?: number | null;
  
  // Avantages
  benefits?: string | null; // JSON stringifié des avantages
}

/**
 * Informations minimales d'un employé pour le bulletin
 */
export interface PayslipEmployee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  contractType: ContractType;
  socialSecurityNumber: string;
  startDate: string;
}

/**
 * Informations minimales d'une entreprise pour le bulletin
 */
export interface PayslipCompany {
  id: string;
  name: string;
  siret: string;
  address: string;
  postalCode: string;
  city: string;
}

/**
 * DTO pour la création d'un bulletin de paie
 */
export interface PayslipCreateRequestDTO {
  employeeId: string;
  periodStart: string; // Format ISO
  periodEnd: string; // Format ISO
  paymentDate: string; // Format ISO
  hoursWorked: number;
  baseSalary: number;
  
  // Salaires additionnels
  overtimePay?: number | null;
  bonusPay?: number | null;
  otherPay?: number | null;
  
  // Déductions
  socialContributions?: number | null;
  healthInsurance?: number | null;
  retirementContribution?: number | null;
  unemploymentInsurance?: number | null;
  otherContributions?: number | null;
  incomeTax?: number | null;
  
  // Autres
  comments?: string | null;
  status?: PayslipStatus;
  benefits?: Array<{name: string, amount: number}> | null;
}

/**
 * DTO pour la mise à jour d'un bulletin de paie
 */
export type PayslipUpdateRequestDTO = Partial<PayslipCreateRequestDTO> & {
  id: string;
};

/**
 * DTO pour la réponse contenant un bulletin
 */
export interface PayslipResponseDTO extends Payslip {
  // Informations de l'entreprise
  company: PayslipCompany;
  
  // Informations de l'employé
  employee: PayslipEmployee;
  
  // Détails de calcul
  baseSalary: number;
  overtimePay?: number | null;
  bonusPay?: number | null;
  otherPay?: number | null;
  
  // Déductions et contributions
  socialContributions: number;
  healthInsurance: number;
  retirementContribution: number;
  unemploymentInsurance: number;
  otherContributions?: number | null;
  incomeTax?: number | null;
  
  // Avantages
  benefits?: Array<{name: string, amount: number}> | null;
}

/**
 * Type pour les données de formulaire de bulletin de paie
 * Utilisé dans le composant PayslipForm
 */
export interface PayslipFormData {
  // Informations de l'entreprise
  company: {
    id: string;
    name: string;
    siret: string;
  };
  
  // Informations de l'employé
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    socialSecurityNumber: string;
  };
  
  // Période de paie
  period: {
    month: string;
    year: string;
    startDate: string;
    endDate: string;
  };
  
  // Rémunération brute
  grossSalary: {
    base: string;
    overtime: string | null;
    bonus: string | null;
    indemnityCp: string | null;
    other: string | null;
  };
  
  // Cotisations sociales
  contributions: {
    health: string | null;
    retirement: string | null;
    unemployment: string | null;
    otherContributions: string | null;
  };
  
  // Avantages en nature
  benefits: {
    mealVouchers: string | null;
    transport: string | null;
    otherBenefits: string | null;
  };
  
  // Net à payer
  netSalary: string | null;
  
  // Commentaires
  comments: string | null;
} 