/**
 * Types pour les articles de contrat
 * 
 * Ce fichier centralise toutes les définitions de types pour les articles de contrat.
 */

// Article 1: Nature du contrat
export interface Article1Data {
  contractType: 'CDI' | 'CDD';
  title: string;
  description?: string;
  includePreambule?: boolean;
  preambuleText?: string;
}

// Article 2: Date d'entrée en fonction
export interface Article2Data {
  startDate: string;
  trialPeriod?: boolean;
  trialPeriodDuration?: number;
  trialPeriodUnit?: 'days' | 'weeks' | 'months';
  cdd?: CDDData;
}

export interface CDDData {
  endDate?: string;
  reason?: string;
  replacedEmployee?: string;
  renewalOption?: boolean;
  renewalTerms?: string;
}

// Article 3: Fonctions
export interface Article3Data {
  position: string;
  category?: string;
  responsibilities?: string[];
  reportingTo?: string;
  jobClassification?: string;
}

// Article 4: Lieu de travail
export interface Article4Data {
  workLocation: string;
  mobilityClause?: boolean;
  mobilityZone?: string;
  secondaryLocations?: string[];
}

// Article 5: Durée et organisation du travail
export interface Article5Data {
  weeklyHours: number;
  schedule?: string;
  flexibleHours?: boolean;
  nightWork?: boolean;
  weekendWork?: boolean;
  overtimeRules?: string;
}

// Article 6: Rémunération
export interface Article6Data {
  baseSalary: number;
  currency: string;
  paymentFrequency: 'monthly' | 'weekly' | 'bi-weekly';
  bonuses?: {
    type: string;
    amount: number;
    conditions?: string;
  }[];
  salaryReviewPolicy?: string;
}

// Article 7: Avantages
export interface Article7Data {
  benefits: {
    type: string;
    description: string;
    value?: number;
  }[];
  mealVouchers?: boolean;
  mealVoucherValue?: number;
  professionalExpenses?: boolean;
  professionalExpenseTerms?: string;
  companyVehicle?: boolean;
  companyVehicleDetails?: string;
}

// Article 8: Congés et absences
export interface Article8Data {
  paidLeave: number;
  paidLeavePeriod?: string;
  sickLeavePolicy?: string;
  specialLeavePolicy?: string;
  unpaidLeavePolicy?: string;
}

// Article 9: Données personnelles et droit à l'image
export interface Article9Data {
  dataProtectionTerms?: string;
  imageRightsConsent?: boolean;
  dataRetentionPeriod?: string;
  rightToAccessData?: boolean;
}

// Article 10: Tenue et règles internes
export interface Article10Data {
  dresscode?: string;
  internalRulesReference?: boolean;
  specificRequirements?: string[];
  healthAndSafetyRules?: string;
}

// Article 11: Confidentialité et propriété intellectuelle
export interface Article11Data {
  confidentialityTerms: string;
  intellectualPropertyAssignment: boolean;
  postTermConfidentiality?: boolean;
  postTermDuration?: number;
  restrictedInformation?: string[];
}

// Article 12: Non-concurrence (CDI uniquement)
export interface Article12Data {
  nonCompeteClause?: boolean;
  geographicScope?: string;
  duration?: number;
  compensation?: number;
  restrictedActivities?: string[];
}

// Article 13: Télétravail
export interface Article13Data {
  teleworkAllowed?: boolean;
  teleworkDays?: number;
  equipmentProvided?: boolean;
  equipmentDetails?: string[];
  expensesReimbursed?: boolean;
  expensesDetails?: string;
}

// Article 14: Rupture du contrat et préavis
export interface Article14Data {
  noticePeriod?: string;
  severanceTerms?: string;
  terminationConditions?: string[];
  returnOfProperty?: string[];
  gardeningLeave?: boolean;
}

// Type de contrat complet
export interface ContractData {
  id: string;
  userId: string;
  companyId: string;
  employeeId: string;
  title: string;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  createdAt: string;
  updatedAt: string;
  articles?: {
    article1?: Article1Data;
    article2?: Article2Data;
    article3?: Article3Data;
    article4?: Article4Data;
    article5?: Article5Data;
    article6?: Article6Data;
    article7?: Article7Data;
    article8?: Article8Data;
    article9?: Article9Data;
    article10?: Article10Data;
    article11?: Article11Data;
    article12?: Article12Data;
    article13?: Article13Data;
    article14?: Article14Data;
  };
} 