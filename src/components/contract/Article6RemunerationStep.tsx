import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, HelpCircle, Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContractType, WorkingHours } from '@/types/contract';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export interface Article6Remuneration {
  monthlySalary: number;
  paymentDate: string;
  hourlyRate?: number;
  collectiveAgreement?: string;
  hasConventionalSalary: boolean;
  includeCDDIndemnity: boolean; // Pour CDD uniquement
  customPaymentDate: boolean;
}

interface Article6RemunerationStepProps {
  onSaveRemuneration: (data: Article6Remuneration) => Promise<void>;
  initialData?: Article6Remuneration;
  contractType: ContractType;
  workingHours: WorkingHours;
  isPartTime: boolean;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

// Liste des dates de paiement courantes
const PAYMENT_DATES = [
  { value: 'dernier-jour', label: 'Dernier jour ouvré du mois' },
  { value: '25', label: '25 du mois' },
  { value: '30', label: '30 du mois' },
  { value: '31', label: '31 du mois' },
  { value: '5', label: '5 du mois suivant' },
  { value: 'custom', label: 'Autre date...' },
];

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

export function Article6RemunerationStep({
  onSaveRemuneration,
  initialData,
  contractType,
  workingHours,
  isPartTime,
  isLoading,
  onBack,
  onNext
}: Article6RemunerationStepProps) {
  const isCDI = contractType === 'CDI';

  // États
  const [monthlySalary, setMonthlySalary] = useState<number>(
    initialData?.monthlySalary || 0
  );
  
  const [hourlyRate, setHourlyRate] = useState<number>(
    initialData?.hourlyRate || (monthlySalary > 0 ? calculateHourlyRate(monthlySalary) : 0)
  );
  
  const [paymentDate, setPaymentDate] = useState<string>(
    initialData?.paymentDate || 'dernier-jour'
  );
  
  const [customPaymentDate, setCustomPaymentDate] = useState<boolean>(
    initialData?.customPaymentDate || false
  );
  
  const [collectiveAgreement, setCollectiveAgreement] = useState<string>(
    initialData?.collectiveAgreement || ''
  );
  
  const [hasConventionalSalary, setHasConventionalSalary] = useState<boolean>(
    initialData?.hasConventionalSalary || false
  );
  
  const [includeCDDIndemnity, setIncludeCDDIndemnity] = useState<boolean>(
    initialData?.includeCDDIndemnity !== undefined ? initialData.includeCDDIndemnity : true
  );
  
  // Calculer le taux horaire automatiquement à partir du salaire mensuel
  function calculateHourlyRate(salary: number): number {
    if (salary <= 0 || workingHours <= 0) return 0;
    const hourlyRate = (salary * 12) / (workingHours * 52);
    return parseFloat(hourlyRate.toFixed(2));
  }
  
  // Calculer le salaire mensuel à partir du taux horaire
  function calculateMonthlySalary(rate: number): number {
    if (rate <= 0 || workingHours <= 0) return 0;
    const monthlySalary = (rate * workingHours * 52) / 12;
    return parseFloat(monthlySalary.toFixed(2));
  }
  
  // Mettre à jour le taux horaire lorsque le salaire mensuel change
  useEffect(() => {
    if (monthlySalary > 0) {
      setHourlyRate(calculateHourlyRate(monthlySalary));
    }
  }, [monthlySalary]);
  
  // Mettre à jour le salaire mensuel lorsque le taux horaire change
  const updateMonthlySalaryFromHourlyRate = (rate: number) => {
    setHourlyRate(rate);
    if (rate > 0) {
      setMonthlySalary(calculateMonthlySalary(rate));
    }
  };
  
  // Formater la date de paiement pour l'affichage
  const formatPaymentDateForDisplay = () => {
    if (customPaymentDate) return paymentDate;
    
    const option = PAYMENT_DATES.find(o => o.value === paymentDate);
    return option ? option.label : paymentDate;
  };
  
  // Calculer le salaire net approximatif (environ 78% du brut pour une estimation simple)
  const estimateNetSalary = (brutSalary: number): number => {
    return parseFloat((brutSalary * 0.78).toFixed(2));
  };
  
  // Calculer le salaire net imposable approximatif (environ 80% du brut)
  const estimateNetTaxableSalary = (brutSalary: number): number => {
    return parseFloat((brutSalary * 0.8).toFixed(2));
  };
  
  // Calculer le salaire annuel
  const calculateAnnualSalary = (monthlySalary: number): number => {
    return parseFloat((monthlySalary * 12).toFixed(2));
  };

  const handleSave = async () => {
    const data: Article6Remuneration = {
      monthlySalary,
      hourlyRate,
      paymentDate,
      collectiveAgreement: hasConventionalSalary ? collectiveAgreement : undefined,
      hasConventionalSalary,
      includeCDDIndemnity: !isCDI && includeCDDIndemnity,
      customPaymentDate
    };
    
    await onSaveRemuneration(data);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Article 6 – Rémunération</h2>
        <p className="text-gray-500">
          Définissez les éléments de rémunération du salarié
        </p>
      </div>

      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <p className="text-sm text-blue-700 font-medium">
          {isCDI 
            ? 'Contrat à Durée Indéterminée (CDI)' 
            : 'Contrat à Durée Déterminée (CDD)'} - 
          {isPartTime ? ' Temps partiel' : ' Temps complet'}
        </p>
        <p className="text-sm text-blue-600 mt-1">
          Durée hebdomadaire de travail : <span className="font-medium">{workingHours} heures</span>
        </p>
        {!isCDI && (
          <p className="text-sm text-amber-600 mt-1">
            En fin de CDD, une indemnité de fin de contrat (10% de la rémunération brute) est habituellement versée.
          </p>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="monthly-salary" className="text-base font-medium">Salaire brut mensuel</Label>
          <div className="relative">
            <Input
              id="monthly-salary"
              type="number"
              min="0"
              step="50"
              value={monthlySalary || ''}
              onChange={(e) => setMonthlySalary(parseFloat(e.target.value) || 0)}
              placeholder="Ex: 2000"
              disabled={isLoading}
              className="pl-[2.5rem]"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</div>
          </div>
          
          {isPartTime && (
            <>
              <Label htmlFor="hourly-rate" className="text-base font-medium mt-4">Taux horaire brut</Label>
              <div className="relative">
                <Input
                  id="hourly-rate"
                  type="number"
                  min="0"
                  step="0.5"
                  value={hourlyRate || ''}
                  onChange={(e) => updateMonthlySalaryFromHourlyRate(parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 12.50"
                  disabled={isLoading}
                  className="pl-[2.5rem]"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€/h</div>
              </div>
            </>
          )}
        </div>
        
        <div className="bg-gray-50 rounded-md p-4 border mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-700">Estimation des montants</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-blue-600 text-sm">
                    <Calculator className="h-4 w-4 mr-1" />
                    <span>Approximation</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Ces montants sont des approximations à titre indicatif. Le calcul précis dépend de nombreux facteurs individuels.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Période</TableHead>
                <TableHead className="text-right">Brut</TableHead>
                <TableHead className="text-right">Net imposable</TableHead>
                <TableHead className="text-right">Net à payer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Mensuel</TableCell>
                <TableCell className="text-right">{monthlySalary.toLocaleString('fr-FR')} €</TableCell>
                <TableCell className="text-right">{estimateNetTaxableSalary(monthlySalary).toLocaleString('fr-FR')} €</TableCell>
                <TableCell className="text-right">{estimateNetSalary(monthlySalary).toLocaleString('fr-FR')} €</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Annuel</TableCell>
                <TableCell className="text-right">{calculateAnnualSalary(monthlySalary).toLocaleString('fr-FR')} €</TableCell>
                <TableCell className="text-right">{estimateNetTaxableSalary(calculateAnnualSalary(monthlySalary)).toLocaleString('fr-FR')} €</TableCell>
                <TableCell className="text-right">{estimateNetSalary(calculateAnnualSalary(monthlySalary)).toLocaleString('fr-FR')} €</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Taux horaire</TableCell>
                <TableCell className="text-right">{hourlyRate.toLocaleString('fr-FR')} €/h</TableCell>
                <TableCell className="text-right">{(hourlyRate * 0.8).toFixed(2)} €/h</TableCell>
                <TableCell className="text-right">{(hourlyRate * 0.78).toFixed(2)} €/h</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <p className="text-xs text-gray-500 mt-2">
            * Ces montants sont des approximations. Le salaire net dépend des cotisations sociales, des prélèvements fiscaux et d'autres facteurs individuels.
          </p>
        </div>
        
        <div className="space-y-4 pt-2">
          <Label htmlFor="payment-date" className="text-base font-medium">Date de versement du salaire</Label>
          <Select 
            value={paymentDate}
            onValueChange={(value) => {
              setPaymentDate(value);
              setCustomPaymentDate(value === 'custom');
            }}
            disabled={isLoading}
          >
            <SelectTrigger id="payment-date">
              <SelectValue placeholder="Choisir une date" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_DATES.map((date) => (
                <SelectItem key={date.value} value={date.value}>
                  {date.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {customPaymentDate && (
            <Input
              placeholder="Précisez la date de versement"
              value={typeof paymentDate === 'string' ? paymentDate : ''}
              onChange={(e) => setPaymentDate(e.target.value)}
              disabled={isLoading}
              className="mt-2"
            />
          )}
        </div>
        
        <Separator className="my-4" />
        
        {isCDI && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium">Convention collective</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="has-conventional-salary"
                  checked={hasConventionalSalary}
                  onCheckedChange={setHasConventionalSalary}
                  disabled={isLoading}
                />
                <Label htmlFor="has-conventional-salary" className="cursor-pointer">
                  Mentionner la convention collective
                </Label>
              </div>
            </div>
            
            {hasConventionalSalary && (
              <div className="mt-2">
                <Select 
                  value={collectiveAgreement} 
                  onValueChange={setCollectiveAgreement}
                  disabled={isLoading}
                >
                  <SelectTrigger id="collective-agreement">
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
                {collectiveAgreement === 'AUTRE' && (
                  <Input
                    className="mt-2"
                    placeholder="Précisez la convention collective"
                    value={collectiveAgreement === 'AUTRE' ? '' : collectiveAgreement}
                    onChange={(e) => setCollectiveAgreement(e.target.value)}
                    disabled={isLoading}
                  />
                )}
              </div>
            )}
          </div>
        )}
        
        {!isCDI && (
          <div className="flex items-center space-x-2 mt-4">
            <Switch
              id="include-cdd-indemnity"
              checked={includeCDDIndemnity}
              onCheckedChange={setIncludeCDDIndemnity}
              disabled={isLoading}
            />
            <Label htmlFor="include-cdd-indemnity" className="cursor-pointer">
              Inclure l'indemnité de fin de contrat (10%)
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Cette indemnité n'est pas due dans certains cas spécifiques (contrat étudiant, contrat saisonnier, etc.). Décochez si applicable.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        <div className="mt-6 mb-4">
          <p className="text-gray-600 italic text-sm mb-2">
            Aperçu du texte qui sera généré :
          </p>
          <div className="p-4 bg-gray-50 rounded-md border">
            {isCDI ? (
              isPartTime ? (
                // CDI Temps partiel
                <>
                  <p className="text-sm">
                    Le Salarié percevra une rémunération brute mensuelle de <span className="font-medium">{monthlySalary.toLocaleString('fr-FR')}</span> euros, correspondant à une durée de travail hebdomadaire de <span className="font-medium">{workingHours} heures</span>, soit <span className="font-medium">{Math.round((workingHours / 35) * 100)}%</span> d&apos;un temps plein.
                  </p>
                  
                  <p className="text-sm mt-2">
                    Le taux horaire brut applicable est de <span className="font-medium">{hourlyRate.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span> euros/heure
                    {hasConventionalSalary && collectiveAgreement && (
                      <>, conformément à la convention collective {collectiveAgreement}</>
                    )}.
                  </p>
                  
                  <p className="text-sm mt-2">
                    Le salaire sera versé le <span className="font-medium">{formatPaymentDateForDisplay()}</span>. Toute heure complémentaire effectuée sera rémunérée conformément aux dispositions légales et conventionnelles.
                  </p>
                </>
              ) : (
                // CDI Temps plein
                <>
                  <p className="text-sm">
                    En contrepartie de ses fonctions, le Salarié percevra une rémunération brute mensuelle de <span className="font-medium">{monthlySalary.toLocaleString('fr-FR')}</span> euros, versée mensuellement à terme échu, le <span className="font-medium">{formatPaymentDateForDisplay()}</span>.
                  </p>
                  
                  <p className="text-sm mt-2">
                    Cette rémunération correspond à <span className="font-medium">{workingHours} heures</span> hebdomadaires
                    {hasConventionalSalary && collectiveAgreement && (
                      <>, sur la base du salaire mensuel prévu par la convention collective {collectiveAgreement}</>
                    )}, et sera soumise aux charges sociales en vigueur.
                  </p>
                </>
              )
            ) : (
              // CDD (temps plein ou partiel)
              <>
                <p className="text-sm">
                  Le Salarié percevra une rémunération brute mensuelle de <span className="font-medium">{monthlySalary.toLocaleString('fr-FR')}</span> euros, versée le <span className="font-medium">{formatPaymentDateForDisplay()}</span> de chaque mois.
                </p>
                
                {isPartTime && (
                  <p className="text-sm mt-2">
                    Le taux horaire brut applicable est de <span className="font-medium">{hourlyRate.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span> euros/heure pour une durée hebdomadaire de <span className="font-medium">{workingHours} heures</span>.
                  </p>
                )}
                
                {includeCDDIndemnity && (
                  <p className="text-sm mt-2">
                    En fin de contrat, le Salarié percevra une indemnité de fin de contrat égale à 10% de la rémunération brute totale perçue, sauf exceptions prévues par la loi (ex : contrat étudiant, embauche CDI…).
                  </p>
                )}
                
                <p className="text-sm mt-2">
                  Le contrat ouvre également droit à l&apos;indemnité compensatrice de congés payés (10%).
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
          disabled={isLoading || !monthlySalary || monthlySalary <= 0} 
          className="flex items-center"
        >
          {isLoading ? 'Enregistrement...' : 'Continuer'}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
} 