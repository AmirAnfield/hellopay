'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save, History, FileCheck } from 'lucide-react';
import { ContractConfig, ContractType, WorkingHours, Company, Employee } from '@/types/contract';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { ContractPreviewStep } from './ContractPreviewStep';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/lib/firebase';

// Importation des services
import { 
  getContractConfig, 
  updateContractType, 
  updateWorkingHours, 
  updateCompany, 
  updateEmployee, 
  updatePreambule, 
  submitFinalContract,
  getContractArticles,
  getArticle1Nature,
  getArticle6Remuneration,
  getArticle7Benefits,
  getArticle8Leaves,
  loadUserCompanies,
  loadUserEmployees,
  saveArticle1Nature,
  saveArticle2EntryDate,
  saveArticle2CDDEntry,
  saveArticle3Functions,
  saveArticle4Workplace,
  saveArticle5WorkingSchedule,
  saveArticle6Remuneration,
  saveArticle7Benefits,
  saveArticle8Leaves,
  saveArticle9DataProtection,
  saveArticle10Conduct,
  saveArticle11Confidentiality,
  saveArticle12NonCompete,
  saveArticle13Teleworking,
  saveArticle14Termination,
  saveContractConfig
} from '@/services';

// Importation des étapes du contrat (composants)
import {
  CompanyStep,
  ContractTypeStep,
  EmployeeStep,
  PreambuleStep,
  WorkingHoursStep,
  Article1NatureStep, 
  Article2EntryDateStep,
  Article2CDDEntryStep,
  Article3FunctionsStep,
  Article4WorkplaceStep,
  Article5WorkingScheduleStep,
  Article6RemunerationStep,
  Article7BenefitsStep,
  Article8LeavesStep,
  Article9DataProtectionStep,
  Article10ConductStep,
  Article11ConfidentialityStep,
  Article12NonCompeteStep,
  Article13TeleworkingStep,
  Article14TerminationStep,
} from '@/components/contract';

// Importation des types des articles
import { 
  Article1Nature,
  Article6Remuneration,
  Article7Benefits,
  Article8Leaves
} from '@/types/contract-articles';

// Type pour les sauvegardes
interface SavedState {
  id: string;
  name: string;
  date: Date;
  progress: number;
}

