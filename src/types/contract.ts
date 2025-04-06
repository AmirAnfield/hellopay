export type ContractType = 'CDI' | 'CDD';
export type ContractStatus = 'draft' | 'validated';
export type WorkingHours = 24 | 28 | 30 | 35;

export interface Company {
  id: string;
  name: string;
  siret?: string;
  address?: string;
  addressLine2?: string;
  zipCode?: string;
  city?: string;
  [key: string]: unknown;
}

export interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  birthDate?: string;
  birthPlace?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  socialSecurityNumber?: string;
  [key: string]: unknown;
}

export interface ContractConfig {
  id?: string;
  userId: string;
  status: ContractStatus;
  progress: number;
  contractType?: ContractType;
  workingHours?: WorkingHours;
  isPartTime?: boolean;
  isExecutive?: boolean;
  company?: Company;
  employee?: Employee;
  hasPreambule?: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  // Autres champs à ajouter au fur et à mesure
} 