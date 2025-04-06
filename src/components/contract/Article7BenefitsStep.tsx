import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, HelpCircle, Plus, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContractType } from '@/types/contract';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

export interface Article7Benefits {
  hasNoBenefits: boolean; // Aucun avantage spécifique
  hasExpenseReimbursement: boolean; // Remboursement de frais
  hasTransportAllowance: boolean; // Remboursement transport
  hasLunchVouchers: boolean; // Tickets restaurant
  lunchVoucherAmount?: number; // Montant ticket restaurant
  lunchVoucherEmployerContribution?: number; // Part employeur
  hasMutualInsurance: boolean; // Mutuelle d'entreprise
  mutualInsuranceEmployerContribution?: number; // Part employeur mutuelle
  hasSpecificEquipment: boolean; // Équipement spécifique (pour CDD)
  specificEquipmentDetails?: string; // Détails équipement
  hasProfessionalPhone: boolean; // Téléphone professionnel
  hasOtherBenefits: boolean; // Autres avantages
  otherBenefitsDetails?: string; // Détails autres avantages
}

interface Article7BenefitsStepProps {
  onSaveBenefits: (data: Article7Benefits) => Promise<void>;
  initialData?: Article7Benefits;
  contractType: ContractType;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function Article7BenefitsStep({
  onSaveBenefits,
  initialData,
  contractType,
  isLoading,
  onBack,
  onNext
}: Article7BenefitsStepProps) {
  const isCDI = contractType === 'CDI';
  
  // États
  const [hasNoBenefits, setHasNoBenefits] = useState<boolean>(
    initialData?.hasNoBenefits || false
  );
  
  const [hasExpenseReimbursement, setHasExpenseReimbursement] = useState<boolean>(
    initialData?.hasExpenseReimbursement || false
  );
  
  const [hasTransportAllowance, setHasTransportAllowance] = useState<boolean>(
    initialData?.hasTransportAllowance || true // Obligatoire par défaut
  );
  
  const [hasLunchVouchers, setHasLunchVouchers] = useState<boolean>(
    initialData?.hasLunchVouchers || false
  );
  
  const [lunchVoucherAmount, setLunchVoucherAmount] = useState<number>(
    initialData?.lunchVoucherAmount || 9
  );
  
  const [lunchVoucherEmployerContribution, setLunchVoucherEmployerContribution] = useState<number>(
    initialData?.lunchVoucherEmployerContribution || 55
  );
  
  const [hasMutualInsurance, setHasMutualInsurance] = useState<boolean>(
    initialData?.hasMutualInsurance || false
  );
  
  const [mutualInsuranceEmployerContribution, setMutualInsuranceEmployerContribution] = useState<number>(
    initialData?.mutualInsuranceEmployerContribution || 50
  );
  
  const [hasSpecificEquipment, setHasSpecificEquipment] = useState<boolean>(
    initialData?.hasSpecificEquipment || false
  );
  
  const [specificEquipmentDetails, setSpecificEquipmentDetails] = useState<string>(
    initialData?.specificEquipmentDetails || ''
  );
  
  const [hasProfessionalPhone, setHasProfessionalPhone] = useState<boolean>(
    initialData?.hasProfessionalPhone || false
  );
  
  const [hasOtherBenefits, setHasOtherBenefits] = useState<boolean>(
    initialData?.hasOtherBenefits || false
  );
  
  const [otherBenefitsDetails, setOtherBenefitsDetails] = useState<string>(
    initialData?.otherBenefitsDetails || ''
  );

  // Activation/désactivation de tous les avantages en fonction de hasNoBenefits
  const handleToggleNoBenefits = (checked: boolean) => {
    setHasNoBenefits(checked);
    
    if (checked) {
      // Désactiver tous les avantages sauf le transport (obligatoire)
      setHasExpenseReimbursement(false);
      setHasLunchVouchers(false);
      setHasMutualInsurance(false);
      setHasSpecificEquipment(false);
      setHasProfessionalPhone(false);
      setHasOtherBenefits(false);
    }
  };

  const handleSave = async () => {
    const data: Article7Benefits = {
      hasNoBenefits,
      hasExpenseReimbursement,
      hasTransportAllowance,
      hasLunchVouchers,
      lunchVoucherAmount: hasLunchVouchers ? lunchVoucherAmount : undefined,
      lunchVoucherEmployerContribution: hasLunchVouchers ? lunchVoucherEmployerContribution : undefined,
      hasMutualInsurance,
      mutualInsuranceEmployerContribution: hasMutualInsurance ? mutualInsuranceEmployerContribution : undefined,
      hasSpecificEquipment,
      specificEquipmentDetails: hasSpecificEquipment ? specificEquipmentDetails : undefined,
      hasProfessionalPhone,
      hasOtherBenefits,
      otherBenefitsDetails: hasOtherBenefits ? otherBenefitsDetails : undefined
    };
    
    await onSaveBenefits(data);
    onNext();
  };

  // Calcul des montants pour les tickets restaurant
  const calculateLunchVoucherAmounts = () => {
    if (!hasLunchVouchers || !lunchVoucherAmount || !lunchVoucherEmployerContribution) {
      return { employerAmount: 0, employeeAmount: 0 };
    }
    
    const employerPct = lunchVoucherEmployerContribution;
    const employeePct = 100 - employerPct;
    
    const employerAmount = parseFloat(((lunchVoucherAmount * employerPct) / 100).toFixed(2));
    const employeeAmount = parseFloat(((lunchVoucherAmount * employeePct) / 100).toFixed(2));
    
    return { employerAmount, employeeAmount };
  };

  // Déterminer si au moins un avantage est sélectionné
  const hasAnyBenefit = hasExpenseReimbursement || hasTransportAllowance || hasLunchVouchers || 
                        hasMutualInsurance || hasSpecificEquipment || hasProfessionalPhone || hasOtherBenefits;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Article 7 – Avantages et frais professionnels</h2>
        <p className="text-gray-500">
          Définissez les avantages et remboursements dont bénéficiera le salarié
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
            ? 'Cet article définit les avantages et remboursements de frais dont bénéficiera le salarié en plus de sa rémunération principale.'
            : 'Cet article décrit les avantages annexes accordés au salarié pendant la durée du contrat.'}
        </p>
        <p className="text-sm text-amber-600 mt-1">
          La prise en charge partielle des frais de transport en commun (50%) est obligatoire selon la réglementation.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Label className="text-base font-medium">Aucun avantage spécifique</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="no-benefits"
              checked={hasNoBenefits}
              onCheckedChange={handleToggleNoBenefits}
              disabled={isLoading}
            />
            <Label htmlFor="no-benefits" className="cursor-pointer">
              Simplifier l'article
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Utilisez cette option si aucun avantage spécifique n'est prévu au contrat, hors dispositions légales obligatoires.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {!hasNoBenefits && (
          <div className="space-y-5 mt-4">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="expense-reimbursement"
                checked={hasExpenseReimbursement}
                onCheckedChange={(checked) => setHasExpenseReimbursement(checked === true)}
                disabled={isLoading || hasNoBenefits}
              />
              <div className="space-y-1">
                <Label 
                  htmlFor="expense-reimbursement" 
                  className="font-medium cursor-pointer"
                >
                  Remboursement de frais professionnels
                </Label>
                <p className="text-sm text-gray-500">
                  Les frais engagés dans le cadre de l'activité seront remboursés sur présentation des justificatifs, selon les barèmes en vigueur dans l'entreprise.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="transport-allowance"
                checked={hasTransportAllowance}
                onCheckedChange={(checked) => setHasTransportAllowance(checked === true)}
                disabled={isLoading} // Toujours actif car obligatoire
              />
              <div className="space-y-1">
                <Label 
                  htmlFor="transport-allowance" 
                  className="font-medium cursor-pointer"
                >
                  Prise en charge des frais de transport (obligatoire)
                </Label>
                <p className="text-sm text-gray-500">
                  Remboursement de 50% du titre de transport public, conformément à la réglementation (article L.3261-2 du Code du travail).
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="lunch-vouchers"
                checked={hasLunchVouchers}
                onCheckedChange={(checked) => setHasLunchVouchers(checked === true)}
                disabled={isLoading || hasNoBenefits}
              />
              <div className="space-y-1 w-full">
                <Label 
                  htmlFor="lunch-vouchers" 
                  className="font-medium cursor-pointer"
                >
                  Titres-restaurant
                </Label>
                {hasLunchVouchers && (
                  <div className="mt-2 space-y-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm whitespace-nowrap w-36">Valeur faciale :</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min="5"
                          max="25"
                          step="0.5"
                          value={lunchVoucherAmount || ''}
                          onChange={(e) => setLunchVoucherAmount(parseFloat(e.target.value) || 0)}
                          disabled={isLoading}
                          className="pl-[2.5rem] h-9 w-32"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm whitespace-nowrap w-36">Part employeur :</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min="50"
                          max="60"
                          step="1"
                          value={lunchVoucherEmployerContribution || ''}
                          onChange={(e) => setLunchVoucherEmployerContribution(parseInt(e.target.value) || 0)}
                          disabled={isLoading}
                          className="pl-[2.5rem] h-9 w-32"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</div>
                      </div>
                    </div>
                    
                    {lunchVoucherAmount && lunchVoucherEmployerContribution && (
                      <div className="text-xs text-gray-600 mt-1 bg-gray-100 p-2 rounded">
                        <p>Pour un ticket de {lunchVoucherAmount.toFixed(2)}€ :</p>
                        <p>- Part employeur : {calculateLunchVoucherAmounts().employerAmount}€ ({lunchVoucherEmployerContribution}%)</p>
                        <p>- Part salarié : {calculateLunchVoucherAmounts().employeeAmount}€ ({100 - lunchVoucherEmployerContribution}%)</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="mutual-insurance"
                checked={hasMutualInsurance}
                onCheckedChange={(checked) => setHasMutualInsurance(checked === true)}
                disabled={isLoading || hasNoBenefits}
              />
              <div className="space-y-1 w-full">
                <Label 
                  htmlFor="mutual-insurance" 
                  className="font-medium cursor-pointer"
                >
                  Mutuelle d'entreprise
                </Label>
                {hasMutualInsurance && (
                  <div className="mt-2 space-y-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm whitespace-nowrap w-36">Part employeur :</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min="50"
                          max="100"
                          step="5"
                          value={mutualInsuranceEmployerContribution || ''}
                          onChange={(e) => setMutualInsuranceEmployerContribution(parseInt(e.target.value) || 0)}
                          disabled={isLoading}
                          className="pl-[2.5rem] h-9 w-32"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600 mt-1 bg-gray-100 p-2 rounded">
                      <p>Répartition des cotisations :</p>
                      <p>- Part employeur : {mutualInsuranceEmployerContribution}%</p>
                      <p>- Part salarié : {100 - mutualInsuranceEmployerContribution}%</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {!isCDI && (
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="specific-equipment"
                  checked={hasSpecificEquipment}
                  onCheckedChange={(checked) => setHasSpecificEquipment(checked === true)}
                  disabled={isLoading || hasNoBenefits}
                />
                <div className="space-y-1 w-full">
                  <Label 
                    htmlFor="specific-equipment" 
                    className="font-medium cursor-pointer"
                  >
                    Mise à disposition d'équipement
                  </Label>
                  {hasSpecificEquipment && (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={specificEquipmentDetails}
                        onChange={(e) => setSpecificEquipmentDetails(e.target.value)}
                        placeholder="Ordinateur portable, véhicule, téléphone professionnel, tenue de travail..."
                        disabled={isLoading}
                        className="h-20"
                      />
                      <p className="text-sm text-gray-500">
                        Précisez l'équipement mis à disposition du salarié pour l'exécution de sa mission, à restituer en fin de contrat.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="professional-phone"
                checked={hasProfessionalPhone}
                onCheckedChange={(checked) => setHasProfessionalPhone(checked === true)}
                disabled={isLoading || hasNoBenefits}
              />
              <div className="space-y-1">
                <Label 
                  htmlFor="professional-phone" 
                  className="font-medium cursor-pointer"
                >
                  Téléphone professionnel
                </Label>
                <p className="text-sm text-gray-500">
                  Mise à disposition d'un téléphone professionnel avec forfait pour l'exercice des fonctions.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="other-benefits"
                checked={hasOtherBenefits}
                onCheckedChange={(checked) => setHasOtherBenefits(checked === true)}
                disabled={isLoading || hasNoBenefits}
              />
              <div className="space-y-1 w-full">
                <Label 
                  htmlFor="other-benefits" 
                  className="font-medium cursor-pointer"
                >
                  Autres avantages
                </Label>
                {hasOtherBenefits && (
                  <div className="mt-2 space-y-2">
                    <Textarea
                      value={otherBenefitsDetails}
                      onChange={(e) => setOtherBenefitsDetails(e.target.value)}
                      placeholder="Prime annuelle, 13ème mois, participation, intéressement..."
                      disabled={isLoading}
                      className="h-20"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 mb-4">
          <p className="text-gray-600 italic text-sm mb-2">
            Aperçu du texte qui sera généré :
          </p>
          <div className="p-4 bg-gray-50 rounded-md border">
            {hasNoBenefits ? (
              <p className="text-sm">
                Aucun avantage en nature ou remboursement spécifique n'est prévu au titre du présent contrat, hors dispositions légales obligatoires.
              </p>
            ) : (
              <>
                <p className="text-sm">
                  {isCDI 
                    ? "En sus de sa rémunération, le Salarié pourra bénéficier des avantages suivants :"
                    : "Pendant la durée du contrat, le Salarié pourra bénéficier des éléments suivants :"}
                </p>
                
                {!hasAnyBenefit && (
                  <p className="text-sm italic mt-2">Aucun avantage spécifique sélectionné.</p>
                )}
                
                <ul className="text-sm mt-2 space-y-2">
                  {hasExpenseReimbursement && (
                    <li>
                      <p className="font-medium">Frais professionnels :</p>
                      <p>Les frais engagés dans le cadre de l'activité seront remboursés sur présentation des justificatifs, selon les barèmes en vigueur dans l'entreprise.</p>
                    </li>
                  )}
                  
                  {hasLunchVouchers && (
                    <li>
                      <p className="font-medium">Titres-restaurant :</p>
                      <p>Le Salarié bénéficie de titres-restaurant pour les jours travaillés, d'une valeur faciale de {lunchVoucherAmount}€, pris en charge à {lunchVoucherEmployerContribution}% par l'Employeur.</p>
                    </li>
                  )}
                  
                  {hasTransportAllowance && (
                    <li>
                      <p className="font-medium">Prise en charge du transport :</p>
                      <p>Remboursement de 50% du titre de transport public, conformément à la réglementation (article L.3261-2 du Code du travail).</p>
                    </li>
                  )}
                  
                  {hasMutualInsurance && (
                    <li>
                      <p className="font-medium">Mutuelle d'entreprise :</p>
                      <p>Le Salarié bénéficiera de la couverture santé collective, avec une prise en charge employeur à hauteur de {mutualInsuranceEmployerContribution}%, conformément à la législation et aux accords applicables.</p>
                    </li>
                  )}
                  
                  {hasSpecificEquipment && specificEquipmentDetails && (
                    <li>
                      <p className="font-medium">Équipement mis à disposition :</p>
                      <p>{specificEquipmentDetails}.</p>
                      <p className="text-xs text-gray-500">Cet équipement devra être restitué en bon état à la fin du contrat.</p>
                    </li>
                  )}
                  
                  {hasProfessionalPhone && (
                    <li>
                      <p className="font-medium">Téléphone professionnel :</p>
                      <p>Un téléphone professionnel avec forfait sera mis à disposition du Salarié pour l'exercice de ses fonctions.</p>
                    </li>
                  )}
                  
                  {hasOtherBenefits && otherBenefitsDetails && (
                    <li>
                      <p className="font-medium">Autres avantages :</p>
                      <p>{otherBenefitsDetails}</p>
                    </li>
                  )}
                </ul>
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