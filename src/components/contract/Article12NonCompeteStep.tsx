import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContractType } from '@/types/contract';
import { Switch } from '@/components/ui/switch';
import { Separator } from "@/components/ui/separator";
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

export interface Article12NonCompete {
  includeNonCompete: boolean;
  includeNonSolicitation: boolean;
  nonCompeteDuration?: number;
  nonCompeteArea?: string;
  nonCompeteCompensation?: number;
  hasCustomText: boolean;
  customNonCompeteText?: string;
}

interface Article12NonCompeteStepProps {
  onSaveNonCompete: (data: Article12NonCompete) => Promise<void>;
  initialData?: Article12NonCompete;
  contractType: ContractType;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function Article12NonCompeteStep({
  onSaveNonCompete,
  initialData,
  contractType,
  isLoading,
  onBack,
  onNext
}: Article12NonCompeteStepProps) {
  const isCDI = contractType === 'CDI';
  
  // États
  const [includeNonCompete, setIncludeNonCompete] = useState<boolean>(
    initialData?.includeNonCompete ?? false
  );
  
  const [includeNonSolicitation, setIncludeNonSolicitation] = useState<boolean>(
    initialData?.includeNonSolicitation ?? false
  );
  
  const [nonCompeteDuration, setNonCompeteDuration] = useState<number | undefined>(
    initialData?.nonCompeteDuration || 6
  );
  
  const [nonCompeteArea, setNonCompeteArea] = useState<string>(
    initialData?.nonCompeteArea || 'la région où l\'entreprise opère'
  );
  
  const [nonCompeteCompensation, setNonCompeteCompensation] = useState<number | undefined>(
    initialData?.nonCompeteCompensation || 30
  );
  
  const [hasCustomText, setHasCustomText] = useState<boolean>(
    initialData?.hasCustomText || false
  );
  
  const [customNonCompeteText, setCustomNonCompeteText] = useState<string>(
    initialData?.customNonCompeteText || ''
  );

  const handleSave = async () => {
    const data: Article12NonCompete = {
      includeNonCompete,
      includeNonSolicitation,
      nonCompeteDuration: includeNonCompete ? nonCompeteDuration : undefined,
      nonCompeteArea: includeNonCompete ? nonCompeteArea : undefined,
      nonCompeteCompensation: includeNonCompete ? nonCompeteCompensation : undefined,
      hasCustomText,
      customNonCompeteText: hasCustomText ? customNonCompeteText : undefined
    };
    
    await onSaveNonCompete(data);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Article 12 – Clauses restrictives</h2>
        <p className="text-gray-500">
          Définissez les clauses de non-concurrence et non-sollicitation
        </p>
      </div>

      <div className="p-4 bg-amber-50 rounded-md border border-amber-100">
        <p className="text-sm text-amber-700 font-medium">
          {isCDI 
            ? 'Contrat à Durée Indéterminée (CDI)' 
            : 'Contrat à Durée Déterminée (CDD)'}
        </p>
        <p className="text-sm text-amber-700 mt-1">
          <strong>Attention :</strong> Ces clauses sont sensibles juridiquement et doivent être utilisées avec précaution.
        </p>
        <p className="text-sm text-amber-600 mt-1">
          La clause de non-concurrence doit être justifiée, limitée dans le temps et l&apos;espace, et obligatoirement assortie d&apos;une contrepartie financière.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Label className="text-base font-medium">Clause de non-concurrence</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="include-non-compete"
              checked={includeNonCompete}
              onCheckedChange={setIncludeNonCompete}
              disabled={isLoading}
            />
            <Label htmlFor="include-non-compete" className="cursor-pointer">
              Inclure une clause de non-concurrence
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Interdit au salarié d&apos;exercer une activité concurrente après la fin du contrat, moyennant une contrepartie financière.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {includeNonCompete && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="non-compete-duration" className="text-sm font-medium">
                  Durée de la clause (mois)
                </Label>
                <Select 
                  value={nonCompeteDuration?.toString()}
                  onValueChange={(value) => setNonCompeteDuration(parseInt(value))}
                  disabled={isLoading}
                >
                  <SelectTrigger id="non-compete-duration" className="mt-1">
                    <SelectValue placeholder="Choisir une durée" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 mois</SelectItem>
                    <SelectItem value="6">6 mois</SelectItem>
                    <SelectItem value="12">12 mois</SelectItem>
                    <SelectItem value="24">24 mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="non-compete-compensation" className="text-sm font-medium">
                  Contrepartie financière (% du salaire)
                </Label>
                <Select 
                  value={nonCompeteCompensation?.toString()}
                  onValueChange={(value) => setNonCompeteCompensation(parseInt(value))}
                  disabled={isLoading}
                >
                  <SelectTrigger id="non-compete-compensation" className="mt-1">
                    <SelectValue placeholder="Choisir un pourcentage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25%</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                    <SelectItem value="40">40%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="non-compete-area" className="text-sm font-medium">
                Zone géographique concernée
              </Label>
              <Input
                id="non-compete-area"
                value={nonCompeteArea}
                onChange={(e) => setNonCompeteArea(e.target.value)}
                placeholder="Ex: la région Île-de-France"
                disabled={isLoading}
                className="mt-1"
              />
            </div>
            
            <p className="text-sm text-amber-600">
              Vérifiez que ces restrictions sont proportionnées à l&apos;intérêt légitime de l&apos;entreprise.
            </p>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-4">
          <Label className="text-base font-medium">Clause de non-sollicitation</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="include-non-solicitation"
              checked={includeNonSolicitation}
              onCheckedChange={setIncludeNonSolicitation}
              disabled={isLoading}
            />
            <Label htmlFor="include-non-solicitation" className="cursor-pointer">
              Inclure une clause de non-sollicitation
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Interdit au salarié de démarcher les clients, partenaires ou collaborateurs de l&apos;entreprise après son départ.
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
              disabled={isLoading || (!includeNonCompete && !includeNonSolicitation)}
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
                    Activez cette option pour rédiger entièrement votre clause de non-concurrence et/ou non-sollicitation.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {hasCustomText && (includeNonCompete || includeNonSolicitation) && (
          <div className="mt-2">
            <Textarea
              value={customNonCompeteText}
              onChange={(e) => setCustomNonCompeteText(e.target.value)}
              placeholder="Rédigez votre clause personnalisée de non-concurrence et/ou de non-sollicitation..."
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
            {includeNonCompete || includeNonSolicitation ? (
              <>
                <p className="text-sm font-medium">Article 12 – Non-concurrence et non-sollicitation</p>
                
                {hasCustomText && customNonCompeteText ? (
                  <p className="text-sm mt-2">{customNonCompeteText}</p>
                ) : (
                  <>
                    {includeNonCompete && (
                      <p className="text-sm mt-2">
                        À la fin de la relation de travail, le Salarié s&apos;engage, pendant une durée de {nonCompeteDuration} mois et dans un périmètre comprenant {nonCompeteArea}, à ne pas exercer d&apos;activité concurrente directe ou indirecte à celle de l&apos;Employeur.
                        <br />
                        En contrepartie, une indemnité mensuelle égale à {nonCompeteCompensation}% du salaire brut mensuel moyen perçu au cours des 12 derniers mois sera versée au Salarié pendant la durée d&apos;application de la clause.
                      </p>
                    )}
                    
                    {includeNonSolicitation && (
                      <p className="text-sm mt-2">
                        Le Salarié s&apos;interdit également de solliciter ou détourner les clients, partenaires ou collaborateurs de l&apos;Employeur pendant {includeNonCompete ? 'cette période' : 'une période de 12 mois suivant la fin du contrat'}.
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
          disabled={isLoading || (hasCustomText && !customNonCompeteText && (includeNonCompete || includeNonSolicitation))}
          className="flex items-center"
        >
          {isLoading ? 'Enregistrement...' : 'Continuer'}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
} 