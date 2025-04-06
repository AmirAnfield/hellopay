import { ContractType, WorkingHours } from '@/types/contract';
import {
  Article1Nature,
  Article2EntryDate,
  Article2CDDEntry,
  Article3Functions,
  Article4Workplace,
  Article5WorkingSchedule,
  Article6Remuneration,
  Article7Benefits,
  Article8Leaves,
  Article9DataProtection,
  Article10Conduct,
  Article11Confidentiality,
  Article12NonCompete,
  Article13Teleworking,
  Article14Termination
} from '@/types/contract-articles';

// Interface de base pour tous les composants d'étape
export interface BaseStepProps {
  isLoading: boolean;
  onBack?: () => void;
}

// Interface générique pour les étapes de remplissage d'article
export interface ArticleStepProps<T> extends BaseStepProps {
  onSaveArticle: (data: T) => void;
  initialData?: T;
}

// Props spécifiques pour Article1NatureStep
export interface Article1NatureStepProps extends ArticleStepProps<Article1Nature> {
  contractType: ContractType;
}

// Props spécifiques pour Article2EntryDateStep
export interface Article2EntryDateStepProps extends ArticleStepProps<Article2EntryDate> {}

// Props spécifiques pour Article2CDDEntryStep
export interface Article2CDDEntryStepProps extends ArticleStepProps<Article2CDDEntry> {}

// Props spécifiques pour Article3FunctionsStep
export interface Article3FunctionsStepProps extends ArticleStepProps<Article3Functions> {}

// Props spécifiques pour Article4WorkplaceStep
export interface Article4WorkplaceStepProps extends ArticleStepProps<Article4Workplace> {}

// Props spécifiques pour Article5WorkingScheduleStep
export interface Article5WorkingScheduleStepProps extends ArticleStepProps<Article5WorkingSchedule> {
  contractType: ContractType;
  workingHours: WorkingHours;
  isPartTime: boolean;
}

// Props spécifiques pour Article6RemunerationStep
export interface Article6RemunerationStepProps extends ArticleStepProps<Article6Remuneration> {
  contractType: ContractType;
  workingHours: WorkingHours;
  isPartTime: boolean;
}

// Props spécifiques pour Article7BenefitsStep
export interface Article7BenefitsStepProps extends ArticleStepProps<Article7Benefits> {}

// Props spécifiques pour Article8LeavesStep
export interface Article8LeavesStepProps extends ArticleStepProps<Article8Leaves> {
  contractType: ContractType;
}

// Props spécifiques pour Article9DataProtectionStep
export interface Article9DataProtectionStepProps extends ArticleStepProps<Article9DataProtection> {}

// Props spécifiques pour Article10ConductStep
export interface Article10ConductStepProps extends ArticleStepProps<Article10Conduct> {}

// Props spécifiques pour Article11ConfidentialityStep
export interface Article11ConfidentialityStepProps extends ArticleStepProps<Article11Confidentiality> {}

// Props spécifiques pour Article12NonCompeteStep
export interface Article12NonCompeteStepProps extends ArticleStepProps<Article12NonCompete> {
  contractType: ContractType;
}

// Props spécifiques pour Article13TeleworkingStep
export interface Article13TeleworkingStepProps extends ArticleStepProps<Article13Teleworking> {}

// Props spécifiques pour Article14TerminationStep
export interface Article14TerminationStepProps extends ArticleStepProps<Article14Termination> {
  contractType: ContractType;
} 