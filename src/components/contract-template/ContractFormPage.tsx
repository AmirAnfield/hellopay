'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Download, 
  Save, 
  Building, 
  User, 
  ClipboardList,
  Check,
  ArrowLeft 
} from 'lucide-react';
import { ContractTemplate } from './ContractTemplate';

// Schéma de validation Zod pour les données du formulaire
const contractFormSchema = z.object({
  // Données de l'entreprise
  company: z.object({
    name: z.string().min(1, { message: 'Le nom de l\'entreprise est requis' }),
    address: z.string().min(1, { message: 'L\'adresse est requise' }),
    siret: z.string().min(1, { message: 'Le SIRET est requis' }),
    representant: z.string().min(1, { message: 'Le représentant est requis' }),
    conventionCollective: z.string().optional()
  }),
  
  // Données de l'employé
  employee: z.object({
    firstName: z.string().min(1, { message: 'Le prénom est requis' }),
    lastName: z.string().min(1, { message: 'Le nom est requis' }),
    address: z.string().min(1, { message: 'L\'adresse est requise' }),
    birthDate: z.string().optional(),
    nationality: z.string().optional(),
    socialSecurityNumber: z.string().optional()
  }),
  
  // Détails du contrat
  contractDetails: z.object({
    type: z.enum(['CDI', 'CDD']),
    workingHours: z.number().min(1).max(35),
    position: z.string().min(1, { message: 'Le poste est requis' }),
    classification: z.string().optional(),
    startDate: z.string().min(1, { message: 'La date de début est requise' }),
    endDate: z.string().optional(),
    motifCDD: z.string().optional(),
    trialPeriod: z.boolean().default(false),
    trialPeriodDuration: z.string().optional(),
    workplace: z.string().min(1, { message: 'Le lieu de travail est requis' }),
    mobilityClause: z.boolean().default(false),
    mobilityRadius: z.number().optional(),
    scheduleType: z.enum(['fixed', 'variable', 'shifts']).optional(),
    workingDays: z.string().optional(),
    salary: z.number().min(0, { message: 'Le salaire est requis' }),
    hourlyRate: z.number().optional(),
    paymentDate: z.string().optional(),
    benefits: z.object({
      expenseReimbursement: z.boolean().default(false),
      transportAllowance: z.boolean().default(false),
      lunchVouchers: z.boolean().default(false),
      lunchVoucherAmount: z.number().optional(),
      lunchVoucherEmployerContribution: z.number().optional(),
      mutualInsurance: z.boolean().default(false),
      mutualInsuranceEmployerContribution: z.number().optional(),
      professionalPhone: z.boolean().default(false)
    }).optional(),
    customLeaves: z.boolean().default(false),
    customLeavesDetails: z.string().optional(),
    nonCompete: z.boolean().default(false),
    nonCompeteDuration: z.string().optional(),
    nonCompeteArea: z.string().optional(),
    nonCompeteCompensation: z.string().optional(),
    nonSolicitation: z.boolean().default(false),
    noticePeriod: z.enum(['legal', '1-month', '2-months', '3-months', 'collective']).optional()
  }),
  
  // Options d'affichage
  displayOptions: z.object({
    hasPreambule: z.boolean().default(true),
    includeDataProtection: z.boolean().default(true),
    includeImageRights: z.boolean().default(false),
    includeWorkRules: z.boolean().default(false),
    includeWorkClothes: z.boolean().default(false),
    includeInternalRules: z.boolean().default(false),
    includeConfidentiality: z.boolean().default(false),
    includeIntellectualProperty: z.boolean().default(false),
    includeTeleworking: z.boolean().default(false),
    teleworkingType: z.enum(['regular', 'occasional', 'mixed']).optional(),
    employerProvidesEquipment: z.boolean().default(false),
    showSignatures: z.boolean().default(true)
  })
});

type ContractFormValues = z.infer<typeof contractFormSchema>;

