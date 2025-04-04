"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save, CheckCircle2, Trash } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { ContractData, CONTRACT_WIZARD_STEPS } from "./ContractData";
import { EntitySelectionStep } from "./EntitySelectionStep";
import { ContractParametersStep } from "./ContractParametersStep";
import { ContractArticlesStep } from "./ContractArticlesStep";
import { ContractClausesStep } from "./ContractClausesStep";
import { ContractPreviewStep } from "./ContractPreviewStep";
import { ContractFinalizeStep } from "./ContractFinalizeStep";

interface ContractWizardProps {
  contractId?: string; // Pour l'édition d'un contrat existant
  initialStep?: string; // Étape initiale
}

export default function ContractWizard({
  contractId,
  initialStep = "entity",
}: ContractWizardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [progress, setProgress] = useState(0);

  // État pour les données du contrat
  const [contractData, setContractData] = useState<ContractData>({
    id: contractId || `contract-${Date.now()}-${uuidv4().substring(0, 8)}`,
    title: "",
    status: "draft",
    contractType: "CDI",
    startDate: new Date().toISOString().split("T")[0],
    company: {
      id: "",
      name: "",
    },
    probationPeriod: {
      enabled: true,
      durationMonths: 2,
      renewalEnabled: false,
    },
    workSchedule: {
      hoursPerWeek: 35,
      daysPerWeek: 5,
      scheduleType: "fixed",
    },
    compensation: {
      baseSalary: 0,
      currency: "EUR",
      paymentFrequency: "monthly",
    },
    articles: [],
    additionalClauses: [],
    documentOptions: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    wizardProgress: {
      currentStep: initialStep,
      completedSteps: [],
      lastSaved: new Date().toISOString(),
    },
  });

  // Chargement d'un contrat existant
  useEffect(() => {
    if (contractId) {
      setIsLoading(true);
      try {
        // Récupérer les contrats depuis le localStorage
        const storedContracts = localStorage.getItem("contracts");
        if (storedContracts) {
          const contracts = JSON.parse(storedContracts);
          const existingContract = contracts.find(
            (contract: ContractData) => contract.id === contractId
          );

          if (existingContract) {
            setContractData(existingContract);
            setCurrentStep(
              existingContract.wizardProgress?.currentStep || initialStep
            );
          } else {
            toast({
              title: "Contrat introuvable",
              description: "Le contrat demandé n'a pas été trouvé.",
              variant: "destructive",
            });
            router.push("/dashboard/contracts");
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement du contrat:", error);
        toast({
          title: "Erreur",
          description:
            "Une erreur est survenue lors du chargement du contrat. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [contractId, initialStep, router, toast]);

  // Calcul de la progression
  useEffect(() => {
    const currentStepIndex = CONTRACT_WIZARD_STEPS.findIndex(
      (step) => step.id === currentStep
    );
    const progressValue =
      ((currentStepIndex + 1) / CONTRACT_WIZARD_STEPS.length) * 100;
    setProgress(progressValue);
  }, [currentStep]);

  // Mise à jour des données du contrat
  const handleDataChange = (newData: Partial<ContractData>) => {
    setContractData((prev) => ({
      ...prev,
      ...newData,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Navigation entre les étapes
  const goToStep = (stepId: string) => {
    setCurrentStep(stepId);
    handleDataChange({
      wizardProgress: {
        ...contractData.wizardProgress,
        currentStep: stepId,
      },
    });
  };

  const goToNextStep = () => {
    const currentStepIndex = CONTRACT_WIZARD_STEPS.findIndex(
      (step) => step.id === currentStep
    );
    if (currentStepIndex < CONTRACT_WIZARD_STEPS.length - 1) {
      const nextStep = CONTRACT_WIZARD_STEPS[currentStepIndex + 1].id;
      goToStep(nextStep);

      // Marquer l'étape comme complétée
      const completedSteps = [...contractData.wizardProgress.completedSteps];
      if (!completedSteps.includes(currentStep)) {
        completedSteps.push(currentStep);
      }
      handleDataChange({
        wizardProgress: {
          ...contractData.wizardProgress,
          currentStep: nextStep,
          completedSteps,
        },
      });
    }
  };

  const goToPreviousStep = () => {
    const currentStepIndex = CONTRACT_WIZARD_STEPS.findIndex(
      (step) => step.id === currentStep
    );
    if (currentStepIndex > 0) {
      const prevStep = CONTRACT_WIZARD_STEPS[currentStepIndex - 1].id;
      goToStep(prevStep);
    }
  };

  // Enregistrement du brouillon
  const saveAsDraft = () => {
    const updatedContract = {
      ...contractData,
      status: "draft",
      updatedAt: new Date().toISOString(),
      wizardProgress: {
        ...contractData.wizardProgress,
        lastSaved: new Date().toISOString(),
      },
    };

    try {
      // Récupérer les contrats existants
      const storedContracts = localStorage.getItem("contracts");
      const contracts = storedContracts ? JSON.parse(storedContracts) : [];

      // Vérifier si le contrat existe déjà
      const existingIndex = contracts.findIndex(
        (c: ContractData) => c.id === updatedContract.id
      );

      if (existingIndex >= 0) {
        // Mettre à jour le contrat existant
        contracts[existingIndex] = updatedContract;
      } else {
        // Ajouter le nouveau contrat
        contracts.push(updatedContract);
      }

      // Enregistrer dans le localStorage
      localStorage.setItem("contracts", JSON.stringify(contracts));

      toast({
        title: "Brouillon enregistré",
        description: "Le contrat a été enregistré comme brouillon.",
      });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du brouillon:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de l'enregistrement du brouillon. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  // Finalisation du contrat
  const finalizeContract = () => {
    const updatedContract = {
      ...contractData,
      status: "active",
      updatedAt: new Date().toISOString(),
    };

    try {
      // Récupérer les contrats existants
      const storedContracts = localStorage.getItem("contracts");
      const contracts = storedContracts ? JSON.parse(storedContracts) : [];

      // Vérifier si le contrat existe déjà
      const existingIndex = contracts.findIndex(
        (c: ContractData) => c.id === updatedContract.id
      );

      if (existingIndex >= 0) {
        // Mettre à jour le contrat existant
        contracts[existingIndex] = updatedContract;
      } else {
        // Ajouter le nouveau contrat
        contracts.push(updatedContract);
      }

      // Enregistrer dans le localStorage
      localStorage.setItem("contracts", JSON.stringify(contracts));

      toast({
        title: "Contrat finalisé",
        description: "Le contrat a été créé avec succès.",
      });

      // Rediriger vers la liste des contrats
      router.push("/dashboard/contracts");
    } catch (error) {
      console.error("Erreur lors de la finalisation du contrat:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la finalisation du contrat. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  // Suppression du contrat
  const deleteContract = () => {
    try {
      // Récupérer les contrats existants
      const storedContracts = localStorage.getItem("contracts");
      if (storedContracts) {
        let contracts = JSON.parse(storedContracts);
        
        // Filtrer pour retirer le contrat actuel
        contracts = contracts.filter(
          (c: ContractData) => c.id !== contractData.id
        );
        
        // Enregistrer dans le localStorage
        localStorage.setItem("contracts", JSON.stringify(contracts));
        
        toast({
          title: "Contrat supprimé",
          description: "Le contrat a été supprimé avec succès.",
        });
        
        // Rediriger vers la liste des contrats
        router.push("/dashboard/contracts");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du contrat:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la suppression du contrat. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  // Rendu du contenu de l'étape actuelle
  const renderStepContent = () => {
    switch (currentStep) {
      case "entity":
        return (
          <EntitySelectionStep
            contractData={contractData}
            onDataChange={handleDataChange}
            onNext={goToNextStep}
          />
        );
      case "parameters":
        return (
          <ContractParametersStep
            contractData={contractData}
            onDataChange={handleDataChange}
            onNext={goToNextStep}
          />
        );
      case "articles":
        return (
          <ContractArticlesStep
            contractData={contractData}
            onDataChange={handleDataChange}
            onNext={goToNextStep}
          />
        );
      case "clauses":
        return (
          <ContractClausesStep
            contractData={contractData}
            onDataChange={handleDataChange}
            onNext={goToNextStep}
          />
        );
      case "preview":
        return (
          <ContractPreviewStep
            contractData={contractData}
            onDataChange={handleDataChange}
            onNext={goToNextStep}
          />
        );
      case "finalize":
        return (
          <ContractFinalizeStep
            contractData={contractData}
            onDataChange={handleDataChange}
            onNext={goToNextStep}
          />
        );
      default:
        return <div>Étape non implémentée: {currentStep}</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h3 className="mt-4 text-lg font-medium">Chargement du contrat...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {contractId ? "Modifier le contrat" : "Nouveau contrat"}
          </h1>
          <p className="text-muted-foreground">
            {CONTRACT_WIZARD_STEPS.find((step) => step.id === currentStep)?.description}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={saveAsDraft}>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
          {contractId && (
            <Button variant="destructive" onClick={deleteContract}>
              <Trash className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2">
          {CONTRACT_WIZARD_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`text-xs font-medium ${
                currentStep === step.id
                  ? "text-primary"
                  : contractData.wizardProgress.completedSteps.includes(step.id)
                  ? "text-primary/70"
                  : "text-muted-foreground"
              }`}
              style={{
                position: "absolute",
                left: `${(index / (CONTRACT_WIZARD_STEPS.length - 1)) * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-6">
          {CONTRACT_WIZARD_STEPS.map((step) => (
            <button
              key={step.id}
              className={`text-xs font-medium flex flex-col items-center ${
                currentStep === step.id
                  ? "text-primary"
                  : contractData.wizardProgress.completedSteps.includes(step.id)
                  ? "text-primary/70 hover:text-primary"
                  : "text-muted-foreground"
              }`}
              onClick={() => {
                // Ne permettre la navigation que vers les étapes complétées
                if (
                  currentStep === step.id ||
                  contractData.wizardProgress.completedSteps.includes(step.id)
                ) {
                  goToStep(step.id);
                }
              }}
            >
              {step.title}
              {contractData.wizardProgress.completedSteps.includes(step.id) && (
                <CheckCircle2 className="h-3 w-3 mt-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {CONTRACT_WIZARD_STEPS.find((step) => step.id === currentStep)?.title}
          </CardTitle>
          <CardDescription>
            {CONTRACT_WIZARD_STEPS.find((step) => step.id === currentStep)?.description}
          </CardDescription>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
        <CardFooter className="flex justify-between">
          <div>
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStep === CONTRACT_WIZARD_STEPS[0].id}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={saveAsDraft}>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer comme brouillon
            </Button>
            {currentStep === CONTRACT_WIZARD_STEPS[CONTRACT_WIZARD_STEPS.length - 1].id ? (
              <Button onClick={finalizeContract}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Finaliser le contrat
              </Button>
            ) : (
              <Button
                onClick={goToNextStep}
                disabled={!contractData.wizardProgress.completedSteps.includes(
                  currentStep
                )}
              >
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 