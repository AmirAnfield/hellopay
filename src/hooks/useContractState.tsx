import React, { createContext, useContext, useReducer, useCallback, useState, useEffect } from 'react';
import { ContractConfig } from '@/types/contract';
import { contractAutoSaveService } from '@/services/contractAutoSaveService';
import { getContractConfig, saveContractConfig } from '@/services/contractService';
import { getContractArticles } from '@/services/contractFinalizeService';
import { useToast } from '@/components/ui/use-toast';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/config';

// Types pour les articles du contrat
export interface Article1Nature {
  motif?: string;
  duree?: string;
}

export interface Article2EntryDate {
  startDate: string;
  trialPeriod: string;
}

export interface Article2CDDEntry {
  startDate: string;
  endDate: string;
  hasTrialPeriod: boolean;
  trialPeriodDuration?: string;
}

export interface Article3Functions {
  position: string;
  classification: string;
  responsibilities?: string;
}

export interface Article4Workplace {
  address: string;
  includeMobilityClause: boolean;
  mobilityRadius?: number;
}

export interface Article5WorkingSchedule {
  scheduleType: string;
  workingDays?: string;
}

export interface Article6Remuneration {
  monthlySalary: number;
  hourlyRate: number;
  paymentDate: string;
}

export interface Article7Benefits {
  hasNoBenefits: boolean;
  hasExpenseReimbursement: boolean;
  hasTransportAllowance: boolean;
  hasLunchVouchers: boolean;
  lunchVoucherAmount?: number;
  lunchVoucherEmployerContribution?: number;
  hasMutualInsurance: boolean;
  mutualInsuranceEmployerContribution?: number;
  hasProfessionalPhone: boolean;
}

export interface Article8Leaves {
  collectiveAgreement: string;
  hasCustomLeaves: boolean;
  customLeavesDetails?: string;
}

export interface Articles {
  article1Nature?: Article1Nature;
  article2EntryDate?: Article2EntryDate;
  article2CDDEntry?: Article2CDDEntry;
  article3Functions?: Article3Functions;
  article4Workplace?: Article4Workplace;
  article5WorkingSchedule?: Article5WorkingSchedule;
  article6Remuneration?: Article6Remuneration;
  article7Benefits?: Article7Benefits;
  article8Leaves?: Article8Leaves;
  [key: string]: any;
}

// Interface pour l'état du contrat
interface ContractState {
  config: ContractConfig | null;
  articles: Articles;
  currentStep: number;
  isLoading: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
}

// Types d'actions pour le reducer
type Action =
  | { type: 'SET_CONFIG'; payload: ContractConfig }
  | { type: 'UPDATE_CONFIG'; payload: Partial<ContractConfig> }
  | { type: 'SET_ARTICLES'; payload: Articles }
  | { type: 'UPDATE_ARTICLE'; articleKey: string; payload: any }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'MARK_SAVED'; timestamp: Date }
  | { type: 'LOAD_STATE'; config: ContractConfig; articles: Articles; step: number };

// État initial
const initialState: ContractState = {
  config: null,
  articles: {},
  currentStep: 0,
  isLoading: false,
  isDirty: false,
  lastSaved: null
};

// Créer le context
const ContractStateContext = createContext<{
  state: ContractState;
  dispatch: React.Dispatch<Action>;
  loadContractData: (userId: string) => Promise<void>;
  saveCurrentStep: (userId: string) => Promise<void>;
  updateArticle: <T>(userId: string, articleKey: string, articleData: T) => Promise<void>;
  goToStep: (step: number) => void;
}>({
  state: initialState,
  dispatch: () => null,
  loadContractData: async () => {},
  saveCurrentStep: async () => {},
  updateArticle: async () => {},
  goToStep: () => {}
});

// Reducer pour gérer les actions
function contractReducer(state: ContractState, action: Action): ContractState {
  switch (action.type) {
    case 'SET_CONFIG':
      return {
        ...state,
        config: action.payload,
        isDirty: true
      };
    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: state.config ? { ...state.config, ...action.payload } : null,
        isDirty: true
      };
    case 'SET_ARTICLES':
      return {
        ...state,
        articles: action.payload,
        isDirty: true
      };
    case 'UPDATE_ARTICLE':
      return {
        ...state,
        articles: {
          ...state.articles,
          [action.articleKey]: action.payload
        },
        isDirty: true
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload
      };
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: state.currentStep + 1
      };
    case 'PREVIOUS_STEP':
      return {
        ...state,
        currentStep: Math.max(0, state.currentStep - 1)
      };
    case 'MARK_SAVED':
      return {
        ...state,
        isDirty: false,
        lastSaved: action.timestamp
      };
    case 'LOAD_STATE':
      return {
        ...state,
        config: action.config,
        articles: action.articles,
        currentStep: action.step,
        isDirty: false
      };
    default:
      return state;
  }
}

