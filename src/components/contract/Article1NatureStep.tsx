import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ContractType } from '@/types/contract';
import { Article1Nature } from '@/types/contract-articles';
import { Article1NatureStepProps } from './props/ArticleStepProps';
import { Spinner } from '@/components/ui/spinner';

export function Article1NatureStep({
  contractType, 
  onSaveArticle, 
  initialData,
  isLoading,
  onBack 
}: Article1NatureStepProps) {
  const [trialPeriod, setTrialPeriod] = useState<boolean>(initialData?.trialPeriod || false);
  const [trialPeriodDuration, setTrialPeriodDuration] = useState<number | undefined>(
    initialData?.trialPeriodDuration || undefined
  );
  
  // CDD specific fields
  const [startDate, setStartDate] = useState<string | undefined>(initialData?.startDate || undefined);
  const [endDate, setEndDate] = useState<string | undefined>(initialData?.endDate || undefined);
  const [reason, setReason] = useState<string | undefined>(initialData?.reason || undefined);
  
  // Validation function
  const isFormValid = () => {
    if (contractType === 'CDD') {
      return !!(startDate && endDate && reason);
    }
    return true;
  };
  
  // Submit handler
  const handleSubmit = () => {
    const data: Article1Nature = {
      contractType,
      startDate,
      endDate,
      reason,
      trialPeriod,
      ...(trialPeriod && { trialPeriodDuration })
    };
    
    onSaveArticle(data);
  };

  return (
    <div>
      <CardHeader>
        <CardTitle>Nature du contrat</CardTitle>
        <CardDescription>
          Définissez les caractéristiques fondamentales du contrat de travail
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Type de contrat (lecture seule car déjà choisi) */}
        <div className="space-y-2">
          <Label>Type de contrat</Label>
          <div className="font-medium text-slate-700 p-2 bg-slate-50 rounded-md">
            {contractType === 'CDI' ? 'Contrat à Durée Indéterminée (CDI)' : 'Contrat à Durée Déterminée (CDD)'}
                </div>
              </div>
        
        {/* Période d'essai */}
        <div className="space-y-2">
          <Label>Période d'essai</Label>
          <RadioGroup 
            defaultValue={trialPeriod ? "yes" : "no"} 
            className="flex flex-col space-y-1"
            onValueChange={(value) => setTrialPeriod(value === "yes")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="trial-yes" />
              <Label htmlFor="trial-yes">Oui, inclure une période d'essai</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="trial-no" />
              <Label htmlFor="trial-no">Non, pas de période d'essai</Label>
            </div>
          </RadioGroup>
          </div>
          
        {/* Durée de la période d'essai (si applicable) */}
        {trialPeriod && (
          <div className="space-y-2">
            <Label htmlFor="trial-duration">Durée de la période d'essai (en mois)</Label>
            <Input 
              id="trial-duration"
              type="number" 
              min={1} 
              max={6} 
              placeholder="Ex: 2"
              value={trialPeriodDuration || ''}
              onChange={(e) => setTrialPeriodDuration(parseInt(e.target.value) || undefined)}
            />
          </div>
        )}
        
        {/* Champs spécifiques au CDD */}
        {contractType === 'CDD' && (
          <>
            <div className="space-y-2">
              <Label>Date de début</Label>
              <DatePicker 
                value={startDate ? new Date(startDate) : undefined}
                onChange={(date) => setStartDate(date ? date.toISOString().split('T')[0] : undefined)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Date de fin</Label>
              <DatePicker 
                value={endDate ? new Date(endDate) : undefined}
                onChange={(date) => setEndDate(date ? date.toISOString().split('T')[0] : undefined)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cdd-reason">Motif du recours au CDD</Label>
              <Input 
                id="cdd-reason"
                placeholder="Ex: Remplacement d'un salarié absent" 
                value={reason || ''}
                onChange={(e) => setReason(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Conformément à l'article L.1242-2 du Code du travail, un CDD ne peut être conclu que pour l'exécution 
                d'une tâche précise et temporaire.
              </p>
            </div>
          </>
      )}

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
        </Button>
        
        <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? (
              <Spinner className="mr-2" />
            ) : (
              <>
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
        </Button>
      </div>
      </CardContent>
    </div>
  );
} 