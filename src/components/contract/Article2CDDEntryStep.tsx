import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Article1Nature } from '@/services/contractArticlesService';

export interface Article2CDDEntry {
  includeTrialPeriod: boolean;
  trialPeriodDuration: string;
  trialPeriodDurationValue: string;
  trialPeriodDurationUnit: string;
}

interface Article2CDDEntryStepProps {
  onSaveEntry: (data: Article2CDDEntry) => Promise<void>;
  initialData?: Article2CDDEntry;
  natureData?: Article1Nature;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

// Helper pour déterminer la période d'essai recommandée en fonction de la durée du contrat
const getRecommendedTrialPeriodDuration = (durationMonths?: number): { value: string, unit: string } => {
  if (!durationMonths) return { value: '1', unit: 'jour' };
  
  if (durationMonths < 1) return { value: '2', unit: 'jours' };
  if (durationMonths < 2) return { value: '1', unit: 'semaine' };
  if (durationMonths <= 6) return { value: '2', unit: 'semaines' };
  return { value: '1', unit: 'mois' };
};

// Obtenir le texte formaté pour la durée du contrat
const getFormattedDuration = (durationMonths?: number): string => {
  if (!durationMonths) return 'Non définie';
  
  if (durationMonths === 1) return '1 mois';
  if (durationMonths < 12) return `${durationMonths} mois`;
  
  const years = Math.floor(durationMonths / 12);
  const months = durationMonths % 12;
  
  if (months === 0) {
    return years === 1 ? '1 an' : `${years} ans`;
  } else {
    return years === 1 
      ? `1 an et ${months === 1 ? '1 mois' : `${months} mois`}` 
      : `${years} ans et ${months === 1 ? '1 mois' : `${months} mois`}`;
  }
};

export function Article2CDDEntryStep({
  onSaveEntry,
  initialData,
  natureData,
  isLoading,
  onBack,
  onNext
}: Article2CDDEntryStepProps) {
  // État initial par défaut ou à partir des données existantes
  const [includeTrialPeriod, setIncludeTrialPeriod] = useState<boolean>(
    initialData?.includeTrialPeriod ?? true
  );
  
  // Récupérer la recommandation basée sur la durée du contrat
  const defaultRecommendation = getRecommendedTrialPeriodDuration(natureData?.durationMonths);
  
  const [trialPeriodDurationValue, setTrialPeriodDurationValue] = useState<string>(
    initialData?.trialPeriodDurationValue || defaultRecommendation.value
  );
  
  const [trialPeriodDurationUnit, setTrialPeriodDurationUnit] = useState<string>(
    initialData?.trialPeriodDurationUnit || defaultRecommendation.unit
  );

  const formattedContractDuration = getFormattedDuration(natureData?.durationMonths);
  const isRecommendedValue = trialPeriodDurationValue === defaultRecommendation.value && 
                             trialPeriodDurationUnit === defaultRecommendation.unit;

  // Mettre à jour la période d'essai recommandée quand la durée du contrat change
  useEffect(() => {
    if (!initialData && natureData?.durationMonths) {
      const recommendation = getRecommendedTrialPeriodDuration(natureData.durationMonths);
      setTrialPeriodDurationValue(recommendation.value);
      setTrialPeriodDurationUnit(recommendation.unit);
    }
  }, [natureData?.durationMonths, initialData]);

  const handleSave = async () => {
    // Construire l'objet à sauvegarder
    const trialPeriodDuration = `${trialPeriodDurationValue} ${trialPeriodDurationUnit}`;
    
    const data: Article2CDDEntry = {
      includeTrialPeriod,
      trialPeriodDuration,
      trialPeriodDurationValue,
      trialPeriodDurationUnit
    };
    
    await onSaveEntry(data);
    onNext();
  };

  // Formater la date depuis une chaîne ISO
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Article 2 – Entrée en fonction et période d&apos;essai</h2>
        <p className="text-gray-500">Définissez la période d&apos;essai pour ce CDD</p>
      </div>

      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <p className="text-sm text-blue-700 font-medium">Contrat à Durée Déterminée (CDD)</p>
        <p className="text-sm text-blue-600 mt-1">
          Cet article définit la date d&apos;entrée en fonction et éventuellement la période d&apos;essai,
          conformément à l&apos;article L.1242-10 du Code du travail.
        </p>
        {natureData?.durationMonths && (
          <div className="mt-2 p-2 bg-blue-100 rounded">
            <p className="text-sm font-medium text-blue-800">
              Durée du contrat : {formattedContractDuration}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Période d&apos;essai recommandée : <span className="font-bold">{defaultRecommendation.value} {defaultRecommendation.unit}</span>
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-6">
            <p className="text-gray-600 mb-1">Date d&apos;entrée en fonction :</p>
            <p className="font-medium">
              {natureData?.startDate ? formatDate(natureData.startDate) : 'Date non définie'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Cette date correspond à celle définie dans l&apos;Article 1 - Nature du contrat.
            </p>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="include-trial"
              checked={includeTrialPeriod}
              onCheckedChange={(checked) => setIncludeTrialPeriod(checked as boolean)}
              disabled={isLoading}
            />
            <Label 
              htmlFor="include-trial" 
              className="cursor-pointer font-medium"
            >
              Inclure une période d&apos;essai
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>La période d&apos;essai en CDD est facultative mais recommandée. Elle permet à l&apos;employeur comme au salarié de rompre le contrat sans motif et sans indemnité.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {includeTrialPeriod && (
            <div className="ml-6 space-y-3 bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700 mb-3">Durée de la période d&apos;essai :</p>
              
              <div className="flex flex-wrap items-center gap-2">
                <Select 
                  value={trialPeriodDurationValue}
                  onValueChange={setTrialPeriodDurationValue}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="Valeur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={trialPeriodDurationUnit}
                  onValueChange={setTrialPeriodDurationUnit}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Unité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jour">jour</SelectItem>
                    <SelectItem value="jours">jours</SelectItem>
                    <SelectItem value="semaine">semaine</SelectItem>
                    <SelectItem value="semaines">semaines</SelectItem>
                    <SelectItem value="mois">mois</SelectItem>
                  </SelectContent>
                </Select>
                
                {isRecommendedValue && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Recommandée
                  </span>
                )}
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                <p className="font-medium mt-2 mb-1">Période d&apos;essai recommandée par la loi :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>2 jours pour un contrat de moins d&apos;un mois</li>
                  <li>1 semaine pour un contrat de moins de deux mois</li>
                  <li>2 semaines pour un contrat de moins de six mois</li>
                  <li>1 mois pour un contrat de six mois ou plus</li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-6 mb-4">
            <p className="text-gray-600 italic text-sm">
              Aperçu du texte qui sera généré :
            </p>
            <div className="p-4 bg-gray-50 rounded-md border mt-2">
              <p className="text-sm">
                Le Salarié prendra ses fonctions à compter du <span className="font-medium">{natureData?.startDate ? formatDate(natureData.startDate) : '[date]'}</span>, date de début du contrat telle que mentionnée à l&apos;article 1.
              </p>
              
              {includeTrialPeriod ? (
                <>
                  <p className="text-sm mt-2">
                    Le présent contrat est assorti d&apos;une période d&apos;essai de <span className="font-medium">{trialPeriodDurationValue} {trialPeriodDurationUnit}</span>, conformément à l&apos;article L.1242-10 du Code du travail.
                  </p>
                  <p className="text-sm mt-2">
                    Pendant cette période, chacune des parties pourra rompre le contrat sans indemnité, sous réserve du respect d&apos;un délai de prévenance.
                  </p>
                </>
              ) : (
                <p className="text-sm mt-2 italic">
                  Le présent contrat ne comporte pas de période d&apos;essai.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isLoading} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <Button 
          onClick={handleSave}
          disabled={isLoading} 
          className="flex items-center"
        >
          {isLoading ? 'Enregistrement...' : 'Continuer'}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
} 