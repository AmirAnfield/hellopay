import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContractType } from '@/types/contract';
import { Switch } from '@/components/ui/switch';
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

export interface Article14Termination {
  collectiveAgreement: string;
  noticePeriodCDI?: string;
  hasCustomText: boolean;
  customTerminationText?: string;
}

interface Article14TerminationStepProps {
  onSaveTermination: (data: Article14Termination) => Promise<void>;
  initialData?: Article14Termination;
  contractType: ContractType;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

// Liste des conventions collectives courantes
const COLLECTIVE_AGREEMENTS = [
  { value: 'AGRIC-ARCO', label: 'AGRIC-ARCO' },
  { value: 'SYNTEC', label: 'SYNTEC - Bureaux d\'études techniques' },
  { value: 'COMMERCE', label: 'Commerce de détail et de gros' },
  { value: 'HCR', label: 'Hôtels, Cafés, Restaurants' },
  { value: 'BTP', label: 'Bâtiment et Travaux Publics' },
  { value: 'TRANSPORTS', label: 'Transports routiers' },
  { value: 'METALLURGIE', label: 'Métallurgie' },
  { value: 'AUTRE', label: 'Autre convention collective' },
];

// Options de préavis pour CDI
const NOTICE_PERIODS = [
  { value: 'legal', label: 'Préavis légal (1 mois cadre, 2 mois non-cadre)' },
  { value: '1-month', label: '1 mois' },
  { value: '2-months', label: '2 mois' },
  { value: '3-months', label: '3 mois' },
  { value: 'collective', label: 'Selon convention collective' },
];

export function Article14TerminationStep({
  onSaveTermination,
  initialData,
  contractType,
  isLoading,
  onBack,
  onNext
}: Article14TerminationStepProps) {
  const isCDI = contractType === 'CDI';
  
  // États
  const [collectiveAgreement, setCollectiveAgreement] = useState<string>(
    initialData?.collectiveAgreement || 'AGRIC-ARCO'
  );
  
  const [noticePeriodCDI, setNoticePeriodCDI] = useState<string>(
    initialData?.noticePeriodCDI || 'legal'
  );
  
  const [hasCustomText, setHasCustomText] = useState<boolean>(
    initialData?.hasCustomText || false
  );
  
  const [customTerminationText, setCustomTerminationText] = useState<string>(
    initialData?.customTerminationText || ''
  );

  const handleSave = async () => {
    const data: Article14Termination = {
      collectiveAgreement,
      noticePeriodCDI: isCDI ? noticePeriodCDI : undefined,
      hasCustomText,
      customTerminationText: hasCustomText ? customTerminationText : undefined
    };
    
    await onSaveTermination(data);
    onNext();
  };

  // Formater le texte du préavis pour l'affichage
  const formatNoticePeriod = () => {
    const option = NOTICE_PERIODS.find(o => o.value === noticePeriodCDI);
    return option ? option.label : 'selon les dispositions légales';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Article 14 – Rupture du contrat et préavis</h2>
        <p className="text-gray-500">
          Définissez les conditions de rupture du contrat et le préavis applicable
        </p>
      </div>

      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <p className="text-sm text-blue-700 font-medium">
          {isCDI 
            ? 'Contrat à Durée Indéterminée (CDI)' 
            : 'Contrat à Durée Déterminée (CDD)'}
        </p>
        <p className="text-sm text-blue-600 mt-1">
          {isCDI
            ? 'Cet article définit les conditions de rupture du contrat et les durées de préavis applicables.'
            : 'Cet article rappelle les conditions légales de rupture anticipée d\'un CDD.'}
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Convention collective applicable</Label>
          <Select 
            value={collectiveAgreement} 
            onValueChange={setCollectiveAgreement}
            disabled={isLoading}
            className="mt-2"
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une convention" />
            </SelectTrigger>
            <SelectContent>
              {COLLECTIVE_AGREEMENTS.map((agreement) => (
                <SelectItem key={agreement.value} value={agreement.value}>
                  {agreement.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {isCDI && (
          <div className="mt-4">
            <Label className="text-base font-medium">Durée du préavis en cas de rupture</Label>
            <Select 
              value={noticePeriodCDI} 
              onValueChange={setNoticePeriodCDI}
              disabled={isLoading}
              className="mt-2"
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une durée" />
              </SelectTrigger>
              <SelectContent>
                {NOTICE_PERIODS.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              Cette durée s&apos;applique en cas de démission ou licenciement hors faute grave ou lourde.
            </p>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4">
          <Label className="text-base font-medium">Personnaliser le texte</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="has-custom-text"
              checked={hasCustomText}
              onCheckedChange={setHasCustomText}
              disabled={isLoading}
            />
            <Label htmlFor="has-custom-text" className="cursor-pointer">
              Utiliser un texte personnalisé
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Activez cette option pour rédiger entièrement votre clause de rupture du contrat.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {hasCustomText && (
          <div className="mt-2">
            <Textarea
              value={customTerminationText}
              onChange={(e) => setCustomTerminationText(e.target.value)}
              placeholder="Rédigez votre clause personnalisée sur les conditions de rupture du contrat..."
              disabled={isLoading}
              className="h-32"
            />
          </div>
        )}

        <div className="mt-6 mb-4">
          <p className="text-gray-600 italic text-sm mb-2">
            Aperçu du texte qui sera généré :
          </p>
          <div className="p-4 bg-gray-50 rounded-md border">
            <p className="text-sm font-medium">Article 14 – Rupture du contrat et préavis</p>
            
            {hasCustomText && customTerminationText ? (
              <p className="text-sm mt-2">{customTerminationText}</p>
            ) : (
              <>
                <p className="text-sm mt-2">
                  Le présent contrat pourra être rompu à l&apos;initiative de l&apos;une ou l&apos;autre des parties, dans les conditions prévues par le Code du travail et la convention collective {collectiveAgreement}, selon la nature du contrat :
                </p>
                
                {isCDI ? (
                  <p className="text-sm mt-2">
                    En CDI : respect d&apos;un préavis de {formatNoticePeriod()} en cas de démission ou licenciement, sauf cas de faute grave ou lourde.
                  </p>
                ) : (
                  <p className="text-sm mt-2">
                    En CDD : rupture anticipée uniquement en cas de faute grave, force majeure, accord mutuel ou embauche en CDI.
                  </p>
                )}
                
                <p className="text-sm mt-2">
                  En période d&apos;essai : préavis réduit selon l&apos;article L.1221-25 du Code du travail.
                </p>
              </>
            )}
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
          disabled={isLoading || (hasCustomText && !customTerminationText)}
          className="flex items-center"
        >
          {isLoading ? 'Enregistrement...' : 'Continuer'}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
} 