import { ContractType, WorkingHours, Company, Employee } from '@/types/contract';
import {
  Article1Nature,
  Article6Remuneration,
  Article7Benefits,
  Article8Leaves
} from '@/types/contract-articles';

// Props de base pour toutes les étapes
export interface BaseStepProps {
  isLoading: boolean;
  onBack?: () => void;
}

// Props pour les étapes avec validation
export interface StepWithValidationProps extends BaseStepProps {
  onNext: () => void;
}

// Props pour la sélection du type de contrat
export interface ContractTypeStepProps extends BaseStepProps {
  onSelectType: (type: ContractType) => void;
  selectedType?: ContractType;
}

// Props pour la sélection des heures de travail
export interface WorkingHoursStepProps extends BaseStepProps {
  onSelectHours: (hours: WorkingHours) => void;
  selectedHours?: WorkingHours;
}

// Props pour la sélection de l'entreprise
export interface CompanyStepProps extends BaseStepProps {
  onSelectCompany: (company: Company) => void;
  companies: Company[];
  selectedCompanyId?: string;
}

// Props pour la sélection de l'employé
export interface EmployeeStepProps extends BaseStepProps {
  onSelectEmployee: (employee: Employee) => void;
  employees: Employee[];
  selectedEmployeeId?: string;
}

// Props pour la sélection du préambule
export interface PreambuleStepProps extends BaseStepProps {
  onSelectPreambule: (hasPreambule: boolean) => void;
  hasPreambule?: boolean;
}

// Props pour l'article 1 sur la nature du contrat
export interface Article1NatureStepProps extends BaseStepProps {
  contractType: ContractType;
  onSaveArticle: (data: Article1Nature) => void;
  initialData?: Article1Nature;
}

// Props pour l'article 2 sur la date d'entrée (CDI)
export interface Article2EntryDateStepProps extends BaseStepProps {
  onSaveArticle: (data: any) => void;
  initialData?: any;
}

// Props pour l'article 2 sur la date d'entrée (CDD)
export interface Article2CDDEntryStepProps extends BaseStepProps {
  onSaveArticle: (data: any) => void;
  initialData?: any;
}

// Props pour l'article 3 sur les fonctions
export interface Article3FunctionsStepProps extends BaseStepProps {
  onSaveArticle: (data: any) => void;
  initialData?: any;
}

// Props pour l'article 4 sur le lieu de travail
export interface Article4WorkplaceStepProps extends BaseStepProps {
  onSaveArticle: (data: any) => void;
  initialData?: any;
}

// Props pour l'article 5 sur l'organisation du travail
export interface Article5WorkingScheduleStepProps extends BaseStepProps {
  contractType: ContractType;
  workingHours: WorkingHours;
  isPartTime: boolean;
  onSaveArticle: (data: any) => void;
  initialData?: any;
}

// Props pour l'article 6 sur la rémunération
export interface Article6RemunerationStepProps extends BaseStepProps {
  contractType: ContractType;
  workingHours: WorkingHours;
  isPartTime: boolean;
  onSaveArticle: (data: Article6Remuneration) => void;
  initialData?: Article6Remuneration;
}

// Props pour l'article 7 sur les avantages
export interface Article7BenefitsStepProps extends BaseStepProps {
  onSaveArticle: (data: Article7Benefits) => void;
  initialData?: Article7Benefits;
}

// Props pour l'article 8 sur les congés
export interface Article8LeavesStepProps extends BaseStepProps {
  contractType: ContractType;
  onSaveArticle: (data: Article8Leaves) => void;
  initialData?: Article8Leaves;
}

// Props pour l'article 9 sur les données personnelles
export interface Article9DataProtectionStepProps extends BaseStepProps {
  onSaveArticle: (data: any) => void;
  initialData?: any;
}

// Props pour l'article 10 sur la tenue et les règles
export interface Article10ConductStepProps extends BaseStepProps {
  onSaveArticle: (data: any) => void;
  initialData?: any;
}

// Props pour l'article 11 sur la confidentialité
export interface Article11ConfidentialityStepProps extends BaseStepProps {
  onSaveArticle: (data: any) => void;
  initialData?: any;
}

// Props pour l'article 12 sur la non-concurrence
export interface Article12NonCompeteStepProps extends BaseStepProps {
  contractType: ContractType;
  onSaveArticle: (data: any) => void;
  initialData?: any;
}

// Props pour l'article 13 sur le télétravail
export interface Article13TeleworkingStepProps extends BaseStepProps {
  onSaveArticle: (data: any) => void;
  initialData?: any;
}

// Props pour l'article 14 sur la rupture du contrat
export interface Article14TerminationStepProps extends BaseStepProps {
  contractType: ContractType;
  onSaveArticle: (data: any) => void;
  initialData?: any;
}

// Props pour l'aperçu du contrat
export interface ContractPreviewStepProps extends BaseStepProps {
  contractConfig: any;
  articles: Record<string, any>;
  onValidateContract: () => void;
} 