// Fournisseur de contexte
export const ContractStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(contractReducer, initialState);
  const { toast } = useToast();

  // Charger les données du contrat depuis Firestore
  const loadContractData = useCallback(async (userId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Charger la configuration
      const config = await getContractConfig(userId);
      if (config) {
        dispatch({ type: 'SET_CONFIG', payload: config });
        dispatch({ type: 'SET_CURRENT_STEP', payload: config.progress });

        // Charger les articles si la progression le justifie
        if (config.progress > 0) {
          const articles = await getContractArticles(userId);
          dispatch({ type: 'SET_ARTICLES', payload: articles });
        }
      } else {
        // Créer une nouvelle configuration si elle n'existe pas
        const newConfig: ContractConfig = {
          userId,
          status: 'draft',
          progress: 0,
          contractType: 'CDI',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        dispatch({ type: 'SET_CONFIG', payload: newConfig });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données du contrat:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du contrat',
        variant: 'destructive',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [toast]);

  // Enregistrer la progression actuelle
  const saveCurrentStep = useCallback(async (userId: string) => {
    if (!state.config) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Mettre à jour la progression dans la configuration
      const updatedConfig = {
        ...state.config,
        progress: Math.max(state.currentStep, state.config.progress),
        updatedAt: new Date()
      };

      // Sauvegarder la configuration
      await saveContractConfig(userId, updatedConfig);

      // Synchroniser les articles
      await contractAutoSaveService.synchronizeArticles(userId, state.articles);

      // Auto-sauvegarde pour restauration future
      await contractAutoSaveService.autoSave(userId, updatedConfig, state.articles);

      dispatch({ type: 'SET_CONFIG', payload: updatedConfig });
      dispatch({ type: 'MARK_SAVED', timestamp: new Date() });

      toast({
        title: 'Sauvegarde',
        description: 'Progression sauvegardée avec succès',
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la progression',
        variant: 'destructive',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.config, state.currentStep, state.articles, toast]);

  // Mise à jour d'un article spécifique
  const updateArticle = useCallback(async <T,>(userId: string, articleKey: string, articleData: T) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'UPDATE_ARTICLE', articleKey, payload: articleData });

      // Sauvegarder l'article spécifique
      const articlesPath = `users/${userId}/contracts/config/articles`;
      const articleRef = doc(firestore, articlesPath, articleKey);
      await setDoc(articleRef, articleData, { merge: true });

      dispatch({ type: 'MARK_SAVED', timestamp: new Date() });
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'article ${articleKey}:`, error);
      toast({
        title: 'Erreur',
        description: `Impossible de sauvegarder l'article ${articleKey}`,
        variant: 'destructive',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [toast]);

  // Navigation entre les étapes
  const goToStep = useCallback((step: number) => {
    if (state.config && step <= state.config.progress) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: step });
    } else {
      toast({
        title: 'Navigation limitée',
        description: 'Vous devez compléter les étapes précédentes',
      });
    }
  }, [state.config, toast]);

  // Effet pour la sauvegarde automatique périodique
  useEffect(() => {
    if (!state.config || !state.isDirty) return;

    const autoSaveInterval = setTimeout(() => {
      saveCurrentStep(state.config?.userId || '');
    }, 60000); // Auto-sauvegarde toutes les minutes

    return () => clearTimeout(autoSaveInterval);
  }, [state.config, state.isDirty, saveCurrentStep]);

  const value = {
    state,
    dispatch,
    loadContractData,
    saveCurrentStep,
    updateArticle,
    goToStep
  };

  return (
    <ContractStateContext.Provider value={value}>
      {children}
    </ContractStateContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useContractState = () => {
  const context = useContext(ContractStateContext);
  if (context === undefined) {
    throw new Error('useContractState doit être utilisé avec ContractStateProvider');
  }
  return context;
}; 