import React, { useState, useEffect } from 'react';
import { AIContractMemory, AISuggestion } from '@/types/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock, Briefcase, Euro, MapPin, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useAIContractMemory } from '@/hooks/useAIContractMemory';
import { AIAssistant } from './AIAssistant';
import { suggestClause } from '@/lib/ai/service';

interface StepDetailsProps {
  memory: AIContractMemory | null;
  onUpdateMemory: (
    field: keyof AIContractMemory, 
    value: AIContractMemory[keyof AIContractMemory]
  ) => Promise<void>;
  onComplete: () => void;
}

export function StepDetails({ memory, onUpdateMemory, onComplete }: StepDetailsProps) {
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const { addMessage, updateField } = useAIContractMemory();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // État local pour les champs du formulaire
  const [formFields, setFormFields] = useState({
    workingHours: memory?.fields.workingHours || '',
    hasRemoteWork: memory?.fields.hasRemoteWork || false,
    salary: memory?.fields.salary?.toString() || '',
    position: memory?.fields.position || '',
    workLocation: memory?.fields.workLocation || '',
    trialPeriod: memory?.fields.trialPeriod || false,
    trialPeriodDuration: memory?.fields.trialPeriodDuration || ''
  });

  // Initialiser les dates si présentes dans la mémoire
  useEffect(() => {
    if (memory?.fields.startDate) {
      setStartDate(new Date(memory.fields.startDate));
    }
    if (memory?.fields.endDate) {
      setEndDate(new Date(memory.fields.endDate));
    }
  }, [memory]);

  // Mettre à jour les champs locaux quand la mémoire change
  useEffect(() => {
    if (memory) {
      setFormFields({
        workingHours: memory.fields.workingHours || '',
        hasRemoteWork: memory.fields.hasRemoteWork || false,
        salary: memory.fields.salary?.toString() || '',
        position: memory.fields.position || '',
        workLocation: memory.fields.workLocation || '',
        trialPeriod: memory.fields.trialPeriod || false,
        trialPeriodDuration: memory.fields.trialPeriodDuration || ''
      });
    }
  }, [memory]);

  // Générer des suggestions avec l'IA lors du chargement initial
  useEffect(() => {
    if (memory && !suggestion) {
      generateWorkingConditionsSuggestion();
    }
  }, [memory]);

  // Mettre à jour un champ spécifique dans l'état local
  const handleFieldChange = (field: string, value: string | boolean | number) => {
    setFormFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Sauvegarder les modifications dans Firestore
  const handleSaveDetails = async () => {
    if (!memory) return;
    
    try {
      // Mettre à jour les champs dans la mémoire IA
      const fieldsToUpdate = {
        ...memory.fields,
        workingHours: formFields.workingHours,
        hasRemoteWork: formFields.hasRemoteWork,
        salary: formFields.salary ? parseFloat(formFields.salary) : undefined,
        position: formFields.position,
        workLocation: formFields.workLocation,
        trialPeriod: formFields.trialPeriod,
        trialPeriodDuration: formFields.trialPeriodDuration,
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined
      };
      
      // Utiliser onUpdateMemory pour mettre à jour les champs
      await onUpdateMemory('fields', fieldsToUpdate);
      
      // Ajouter un message à l'historique IA
      await addMessage({
        role: 'user',
        content: `J'ai défini les détails suivants pour le contrat : Horaires de travail ${formFields.workingHours}h/semaine, Salaire ${formFields.salary}€, Poste de ${formFields.position}, Date de début ${startDate ? format(startDate, 'dd/MM/yyyy') : 'non définie'}.`
      });
      
      toast({
        title: 'Détails mis à jour',
        description: 'Les détails du contrat ont été enregistrés.',
        variant: 'default',
      });
      
      // Valider cette étape et passer à la suivante
      onComplete();
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des détails:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les détails du contrat.',
        variant: 'destructive',
      });
    }
  };

  // Générer une suggestion sur les conditions de travail avec l'IA
  const generateWorkingConditionsSuggestion = async () => {
    if (!memory) return;
    
    try {
      setIsLoadingAI(true);
      
      // Appeler le service d'IA avec Genkit
      const aiSuggestion = await suggestClause(memory, 3);
      
      // Stocker la suggestion
      setSuggestion(aiSuggestion);
      
      // Ajouter un message à l'historique (réponse de l'IA)
      await addMessage({
        role: 'assistant',
        content: aiSuggestion.suggestion
      });
      
      // Mettre à jour la clause de travail dans la mémoire
      if (memory.clauses) {
        await updateField('clauses', {
          ...memory.clauses,
          workingTime: aiSuggestion.suggestion
        });
      }
      
      // Si l'IA suggère des champs et qu'ils ne sont pas encore remplis, les pré-remplir
      if (aiSuggestion.fields) {
        const fieldsToUpdate = { ...memory.fields };
        let hasUpdate = false;
        
        // Mise à jour du salaire
        if (aiSuggestion.fields.salary && !formFields.salary) {
          const suggestedSalary = aiSuggestion.fields.salary as number;
          handleFieldChange('salary', suggestedSalary.toString());
          fieldsToUpdate.salary = suggestedSalary;
          hasUpdate = true;
        }
        
        // Mise à jour des horaires
        if (aiSuggestion.fields.workingHours && !formFields.workingHours) {
          fieldsToUpdate.workingHours = aiSuggestion.fields.workingHours as string;
          handleFieldChange('workingHours', aiSuggestion.fields.workingHours as string);
          hasUpdate = true;
        }
        
        // Mise à jour du lieu de travail
        if (aiSuggestion.fields.workLocation && !formFields.workLocation) {
          fieldsToUpdate.workLocation = aiSuggestion.fields.workLocation as string;
          handleFieldChange('workLocation', aiSuggestion.fields.workLocation as string);
          hasUpdate = true;
        }
        
        // Téléravail
        if (aiSuggestion.fields.hasRemoteWork !== undefined && formFields.hasRemoteWork === false) {
          fieldsToUpdate.hasRemoteWork = aiSuggestion.fields.hasRemoteWork as boolean;
          handleFieldChange('hasRemoteWork', aiSuggestion.fields.hasRemoteWork as boolean);
          hasUpdate = true;
        }
        
        // Mettre à jour les champs dans la mémoire si nécessaire
        if (hasUpdate) {
          await updateField('fields', fieldsToUpdate);
        }
      }
      
    } catch (error) {
      console.error('Erreur lors de la génération de suggestions:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer des suggestions.',
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
        workingTime: suggestion.suggestion
      });
      
      // Mettre à jour les champs supplémentaires si présents
      if (suggestion.fields && Object.keys(suggestion.fields).length > 0) {
        const updatedFields = { ...memory.fields };
        
        // Mettre à jour le salaire si suggéré
        if (suggestion.fields && suggestion.fields.salary) {
          updatedFields.salary = suggestion.fields.salary as number;
          setFormFields(prev => ({
            ...prev,
            salary: suggestion.fields.salary?.toString() || prev.salary
          }));
        }
        
        await updateField('fields', updatedFields);
      }
      
      // Ajouter un message à l'historique
      await addMessage({
        role: 'user',
        content: "J'ai accepté votre suggestion pour les conditions de travail."
      });
      
      toast({
        title: 'Suggestion acceptée',
        description: 'Les conditions de travail ont été ajoutées au contrat.',
        variant: 'default',
      });
      
    } catch (error) {
      console.error("Erreur lors de l'acceptation de la suggestion:", error);
      toast({
        title: 'Erreur',
        description: "Impossible d'accepter la suggestion.",
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
        workingTime: suggestion
      });
      
      // Ajouter un message à l'historique
      await addMessage({
        role: 'user',
        content: "J'ai modifié votre suggestion pour les conditions de travail."
      });
      
      toast({
        title: 'Suggestion modifiée',
        description: 'Les conditions de travail ont été mises à jour selon vos modifications.',
        variant: 'default',
      });
      
    } catch (error) {
      console.error("Erreur lors de la modification de la suggestion:", error);
      toast({
        title: 'Erreur',
        description: "Impossible de modifier la suggestion.",
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

  // Déterminer si les champs obligatoires sont remplis
  const isFormComplete = () => {
    return (
      formFields.workingHours !== '' &&
      formFields.salary !== '' &&
      formFields.position !== '' &&
      startDate !== undefined
    );
  };

  // Vérifie si des dates sont nécessaires selon le type de contrat
  const needsEndDate = memory?.contractType?.includes('CDD') || memory?.contractType === 'STAGE';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-5">
        <h3 className="text-lg font-medium mb-5">Détails du contrat</h3>
        
        <div className="space-y-5">
          {/* Position et lieu de travail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">
                <Briefcase className="h-4 w-4 inline mr-1" />
                Poste/Fonction
              </Label>
              <Input
                id="position"
                value={formFields.position}
                onChange={(e) => handleFieldChange('position', e.target.value)}
                placeholder="Ex: Développeur Web"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workLocation">
                <MapPin className="h-4 w-4 inline mr-1" />
                Lieu de travail
              </Label>
              <Input
                id="workLocation"
                value={formFields.workLocation}
                onChange={(e) => handleFieldChange('workLocation', e.target.value)}
                placeholder="Ex: Paris"
              />
            </div>
          </div>
          
          {/* Dates de début et fin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP', { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {needsEndDate && (
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP', { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      locale={fr}
                      disabled={(date) => startDate ? date < startDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          
          {/* Horaires et salaire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workingHours">
                <Clock className="h-4 w-4 inline mr-1" />
                Horaires (heures/semaine)
              </Label>
              <Input
                id="workingHours"
                value={formFields.workingHours}
                onChange={(e) => handleFieldChange('workingHours', e.target.value)}
                placeholder="Ex: 35"
                type="number"
                min="1"
                max="45"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salary">
                <Euro className="h-4 w-4 inline mr-1" />
                Salaire mensuel brut (EUR)
              </Label>
              <Input
                id="salary"
                value={formFields.salary}
                onChange={(e) => handleFieldChange('salary', e.target.value)}
                placeholder="Ex: 2500"
                type="number"
                min="0"
              />
            </div>
          </div>
          
          {/* Options supplémentaires */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="hasRemoteWork"
                checked={formFields.hasRemoteWork as boolean}
                onCheckedChange={(checked) => handleFieldChange('hasRemoteWork', checked)}
              />
              <Label htmlFor="hasRemoteWork">Télétravail autorisé</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="trialPeriod"
                checked={formFields.trialPeriod as boolean}
                onCheckedChange={(checked) => handleFieldChange('trialPeriod', checked)}
              />
              <Label htmlFor="trialPeriod">Période d'essai</Label>
            </div>
            
            {formFields.trialPeriod && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="trialPeriodDuration">Durée de la période d'essai</Label>
                <Input
                  id="trialPeriodDuration"
                  value={formFields.trialPeriodDuration}
                  onChange={(e) => handleFieldChange('trialPeriodDuration', e.target.value)}
                  placeholder="Ex: 2 mois"
                />
              </div>
            )}
          </div>
          
          {!isFormComplete() && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start mt-5">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Veuillez remplir les champs obligatoires : Poste, horaires, salaire et date de début.
              </p>
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleSaveDetails}
              disabled={!isFormComplete()}
            >
              Continuer
            </Button>
          </div>
        </div>
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