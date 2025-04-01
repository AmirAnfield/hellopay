/**
 * Types pour le module Employés
 * Partie du projet d'uniformisation des types (MVP 0.24)
 */

/**
 * Interface de base commune pour les employés
 * Utilisée à la fois par le front-end et le back-end
 */
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phoneNumber?: string | null;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  birthDate?: string | null;
  birthPlace?: string | null;
  nationality: string;
  socialSecurityNumber: string;
  position: string;
  department?: string | null;
  contractType: ContractType;
  isExecutive: boolean;
  startDate: string; // Format ISO
  endDate?: string | null; // Format ISO
  trialPeriodEndDate?: string | null; // Format ISO
  iban?: string | null;
  bic?: string | null;
}

/**
 * Type enumérant les différents types de contrat possibles
 */
export type ContractType = 'CDI' | 'CDD' | 'Alternance' | 'Stage' | 'Intérim' | 'Autre';

/**
 * Type pour le modèle de données de la base de données
 */
export interface EmployeeModel extends Employee {
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  // Champs supplémentaires spécifiques à la base de données
  hourlyRate: number;
  monthlyHours: number;
  baseSalary: number;
  bonusAmount: number;
  bonusDescription?: string | null;
  paidLeaveBalance?: number | null;
}

/**
 * DTO pour la création d'un employé (requête)
 */
export type EmployeeCreateRequestDTO = Omit<EmployeeModel, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * DTO pour la mise à jour d'un employé (requête)
 */
export type EmployeeUpdateRequestDTO = Partial<EmployeeCreateRequestDTO> & {
  id: string;
};

/**
 * DTO pour la réponse contenant un employé
 */
export interface EmployeeResponseDTO extends Employee {
  // Informations basiques sur l'entreprise
  company?: {
    id: string;
    name: string;
    siret?: string;
  };
  // Résumé des bulletins de paie (si demandé)
  payslips?: {
    id: string;
    periodStart: string;
    periodEnd: string;
    grossSalary: number;
    netSalary: number;
    status: 'draft' | 'final';
    pdfUrl?: string | null;
  }[];
  // Informations de rémunération
  hourlyRate: number;
  monthlyHours: number;
  baseSalary: number;
  bonusAmount?: number;
  bonusDescription?: string | null;
}

/**
 * Type pour les données de formulaire d'employé
 * Utilisé dans le composant EmployeeForm
 */
export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  email: string;
  phoneNumber: string;
  birthDate: string; // Format yyyy-MM-dd pour l'élément input[type=date]
  birthPlace: string;
  nationality: string;
  socialSecurityNumber: string;
  position: string;
  department: string;
  contractType: ContractType;
  isExecutive: boolean;
  startDate: string; // Format yyyy-MM-dd
  endDate: string; // Format yyyy-MM-dd
  trialPeriodEndDate: string; // Format yyyy-MM-dd
  hourlyRate: number;
  monthlyHours: number;
  baseSalary: number;
  bonusAmount: number;
  bonusDescription: string;
  iban: string;
  bic: string;
  companyId: string;
} 