import React, { useState, ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAIContractMemory } from '@/hooks/useAIContractMemory';
import { useToast } from '@/components/ui/use-toast';

// Étapes du wizard
export const WIZARD_STEPS = [
  { id: 'parties', title: 'Parties', description: 'Identification des parties contractantes' },
  { id: 'type', title: 'Type de contrat', description: 'Type et paramètres du contrat' },
  { id: 'details', title: 'Détails', description: 'Horaires, clauses et conditions' },
  { id: 'signature', title: 'Finalisation', description: 'Validation et signature' }
];

interface WizardLayoutProps {
  children: ReactNode;
  currentStep: string;
  onNext: () => void;
  onPrevious: () => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  preview: ReactNode;
  isSaving?: boolean;
}

export function WizardLayout({
  children,
  currentStep,
  onNext,
  onPrevious,
  onSave,
  onCancel,
  preview,
  isSaving = false
}: WizardLayoutProps) {
  const { isLoading } = useAIContractMemory();
  const { toast } = useToast();
  const [isNavigating, setIsNavigating] = useState(false);

  // Calcul de l'index d'étape et du pourcentage de progression
  const currentStepIndex = WIZARD_STEPS.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / WIZARD_STEPS.length) * 100;

  // Gestion du bouton précédent
  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setIsNavigating(true);
      onPrevious();
      setTimeout(() => setIsNavigating(false), 500);
    }
  };

  // Gestion du bouton suivant
  const handleNext = () => {
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setIsNavigating(true);
      onNext();
      setTimeout(() => setIsNavigating(false), 500);
    }
  };

  // Gestion de la sauvegarde
  const handleSave = async () => {
    try {
      await onSave();
      toast({
        title: 'Sauvegarde réussie',
        description: 'Vos modifications ont été enregistrées.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: 'Erreur de sauvegarde',
        description: 'Un problème est survenu lors de la sauvegarde.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement des données en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-[1600px] mx-auto">
      {/* En-tête et navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Link href="/dashboard/documents" className="inline-flex items-center text-sm text-muted-foreground mb-2 hover:text-primary transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour à document
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Créer un nouveau contrat</h1>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0 || isNavigating || isSaving}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline"
            size="icon"
            onClick={handleSave}
            disabled={isSaving || isNavigating}
            className="h-10 w-10 relative"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
          </Button>
          
          <Button 
            variant="outline"
            size="icon"
            onClick={onCancel}
            disabled={isSaving || isNavigating}
            className="h-10 w-10 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentStepIndex === WIZARD_STEPS.length - 1 || isNavigating || isSaving}
            className="h-10 w-10"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Barre de progression unifiée */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className="text-sm font-medium text-primary">{currentStepIndex + 1}</span>
            <span className="text-sm text-muted-foreground mx-1.5">/</span>
            <span className="text-sm text-muted-foreground">{WIZARD_STEPS.length}</span>
            <span className="text-sm font-medium ml-3">{WIZARD_STEPS[currentStepIndex]?.title}</span>
          </div>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}% complété</span>
        </div>
        <Progress value={progress} className="h-2 mb-4" />
      </div>
      
      {/* Contenu principal: formulaire à gauche et aperçu à droite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulaire interactif */}
        <div className="lg:col-span-5 xl:col-span-5">
          <div className="bg-blue-50 dark:bg-slate-800/30 rounded-lg p-5 h-full">
            {/* Contenu de l'étape actuelle */}
            {children}
          </div>
        </div>
        
        {/* Aperçu du contrat avec IA */}
        <div className="lg:col-span-7 xl:col-span-7">
          {preview}
        </div>
      </div>
    </div>
  );
} 