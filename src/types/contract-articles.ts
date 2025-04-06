import { ContractType, WorkingHours } from './contract';

export interface Article1Nature {
  contractType: ContractType;
  startDate?: string;
  endDate?: string;
  reason?: string;
  trialPeriod?: boolean;
  trialPeriodDuration?: number;
  [key: string]: unknown;
}

export interface Article2EntryDate {
  entryDate: string;
  effectiveDate?: string;
  [key: string]: unknown;
}

export interface Article2CDDEntry extends Article2EntryDate {
  replacedEmployee?: string;
  temporaryActivity?: string;
  seasonalActivity?: string;
  [key: string]: unknown;
}

export interface Article3Functions {
  position: string;
  classification?: string;
  supervisor?: string;
  duties: string[];
  [key: string]: unknown;
}

export interface Article4Workplace {
  mainLocation: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  zipCode?: string;
  hasMobilityClause?: boolean;
  mobilityRadius?: number;
  [key: string]: unknown;
}

export interface Article5WorkingSchedule {
  workingHours: WorkingHours;
  isPartTime: boolean;
  scheduleType: 'fixed' | 'variable';
  weeklySchedule?: {
    monday?: { start: string, end: string }[];
    tuesday?: { start: string, end: string }[];
    wednesday?: { start: string, end: string }[];
    thursday?: { start: string, end: string }[];
    friday?: { start: string, end: string }[];
    saturday?: { start: string, end: string }[];
    sunday?: { start: string, end: string }[];
  };
  [key: string]: unknown;
}

export interface Article6Remuneration {
  grossMonthlySalary: number;
  currency?: string;
  paymentDate?: number;
  monthlySalary?: number;
  hasConventionalSalary?: boolean;
  includeCDDIndemnity?: boolean;
  customPaymentDate?: number;
  bonuses?: {
    name: string;
    amount: number;
    frequency: 'monthly' | 'quarterly' | 'annual' | 'other';
    description?: string;
  }[];
  [key: string]: unknown;
}

export interface Article7Benefits {
  hasHealthInsurance?: boolean;
  hasProfessionalExpenses?: boolean;
  hasCompanyCar?: boolean;
  hasCompanyPhone?: boolean;
  hasCompanyLaptop?: boolean;
  mealVouchers?: boolean;
  mealVouchersAmount?: number;
  hasNoBenefits?: boolean;
  hasExpenseReimbursement?: boolean;
  hasTransportAllowance?: boolean;
  hasLunchVouchers?: boolean;
  hasCompanyHousing?: boolean;
  hasHomeOfficeAllowance?: boolean;
  hasRetirementPlan?: boolean;
  hasProfitSharing?: boolean;
  otherBenefits?: string[];
  [key: string]: unknown;
}

export interface Article8Leaves {
  paidLeavesDays?: number;
  extraHolidays?: number;
  collectiveAgreement?: string;
  hasCustomLeaves?: boolean;
  hasSpecialAbsences?: boolean;
  specialLeaves?: {
    type: string;
    days: number;
  }[];
  sickLeavePolicy?: string;
  [key: string]: unknown;
}

export interface Article9DataProtection {
  allowPersonalDataProcessing?: boolean;
  allowImageUse?: boolean;
  imageUseScope?: 'internal' | 'external' | 'both';
  dataRetentionPeriod?: number;
  [key: string]: unknown;
}

export interface Article10Conduct {
  dressCode?: boolean;
  dressCodeProvided?: boolean;
  internalRulesAccepted?: boolean;
  [key: string]: unknown;
}

export interface Article11Confidentiality {
  hasConfidentialityClause?: boolean;
  confidentialityPeriod?: number;
  confidentialityScope?: string;
  intellectualProperty?: boolean;
  [key: string]: unknown;
}

export interface Article12NonCompete {
  hasNonCompeteClause?: boolean;
  nonCompeteDuration?: number;
  nonCompeteGeographicScope?: string;
  nonCompeteCompensation?: number;
  [key: string]: unknown;
}

export interface Article13Teleworking {
  hasTeleworking?: boolean;
  teleworkingDaysPerWeek?: number;
  teleworkingEquipmentProvided?: boolean;
  teleworkingAllowance?: number;
  [key: string]: unknown;
}

export interface Article14Termination {
  noticePeriod?: number;
  cddTerminationConditions?: string;
  [key: string]: unknown;
} 