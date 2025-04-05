"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useAIContractMemory } from '@/hooks/useAIContractMemory';
import { WizardLayout, WIZARD_STEPS } from '@/components/contractWizard/WizardLayout';
import { StepParties } from '@/components/contractWizard/StepParties';
import { StepType } from '@/components/contractWizard/StepType';
import { StepDetails } from '@/components/contractWizard/StepDetails';
import { StepSignature } from '@/components/contractWizard/StepSignature';
import { ContractPreview } from '@/components/contractWizard/ContractPreview';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { AIContractMemory } from '@/types/firebase';
import { AuthProvider } from '@/contexts/AuthContext';

// Composant wrapper avec AuthProvider
function ContractWizardContent() {
  const router = useRouter();
  
  const { memory, isLoading, error, updateField, setStep, resetMemory } = useAIContractMemory();
  const [currentStep, setCurrentStep] = useState<string>('parties');
  const [isSaving, setIsSaving] = useState(false);

  // Initialiser la mémoire IA et définir l'étape initiale
  useEffect(() => {
    if (memory && memory.step) {
      // Trouver l'étape correspondant au numéro dans la mémoire
      const stepId = WIZARD_STEPS[Math.min(memory.step - 1, WIZARD_STEPS.length - 1)].id;
      setCurrentStep(stepId);
    }
  }, [memory]);

  // Gérer les erreurs
  useEffect(() => {
    if (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error]);

  // Naviguer vers l'étape suivante
  const goToNextStep = async () => {
    const currentIndex = WIZARD_STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex < WIZARD_STEPS.length - 1) {
      const nextStep = WIZARD_STEPS[currentIndex + 1];
      setCurrentStep(nextStep.id);
      
      // Mettre à jour l'étape dans la mémoire IA
      await setStep(currentIndex + 2); // +2 car les indices commencent à 0 mais les étapes à 1
    }
  };

  // Naviguer vers l'étape précédente
  const goToPreviousStep = async () => {
    const currentIndex = WIZARD_STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      const prevStep = WIZARD_STEPS[currentIndex - 1];
      setCurrentStep(prevStep.id);
      
      // Mettre à jour l'étape dans la mémoire IA
      await setStep(currentIndex); // currentIndex est déjà décalé de 1 par rapport aux étapes
    }
  };

  // Mettre à jour un champ spécifique dans la mémoire IA
  const handleUpdateMemory = async <K extends keyof AIContractMemory>(field: K, value: AIContractMemory[K]) => {
    if (!memory) return;
    await updateField(field, value);
  };

  // Sauvegarder le contrat
  const handleSave = async () => {
    if (!memory) return;
    
    try {
      setIsSaving(true);
      
      // Simuler une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Contrat sauvegardé',
        description: 'Votre progression a été enregistrée avec succès.',
        variant: 'default',
      });
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du contrat:', error);
      toast({
        title: 'Erreur de sauvegarde',
        description: 'Impossible de sauvegarder le contrat.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Annuler la création de contrat
  const handleCancel = async () => {
    const confirmed = window.confirm('Voulez-vous vraiment annuler la création de ce contrat ? Toutes vos modifications seront perdues.');
    
    if (confirmed) {
      // Réinitialiser la mémoire IA
      await resetMemory();
      router.push('/dashboard/contracts');
    }
  };

  // Afficher les composants en fonction de l'étape actuelle
  const renderStepComponent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!memory) return null;

    switch (memory.step) {
      case 1: // PARTIES
        return (
          <StepParties 
            memory={memory} 
            onUpdateMemory={handleUpdateMemory}
            onComplete={goToNextStep}
          />
        );
      case 2: // TYPE
        return (
          <StepType 
            memory={memory} 
            onUpdateMemory={handleUpdateMemory}
            onComplete={goToNextStep}
          />
        );
      case 3: // DETAILS
        return (
          <StepDetails 
            memory={memory} 
            onUpdateMemory={handleUpdateMemory}
            onComplete={goToNextStep}
          />
        );
      case 4: // SIGNATURE
        return (
          <StepSignature 
            memory={memory} 
            onUpdateMemory={handleUpdateMemory}
            onComplete={goToNextStep}
          />
        );
      case 5: // PREVIEW
        return (
          <ContractPreview 
            memory={memory} 
            onBackStep={goToPreviousStep}
            onFinish={handleSave}
          />
        );
      default:
        return (
          <div className="p-4 rounded-lg border border-destructive bg-destructive/5">
            <p>Étape inconnue: {memory.step}</p>
          </div>
        );
    }
  };

  return (
    <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <WizardLayout 
        currentStep={memory?.step || 1}
        steps={WIZARD_STEPS}
        onStepClick={goToNextStep}
        isCompletedStep={false}
        error={error}
        onReset={handleCancel}
      >
        {renderStepComponent()}
      </WizardLayout>
    </main>
  );
}

// Composant principal exporté avec AuthProvider
export default function ContractWizardPage() {
  return (
    <AuthProvider>
      <ContractWizardContent />
    </AuthProvider>
  );
} 