import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';
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

export interface Article8Leaves {
  collectiveAgreement: string;
  hasCustomLeaves: boolean;
  customLeavesDetails?: string;
  hasSpecialAbsences: boolean;
  specialAbsencesDetails?: string;
}

interface Article8LeavesStepProps {
  onSaveLeaves: (data: Article8Leaves) => Promise<void>;
  initialData?: Article8Leaves;
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

export function Article8LeavesStep({
  onSaveLeaves,
  initialData,
  contractType,
  isLoading,
  onBack,
  onNext
}: Article8LeavesStepProps) {
  const isCDI = contractType === 'CDI';
  
  // États
  const [collectiveAgreement, setCollectiveAgreement] = useState<string>(
    initialData?.collectiveAgreement || 'AGRIC-ARCO'
  );
  
  const [hasCustomLeaves, setHasCustomLeaves] = useState<boolean>(
    initialData?.hasCustomLeaves || false
  );
  
  const [customLeavesDetails, setCustomLeavesDetails] = useState<string>(
    initialData?.customLeavesDetails || ''
  );
  
  const [hasSpecialAbsences, setHasSpecialAbsences] = useState<boolean>(
    initialData?.hasSpecialAbsences || false
  );
  
  const [specialAbsencesDetails, setSpecialAbsencesDetails] = useState<string>(
    initialData?.specialAbsencesDetails || 
    "Le salarié bénéficie également des congés pour événements familiaux prévus par le Code du travail :\n- Mariage ou PACS du salarié : 4 jours\n- Mariage d'un enfant : 1 jour\n- Naissance ou adoption : 3 jours\n- Décès du conjoint, partenaire de PACS, concubin, enfant : 3 jours\n- Décès d'un parent : 3 jours\n- Décès d'un frère, d'une sœur, d'un beau-parent : 3 jours\n- Annonce de la survenue d'un handicap chez un enfant : 2 jours"
  );

  const handleSave = async () => {
    const data: Article8Leaves = {
      collectiveAgreement,
      hasCustomLeaves,
      customLeavesDetails: hasCustomLeaves ? customLeavesDetails : undefined,
      hasSpecialAbsences,
      specialAbsencesDetails: hasSpecialAbsences ? specialAbsencesDetails : undefined
    };
    
    await onSaveLeaves(data);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Article 8 – Congés et absences</h2>
        <p className="text-gray-500">
          Définissez les modalités de congés payés et absences
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
            ? 'Cet article définit les droits à congés payés et les modalités d\'absences du salarié.'
            : 'Cet article définit les congés payés et l\'indemnité compensatrice de congés payés applicable en fin de contrat.'}
        </p>
        <p className="text-sm text-amber-600 mt-1">
          Le droit aux congés payés est calculé sur la base de 2,5 jours ouvrables par mois de travail effectif.
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
          <>
            <div className="pt-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-medium">Congés supplémentaires</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="has-custom-leaves"
                    checked={hasCustomLeaves}
                    onCheckedChange={setHasCustomLeaves}
                    disabled={isLoading}
                  />
                  <Label htmlFor="has-custom-leaves" className="cursor-pointer">
                    Personnaliser les congés
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Activez cette option pour spécifier des jours de congés supplémentaires prévus par la convention collective ou par accord d&apos;entreprise.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              {hasCustomLeaves && (
                <div className="mt-2">
                  <Textarea
                    value={customLeavesDetails}
                    onChange={(e) => setCustomLeavesDetails(e.target.value)}
                    placeholder="Précisez les congés supplémentaires (ex: jours d'ancienneté, congés conventionnels...)"
                    disabled={isLoading}
                    className="h-24"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Ex: "Le salarié bénéficiera de jours de congés supplémentaires selon son ancienneté, conformément à la convention collective."
                  </p>
                </div>
              )}
            </div>
            
            <Separator className="my-2" />
            
            <div className="pt-2">
              <div className="flex justify-between items-center">
                <Label className="text-base font-medium">Absences exceptionnelles</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="has-special-absences"
                    checked={hasSpecialAbsences}
                    onCheckedChange={setHasSpecialAbsences}
                    disabled={isLoading}
                  />
                  <Label htmlFor="has-special-absences" className="cursor-pointer">
                    Inclure les absences exceptionnelles
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Définit les congés exceptionnels pour événements familiaux (mariage, naissance, décès...) selon le Code du travail ou la convention collective.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              {hasSpecialAbsences && (
                <div className="mt-2">
                  <Textarea
                    value={specialAbsencesDetails}
                    onChange={(e) => setSpecialAbsencesDetails(e.target.value)}
                    placeholder="Précisez les absences exceptionnelles (mariage, décès, naissance...)"
                    disabled={isLoading}
                    className="h-32"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Vous pouvez personnaliser ces durées selon votre convention collective ou accords d&apos;entreprise.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-6 mb-4">
          <p className="text-gray-600 italic text-sm mb-2">
            Aperçu du texte qui sera généré :
          </p>
          <div className="p-4 bg-gray-50 rounded-md border">
            {isCDI ? (
              <>
                <p className="text-sm font-medium">Article 8 – Congés payés et absences</p>
                <p className="text-sm mt-2">
                  Le Salarié bénéficie de congés payés conformément aux dispositions légales et à la convention collective {collectiveAgreement}, soit 2,5 jours ouvrables par mois de travail effectif.
                </p>
                
                {hasCustomLeaves && customLeavesDetails && (
                  <p className="text-sm mt-2">
                    {customLeavesDetails}
                  </p>
                )}
                
                <p className="text-sm mt-2">
                  Les demandes de congés doivent être soumises à l&apos;employeur dans le respect du délai de prévenance en vigueur dans l&apos;entreprise.
                </p>
                
                <p className="text-sm mt-2">
                  Toute absence non justifiée ou non autorisée pourra être considérée comme injustifiée et faire l&apos;objet d&apos;une retenue sur salaire ou d&apos;une procédure disciplinaire.
                </p>
                
                {hasSpecialAbsences && specialAbsencesDetails && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Absences exceptionnelles :</p>
                    <p className="text-sm">
                      {specialAbsencesDetails.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-sm font-medium">Article 8 – Congés et indemnité compensatrice</p>
                <p className="text-sm mt-2">
                  Pendant la durée du contrat, le Salarié acquiert des droits à congés payés à raison de 2,5 jours ouvrables par mois, calculés prorata temporis.
                </p>
                
                <p className="text-sm mt-2">
                  En fin de contrat, le Salarié percevra une indemnité compensatrice de congés payés équivalente à 10% de la rémunération brute totale, sauf prise effective des congés pendant la période du contrat.
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