import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

// Composants UI
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Validation schema
const payslipSchema = z.object({
  // Informations de l'entreprise
  company: z.object({
    id: z.string().min(1, 'L\'entreprise est requise'),
    name: z.string().min(1, 'Le nom de l\'entreprise est requis'),
    siret: z.string().min(1, 'Le SIRET est requis'),
  }),
  
  // Informations de l'employé
  employee: z.object({
    id: z.string().min(1, 'L\'employé est requis'),
    firstName: z.string().min(1, 'Le prénom est requis'),
    lastName: z.string().min(1, 'Le nom est requis'),
    position: z.string().min(1, 'Le poste est requis'),
    socialSecurityNumber: z.string().min(1, 'Le numéro de sécurité sociale est requis'),
  }),
  
  // Période de paie
  period: z.object({
    month: z.string().min(1, 'Le mois est requis'),
    year: z.string().min(1, 'L\'année est requise'),
    startDate: z.string().min(1, 'La date de début est requise'),
    endDate: z.string().min(1, 'La date de fin est requise'),
  }),
  
  // Rémunération brute
  grossSalary: z.object({
    base: z.string().min(1, 'Le salaire de base est requis'),
    overtime: z.string().optional().nullable(),
    bonus: z.string().optional().nullable(),
    indemnityCp: z.string().optional().nullable(),
    other: z.string().optional().nullable(),
  }),
  
  // Cotisations sociales
  contributions: z.object({
    health: z.string().optional().nullable(),
    retirement: z.string().optional().nullable(),
    unemployment: z.string().optional().nullable(),
    otherContributions: z.string().optional().nullable(),
  }),
  
  // Avantages en nature
  benefits: z.object({
    mealVouchers: z.string().optional().nullable(),
    transport: z.string().optional().nullable(),
    otherBenefits: z.string().optional().nullable(),
  }),
  
  // Net à payer
  netSalary: z.string().optional().nullable(),
  
  // Commentaires
  comments: z.string().optional().nullable(),
});

type PayslipFormValues = z.infer<typeof payslipSchema>;

