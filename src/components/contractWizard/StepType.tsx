import React, { useState } from 'react';
import { AIContractMemory, AISuggestion } from '@/types/firebase';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  FileText, 
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAIContractMemory } from '@/hooks/useAIContractMemory';
import { AIAssistant } from './AIAssistant';
import { suggestClause } from '@/lib/ai/service';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface StepTypeProps {
  memory: AIContractMemory | null;
  onUpdateMemory: (
    field: keyof AIContractMemory, 
    value: AIContractMemory[keyof AIContractMemory]
  ) => Promise<void>;
  onComplete: () => void;
}

type ContractType = 'CDI_temps_plein' | 'CDI_temps_partiel' | 'CDD_temps_plein' | 'CDD_temps_partiel';

interface ContractTypeOption {
  id: ContractType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export function StepType({ memory, onUpdateMemory, onComplete }: StepTypeProps) {
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const { addMessage, updateField } = useAIContractMemory();
  const { toast } = useToast();
  const [contractDuration, setContractDuration] = useState<'cdi' | 'cdd'>(
    memory?.contractType?.startsWith('CDI') ? 'cdi' : 
    memory?.contractType?.startsWith('CDD') ? 'cdd' : 'cdi'
  );
  const [workingTime, setWorkingTime] = useState<'full' | 'part'>(
    memory?.contractType?.endsWith('temps_plein') ? 'full' : 
    memory?.contractType?.endsWith('temps_partiel') ? 'part' : 'full'
  );

  // Options de types de contrat disponibles (seulement CDI et CDD)
  const contractTypes: ContractTypeOption[] = [
    {
      id: 'CDI_temps_plein',
      title: 'CDI à temps plein',
      description: 'Contrat à durée indéterminée avec horaires complets (35h/semaine)',
      icon: <FileText className="h-10 w-10" />,
      color: 'text-emerald-500'
    },
    {
      id: 'CDI_temps_partiel',
      title: 'CDI à temps partiel',
      description: 'Contrat à durée indéterminée avec horaires réduits',
      icon: <FileText className="h-10 w-10" />,
      color: 'text-emerald-500'
    },
    {
      id: 'CDD_temps_plein',
      title: 'CDD à temps plein',
      description: 'Contrat à durée déterminée avec horaires complets',
      icon: <Calendar className="h-10 w-10" />,
      color: 'text-amber-500'
    },
    {
      id: 'CDD_temps_partiel',
      title: 'CDD à temps partiel',
      description: 'Contrat à durée déterminée avec horaires réduits',
      icon: <Calendar className="h-10 w-10" />,
      color: 'text-amber-500'
    }
  ];

  // Calculer le type de contrat actuel basé sur les sélections
  const getCurrentContractType = (): ContractType => {
    if (contractDuration === 'cdi') {
      return workingTime === 'full' ? 'CDI_temps_plein' : 'CDI_temps_partiel';
    } else {
      return workingTime === 'full' ? 'CDD_temps_plein' : 'CDD_temps_partiel';
    }
  };

  // Mettre à jour le type de contrat
  const updateContractType = async () => {
    const contractType = getCurrentContractType();
    
    try {
      // Mettre à jour le type de contrat dans la mémoire IA
      await onUpdateMemory('contractType', contractType);
      
      // Ajouter un message à l'historique IA
      await addMessage({
        role: 'user',
        content: `J'ai choisi un ${getContractTypeDisplayName(contractType)} pour ce contrat.`
      });
      
      // Demander une suggestion à l'IA pour la clause d'introduction
      await generateIntroductionClause(contractType);
      
      toast({
        title: 'Type de contrat sélectionné',
        description: `Vous avez choisi un ${getContractTypeDisplayName(contractType)}.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Erreur lors de la sélection du type de contrat:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sélectionner ce type de contrat.',
        variant: 'destructive',
      });
    }
  };

  // Obtenir le nom d'affichage du type de contrat
  const getContractTypeDisplayName = (type: ContractType): string => {
    const contractType = contractTypes.find(ct => ct.id === type);
    return contractType ? contractType.title : type;
  };

  // Générer une clause d'introduction avec l'IA 
  const generateIntroductionClause = async (contractType: ContractType) => {
    if (!memory) return;
    
    try {
      setIsLoadingAI(true);
      
      // Appeler le service d'IA avec Genkit
      const aiSuggestion = await suggestClause(memory, 2);
      
      // Stocker la suggestion
      setSuggestion(aiSuggestion);
      
      // Ajouter un message à l'historique (réponse de l'IA)
      await addMessage({
        role: 'assistant',
        content: aiSuggestion.suggestion
      });
      
      // Mettre à jour la clause d'introduction dans la mémoire
      if (memory.clauses) {
        await updateField('clauses', {
          ...memory.clauses,
          introduction: aiSuggestion.suggestion
        });
      }
      
      // Appliquer les suggestions de champs si présentes
      if (aiSuggestion.fields) {
        // Vérifier s'il y a des suggestions pour position, salary ou workingHours
        const fieldsToUpdate = { ...memory.fields };
        let hasUpdate = false;
        
        if (aiSuggestion.fields.position && !memory.fields.position) {
          fieldsToUpdate.position = aiSuggestion.fields.position as string;
          hasUpdate = true;
        }
        
        if (aiSuggestion.fields.salary && !memory.fields.salary) {
          fieldsToUpdate.salary = aiSuggestion.fields.salary as number;
          hasUpdate = true;
        }
        
        if (aiSuggestion.fields.workingHours && !memory.fields.workingHours) {
          fieldsToUpdate.workingHours = aiSuggestion.fields.workingHours as string;
          hasUpdate = true;
        }
        
        if (aiSuggestion.fields.startDate && !memory.fields.startDate) {
          fieldsToUpdate.startDate = aiSuggestion.fields.startDate as string;
          hasUpdate = true;
        }
        
        // Mettre à jour les champs si nécessaire
        if (hasUpdate) {
          await updateField('fields', fieldsToUpdate);
        }
      }
      
    } catch (error) {
      console.error('Erreur lors de la génération de la clause:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer la clause d\'introduction.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Accepter la suggestion de l'IA
  const handleAcceptSuggestion = async (suggestion: AISuggestion) => {
    if (!memory) return;
    
    try {
      // Mettre à jour les clauses dans la mémoire IA
      await updateField('clauses', {
        ...memory.clauses,
        introduction: suggestion.suggestion
      });
      
      // Mettre à jour les champs supplémentaires si présents
      if (suggestion.fields && Object.keys(suggestion.fields).length > 0) {
        await updateField('fields', {
          ...memory.fields,
          ...suggestion.fields
        });
      }
      
      // Ajouter un message à l'historique
      await addMessage({
        role: 'user',
        content: 'J\'ai accepté votre suggestion pour la clause d\'introduction.'
      });
      
      toast({
        title: 'Suggestion acceptée',
        description: 'La clause d\'introduction a été ajoutée au contrat.',
        variant: 'default',
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la suggestion:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'accepter la suggestion.',
        variant: 'destructive',
      });
    }
  };

  // Modifier la suggestion de l'IA
  const handleModifySuggestion = async (suggestion: string) => {
    if (!memory) return;
    
    try {
      // Mettre à jour les clauses dans la mémoire IA avec la version modifiée
      await updateField('clauses', {
        ...memory.clauses,
        introduction: suggestion
      });
      
      // Ajouter un message à l'historique
      await addMessage({
        role: 'user',
        content: 'J\'ai modifié votre suggestion pour la clause d\'introduction.'
      });
      
      toast({
        title: 'Suggestion modifiée',
        description: 'La clause d\'introduction a été mise à jour selon vos modifications.',
        variant: 'default',
      });
      
    } catch (error) {
      console.error('Erreur lors de la modification de la suggestion:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier la suggestion.',
        variant: 'destructive',
      });
    }
  };

  // Poser une question à l'IA
  const handleAskQuestion = async (question: string) => {
    await addMessage({
      role: 'user',
      content: question
    });
    
    // Ici, dans une version complète, on appellerait l'IA pour obtenir une réponse
    // Pour le moment, on se contente d'ajouter la question à l'historique
  };

  // Gérer les changements de sélection et mettre à jour le contrat
  const handleDurationChange = (value: 'cdi' | 'cdd') => {
    setContractDuration(value);
    updateContractType();
  };

  const handleWorkingTimeChange = (value: 'full' | 'part') => {
    setWorkingTime(value);
    updateContractType();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 border">
        <h3 className="text-xl font-medium mb-6">Sélection du type de contrat</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-base font-medium mb-3">1. Quelle est la durée du contrat ?</h4>
            <RadioGroup 
              defaultValue={contractDuration} 
              onValueChange={(v) => handleDurationChange(v as 'cdi' | 'cdd')}
              className="flex flex-col md:flex-row gap-4"
            >
              <div className={`flex-1 p-4 border rounded-lg transition-all ${contractDuration === 'cdi' ? 'border-emerald-500 bg-emerald-50' : 'hover:border-primary'}`}>
                <RadioGroupItem value="cdi" id="cdi" className="sr-only" />
                <Label 
                  htmlFor="cdi" 
                  className="flex items-start cursor-pointer gap-4 h-full"
                >
                  <FileText className={`h-8 w-8 mt-1 ${contractDuration === 'cdi' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      CDI
                      {contractDuration === 'cdi' && <Check className="h-4 w-4 text-emerald-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Contrat à durée indéterminée - relation de travail sans limite de temps.
                    </p>
                  </div>
                </Label>
              </div>
              
              <div className={`flex-1 p-4 border rounded-lg transition-all ${contractDuration === 'cdd' ? 'border-amber-500 bg-amber-50' : 'hover:border-primary'}`}>
                <RadioGroupItem value="cdd" id="cdd" className="sr-only" />
                <Label 
                  htmlFor="cdd" 
                  className="flex items-start cursor-pointer gap-4 h-full"
                >
                  <Calendar className={`h-8 w-8 mt-1 ${contractDuration === 'cdd' ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      CDD
                      {contractDuration === 'cdd' && <Check className="h-4 w-4 text-amber-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Contrat à durée déterminée - relation de travail limitée dans le temps.
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="text-base font-medium mb-3">2. Quel est le temps de travail ?</h4>
            <RadioGroup 
              defaultValue={workingTime}
              onValueChange={(v) => handleWorkingTimeChange(v as 'full' | 'part')}
              className="flex flex-col md:flex-row gap-4"
            >
              <div className={`flex-1 p-4 border rounded-lg transition-all ${workingTime === 'full' ? 'border-blue-500 bg-blue-50' : 'hover:border-primary'}`}>
                <RadioGroupItem value="full" id="full" className="sr-only" />
                <Label 
                  htmlFor="full" 
                  className="flex items-start cursor-pointer gap-4 h-full"
                >
                  <Clock className={`h-8 w-8 mt-1 ${workingTime === 'full' ? 'text-blue-500' : 'text-muted-foreground'}`} />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      Temps plein
                      {workingTime === 'full' && <Check className="h-4 w-4 text-blue-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      35 heures par semaine (durée légale) ou équivalent selon convention.
                    </p>
                  </div>
                </Label>
              </div>
              
              <div className={`flex-1 p-4 border rounded-lg transition-all ${workingTime === 'part' ? 'border-purple-500 bg-purple-50' : 'hover:border-primary'}`}>
                <RadioGroupItem value="part" id="part" className="sr-only" />
                <Label 
                  htmlFor="part" 
                  className="flex items-start cursor-pointer gap-4 h-full"
                >
                  <Clock className={`h-8 w-8 mt-1 ${workingTime === 'part' ? 'text-purple-500' : 'text-muted-foreground'}`} />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      Temps partiel
                      {workingTime === 'part' && <Check className="h-4 w-4 text-purple-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Durée inférieure à la durée légale du travail ou à la durée conventionnelle.
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-700 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Type de contrat sélectionné
            </h4>
            <p className="text-blue-700 font-medium mt-1">
              {getContractTypeDisplayName(getCurrentContractType())}
            </p>
          </div>
        </div>
        
        {memory?.contractType && memory.clauses.introduction && (
          <div className="mt-6 flex justify-end">
            <Button onClick={onComplete} className="gap-2">
              Continuer
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <AIAssistant 
        memory={memory}
        isLoading={isLoadingAI}
        suggestion={suggestion}
        onAcceptSuggestion={handleAcceptSuggestion}
        onModifySuggestion={handleModifySuggestion}
        onAskQuestion={handleAskQuestion}
      />
    </div>
  );
}