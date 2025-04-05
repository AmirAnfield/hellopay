import React, { useState } from 'react';
import { AIContractMemory, AISuggestion } from '@/types/firebase';
import { Button } from '@/components/ui/button';
import { Check, FileText, Calendar, Briefcase, GraduationCap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAIContractMemory } from '@/hooks/useAIContractMemory';
import { AIAssistant } from './AIAssistant';
import { suggestClause } from '@/lib/ai/service';

interface StepTypeProps {
  memory: AIContractMemory | null;
  onUpdateMemory: (
    field: keyof AIContractMemory, 
    value: AIContractMemory[keyof AIContractMemory]
  ) => Promise<void>;
  onComplete: () => void;
}

type ContractType = 'CDI_temps_plein' | 'CDI_temps_partiel' | 'CDD_temps_plein' | 'CDD_temps_partiel' | 'STAGE' | 'FREELANCE';

interface ContractTypeOption {
  id: ContractType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function StepType({ memory, onUpdateMemory, onComplete }: StepTypeProps) {
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const { addMessage, updateField } = useAIContractMemory();
  const { toast } = useToast();

  // Options de types de contrat disponibles
  const contractTypes: ContractTypeOption[] = [
    {
      id: 'CDI_temps_plein',
      title: 'CDI à temps plein',
      description: 'Contrat à durée indéterminée avec horaires complets (35h/semaine)',
      icon: <FileText className="h-10 w-10 text-primary/50" />
    },
    {
      id: 'CDI_temps_partiel',
      title: 'CDI à temps partiel',
      description: 'Contrat à durée indéterminée avec horaires réduits',
      icon: <FileText className="h-10 w-10 text-primary/50" />
    },
    {
      id: 'CDD_temps_plein',
      title: 'CDD à temps plein',
      description: 'Contrat à durée déterminée avec horaires complets',
      icon: <Calendar className="h-10 w-10 text-amber-500/50" />
    },
    {
      id: 'CDD_temps_partiel',
      title: 'CDD à temps partiel',
      description: 'Contrat à durée déterminée avec horaires réduits',
      icon: <Calendar className="h-10 w-10 text-amber-500/50" />
    },
    {
      id: 'STAGE',
      title: 'Stage',
      description: 'Convention de stage pour stagiaires et étudiants',
      icon: <GraduationCap className="h-10 w-10 text-blue-500/50" />
    },
    {
      id: 'FREELANCE',
      title: 'Freelance / Prestation',
      description: 'Contrat de prestation de services indépendants',
      icon: <Briefcase className="h-10 w-10 text-emerald-500/50" />
    }
  ];

  // Sélection d'un type de contrat
  const handleContractTypeSelect = async (contractType: ContractType) => {
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-5">
        <h3 className="text-lg font-medium mb-5">Sélection du type de contrat</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contractTypes.map((type) => (
            <div
              key={type.id}
              className={`
                border rounded-lg p-4 cursor-pointer transition-all 
                hover:border-primary hover:shadow-sm
                ${memory?.contractType === type.id ? 'border-primary/70 bg-primary/5 shadow-sm' : ''}
              `}
              onClick={() => handleContractTypeSelect(type.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-1">{type.icon}</div>
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-base mb-1">{type.title}</h4>
                    {memory?.contractType === type.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {memory?.contractType && memory.clauses.introduction && (
          <div className="mt-6 flex justify-end">
            <Button onClick={onComplete}>
              Continuer
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