interface PayslipFormProps {
  initialData?: Partial<PayslipFormValues>;
  onSubmit: (data: PayslipFormValues) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function PayslipForm({ 
  initialData, 
  onSubmit, 
  isLoading = false,
  onCancel
}: PayslipFormProps) {
  const [currentTab, setCurrentTab] = useState("enterprise");
  const [benefits, setBenefits] = useState<{name: string, amount: number}[]>(initialData?.benefits || []);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm<PayslipFormValues>({
    resolver: zodResolver(payslipSchema),
    defaultValues: {
      ...initialData,
      benefits: benefits,
    },
  });
  
  const watchHoursWorked = watch('hoursWorked');
  const watchHourlyRate = watch('hourlyRate');
  const watchGrossSalary = watch('grossSalary');
  const watchHealthInsurance = watch('healthInsurance');
  const watchRetirementBasic = watch('retirementBasic');
  const watchRetirementComplementary = watch('retirementComplementary');
  const watchUnemploymentInsurance = watch('unemploymentInsurance');
  const watchOtherContributions = watch('otherContributions');
  const watchIncomeTax = watch('incomeTax');
  
  // Calculs automatiques
  React.useEffect(() => {
    if (watchHoursWorked && watchHourlyRate) {
      const gross = watchHoursWorked * watchHourlyRate;
      setValue('grossSalary', parseFloat(gross.toFixed(2)));
    }
  }, [watchHoursWorked, watchHourlyRate, setValue]);
  
  React.useEffect(() => {
    if (watchGrossSalary) {
      // Calcul automatique des cotisations (exemples)
      const healthInsurance = watchGrossSalary * 0.07;
      const retirementBasic = watchGrossSalary * 0.0625;
      const retirementComplementary = watchGrossSalary * 0.03;
      const unemploymentInsurance = watchGrossSalary * 0.024;
      const otherContributions = watchGrossSalary * 0.02;
      
      setValue('healthInsurance', parseFloat(healthInsurance.toFixed(2)));
      setValue('retirementBasic', parseFloat(retirementBasic.toFixed(2)));
      setValue('retirementComplementary', parseFloat(retirementComplementary.toFixed(2)));
      setValue('unemploymentInsurance', parseFloat(unemploymentInsurance.toFixed(2)));
      setValue('otherContributions', parseFloat(otherContributions.toFixed(2)));
    }
  }, [watchGrossSalary, setValue]);
  
  React.useEffect(() => {
    const totalContributions = (
      (watchHealthInsurance || 0) + 
      (watchRetirementBasic || 0) + 
      (watchRetirementComplementary || 0) + 
      (watchUnemploymentInsurance || 0) + 
      (watchOtherContributions || 0)
    );
    
    if (watchGrossSalary) {
      const netBeforeTax = watchGrossSalary - totalContributions;
      setValue('netBeforeTax', parseFloat(netBeforeTax.toFixed(2)));
      
      // Estimation de l'impôt
      const incomeTax = netBeforeTax * 0.12; // 12% d'impôt par défaut
      setValue('incomeTax', parseFloat(incomeTax.toFixed(2)));
      
      // Calcul du net après impôt
      const netAfterTax = netBeforeTax - (watchIncomeTax || 0);
      setValue('netAfterTax', parseFloat(netAfterTax.toFixed(2)));
    }
  }, [
    watchGrossSalary, 
    watchHealthInsurance, 
    watchRetirementBasic, 
    watchRetirementComplementary, 
    watchUnemploymentInsurance, 
    watchOtherContributions,
    watchIncomeTax,
    setValue
  ]);
  
  const addBenefit = () => {
    const newBenefits = [...benefits, { name: "", amount: 0 }];
    setBenefits(newBenefits);
    setValue('benefits', newBenefits);
  };
  
  const removeBenefit = (index: number) => {
    const newBenefits = benefits.filter((_, i) => i !== index);
    setBenefits(newBenefits);
    setValue('benefits', newBenefits);
  };
  
  const updateBenefit = (index: number, field: 'name' | 'amount', value: string | number) => {
    const newBenefits = [...benefits];
    newBenefits[index] = { 
      ...newBenefits[index], 
      [field]: field === 'amount' ? parseFloat(value as string) : value 
    };
    setBenefits(newBenefits);
    setValue('benefits', newBenefits);
  };
  
  const handleTabChange = async (value: string) => {
    // Valider les champs avant de changer d'onglet
    const isValid = await trigger();
    if (isValid) {
      setCurrentTab(value);
    }
  };
  
  const processSubmit = (data: PayslipFormValues) => {
    onSubmit(data);
  };
  
  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="enterprise">Entreprise</TabsTrigger>
          <TabsTrigger value="employee">Employé</TabsTrigger>
          <TabsTrigger value="remuneration">Rémunération</TabsTrigger>
        </TabsList>
        
        <TabsContent value="enterprise" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employerName">Nom de l&apos;entreprise *</Label>
              <Input
                id="employerName"
                placeholder="Nom de l'entreprise"
                {...register("employerName")}
                error={errors.employerName?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employerSiret">SIRET *</Label>
              <Input
                id="employerSiret"
                placeholder="14 chiffres"
                {...register("employerSiret")}
                error={errors.employerSiret?.message}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="employerAddress">Adresse *</Label>
              <Input
                id="employerAddress"
                placeholder="Adresse de l'entreprise"
                {...register("employerAddress")}
                error={errors.employerAddress?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employerPostalCode">Code postal *</Label>
              <Input
                id="employerPostalCode"
                placeholder="Code postal"
                {...register("employerPostalCode")}
                error={errors.employerPostalCode?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employerCity">Ville *</Label>
              <Input
                id="employerCity"
                placeholder="Ville"
                {...register("employerCity")}
                error={errors.employerCity?.message}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="employerUrssaf">Identifiant URSSAF *</Label>
              <Input
                id="employerUrssaf"
                placeholder="Identifiant URSSAF"
                {...register("employerUrssaf")}
                error={errors.employerUrssaf?.message}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="button" onClick={() => setCurrentTab("employee")}>
              Suivant
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="employee" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeFirstName">Prénom *</Label>
              <Input
                id="employeeFirstName"
                placeholder="Prénom"
                {...register("employeeFirstName")}
                error={errors.employeeFirstName?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeeName">Nom *</Label>
              <Input
                id="employeeName"
                placeholder="Nom"
                {...register("employeeName")}
                error={errors.employeeName?.message}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="employeeAddress">Adresse *</Label>
              <Input
                id="employeeAddress"
                placeholder="Adresse de l'employé"
                {...register("employeeAddress")}
                error={errors.employeeAddress?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeePostalCode">Code postal *</Label>
              <Input
                id="employeePostalCode"
                placeholder="Code postal"
                {...register("employeePostalCode")}
                error={errors.employeePostalCode?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeeCity">Ville *</Label>
              <Input
                id="employeeCity"
                placeholder="Ville"
                {...register("employeeCity")}
                error={errors.employeeCity?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeeSocialSecurityNumber">Numéro de sécurité sociale *</Label>
              <Input
                id="employeeSocialSecurityNumber"
                placeholder="Numéro de sécurité sociale"
                {...register("employeeSocialSecurityNumber")}
                error={errors.employeeSocialSecurityNumber?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeePosition">Fonction *</Label>
              <Input
                id="employeePosition"
                placeholder="Fonction"
                {...register("employeePosition")}
                error={errors.employeePosition?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeeContractType">Type de contrat *</Label>
              <Select
                onValueChange={(value) => setValue('employeeContractType', value as 'CDI' | 'CDD' | 'Intérim' | 'Stage' | 'Alternance')}
                defaultValue={initialData?.employeeContractType}
              >
                <SelectTrigger id="employeeContractType">
                  <SelectValue placeholder="Sélectionner un type de contrat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CDI">CDI</SelectItem>
                  <SelectItem value="CDD">CDD</SelectItem>
                  <SelectItem value="Intérim">Intérim</SelectItem>
                  <SelectItem value="Stage">Stage</SelectItem>
                  <SelectItem value="Alternance">Alternance</SelectItem>
                </SelectContent>
              </Select>
              {errors.employeeContractType?.message && (
                <p className="text-red-500 text-xs mt-1">{errors.employeeContractType?.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employmentStartDate">Date de début d&apos;emploi *</Label>
              <Input
                id="employmentStartDate"
                type="date"
                {...register("employmentStartDate")}
                error={errors.employmentStartDate?.message}
              />
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setCurrentTab("enterprise")}>
              Précédent
            </Button>
            <Button type="button" onClick={() => setCurrentTab("remuneration")}>
              Suivant
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="remuneration" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period">Période (MM/YYYY) *</Label>
              <Input
                id="period"
                placeholder="MM/YYYY"
                {...register("period")}
                error={errors.period?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Date de paiement *</Label>
              <Input
                id="paymentDate"
                type="date"
                {...register("paymentDate")}
                error={errors.paymentDate?.message}
              />
            </div>
            
            <div className="md:col-span-1">
              {/* Espace vide pour l'alignement */}
            </div>
            
            <div className="border-t pt-4 md:col-span-3">
              <h3 className="font-medium mb-3">Salaire brut</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hoursWorked">Heures travaillées *</Label>
              <Input
                id="hoursWorked"
                type="number"
                step="0.01"
                {...register("hoursWorked", { valueAsNumber: true })}
                error={errors.hoursWorked?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Taux horaire *</Label>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                {...register("hourlyRate", { valueAsNumber: true })}
                error={errors.hourlyRate?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grossSalary">Salaire brut *</Label>
              <Input
                id="grossSalary"
                type="number"
                step="0.01"
                readOnly
                {...register("grossSalary", { valueAsNumber: true })}
                error={errors.grossSalary?.message}
              />
            </div>
            
            <div className="border-t pt-4 md:col-span-3">
              <h3 className="font-medium mb-3">Cotisations salariales</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="healthInsurance">Assurance maladie</Label>
              <Input
                id="healthInsurance"
                type="number"
                step="0.01"
                readOnly
                {...register("healthInsurance", { valueAsNumber: true })}
                error={errors.healthInsurance?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="retirementBasic">Retraite de base</Label>
              <Input
                id="retirementBasic"
                type="number"
                step="0.01"
                readOnly
                {...register("retirementBasic", { valueAsNumber: true })}
                error={errors.retirementBasic?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="retirementComplementary">Retraite complémentaire</Label>
              <Input
                id="retirementComplementary"
                type="number"
                step="0.01"
                readOnly
                {...register("retirementComplementary", { valueAsNumber: true })}
                error={errors.retirementComplementary?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unemploymentInsurance">Assurance chômage</Label>
              <Input
                id="unemploymentInsurance"
                type="number"
                step="0.01"
                readOnly
                {...register("unemploymentInsurance", { valueAsNumber: true })}
                error={errors.unemploymentInsurance?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="otherContributions">Autres cotisations</Label>
              <Input
                id="otherContributions"
                type="number"
                step="0.01"
                readOnly
                {...register("otherContributions", { valueAsNumber: true })}
                error={errors.otherContributions?.message}
              />
            </div>
            
            <div className="md:col-span-1">
              {/* Espace vide pour l'alignement */}
            </div>
            
            <div className="border-t pt-4 md:col-span-3">
              <h3 className="font-medium mb-3">Salaire net</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="netBeforeTax">Net avant impôt</Label>
              <Input
                id="netBeforeTax"
                type="number"
                step="0.01"
                readOnly
                {...register("netBeforeTax", { valueAsNumber: true })}
                error={errors.netBeforeTax?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="incomeTax">Impôt sur le revenu</Label>
              <Input
                id="incomeTax"
                type="number"
                step="0.01"
                readOnly
                {...register("incomeTax", { valueAsNumber: true })}
                error={errors.incomeTax?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="netAfterTax">Net à payer</Label>
              <Input
                id="netAfterTax"
                type="number"
                step="0.01"
                readOnly
                {...register("netAfterTax", { valueAsNumber: true })}
                error={errors.netAfterTax?.message}
              />
            </div>
            
            <div className="border-t pt-4 md:col-span-3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Avantages et primes</h3>
                <Button type="button" variant="outline" size="sm" onClick={addBenefit}>
                  Ajouter
                </Button>
              </div>
              
              {benefits.map((benefit, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`benefit-name-${index}`}>Libellé</Label>
                    <Input
                      id={`benefit-name-${index}`}
                      placeholder="Ticket restaurant, prime, etc."
                      value={benefit.name}
                      onChange={(e) => updateBenefit(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="space-y-2 flex-grow">
                      <Label htmlFor={`benefit-amount-${index}`}>Montant</Label>
                      <Input
                        id={`benefit-amount-${index}`}
                        type="number"
                        step="0.01"
                        value={benefit.amount}
                        onChange={(e) => updateBenefit(index, 'amount', e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mb-2"
                      onClick={() => removeBenefit(index)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onCancel && onCancel()}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer le bulletin"
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  );
} 