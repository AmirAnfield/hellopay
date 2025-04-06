import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContractType } from '@/types/contract';
import { Switch } from '@/components/ui/switch';
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Article11Confidentiality {
  includeConfidentiality: boolean;
  includeIntellectualProperty: boolean;
  hasCustomText: boolean;
  customConfidentialityText?: string;
}

interface Article11ConfidentialityStepProps {
  onSaveConfidentiality: (data: Article11Confidentiality) => Promise<void>;
  initialData?: Article11Confidentiality;
  contractType: ContractType;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function Article11ConfidentialityStep({
  onSaveConfidentiality,
  initialData,
  contractType,
  isLoading,
  onBack,
  onNext
}: Article11ConfidentialityStepProps) {
  const isCDI = contractType === 'CDI';
  
  // États
  const [includeConfidentiality, setIncludeConfidentiality] = useState<boolean>(
    initialData?.includeConfidentiality ?? false
  );
  
  const [includeIntellectualProperty, setIncludeIntellectualProperty] = useState<boolean>(
    initialData?.includeIntellectualProperty ?? false
  );
  
  const [hasCustomText, setHasCustomText] = useState<boolean>(
    initialData?.hasCustomText || false
  );
  
  const [customConfidentialityText, setCustomConfidentialityText] = useState<string>(
    initialData?.customConfidentialityText || ''
  );

  const handleSave = async () => {
    const data: Article11Confidentiality = {
      includeConfidentiality,
      includeIntellectualProperty,
      hasCustomText,
      customConfidentialityText: hasCustomText ? customConfidentialityText : undefined
    };
    
    await onSaveConfidentiality(data);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Article 11 – Confidentialité et propriété intellectuelle</h2>
        <p className="text-gray-500">
          Définissez les clauses de confidentialité et de propriété intellectuelle
        </p>
      </div>

      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <p className="text-sm text-blue-700 font-medium">
          {isCDI 
            ? 'Contrat à Durée Indéterminée (CDI)' 
            : 'Contrat à Durée Déterminée (CDD)'}
        </p>
        <p className="text-sm text-blue-600 mt-1">
          Cet article est particulièrement recommandé pour les postes avec accès à des informations sensibles ou impliquant des créations.
        </p>
        <p className="text-sm text-amber-600 mt-1">
          Par défaut, cet article n&apos;est pas inclus dans le contrat. Activez les options uniquement si nécessaire pour le poste concerné.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Label className="text-base font-medium">Clause de confidentialité</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="include-confidentiality"
              checked={includeConfidentiality}
              onCheckedChange={setIncludeConfidentiality}
              disabled={isLoading}
            />
            <Label htmlFor="include-confidentiality" className="cursor-pointer">
              Inclure la clause de confidentialité
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Oblige le salarié à garder confidentielles les informations sensibles auxquelles il a accès, pendant et après le contrat.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-4">
          <Label className="text-base font-medium">Propriété intellectuelle</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="include-intellectual-property"
              checked={includeIntellectualProperty}
              onCheckedChange={setIncludeIntellectualProperty}
              disabled={isLoading}
            />
            <Label htmlFor="include-intellectual-property" className="cursor-pointer">
              Inclure la clause de propriété intellectuelle
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Précise que les créations réalisées dans le cadre des fonctions appartiennent à l&apos;entreprise.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-between items-center">
          <Label className="text-base font-medium">Personnaliser le texte</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="has-custom-text"
              checked={hasCustomText}
              onCheckedChange={setHasCustomText}
              disabled={isLoading || (!includeConfidentiality && !includeIntellectualProperty)}
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
                    Activez cette option pour rédiger entièrement votre clause de confidentialité et propriété intellectuelle.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {hasCustomText && (includeConfidentiality || includeIntellectualProperty) && (
          <div className="mt-2">
            <Textarea
              value={customConfidentialityText}
              onChange={(e) => setCustomConfidentialityText(e.target.value)}
              placeholder="Rédigez votre clause personnalisée sur la confidentialité et/ou la propriété intellectuelle..."
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
            {includeConfidentiality || includeIntellectualProperty ? (
              <>
                <p className="text-sm font-medium">Article 11 – Obligation de confidentialité et propriété intellectuelle</p>
                
                {hasCustomText && customConfidentialityText ? (
                  <p className="text-sm mt-2">{customConfidentialityText}</p>
                ) : (
                  <>
                    {includeConfidentiality && (
                      <p className="text-sm mt-2">
                        Le Salarié s&apos;engage à garder strictement confidentielles toutes les informations, documents, procédés, fichiers, bases de données, données clients ou fournisseurs dont il aurait connaissance dans le cadre de ses fonctions, pendant toute la durée du contrat et après sa rupture, quelle qu&apos;en soit la cause.
                      </p>
                    )}
                    
                    {includeIntellectualProperty && (
                      <p className="text-sm mt-2">
                        Tout document ou création (texte, image, code, logiciel, méthode…) réalisé dans le cadre de ses fonctions ou avec les moyens de l&apos;entreprise reste la propriété exclusive de l&apos;Employeur, conformément aux articles L.111-1 et suivants du Code de la propriété intellectuelle.
                      </p>
                    )}
                  </>
                )}
              </>
            ) : (
              <p className="text-sm italic text-gray-500">
                Cet article ne sera pas inclus dans le contrat.
              </p>
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
          disabled={isLoading || (hasCustomText && !customConfidentialityText && (includeConfidentiality || includeIntellectualProperty))}
          className="flex items-center"
        >
          {isLoading ? 'Enregistrement...' : 'Continuer'}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
} 