// Valeurs par défaut pour le formulaire
const defaultValues: ContractFormValues = {
  company: {
    name: '',
    address: '',
    siret: '',
    representant: '',
    conventionCollective: ''
  },
  employee: {
    firstName: '',
    lastName: '',
    address: '',
    birthDate: '',
    nationality: '',
    socialSecurityNumber: ''
  },
  contractDetails: {
    type: 'CDI',
    workingHours: 35,
    position: '',
    classification: '',
    startDate: '',
    endDate: '',
    motifCDD: '',
    trialPeriod: false,
    trialPeriodDuration: '',
    workplace: '',
    mobilityClause: false,
    mobilityRadius: 0,
    scheduleType: 'fixed',
    workingDays: '',
    salary: 0,
    hourlyRate: 0,
    paymentDate: '',
    benefits: {
      expenseReimbursement: false,
      transportAllowance: false,
      lunchVouchers: false,
      lunchVoucherAmount: 0,
      lunchVoucherEmployerContribution: 0,
      mutualInsurance: false,
      mutualInsuranceEmployerContribution: 0,
      professionalPhone: false
    },
    customLeaves: false,
    customLeavesDetails: '',
    nonCompete: false,
    nonCompeteDuration: '',
    nonCompeteArea: '',
    nonCompeteCompensation: '',
    nonSolicitation: false,
    noticePeriod: 'legal'
  },
  displayOptions: {
    hasPreambule: true,
    includeDataProtection: true,
    includeImageRights: false,
    includeWorkRules: false,
    includeWorkClothes: false,
    includeInternalRules: false,
    includeConfidentiality: false,
    includeIntellectualProperty: false,
    includeTeleworking: false,
    teleworkingType: 'regular',
    employerProvidesEquipment: false,
    showSignatures: true
  }
};

