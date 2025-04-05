// Ce fichier sera la nouvelle version du wizard de création de contrat
// Il remplacera l'ancienne page create/page.tsx une fois terminé

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAIContractMemory } from '@/hooks/useAIContractMemory';
import { WizardLayout, WIZARD_STEPS } from '@/components/contractWizard/WizardLayout';
import { StepParties } from '@/components/contractWizard/StepParties';
import { StepType } from '@/components/contractWizard/StepType';
import { ContractPreview } from '@/components/contractWizard/ContractPreview';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { AIContractMemory } from '@/types/firebase';

export default function ContractWizardPage() {
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
  const handleUpdateMemory = async (field: keyof typeof memory, value: unknown) => {
    if (!memory) return;
    await updateField(field, value as any); // Type assertion nécessaire car updateField a un type générique
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

  // Afficher le composant correspondant à l'étape actuelle
  const renderCurrentStep = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    switch (currentStep) {
      case 'parties':
        return (
          <StepParties 
            memory={memory} 
            onUpdateMemory={handleUpdateMemory} 
            onComplete={goToNextStep} 
          />
        );
      case 'type':
        return (
          <StepType 
            memory={memory} 
            onUpdateMemory={handleUpdateMemory} 
            onComplete={goToNextStep} 
          />
        );
      // TODO: Ajouter les autres étapes au fur et à mesure
      default:
        return <div>Étape {currentStep} en cours de développement</div>;
    }
  };

  return (
    <WizardLayout
      currentStep={currentStep}
      onNext={goToNextStep}
      onPrevious={goToPreviousStep}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
      preview={<ContractPreview memory={memory} isLoading={isLoading} />}
    >
      {renderCurrentStep()}
    </WizardLayout>
  );
} 