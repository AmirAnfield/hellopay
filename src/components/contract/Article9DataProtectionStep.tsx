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

export interface Article9DataProtection {
  includeImageRights: boolean;
  customDataProtectionText?: string;
  hasCustomText: boolean;
}

interface Article9DataProtectionStepProps {
  onSaveDataProtection: (data: Article9DataProtection) => Promise<void>;
  initialData?: Article9DataProtection;
  contractType: ContractType;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function Article9DataProtectionStep({
  onSaveDataProtection,
  initialData,
  contractType,
  isLoading,
  onBack,
  onNext
}: Article9DataProtectionStepProps) {
  const isCDI = contractType === 'CDI';
  
  // États
  const [includeImageRights, setIncludeImageRights] = useState<boolean>(
    initialData?.includeImageRights ?? true
  );
  
  const [hasCustomText, setHasCustomText] = useState<boolean>(
    initialData?.hasCustomText || false
  );
  
  const [customDataProtectionText, setCustomDataProtectionText] = useState<string>(
    initialData?.customDataProtectionText || ''
  );

  const handleSave = async () => {
    const data: Article9DataProtection = {
      includeImageRights,
      hasCustomText,
      customDataProtectionText: hasCustomText ? customDataProtectionText : undefined
    };
    
    await onSaveDataProtection(data);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Article 9 – Protection des données personnelles et droit à l&apos;image</h2>
        <p className="text-gray-500">
          Définissez les dispositions relatives au RGPD et au droit à l&apos;image
        </p>
      </div>

      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <p className="text-sm text-blue-700 font-medium">
          {isCDI 
            ? 'Contrat à Durée Indéterminée (CDI)' 
            : 'Contrat à Durée Déterminée (CDD)'}
        </p>
        <p className="text-sm text-blue-600 mt-1">
          Cet article est requis par le Règlement Général sur la Protection des Données (RGPD) et définit l&apos;utilisation des données personnelles et de l&apos;image du salarié.
        </p>
        <p className="text-sm text-amber-600 mt-1">
          Par défaut, la section sur le droit à l&apos;image est activée.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Label className="text-base font-medium">Inclure le droit à l&apos;image</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="include-image-rights"
              checked={includeImageRights}
              onCheckedChange={setIncludeImageRights}
              disabled={isLoading}
            />
            <Label htmlFor="include-image-rights" className="cursor-pointer">
              Autoriser l&apos;utilisation de l&apos;image
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Permet à l&apos;employeur d&apos;utiliser l&apos;image du salarié pour la communication interne et externe de l&apos;entreprise.
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
                    Activez cette option pour rédiger un texte personnalisé au lieu du texte standard RGPD.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {hasCustomText && (
          <div className="mt-2">
            <Textarea
              value={customDataProtectionText}
              onChange={(e) => setCustomDataProtectionText(e.target.value)}
              placeholder="Rédigez votre clause personnalisée sur la protection des données personnelles..."
              disabled={isLoading}
              className="h-32"
            />
            <p className="text-sm text-gray-500 mt-1">
              Assurez-vous que votre texte est conforme au RGPD et mentionne les droits d&apos;accès, de rectification et de suppression des données.
            </p>
          </div>
        )}

        <div className="mt-6 mb-4">
          <p className="text-gray-600 italic text-sm mb-2">
            Aperçu du texte qui sera généré :
          </p>
          <div className="p-4 bg-gray-50 rounded-md border">
            <p className="text-sm font-medium">Article 9 – Données personnelles et droit à l&apos;image</p>
            
            {hasCustomText && customDataProtectionText ? (
              <p className="text-sm mt-2">{customDataProtectionText}</p>
            ) : (
              <>
                <p className="text-sm mt-2">
                  Dans le cadre de son activité, le Salarié autorise l&apos;Employeur à collecter, traiter et conserver ses données personnelles, uniquement à des fins professionnelles, administratives, légales et organisationnelles.
                  Ce traitement est effectué dans le respect du Règlement Général sur la Protection des Données (RGPD – UE 2016/679).
                </p>
                
                <p className="text-sm mt-2">
                  Le Salarié dispose d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition sur les données le concernant, qu&apos;il peut exercer en adressant sa demande à l&apos;Employeur.
                </p>
                
                {includeImageRights && (
                  <p className="text-sm mt-2">
                    Le Salarié autorise également l&apos;utilisation de son image à des fins internes (organigrammes, outils RH) et de communication externe (site internet, supports promotionnels), sauf opposition écrite notifiée à l&apos;Employeur.
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
          disabled={isLoading || (hasCustomText && !customDataProtectionText)}
          className="flex items-center"
        >
          {isLoading ? 'Enregistrement...' : 'Continuer'}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
} 