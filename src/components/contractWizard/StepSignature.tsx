import React, { useState, useEffect } from 'react';
import { AIContractMemory, AISuggestion } from '@/types/firebase';
import { Button } from '@/components/ui/button';
import { Check, FileText, Download, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAIContractMemory } from '@/hooks/useAIContractMemory';
import { AIAssistant } from './AIAssistant';
import { suggestClause } from '@/lib/ai/service';
import { FinalizeContractButton } from './FinalizeContractButton';

interface StepSignatureProps {
  memory: AIContractMemory | null;
  onUpdateMemory: (
    field: keyof AIContractMemory, 
    value: AIContractMemory[keyof AIContractMemory]
  ) => Promise<void>;
  onComplete: () => void;
}

export function StepSignature({ memory, onUpdateMemory, onComplete }: StepSignatureProps) {
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratedContract, setIsGeneratedContract] = useState(false);
  const { addMessage, updateField } = useAIContractMemory();
  const { toast } = useToast();

  // Générer une conclusion avec l'IA au chargement du composant
  useEffect(() => {
    if (memory && !suggestion) {
      generateContractSummary();
    }
  }, [memory]);

  // Générer un résumé du contrat avec l'IA
  const generateContractSummary = async () => {
    if (!memory) return;
    
    try {
      setIsLoadingAI(true);
      
      // Appeler le service d'IA avec Genkit
      const aiSuggestion = await suggestClause(memory, 4);
      
      // Stocker la suggestion
      setSuggestion(aiSuggestion);
      
      // Ajouter un message à l'historique (réponse de l'IA)
      await addMessage({
        role: 'assistant',
        content: aiSuggestion.suggestion
      });
      
      // Mettre à jour la clause de conclusion dans la mémoire
      if (memory.clauses) {
        await updateField('clauses', {
          ...memory.clauses,
          termination: aiSuggestion.suggestion
        });
      }
      
    } catch (error) {
      console.error('Erreur lors de la génération du résumé:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le résumé du contrat.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Générer le contrat final
  const handleGenerateContract = async () => {
    if (!memory) return;
    
    try {
      setIsGenerating(true);
      
      // Simuler la génération du contrat (délai artificiel)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Dans une version réelle, on appellerait une Firebase Function pour générer le PDF
      
      // Ajouter un message à l'historique IA
      await addMessage({
        role: 'user',
        content: "J'ai généré le contrat final basé sur les informations fournies."
      });
      
      // Marquer le contrat comme généré
      setIsGeneratedContract(true);
      
      toast({
        title: 'Contrat généré',
        description: 'Votre contrat a été généré avec succès.',
        variant: 'default',
      });
      
    } catch (error) {
      console.error("Erreur lors de la génération du contrat:", error);
      toast({
        title: 'Erreur',
        description: "Impossible de générer le contrat.",
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Envoyer le contrat par email
  const handleSendContract = async () => {
    try {
      // Simuler l'envoi d'email (délai artificiel)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dans une version réelle, on appellerait une Firebase Function pour envoyer l'email
      
      toast({
        title: 'Email envoyé',
        description: 'Le contrat a été envoyé par email aux parties concernées.',
        variant: 'default',
      });
      
      // Terminer le wizard
      onComplete();
      
    } catch (error) {
      console.error("Erreur lors de l'envoi du contrat:", error);
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer le contrat par email.",
        variant: 'destructive',
      });
    }
  };

  // Gérer les questions à l'IA
  const handleAskQuestion = async (question: string) => {
    await addMessage({
      role: 'user',
      content: question
    });
    
    // Ici, dans une version complète, on appellerait l'IA pour obtenir une réponse
    // Pour le moment, on se contente d'ajouter la question à l'historique
  };

  // Vérifier si le contrat est complet et prêt pour la génération
  const isContractComplete = () => {
    if (!memory) return false;
    
    // Vérifier que les informations essentielles sont présentes
    return (
      memory.company?.name &&
      memory.employee?.fullName &&
      memory.contractType &&
      memory.fields.position &&
      memory.fields.salary &&
      memory.fields.startDate &&
      memory.clauses.introduction
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-5">
        <h3 className="text-lg font-medium mb-5">Finalisation du contrat</h3>
        
        <div className="space-y-6">
          {/* Résumé du contrat */}
          <div className="bg-slate-50 rounded-md p-4 space-y-3">
            <h4 className="font-medium text-sm">Récapitulatif du contrat</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <div>
                  <span className="font-medium">Type de contrat:</span>{' '}
                  {memory?.contractType?.replace('_', ' à ')}
                </div>
              </div>
              
              <div className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <div>
                  <span className="font-medium">Parties:</span>{' '}
                  {memory?.company?.name} et {memory?.employee?.fullName}
                </div>
              </div>
              
              <div className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <div>
                  <span className="font-medium">Poste:</span>{' '}
                  {memory?.fields.position}
                </div>
              </div>
              
              <div className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <div>
                  <span className="font-medium">Rémunération:</span>{' '}
                  {memory?.fields.salary} € brut par mois
                </div>
              </div>
              
              <div className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <div>
                  <span className="font-medium">Horaires:</span>{' '}
                  {memory?.fields.workingHours} heures/semaine
                </div>
              </div>
              
              <div className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <div>
                  <span className="font-medium">Date de début:</span>{' '}
                  {memory?.fields.startDate}
                </div>
              </div>
              
              {memory?.fields.trialPeriod && (
                <div className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">Période d'essai:</span>{' '}
                    {memory.fields.trialPeriodDuration}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Boutons d'action */}
          <div className="space-y-4">
            {!isGeneratedContract ? (
              <Button 
                onClick={handleGenerateContract} 
                disabled={!isContractComplete() || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>Génération en cours...</>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Générer le contrat
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <Button 
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le contrat (aperçu)
                </Button>
                
                <div className="border-t border-dashed my-4 pt-4">
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    Votre contrat est prêt. Vous pouvez maintenant le finaliser pour le sauvegarder et créer le PDF officiel.
                  </p>
                  
                  <FinalizeContractButton
                    contractId={memory?.id || ''}
                    memoryId={memory?.id}
                    className="w-full"
                    disabled={!isContractComplete()}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AIAssistant 
        memory={memory}
        isLoading={isLoadingAI}
        suggestion={suggestion}
        onAcceptSuggestion={(aiSuggestion) => {
          if (memory?.clauses) {
            updateField('clauses', {
              ...memory.clauses,
              termination: aiSuggestion.suggestion
            });
          }
        }}
        onModifySuggestion={(modifiedText) => {
          if (memory?.clauses) {
            updateField('clauses', {
              ...memory.clauses,
              termination: modifiedText
            });
          }
        }}
        onAskQuestion={async (question) => {
          await addMessage({
            role: 'user',
            content: question
          });
        }}
      />
    </div>
  );
} 