export function ContractFormPage() {
  const [activeTab, setActiveTab] = useState('company');
  
  // Configuration du formulaire
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues
  });
  
  // Observer les changements du formulaire en temps réel
  const formValues = form.watch();
  
  // Fonction de soumission du formulaire
  const onSubmit = (data: ContractFormValues) => {
    console.log('Formulaire soumis:', data);
    // Ici, vous pourriez sauvegarder les données ou générer le PDF
  };
  
  // État pour suivre si le formulaire est prêt à être validé
  const isFormValid = form.formState.isValid;
  
  // Détection des changements conditionnels
  useEffect(() => {
    // Si le type de contrat change à CDD, requérir une date de fin et motif
    if (form.watch('contractDetails.type') === 'CDD') {
      form.register('contractDetails.endDate', { required: 'La date de fin est requise pour un CDD' });
      form.register('contractDetails.motifCDD', { required: 'Le motif est requis pour un CDD' });
    }
    
    // Si période d'essai activée, valider la durée
    if (form.watch('contractDetails.trialPeriod')) {
      form.register('contractDetails.trialPeriodDuration', { required: 'La durée de la période d\'essai est requise' });
    }
    
    // Si clause de mobilité activée, valider le rayon
    if (form.watch('contractDetails.mobilityClause')) {
      form.register('contractDetails.mobilityRadius', { required: 'Le rayon de mobilité est requis' });
    }
    
    // Si non-concurrence activée, valider les champs associés
    if (form.watch('contractDetails.nonCompete')) {
      form.register('contractDetails.nonCompeteDuration', { required: 'La durée est requise' });
      form.register('contractDetails.nonCompeteArea', { required: 'La zone géographique est requise' });
      form.register('contractDetails.nonCompeteCompensation', { required: 'L\'indemnité est requise' });
    }
    
    // Si télétravail activé, valider les champs associés
    if (form.watch('displayOptions.includeTeleworking')) {
      form.register('displayOptions.teleworkingType', { required: 'Le type de télétravail est requis' });
    }
    
    // Si tickets restaurant activés, valider les champs associés
    if (form.watch('contractDetails.benefits.lunchVouchers')) {
      form.register('contractDetails.benefits.lunchVoucherAmount', { required: 'Le montant des tickets restaurant est requis' });
      form.register('contractDetails.benefits.lunchVoucherEmployerContribution', { required: 'La contribution employeur est requise' });
    }
    
    // Si mutuelle activée, valider la contribution employeur
    if (form.watch('contractDetails.benefits.mutualInsurance')) {
      form.register('contractDetails.benefits.mutualInsuranceEmployerContribution', { required: 'La contribution employeur est requise' });
    }
    
    // Si congés supplémentaires activés, valider les détails
    if (form.watch('contractDetails.customLeaves')) {
      form.register('contractDetails.customLeavesDetails', { required: 'Les détails des congés supplémentaires sont requis' });
    }
  }, [
    form.watch('contractDetails.type'), 
    form.watch('contractDetails.trialPeriod'),
    form.watch('contractDetails.mobilityClause'),
    form.watch('contractDetails.nonCompete'), 
    form.watch('displayOptions.includeTeleworking'),
    form.watch('contractDetails.benefits.lunchVouchers'),
    form.watch('contractDetails.benefits.mutualInsurance'),
    form.watch('contractDetails.customLeaves'),
    form
  ]);
  
  return (
    <div className="overflow-x-hidden w-full max-w-full">
      <div className="min-h-screen overflow-x-hidden flex flex-col">
        <div className="mb-2">
          {/* Barre d'outils simplifiée */}
          <div className="flex items-center gap-2 px-4 py-2">
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs">
              <ArrowLeft className="h-3 w-3 mr-1" />
              Retour
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs">
              <Save className="h-3 w-3 mr-1" />
              Sauvegarder
            </Button>
            <Button 
              type="submit" 
              form="contract-form"
              size="sm" 
              className="h-7 text-xs"
              disabled={!isFormValid}
            >
              <Check className="h-3 w-3 mr-1" />
              Valider
            </Button>
          </div>
        </div>
        
        <div className="flex flex-row flex-1">
          {/* Menu de configuration à gauche - Design amélioré */}
          <div className="w-[400px] min-w-[400px] border-r p-3 h-[calc(100vh-80px)] overflow-y-auto bg-gray-50/50">
            <Form {...form}>
              <form id="contract-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4 mb-4 h-8">
                    <TabsTrigger value="company" onClick={() => setActiveTab('company')} className="text-xs py-1">
                      <Building className="h-3 w-3 mr-1" />
                      Entreprise
                    </TabsTrigger>
                    <TabsTrigger value="employee" onClick={() => setActiveTab('employee')} className="text-xs py-1">
                      <User className="h-3 w-3 mr-1" />
                      Salarié
                    </TabsTrigger>
                    <TabsTrigger value="contract" onClick={() => setActiveTab('contract')} className="text-xs py-1">
                      <ClipboardList className="h-3 w-3 mr-1" />
                      Contrat
                    </TabsTrigger>
                    <TabsTrigger value="options" onClick={() => setActiveTab('options')} className="text-xs py-1">
                      <Check className="h-3 w-3 mr-1" />
                      Options
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Contenu des onglets avec style amélioré */}
                  <TabsContent value="company" className="space-y-3 mt-0">
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="company.name"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Nom de l&apos;entreprise</FormLabel>
                            <FormControl>
                              <Input className="h-8 text-sm" placeholder="HelloPay SAS" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="company.address"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Adresse</FormLabel>
                            <FormControl>
                              <Input className="h-8 text-sm" placeholder="1 rue de la Paix, 75001 Paris" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="company.siret"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">SIRET</FormLabel>
                            <FormControl>
                              <Input className="h-8 text-sm" placeholder="123 456 789 00012" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="company.representant"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Représentant</FormLabel>
                            <FormControl>
                              <Input className="h-8 text-sm" placeholder="John Doe, Directeur Général" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="company.conventionCollective"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Convention collective (optionnel)</FormLabel>
                            <FormControl>
                              <Input className="h-8 text-sm" placeholder="Ex: Convention collective nationale des bureaux d&apos;études techniques" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  
                  {/* Onglet Salarié */}
                  <TabsContent value="employee" className="space-y-3 mt-0">
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="employee.firstName"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Prénom</FormLabel>
                            <FormControl>
                              <Input className="h-8 text-sm" placeholder="Jane" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="employee.lastName"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Nom</FormLabel>
                            <FormControl>
                              <Input className="h-8 text-sm" placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="employee.address"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Adresse</FormLabel>
                          <FormControl>
                            <Input className="h-8 text-sm" placeholder="10 avenue des Champs-Élysées, 75008 Paris" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="employee.birthDate"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Date de naissance</FormLabel>
                          <FormControl>
                            <Input type="date" className="h-8 text-sm" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="employee.nationality"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Nationalité</FormLabel>
                          <FormControl>
                            <Input className="h-8 text-sm" placeholder="Française" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="employee.socialSecurityNumber"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Numéro de sécurité sociale</FormLabel>
                          <FormControl>
                            <Input className="h-8 text-sm" placeholder="1 85 12 34 567 890 12" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  {/* Onglet Contrat */}
                  <TabsContent value="contract" className="space-y-3 mt-0">
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="contractDetails.type"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Type de contrat</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={(value) => field.onChange(value as 'CDI' | 'CDD')}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="CDI">CDI</SelectItem>
                                <SelectItem value="CDD">CDD</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="contractDetails.workingHours"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Durée hebdomadaire</FormLabel>
                            <Select 
                              value={field.value.toString()} 
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="35">35 heures (Temps plein)</SelectItem>
                                <SelectItem value="30">30 heures</SelectItem>
                                <SelectItem value="28">28 heures</SelectItem>
                                <SelectItem value="24">24 heures</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="contractDetails.position"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Poste</FormLabel>
                          <FormControl>
                            <Input className="h-8 text-sm" placeholder="Développeur web" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contractDetails.classification"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Classification</FormLabel>
                          <FormControl>
                            <Input className="h-8 text-sm" placeholder="Cadre - Niveau III" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="contractDetails.startDate"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Date de début</FormLabel>
                            <FormControl>
                              <Input type="date" className="h-8 text-sm" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      {form.watch('contractDetails.type') === 'CDD' && (
                        <FormField
                          control={form.control}
                          name="contractDetails.endDate"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-xs">Date de fin (CDD)</FormLabel>
                              <FormControl>
                                <Input type="date" className="h-8 text-sm" {...field} />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="contractDetails.trialPeriod"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs">
                              Inclure une période d&apos;essai
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch('contractDetails.trialPeriod') && (
                      <FormField
                        control={form.control}
                        name="contractDetails.trialPeriodDuration"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Durée de la période d&apos;essai</FormLabel>
                            <FormControl>
                              <Input className="h-8 text-sm" placeholder="Ex: 2 mois" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="contractDetails.workplace"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Lieu de travail</FormLabel>
                          <FormControl>
                            <Input className="h-8 text-sm" placeholder="1 rue de la Paix, 75001 Paris" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contractDetails.salary"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Salaire brut mensuel (€)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              className="h-8 text-sm" 
                              placeholder="3000" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    {form.watch('contractDetails.type') === 'CDD' && (
                      <FormField
                        control={form.control}
                        name="contractDetails.motifCDD"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Motif du CDD</FormLabel>
                            <FormControl>
                              <Input className="h-8 text-sm" placeholder="Ex: Remplacement d&apos;un salarié absent" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="contractDetails.mobilityClause"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs">
                              Inclure une clause de mobilité
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch('contractDetails.mobilityClause') && (
                      <FormField
                        control={form.control}
                        name="contractDetails.mobilityRadius"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Rayon de mobilité (km)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                className="h-8 text-sm" 
                                placeholder="Ex: 50" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="contractDetails.scheduleType"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Type d&apos;horaires</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={(value) => field.onChange(value as 'fixed' | 'variable' | 'shifts')}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fixed">Horaires fixes</SelectItem>
                              <SelectItem value="variable">Horaires variables</SelectItem>
                              <SelectItem value="shifts">Travail en équipes successives</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    {form.watch('contractDetails.workingHours') < 35 && (
                      <FormField
                        control={form.control}
                        name="contractDetails.workingDays"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Répartition des horaires (temps partiel)</FormLabel>
                            <FormControl>
                              <Input className="h-8 text-sm" placeholder="Ex: Lundi, Mardi, Mercredi matin" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="contractDetails.paymentDate"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Date de paiement du salaire</FormLabel>
                          <FormControl>
                            <Input className="h-8 text-sm" placeholder="Ex: 25" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    {form.watch('contractDetails.type') === 'CDI' && (
                      <FormField
                        control={form.control}
                        name="contractDetails.noticePeriod"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Période de préavis</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={(value) => field.onChange(value as 'legal' | '1-month' | '2-months' | '3-months' | 'collective')}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="legal">Selon dispositions légales</SelectItem>
                                <SelectItem value="1-month">1 mois</SelectItem>
                                <SelectItem value="2-months">2 mois</SelectItem>
                                <SelectItem value="3-months">3 mois</SelectItem>
                                <SelectItem value="collective">Selon convention collective</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {form.watch('contractDetails.type') === 'CDI' && (
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="contractDetails.nonCompete"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-xs">
                                  Inclure une clause de non-concurrence
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        {form.watch('contractDetails.nonCompete') && (
                          <div className="space-y-3 pl-6">
                            <FormField
                              control={form.control}
                              name="contractDetails.nonCompeteDuration"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormLabel className="text-xs">Durée</FormLabel>
                                  <FormControl>
                                    <Input className="h-8 text-sm" placeholder="12 mois" {...field} />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="contractDetails.nonCompeteArea"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormLabel className="text-xs">Zone géographique</FormLabel>
                                  <FormControl>
                                    <Input className="h-8 text-sm" placeholder="100 km autour de Paris" {...field} />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="contractDetails.nonCompeteCompensation"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormLabel className="text-xs">Indemnité (%)</FormLabel>
                                  <FormControl>
                                    <Input className="h-8 text-sm" placeholder="30" {...field} />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Onglet Options */}
                  <TabsContent value="options" className="space-y-3 mt-0">
                    <FormField
                      control={form.control}
                      name="displayOptions.hasPreambule"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs">
                              Inclure un préambule
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="displayOptions.includeDataProtection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs">
                              Inclure l&apos;article &quot;Données personnelles et droit à l&apos;image&quot;
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="displayOptions.includeImageRights"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs">
                              Inclure une clause de droit à l&apos;image
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="displayOptions.includeWorkRules"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs">
                              Inclure l&apos;article &quot;Tenue et règles internes&quot;
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="displayOptions.includeWorkClothes"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs">
                              Inclure des règles sur la tenue vestimentaire
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="displayOptions.includeInternalRules"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs">
                              Référencer le règlement intérieur
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="displayOptions.includeConfidentiality"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs">
                              Inclure une clause de confidentialité
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="displayOptions.includeIntellectualProperty"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs">
                              Inclure une clause de propriété intellectuelle
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="displayOptions.includeTeleworking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs">
                              Inclure l&apos;article &quot;Télétravail&quot;
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch('displayOptions.includeTeleworking') && (
                      <div className="space-y-3 pl-6">
                        <FormField
                          control={form.control}
                          name="displayOptions.teleworkingType"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-xs">Type de télétravail</FormLabel>
                              <Select 
                                value={field.value} 
                                onValueChange={(value) => field.onChange(value as 'regular' | 'occasional' | 'mixed')}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="regular">Télétravail régulier</SelectItem>
                                  <SelectItem value="occasional">Télétravail occasionnel</SelectItem>
                                  <SelectItem value="mixed">Télétravail mixte</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="displayOptions.employerProvidesEquipment"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-xs">
                                  L&apos;employeur fournit l&apos;équipement
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    <FormField
                      control={form.control}
                      name="displayOptions.showSignatures"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs">
                              Afficher les blocs de signature
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
                
                {/* Bouton d'export PDF */}
                <div className="flex items-center pt-2 justify-end">
                  <Button type="button" onClick={() => form.handleSubmit(onSubmit)()} size="sm" className="h-7 text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    Exporter PDF
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          
          {/* Aperçu du contrat - Ajusté pour voir le début */}
          <div className="flex-1 p-2 overflow-auto h-[calc(100vh-80px)] flex items-start justify-center">
            <div className="shadow-xl transform scale-[0.8] origin-top mt-0">
              <ContractTemplate 
                company={formValues.company}
                employee={formValues.employee}
                contractDetails={formValues.contractDetails}
                displayOptions={formValues.displayOptions}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 