'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save, History, FileCheck } from 'lucide-react';
import { ContractConfig } from '@/types/contract';
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

// Importation des services
import { 
  getContractConfig, 
  updateContractType, 
  updateWorkingHours, 
  updateCompany, 
  updateEmployee, 
  updatePreambule, 
  submitFinalContract
} from '@/services/contractService';
import { getContractArticles } from '@/services/contractFinalizeService';

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

// Services des articles
import { getArticle1Nature, saveArticle1Nature } from '@/services/contractArticlesService';
import { getArticle6Remuneration, saveArticle6Remuneration } from '@/services/article6RemunerationService';
import { getArticle7Benefits, saveArticle7Benefits } from '@/services/article7BenefitsService';
import { getArticle8Leaves, saveArticle8Leaves } from '@/services/article8LeavesService';

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
  
  // État des articles
  const [article1Data, setArticle1Data] = useState<any>(null);
  const [article6Data, setArticle6Data] = useState<any>(null);
  const [article7Data, setArticle7Data] = useState<any>(null);
  const [article8Data, setArticle8Data] = useState<any>(null);
  
  // Services externes
  const { toast } = useToast();
  
  // Configuration du wizard
  const totalSteps = 20;
  const steps = [
    { id: 0, title: 'Type de contrat', category: 'Configuration de base' },
    { id: 1, title: 'Heures de travail', category: 'Configuration de base' },
    { id: 2, title: 'Entreprise', category: 'Configuration de base' },
    { id: 3, title: 'Employé', category: 'Configuration de base' },
    { id: 4, title: 'Préambule', category: 'Configuration de base' },
    { id: 5, title: 'Article 1 - Nature du contrat', category: 'Contrat principal' },
    { id: 6, title: 'Article 2 - Entrée en fonction', category: 'Contrat principal' },
    { id: 7, title: 'Article 3 - Fonctions', category: 'Contrat principal' },
    { id: 8, title: 'Article 4 - Lieu de travail', category: 'Contrat principal' },
    { id: 9, title: 'Article 5 - Organisation du travail', category: 'Contrat principal' },
    { id: 10, title: 'Article 6 - Rémunération', category: 'Contrat principal' },
    { id: 11, title: 'Article 7 - Avantages', category: 'Contrat principal' },
    { id: 12, title: 'Article 8 - Congés', category: 'Contrat principal' },
    { id: 13, title: 'Article 9 - Données personnelles', category: 'Clauses additionnelles' },
    { id: 14, title: 'Article 10 - Tenue et règles', category: 'Clauses additionnelles' },
    { id: 15, title: 'Article 11 - Confidentialité', category: 'Clauses additionnelles' },
    { id: 16, title: 'Article 12 - Non-concurrence', category: 'Clauses additionnelles' },
    { id: 17, title: 'Article 13 - Télétravail', category: 'Clauses additionnelles' },
    { id: 18, title: 'Article 14 - Rupture du contrat', category: 'Clauses additionnelles' },
    { id: 19, title: 'Aperçu du contrat', category: 'Finalisation' },
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
        
        // Simuler un utilisateur pour le développement
        const userId = 'user123';
        
        // Charger la configuration existante
        const config = await getContractConfig(userId);
        if (config) {
          setContractConfig(config);
          setCurrentStep(config.progress);
          setProgress((config.progress / totalSteps) * 100);
          
          // Charger les articles selon l'étape
          if (config.progress >= 5) {
            const article1 = await getArticle1Nature(userId);
            setArticle1Data(article1);
          }
          
          if (config.progress >= 10) {
            const article6 = await getArticle6Remuneration(userId);
            setArticle6Data(article6);
          }
          
          if (config.progress >= 11) {
            const article7 = await getArticle7Benefits(userId);
            setArticle7Data(article7);
          }
          
          if (config.progress >= 12) {
            const article8 = await getArticle8Leaves(userId);
            setArticle8Data(article8);
          }
          
          // Si étape d'aperçu, charger tous les articles
          if (config.progress === 19) {
            const allArticles = await getContractArticles(userId);
            setArticles(allArticles);
          }
        } else {
          // Création d'une nouvelle configuration
          setContractConfig({
            userId: userId,
            status: 'draft',
            progress: 0,
            contractType: 'CDI',
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
    if (contractConfig && step <= contractConfig.progress) {
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
  
  // Finalisation du contrat
  const handleFinalizeContract = async () => {
    try {
      setIsLoading(true);
      
      // Simuler un utilisateur pour le développement
      const userId = 'user123';
      
      await submitFinalContract(userId);
      
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
    
    // Sinon, afficher l'étape en cours
    switch (currentStep) {
      case 0:
        return (
          <ContractTypeStep
            onSelectType={(type) => console.log('Type sélectionné:', type)}
            selectedType={contractConfig.contractType}
            isLoading={isLoading}
          />
        );
      case 1:
        return (
          <WorkingHoursStep
            onSelectHours={(hours) => console.log('Heures sélectionnées:', hours)}
            selectedHours={contractConfig.workingHours}
            isLoading={isLoading}
            onBack={handlePreviousStep}
          />
        );
      // Autres étapes...
      case 19:
        // À l'étape 19, charger les articles si pas déjà fait
        if (Object.keys(articles).length === 0) {
          const loadArticles = async () => {
            try {
              setIsLoading(true);
              const userId = 'user123';
              const allArticles = await getContractArticles(userId);
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
            <p>Étape {currentStep} en construction</p>
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
          <span className="text-sm">{currentStep}/{totalSteps-1}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="flex gap-6">
        {/* Sidebar de navigation */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-semibold mb-4">Navigation</h2>
            
            {Object.entries(categories).map(([category, categorySteps]) => (
              <div key={category} className="mb-4">
                <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-2">{category}</h3>
                <ul className="space-y-1">
                  {categorySteps.map(step => {
                    const isCompleted = contractConfig?.progress >= step.id;
                    const isCurrent = currentStep === step.id;
                    
                    return (
                      <li 
                        key={step.id}
                        className={`
                          p-2 rounded-md text-sm cursor-pointer flex items-center
                          ${isCurrent ? 'bg-blue-50 text-blue-700' : ''}
                          ${!isCurrent && isCompleted ? 'text-slate-700 hover:bg-slate-50' : ''}
                          ${!isCompleted ? 'text-slate-400 cursor-not-allowed' : ''}
                        `}
                        onClick={() => isCompleted && goToStep(step.id)}
                      >
                        {isCompleted ? (
                          <svg 
                            className={`mr-2 h-4 w-4 ${isCurrent ? 'text-blue-500' : 'text-green-500'}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="h-4 w-4 mr-2 rounded-full border border-slate-300"></div>
                        )}
                        {step.title}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
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