export function ContractWizard() {
  // État du wizard
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [contractConfig, setContractConfig] = useState<ContractConfig | null>(null);
  const [articles, setArticles] = useState<Record<string, any>>({});
  const [savedStates, setSavedStates] = useState<SavedState[]>([]);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  
  // États des données utilisateur
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [userEmployees, setUserEmployees] = useState<Employee[]>([]);
  
  // État des articles
  const [article1Data, setArticle1Data] = useState<Article1Nature | null>(null);
  const [article6Data, setArticle6Data] = useState<Article6Remuneration | null>(null);
  const [article7Data, setArticle7Data] = useState<Article7Benefits | null>(null);
  const [article8Data, setArticle8Data] = useState<Article8Leaves | null>(null);
  
  // État pour la navigation
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  // Conversion step index (0-based) à step ID (1-based)
  const stepId = currentStep + 1;
  
  // Services externes
  const { toast } = useToast();
  
  // Configuration du wizard
  const totalSteps = 20;
  const steps = [
    { id: 1, title: 'Type de contrat', category: 'Configuration de base' },
    { id: 2, title: 'Heures de travail', category: 'Configuration de base' },
    { id: 3, title: 'Entreprise', category: 'Configuration de base' },
    { id: 4, title: 'Employé', category: 'Configuration de base' },
    { id: 5, title: 'Préambule', category: 'Configuration de base' },
    { id: 6, title: 'Article 1 - Nature du contrat', category: 'Contrat principal' },
    { id: 7, title: 'Article 2 - Entrée en fonction', category: 'Contrat principal' },
    { id: 8, title: 'Article 3 - Fonctions', category: 'Contrat principal' },
    { id: 9, title: 'Article 4 - Lieu de travail', category: 'Contrat principal' },
    { id: 10, title: 'Article 5 - Organisation du travail', category: 'Contrat principal' },
    { id: 11, title: 'Article 6 - Rémunération', category: 'Contrat principal' },
    { id: 12, title: 'Article 7 - Avantages', category: 'Contrat principal' },
    { id: 13, title: 'Article 8 - Congés', category: 'Contrat principal' },
    { id: 14, title: 'Article 9 - Données personnelles', category: 'Clauses additionnelles' },
    { id: 15, title: 'Article 10 - Tenue et règles', category: 'Clauses additionnelles' },
    { id: 16, title: 'Article 11 - Confidentialité', category: 'Clauses additionnelles' },
    { id: 17, title: 'Article 12 - Non-concurrence', category: 'Clauses additionnelles' },
    { id: 18, title: 'Article 13 - Télétravail', category: 'Clauses additionnelles' },
    { id: 19, title: 'Article 14 - Rupture du contrat', category: 'Clauses additionnelles' },
    { id: 20, title: 'Aperçu du contrat', category: 'Finalisation' },
  ];
  
  // Regrouper les étapes par catégorie
  const categories = steps.reduce((acc, step) => {
    if (!acc[step.category]) {
      acc[step.category] = [];
    }
    acc[step.category].push(step);
    return acc;
  }, {} as Record<string, typeof steps>);
  
  // Chargement initial des données
  useEffect(() => {
    const loadContractData = async () => {
      try {
        setIsLoading(true);
        
        // Obtenir l'ID de l'utilisateur actuel
        const userId = auth.currentUser?.uid || 'user123';
        
        console.log("Chargement des données de contrat pour l'utilisateur:", userId);
        
        // Charger les entreprises et employés de l'utilisateur
        const companies = await loadUserCompanies(userId);
        const employees = await loadUserEmployees(userId);
        
        console.log("Entreprises chargées:", companies.length);
        setUserCompanies(companies);
        setUserEmployees(employees);
        
        // Charger la configuration existante
        const config = await getContractConfig(userId);
        if (config) {
          setContractConfig(config);
          setCurrentStep(config.progress);
          setProgress((config.progress / totalSteps) * 100);
          
          // Déterminer la catégorie actuelle
          const currentStepObj = steps.find(s => s.id === config.progress);
          if (currentStepObj) {
            // Initialiser les catégories dépliées (uniquement celle active par défaut)
            const expandedState: Record<string, boolean> = {};
            Object.keys(categories).forEach(category => {
              expandedState[category] = category === currentStepObj.category;
            });
            setExpandedCategories(expandedState);
          }
          
          // Charger les articles selon l'étape
          if (config.progress >= 5) {
            const article1 = await getArticle1Nature(userId);
            if (article1) setArticle1Data(article1 as unknown as Article1Nature);
          }
          
          if (config.progress >= 10) {
            const article6 = await getArticle6Remuneration(userId);
            if (article6) setArticle6Data(article6 as unknown as Article6Remuneration);
          }
          
          if (config.progress >= 11) {
            const article7 = await getArticle7Benefits(userId);
            if (article7) setArticle7Data(article7 as unknown as Article7Benefits);
          }
          
          if (config.progress >= 12) {
            const article8 = await getArticle8Leaves(userId);
            if (article8) setArticle8Data(article8 as unknown as Article8Leaves);
          }
          
          // Si étape d'aperçu, charger tous les articles
          if (config.progress === 20) {
            const allArticles = await getContractArticles(userId);
            setArticles(allArticles);
          }
        } else {
          // Création d'une nouvelle configuration
          setContractConfig({
            userId,
            status: 'draft' as 'draft',
            progress: 0,
            contractType: 'CDI', // Valeur par défaut
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        
        // Simuler des sauvegardes existantes
        setSavedStates([
          { id: 'save1', name: 'Brouillon initial', date: new Date(Date.now() - 86400000), progress: 35 },
          { id: 'save2', name: 'Version avec rémunération', date: new Date(Date.now() - 43200000), progress: 55 },
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: 'Erreur de chargement',
          description: 'Impossible de charger les données du contrat',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContractData();
  }, [toast]);
  
  // Gérer le changement d'étape
  const handleNextStep = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setProgress((nextStep / totalSteps) * 100);
    
    // Sauvegarder automatiquement
    handleAutoSave();
  };
  
  const handlePreviousStep = () => {
    const prevStep = Math.max(0, currentStep - 1);
    setCurrentStep(prevStep);
    setProgress((prevStep / totalSteps) * 100);
  };
  
  const goToStep = (step: number) => {
    // Vérifier que l'étape demandée est accessible (si inférieure ou égale à l'étape maximale atteinte)
    if (contractConfig && step >= 0 && step <= contractConfig.progress) {
      setCurrentStep(step);
      setProgress((step / totalSteps) * 100);
    } else {
      toast({
        title: 'Accès limité',
        description: 'Vous devez compléter les étapes précédentes',
        variant: 'default',
      });
    }
  };
  
  // S'assurer que les sections de navigation sont dépliées au chargement
  useEffect(() => {
    // On s'assure que toutes les sections sont visibles initialement
    Object.keys(categories).forEach(category => {
      const el = document.getElementById(`category-${category.replace(/\s+/g, '-').toLowerCase()}`);
      if (el) {
        el.classList.remove('hidden');
      }
    });
  }, [categories]);
  
  // Sauvegarde et chargement
  const handleAutoSave = async () => {
    // Implémentation de la sauvegarde automatique
    toast({
      title: 'Sauvegarde automatique',
      description: 'Votre progression a été sauvegardée',
    });
  };
  
  const handleSaveState = () => {
    const newSave = {
      id: `save-${Date.now()}`,
      name: `Sauvegarde du ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`,
      date: new Date(),
      progress: Math.round((currentStep / totalSteps) * 100),
    };
    
    setSavedStates([newSave, ...savedStates]);
    
    toast({
      title: 'Sauvegarde créée',
      description: 'Votre progression a été sauvegardée',
    });
  };
  
  const handleLoadState = (saveId: string) => {
    const savedState = savedStates.find(state => state.id === saveId);
    if (savedState) {
      // Dans une implémentation réelle, nous chargerions les données depuis Firestore
      setCurrentStep(Math.round((savedState.progress * totalSteps) / 100));
      setProgress(savedState.progress);
      
      toast({
        title: 'Sauvegarde chargée',
        description: `${savedState.name} a été restaurée`,
      });
    }
  };
  
  // Fonctions de mise à jour des données
  const handleUpdateContractType = async (companyId: string, employeeId: string) => {
    try {
      setIsLoading(true);
      
      // Récupérer les données complètes de l'entreprise et de l'employé
      const company = userCompanies.find(c => c.id === companyId);
      const employee = userEmployees.find(e => e.id === employeeId);
      
      if (!company || !employee) {
        throw new Error("Entreprise ou employé introuvable");
      }
      
      // 1. Créer un nouveau contrat en base
      const userId = auth.currentUser?.uid || 'user123';
      console.log(`Création d'un nouveau contrat pour l'utilisateur: ${userId}`);
      
      // Créer une configuration de base pour le contrat
      const newContractConfig = {
        userId,
        status: 'draft' as 'draft',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        company: { ...company },
        employee: { ...employee },
      };
      
      // 2. Sauvegarder cette configuration dans Firestore
      const savedConfig = await saveContractConfig(userId, newContractConfig);
      
      // 3. Créer une collection de documents si elle n'existe pas déjà
      // Cette partie serait gérée côté backend
      
      console.log("Nouveau contrat créé:", savedConfig);
      setContractConfig(savedConfig);
      
      // 4. Passer à l'étape suivante
      handleNextStep();
      
      // Notification de succès
      toast({
        title: 'Contrat créé',
        description: 'Le contrat a été créé avec succès',
      });
    } catch (error) {
      console.error('Erreur lors de la création du contrat:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de créer le contrat',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateWorkingHours = async (hours: WorkingHours) => {
    if (!contractConfig) return;
    
    try {
      setIsLoading(true);
      const updatedConfig = await updateWorkingHours(contractConfig.userId, hours);
      setContractConfig(updatedConfig);
      handleNextStep();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des heures de travail:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les heures de travail',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateCompany = async (company: Company) => {
    if (!contractConfig) return;
    
    try {
      setIsLoading(true);
      const updatedConfig = await updateCompany(contractConfig.userId, company);
      setContractConfig(updatedConfig);
      handleNextStep();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'entreprise:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'entreprise',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateEmployee = async (employee: Employee) => {
    if (!contractConfig) return;
    
    try {
      setIsLoading(true);
      const updatedConfig = await updateEmployee(contractConfig.userId, employee);
      setContractConfig(updatedConfig);
      handleNextStep();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'employé:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'employé',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdatePreambule = async (hasPreambule: boolean) => {
    if (!contractConfig) return;
    
    try {
      setIsLoading(true);
      const updatedConfig = await updatePreambule(contractConfig.userId, hasPreambule);
      setContractConfig(updatedConfig);
      handleNextStep();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du préambule:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le préambule',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Finalisation du contrat
  const handleFinalizeContract = async () => {
    try {
      setIsLoading(true);
      
      if (!contractConfig) return;
      
      await submitFinalContract(contractConfig.userId);
      
      toast({
        title: 'Contrat finalisé',
        description: 'Votre contrat a été validé avec succès',
      });
      
      // Redirection vers la page du contrat (simulée)
      console.log('Redirection vers le contrat finalisé');
    } catch (error) {
      console.error('Erreur lors de la finalisation du contrat:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de finaliser le contrat',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Implémentation générique pour les articles qui utilisent onSaveArticle
  const handleSaveArticle = async (data: any) => {
    try {
      if (!contractConfig) return;
      
      setIsLoading(true);
      const userId = contractConfig.userId;
      
      // Sauvegarder les données selon l'étape actuelle
      switch (currentStep) {
        case 6: // Article 1 - Nature du contrat
          await saveArticle1Nature(userId, data);
          break;
        case 7: // Article 2 - Date d'entrée en fonction
          if (contractConfig.contractType === 'CDD') {
            await saveArticle2CDDEntry(userId, data);
          } else {
            await saveArticle2EntryDate(userId, data);
          }
          break;
        case 8: // Article 3 - Fonctions
          await saveArticle3Functions(userId, data);
          break;
        case 9: // Article 4 - Lieu de travail
          await saveArticle4Workplace(userId, data);
          break;
        case 10: // Article 5 - Organisation du travail
          await saveArticle5WorkingSchedule(userId, data);
          break;
        case 11: // Article 6 - Rémunération
          await saveArticle6Remuneration(userId, data);
          break;
        case 12: // Article 7 - Avantages
          await saveArticle7Benefits(userId, data);
          break;
        case 13: // Article 8 - Congés
          await saveArticle8Leaves(userId, data);
          break;
        case 14: // Article 9 - Données personnelles
          await saveArticle9DataProtection(userId, data);
          break;
        case 15: // Article 10 - Tenue et règles
          await saveArticle10Conduct(userId, data);
          break;
        case 16: // Article 11 - Confidentialité
          await saveArticle11Confidentiality(userId, data);
          break;
        case 17: // Article 12 - Non-concurrence
          await saveArticle12NonCompete(userId, data);
          break;
        case 18: // Article 13 - Télétravail
          await saveArticle13Teleworking(userId, data);
          break;
        case 19: // Article 14 - Rupture du contrat
          await saveArticle14Termination(userId, data);
          break;
      }
      
      // Notification de succès
      toast({
        title: 'Article sauvegardé',
        description: 'Votre article a été sauvegardé avec succès',
      });
      
      // Passer à l'étape suivante
      handleNextStep();
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Erreur',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la sauvegarde',
          variant: 'destructive',
        });
      }
      console.error('Erreur lors de la sauvegarde de l\'article:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render du contenu de l'étape actuelle
  const renderStepContent = () => {
    if (!contractConfig) return null;
    
    // Si mode aperçu, afficher la prévisualisation
    if (viewMode === 'preview') {
      return (
        <ContractPreviewStep
          contractConfig={contractConfig}
          articles={articles}
          isLoading={isLoading}
          onBack={() => setViewMode('edit')}
          onValidateContract={handleFinalizeContract}
        />
      );
    }
    
    // Log pour le débogage
    console.log(`Affichage de l'étape: index=${currentStep}, id=${stepId}`);
    
    // Sinon, afficher l'étape en cours
    switch (currentStep) {
      case 0: // Création d'un nouveau contrat
        return (
          <ContractTypeStep
            onCreateContract={handleUpdateContractType}
            isLoading={isLoading}
          />
        );
        
      case 1: // Heures hebdomadaires (24/28/30/35)
        return (
          <WorkingHoursStep
            onSelectHours={handleUpdateWorkingHours}
            selectedHours={contractConfig.workingHours}
            isLoading={isLoading}
            onBack={handlePreviousStep}
          />
        );
        
      case 2: // Sélection de l'entreprise
        return (
          <CompanyStep
            onSelectCompany={handleUpdateCompany}
            companies={userCompanies}
            selectedCompanyId={contractConfig.company?.id}
            isLoading={isLoading}
            isLoadingCompanies={isLoading}
            onBack={handlePreviousStep}
          />
        );
        
      case 3: // Sélection de l'employé
        return (
          <EmployeeStep
            onSelectEmployee={handleUpdateEmployee}
            employees={userEmployees}
            selectedEmployeeId={contractConfig.employee?.id}
            isLoading={isLoading}
            isLoadingEmployees={isLoading}
            onBack={handlePreviousStep}
          />
        );
        
      case 4: // Préambule (optionnel)
        return (
          <PreambuleStep
            onSelectPreambule={handleUpdatePreambule}
            hasPreambule={contractConfig.hasPreambule}
            isLoading={isLoading}
            onBack={handlePreviousStep}
          />
        );
        
      case 5: // Article 1 - Nature du contrat
        return (
          <Article1NatureStep
            contractType={contractConfig.contractType || 'CDI'}
            onSaveArticle={handleSaveArticle}
            initialData={article1Data || undefined}
            isLoading={isLoading}
            onBack={handlePreviousStep}
          />
        );
        
      case 6: // Article 2 - Date d'entrée en fonction
        return contractConfig.contractType === 'CDD' ? (
          <Article2CDDEntryStep 
            onSaveArticle={handleSaveArticle}
            isLoading={isLoading}
            onBack={handlePreviousStep}
          />
        ) : (
          <Article2EntryDateStep
            onSaveArticle={handleSaveArticle}
            isLoading={isLoading}
            onBack={handlePreviousStep}
          />
        );
        
      // Autres étapes pour les articles 3 à 14...
      case 7:
        return (
          <Article3FunctionsStep
            onSaveArticle={handleSaveArticle}
            isLoading={isLoading}
            onBack={handlePreviousStep}
          />
        );
        
      case 8:
        return (
          <Article4WorkplaceStep
            onSaveArticle={handleSaveArticle}
            isLoading={isLoading}
            onBack={handlePreviousStep}
          />
        );
        
      case 9:
        return (
          <Article5WorkingScheduleStep
            contractType={contractConfig.contractType || 'CDI'}
            workingHours={contractConfig.workingHours || 35}
            isPartTime={contractConfig.isPartTime || false}
            onSaveArticle={handleSaveArticle}
            isLoading={isLoading}
            onBack={handlePreviousStep}
          />
        );
        
      case 10:
        return (
          <Article6RemunerationStep
            contractType={contractConfig.contractType || 'CDI'}
            workingHours={contractConfig.workingHours || 35}
            isPartTime={contractConfig.isPartTime || false}
            onSaveArticle={handleSaveArticle}
            initialData={article6Data || undefined}
            isLoading={isLoading}
            onBack={handlePreviousStep}
          />
        );
        
      case 11:
        return (
          <Article7BenefitsStep
            onSaveArticle={handleSaveArticle}
            initialData={article7Data || undefined}
            isLoading={isLoading}
            onBack={handlePreviousStep}
          />
        );
        
      case 12:
        return (
          <Article8LeavesStep
            contractType={contractConfig.contractType || 'CDI'}
            onSaveArticle={handleSaveArticle}
            initialData={article8Data || undefined}
            isLoading={isLoading}
            onBack={handlePreviousStep}
          />
        );
        
      case 13:
        return (
          <Article9DataProtectionStep
            onSaveArticle={handleSaveArticle}
            isLoading={isLoading}
            onBack={handlePreviousStep}
          />
        );
        
      case 14:
        return (
          <Article10ConductStep
            onSaveArticle={handleSaveArticle}
            isLoading={isLoading}
            onBack={handlePreviousStep}
          />
        );
        
      case 15:
        return (
          <Article11ConfidentialityStep
            onSaveArticle={handleSaveArticle}
            isLoading={isLoading}
            onBack={handlePreviousStep}
          />
        );
        
      case 16:
        return (
          <Article12NonCompeteStep
            contractType={contractConfig.contractType || 'CDI'}
            onSaveArticle={handleSaveArticle}
            isLoading={isLoading}
            onBack={handlePreviousStep}
          />
        );
        
      case 17:
        return (
          <Article13TeleworkingStep
            onSaveArticle={handleSaveArticle}
            isLoading={isLoading}
            onBack={handlePreviousStep}
          />
        );
        
      case 18:
        return (
          <Article14TerminationStep
            contractType={contractConfig.contractType || 'CDI'}
            onSaveArticle={handleSaveArticle}
            isLoading={isLoading}
            onBack={handlePreviousStep}
          />
        );
        
      case 19: // Aperçu final
        // À l'étape 19, charger les articles si pas déjà fait
        if (Object.keys(articles).length === 0) {
          const loadArticles = async () => {
            try {
              setIsLoading(true);
              if (!contractConfig) return;
              const allArticles = await getContractArticles(contractConfig.userId);
              setArticles(allArticles);
            } catch (error) {
              console.error('Erreur lors du chargement des articles:', error);
            } finally {
              setIsLoading(false);
            }
          };
          loadArticles();
        }
        
        return (
          <ContractPreviewStep
            contractConfig={contractConfig}
            articles={articles}
            isLoading={isLoading}
            onBack={handlePreviousStep}
            onValidateContract={handleFinalizeContract}
          />
        );
        
      default:
        return (
          <div className="p-8 text-center">
            <p>Étape {stepId} en construction</p>
            <div className="flex justify-center gap-4 mt-6">
              <Button variant="outline" onClick={handlePreviousStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>
              <Button onClick={handleNextStep}>
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
    }
  };
  
  // Rendu principal du composant
  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Création de contrat de travail</h1>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveState} className="flex items-center">
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <History className="mr-2 h-4 w-4" />
                Historique
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Versions sauvegardées</SheetTitle>
                <SheetDescription>
                  Restaurez une version précédente de votre contrat
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {savedStates.map(state => (
                  <div 
                    key={state.id} 
                    className="p-4 border rounded-md hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleLoadState(state.id)}
                  >
                    <h3 className="font-medium">{state.name}</h3>
                    <div className="flex justify-between text-sm text-slate-500 mt-1">
                      <span>{state.date.toLocaleString()}</span>
                      <span>{state.progress}% complété</span>
                    </div>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          
          <Button 
            variant={viewMode === 'preview' ? 'default' : 'outline'} 
            onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
            className="flex items-center"
          >
            <FileCheck className="mr-2 h-4 w-4" />
            {viewMode === 'edit' ? 'Aperçu' : 'Édition'}
          </Button>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progression ({Math.round(progress)}%)</span>
          <span className="text-sm">{stepId}/{totalSteps-1}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="flex gap-6">
        {/* Sidebar de navigation */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b">
              <h2 className="font-semibold text-sm">Navigation du contrat</h2>
            </div>
            
            <div className="p-2">
              {Object.entries(categories).map(([category, categorySteps], idx) => {
                const isExpanded = expandedCategories[category] !== false; // par défaut ouvert si non défini
                
                return (
                  <div key={category} className={idx > 0 ? "mt-3" : ""}>
                    <div 
                      className="flex items-center justify-between px-2 py-1.5 text-xs font-semibold rounded-md cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                      onClick={() => {
                        setExpandedCategories({
                          ...expandedCategories,
                          [category]: !isExpanded
                        });
                      }}
                    >
                      <h3 className="uppercase tracking-wider text-slate-600">{category}</h3>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                    {isExpanded && (
                      <ul className="space-y-0.5 mt-1 pl-1">
                        {categorySteps.map(step => {
                          const isCompleted = contractConfig && contractConfig.progress >= step.id;
                          const isCurrent = currentStep === step.id-1;
                          
                          return (
                            <li 
                              key={step.id}
                              className={`
                                py-1.5 px-2 rounded-md text-xs cursor-pointer flex items-center
                                ${isCurrent ? 'bg-blue-50 text-blue-800 font-medium' : ''}
                                ${!isCurrent && isCompleted ? 'text-slate-700 hover:bg-slate-50' : ''}
                                ${!isCompleted ? 'text-slate-400 cursor-not-allowed' : ''}
                                transition-colors duration-150
                              `}
                              onClick={() => isCompleted && goToStep(step.id-1)}
                            >
                              <div className={`
                                flex items-center justify-center w-5 h-5 rounded-full mr-2 text-[10px] font-bold
                                ${isCurrent ? 'bg-red-100 text-red-600 border border-red-300' : ''}
                                ${!isCurrent && isCompleted ? 'bg-green-100 text-green-600 border border-green-300' : ''}
                                ${!isCompleted ? 'bg-gray-100 text-gray-400 border border-gray-200' : ''}
                              `}>
                                {step.id}
                              </div>
                              <span className="truncate leading-tight">{step.title}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
              
              {/* Légende */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-2 mb-2">Légende</p>
                <div className="px-2 space-y-1.5">
                  <div className="flex items-center text-xs">
                    <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 border border-green-300 mr-2"></div>
                    <span className="text-slate-700">Étape complétée</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 border border-red-300 mr-2"></div>
                    <span className="text-slate-700">Étape en cours</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className="w-4 h-4 rounded-full bg-gray-100 text-gray-400 border border-gray-200 mr-2"></div>
                    <span className="text-slate-700">Étape à venir</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="flex-1">
          <Card className="p-6">
            {renderStepContent()}
          </Card>
        </div>
      </div>
    </div>
  );
} 