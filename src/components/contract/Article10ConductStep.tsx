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

export interface Article10Conduct {
  includeWorkClothes: boolean;
  includeInternalRules: boolean;
  hasCustomText: boolean;
  customConductText?: string;
  workClothesDetails?: string;
}

interface Article10ConductStepProps {
  onSaveConduct: (data: Article10Conduct) => Promise<void>;
  initialData?: Article10Conduct;
  contractType: ContractType;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function Article10ConductStep({
  onSaveConduct,
  initialData,
  contractType,
  isLoading,
  onBack,
  onNext
}: Article10ConductStepProps) {
  const isCDI = contractType === 'CDI';
  
  // États
  const [includeWorkClothes, setIncludeWorkClothes] = useState<boolean>(
    initialData?.includeWorkClothes ?? false
  );
  
  const [workClothesDetails, setWorkClothesDetails] = useState<string>(
    initialData?.workClothesDetails || ''
  );
  
  const [includeInternalRules, setIncludeInternalRules] = useState<boolean>(
    initialData?.includeInternalRules ?? true
  );
  
  const [hasCustomText, setHasCustomText] = useState<boolean>(
    initialData?.hasCustomText || false
  );
  
  const [customConductText, setCustomConductText] = useState<string>(
    initialData?.customConductText || ''
  );

  const handleSave = async () => {
    const data: Article10Conduct = {
      includeWorkClothes,
      includeInternalRules,
      hasCustomText,
      customConductText: hasCustomText ? customConductText : undefined,
      workClothesDetails: includeWorkClothes ? workClothesDetails : undefined
    };
    
    await onSaveConduct(data);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Article 10 – Engagement professionnel et tenue</h2>
        <p className="text-gray-500">
          Définissez les règles de conduite professionnelle et exigences de tenue
        </p>
      </div>

      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <p className="text-sm text-blue-700 font-medium">
          {isCDI 
            ? 'Contrat à Durée Indéterminée (CDI)' 
            : 'Contrat à Durée Déterminée (CDD)'}
        </p>
        <p className="text-sm text-blue-600 mt-1">
          Cet article définit les obligations professionnelles, le respect des règles de conduite et éventuellement les exigences vestimentaires.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Label className="text-base font-medium">Tenue de travail spécifique</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="include-work-clothes"
              checked={includeWorkClothes}
              onCheckedChange={setIncludeWorkClothes}
              disabled={isLoading}
            />
            <Label htmlFor="include-work-clothes" className="cursor-pointer">
              Inclure une clause sur la tenue
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Activez cette option si une tenue spécifique est exigée ou fournie par l&apos;entreprise.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {includeWorkClothes && (
          <div className="mt-2">
            <Textarea
              value={workClothesDetails}
              onChange={(e) => setWorkClothesDetails(e.target.value)}
              placeholder="Précisez les détails concernant la tenue de travail (type, modalités de fourniture...)"
              disabled={isLoading}
              className="h-20"
            />
            <p className="text-sm text-gray-500 mt-1">
              Ex: "L'employeur fournira 2 uniformes complets que le salarié s'engage à porter et entretenir."
            </p>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-4">
          <Label className="text-base font-medium">Règlement intérieur</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="include-internal-rules"
              checked={includeInternalRules}
              onCheckedChange={setIncludeInternalRules}
              disabled={isLoading}
            />
            <Label htmlFor="include-internal-rules" className="cursor-pointer">
              Mentionner le règlement intérieur
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Inclut une référence au règlement intérieur ou aux procédures internes que le salarié s&apos;engage à respecter.
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
                    Activez cette option pour rédiger entièrement votre clause sur les règles de conduite.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {hasCustomText && (
          <div className="mt-2">
            <Textarea
              value={customConductText}
              onChange={(e) => setCustomConductText(e.target.value)}
              placeholder="Rédigez votre clause personnalisée sur les règles de conduite professionnelle..."
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
            <p className="text-sm font-medium">Article 10 – Tenue et règles internes</p>
            
            {hasCustomText && customConductText ? (
              <p className="text-sm mt-2">{customConductText}</p>
            ) : (
              <>
                <p className="text-sm mt-2">
                  Le Salarié s&apos;engage à adopter une attitude professionnelle en toutes circonstances, à respecter les consignes de sécurité, les procédures internes et les règles d&apos;hygiène applicables dans l&apos;entreprise.
                </p>
                
                {includeWorkClothes && (
                  <p className="text-sm mt-2">
                    {workClothesDetails ? (
                      workClothesDetails
                    ) : (
                      "Une tenue de travail sera fournie par l'Employeur. Le Salarié s'engage à la porter pendant les heures de travail, à la maintenir en bon état et à la restituer en cas de départ de l'entreprise."
                    )}
                  </p>
                )}
                
                {includeInternalRules && (
                  <p className="text-sm mt-2">
                    Le Salarié reconnaît avoir été informé de l&apos;existence du règlement intérieur ou des procédures internes en vigueur, qu&apos;il s&apos;engage à respecter.
                  </p>
                )}
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
          disabled={isLoading || (hasCustomText && !customConductText) || (includeWorkClothes && !workClothesDetails && !hasCustomText)}
          className="flex items-center"
        >
          {isLoading ? 'Enregistrement...' : 'Continuer'}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
} 