import { Timestamp } from 'firebase-admin/firestore';

// Message d'échange avec l'IA
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Timestamp;
}

// Mémoire IA pour la création de contrat
export interface AIContractMemory {
  id: string;
  userId: string;
  step: number;
  contractType?: string;
  
  company?: {
    id: string;
    name: string;
    siret?: string;
    address?: string;
    postalCode?: string;
    city?: string;
  };
  
  employee?: {
    id: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    birthPlace?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    socialSecurityNumber?: string;
  };
  
  fields: {
    workingHours?: string;
    hasRemoteWork?: boolean;
    salary?: number;
    startDate?: string;
    endDate?: string;
    trialPeriod?: boolean;
    trialPeriodDuration?: string;
    position?: string;
    qualification?: string;
    workLocation?: string;
    [key: string]: unknown; // Pour permettre des champs dynamiques
  };
  
  clauses: {
    introduction?: string;
    workingTime?: string;
    duties?: string;
    remuneration?: string;
    trialPeriod?: string;
    duration?: string;
    termination?: string;
    [key: string]: string | null | undefined; // Pour permettre des clauses dynamiques
  };
  
  // Historique limité aux 5 derniers échanges
  history: AIMessage[];
}

// Suggestion IA pour les clauses et les questions suivantes
export interface AISuggestion {
  suggestion: string;
  fields?: Record<string, unknown>;
  nextQuestion?: string;
} 