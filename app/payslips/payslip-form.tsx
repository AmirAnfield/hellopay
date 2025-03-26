'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { mockPayslipData } from '@/src/components/payslip/MockPayslipData';
import { PayslipProps, SalaryItem } from '@/src/components/payslip/PayslipTemplate';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import ContributionsPanel from '@/src/components/payslip/ContributionsPanel';
import { Contribution } from '@/src/components/payslip/FrenchContributions';

// Définir les types de contrats
const contractTypes = [
  { value: "cdi", label: "CDI - Contrat à durée indéterminée" },
  { value: "cdd", label: "CDD - Contrat à durée déterminée" },
  { value: "apprentissage", label: "Contrat d'apprentissage" },
  { value: "interim", label: "Contrat d'intérim" },
  { value: "stage", label: "Convention de stage" },
  { value: "partiel", label: "Temps partiel" },
];

// Schéma de validation Zod pour l'employeur
const employerSchema = z.object({
  name: z.string().min(1, "Le nom de l'entreprise est requis"),
  address: z.string().min(1, "L'adresse est requise"),
  postalCode: z.string().min(5, "Code postal invalide").max(5, "Code postal invalide"),
  city: z.string().min(1, "La ville est requise"),
  siret: z.string().min(14, "Le numéro SIRET doit contenir 14 chiffres").max(14, "Le numéro SIRET doit contenir 14 chiffres"),
  ape: z.string().min(4, "Le code APE est requis").max(5, "Code APE invalide"),
});

// Schéma de validation Zod pour l'employé
const employeeSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  address: z.string().min(1, "L'adresse est requise"),
  postalCode: z.string().min(5, "Code postal invalide").max(5, "Code postal invalide"),
  city: z.string().min(1, "La ville est requise"),
  socialSecurityNumber: z.string().min(15, "Numéro de sécurité sociale invalide"),
  position: z.string().min(1, "Le poste est requis"),
  contractType: z.string().min(1, "Le type de contrat est requis"),
  employmentDate: z.string().min(1, "La date d'embauche est requise"),
});

// Schéma de validation Zod pour un élément de salaire
const salaryItemSchema = z.object({
  label: z.string().min(1, "Le libellé est requis"),
  base: z.union([z.number().optional(), z.nan().transform(() => undefined)]),
  rate: z.union([z.number().optional(), z.nan().transform(() => undefined)]),
  amount: z.number().min(0.01, "Le montant doit être supérieur à 0"),
  isAddition: z.boolean(),
});

// Schéma de validation Zod pour le salaire
const salarySchema = z.object({
  period: z.string().min(1, "La période est requise"),
  periodStart: z.string().min(1, "La date de début est requise"),
  periodEnd: z.string().min(1, "La date de fin est requise"),
  paymentDate: z.string().min(1, "La date de paiement est requise"),
  items: z.array(salaryItemSchema).min(1, "Au moins un élément de salaire est requis"),
  grossSalary: z.number().min(0.01, "Le salaire brut doit être supérieur à 0"),
  netBeforeTax: z.number().min(0.01, "Le net avant impôt doit être supérieur à 0"),
  netToPay: z.number().min(0.01, "Le net à payer doit être supérieur à 0"),
  netSocial: z.number().min(0.01, "Le net social doit être supérieur à 0"),
  totalEmployeeContributions: z.number().min(0, "Les cotisations salariales ne peuvent pas être négatives"),
  totalEmployerContributions: z.number().min(0, "Les cotisations patronales ne peuvent pas être négatives"),
  paymentMethod: z.string().min(1, "Le mode de paiement est requis"),
  contributions: z.array(z.any()).optional(), // Stockage des cotisations sélectionnées
});

// Schéma de validation complet
const payslipSchema = z.object({
  employer: employerSchema,
  employee: employeeSchema,
  salary: salarySchema,
});

type PayslipFormData = z.infer<typeof payslipSchema>;

// Formulaire de contribution fréquemment utilisée
const commonSalaryItems = [
  { label: "Salaire de base", isAddition: true },
  { label: "Prime d'ancienneté", isAddition: true },
  { label: "Prime de résultat", isAddition: true },
  { label: "Tickets restaurant", isAddition: true },
  { label: "Sécurité Sociale - Maladie", isAddition: false },
  { label: "Sécurité Sociale - Vieillesse plafonnée", isAddition: false },
  { label: "Sécurité Sociale - Vieillesse déplafonnée", isAddition: false },
  { label: "Retraite complémentaire", isAddition: false },
  { label: "Assurance chômage", isAddition: false },
  { label: "CSG déductible", isAddition: false },
  { label: "CSG/CRDS non déductible", isAddition: false },
];

const formatDateFr = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
const today = formatDateFr(new Date());
const firstDayOfMonth = formatDateFr(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
const lastDayOfMonth = formatDateFr(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

// Mise à jour des valeurs par défaut
const defaultValues: PayslipFormData = {
  employer: {
    name: "",
    address: "",
    postalCode: "",
    city: "",
    siret: "",
    ape: "",
  },
  employee: {
    firstName: "",
    lastName: "",
    address: "",
    postalCode: "",
    city: "",
    socialSecurityNumber: "",
    position: "",
    contractType: "cdi", // Valeur par défaut
    employmentDate: today,
  },
  salary: {
    period: currentMonth,
    periodStart: firstDayOfMonth,
    periodEnd: lastDayOfMonth,
    paymentDate: today,
    items: [
      {
        label: "Salaire de base",
        base: 151.67, // Heures mensuelles standard
        rate: 11, // SMIC horaire approx.
        amount: 1668.37, // SMIC mensuel approx.
        isAddition: true,
      }
    ],
    grossSalary: 1668.37,
    netBeforeTax: 1300,
    netToPay: 1300,
    netSocial: 1300,
    totalEmployeeContributions: 368.37,
    totalEmployerContributions: 700,
    paymentMethod: "Virement bancaire",
  },
};

export default function PayslipForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('employer');

  // Utilisation de react-hook-form avec zod
  const form = useForm<PayslipFormData>({
    resolver: zodResolver(payslipSchema),
    defaultValues: mockPayslipData || defaultValues,
  });

  // Configuration de useFieldArray pour gérer les éléments de salaire dynamiques
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "salary.items",
  });

  // Surveiller les changements des éléments de salaire et recalculer les totaux
  const watchedItems = form.watch("salary.items");
  const grossSalary = form.watch("salary.grossSalary") || 0;
  
  useEffect(() => {
    if (watchedItems && watchedItems.length > 0) {
      // Calculer le salaire brut (somme des éléments positifs)
      const additions = watchedItems
        .filter(item => item.isAddition)
        .reduce((sum, item) => sum + (item.amount || 0), 0);
      
      // Calculer les cotisations salariales (somme des éléments négatifs)
      const deductions = watchedItems
        .filter(item => !item.isAddition)
        .reduce((sum, item) => sum + (item.amount || 0), 0);
      
      // Mettre à jour les totaux
      form.setValue("salary.grossSalary", additions);
      form.setValue("salary.totalEmployeeContributions", deductions);
      form.setValue("salary.netBeforeTax", additions - deductions);
      form.setValue("salary.netToPay", additions - deductions);
      form.setValue("salary.netSocial", additions - deductions);
    }
  }, [watchedItems, form]);

  // Fonction pour gérer les changements de cotisations
  const handleContributionsChange = (data: {
    contributions: Contribution[];
    totalEmployeeContributions: number;
    totalEmployerContributions: number;
  }) => {
    // Stocker les cotisations dans le formulaire
    form.setValue("salary.contributions", data.contributions);
    
    // Mettre à jour les totaux de cotisations
    form.setValue("salary.totalEmployeeContributions", data.totalEmployeeContributions);
    form.setValue("salary.totalEmployerContributions", data.totalEmployerContributions);
    
    // Mettre à jour le net à payer
    const grossSalary = form.getValues("salary.grossSalary");
    form.setValue("salary.netBeforeTax", grossSalary - data.totalEmployeeContributions);
    form.setValue("salary.netToPay", grossSalary - data.totalEmployeeContributions);
    form.setValue("salary.netSocial", grossSalary - data.totalEmployeeContributions);
  };

  // Fonction pour passer à l'onglet suivant
  const goToNextTab = () => {
    if (currentTab === 'employer') {
      const employerData = form.getValues("employer");
      try {
        employerSchema.parse(employerData);
        setCurrentTab('employee');
      } catch (error) {
        form.trigger("employer");
        toast.error("Veuillez corriger les erreurs avant de continuer");
      }
    } else if (currentTab === 'employee') {
      const employeeData = form.getValues("employee");
      try {
        employeeSchema.parse(employeeData);
        setCurrentTab('salary');
      } catch (error) {
        form.trigger("employee");
        toast.error("Veuillez corriger les erreurs avant de continuer");
      }
    }
  };

  // Fonction pour passer à l'onglet précédent
  const goToPrevTab = () => {
    if (currentTab === 'salary') setCurrentTab('employee');
    else if (currentTab === 'employee') setCurrentTab('employer');
  };

  // Fonction pour ajouter un élément de salaire prédéfini
  const addPredefinedItem = (label: string, isAddition: boolean) => {
    append({
      label,
      base: undefined,
      rate: undefined,
      amount: 0,
      isAddition,
    });
  };

  // Fonction pour générer la fiche de paie
  const onSubmit = async (data: PayslipFormData) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/generate-payslip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération de la fiche de paie');
      }

      // Récupérer le blob du PDF
      const pdfBlob = await response.blob();
      
      // Nom du fichier pour l'affichage
      const fileName = `fiche_paie_${data.employee.lastName}_${data.employee.firstName}.pdf`;
      
      // Créer un FormData pour envoyer le fichier
      const formData = new FormData();
      formData.append('file', new File([pdfBlob], fileName, { type: 'application/pdf' }));
      
      // Ajouter les métadonnées
      formData.append('employerName', data.employer.name);
      formData.append('employerSiret', data.employer.siret);
      formData.append('employeeFirstName', data.employee.firstName);
      formData.append('employeeLastName', data.employee.lastName);
      formData.append('employeePosition', data.employee.position);
      formData.append('period', data.salary.period);
      formData.append('grossSalary', data.salary.grossSalary.toString());
      formData.append('netToPay', data.salary.netToPay.toString());
      formData.append('paymentDate', data.salary.paymentDate);
      
      // Enregistrer la fiche de paie en base de données
      const storeResponse = await fetch('/api/store-payslip', {
        method: 'POST',
        body: formData,
      });
      
      if (!storeResponse.ok) {
        const storeErrorData = await storeResponse.json();
        console.error('Erreur lors de l\'enregistrement:', storeErrorData);
        // Ne pas bloquer l'utilisateur si l'enregistrement échoue
      }
      
      // Créer une URL pour le blob et télécharger
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success('Fiche de paie générée avec succès', {
        description: 'Votre fiche de paie a été générée et téléchargée.',
      });
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      toast.error('Erreur', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="employer">Employeur</TabsTrigger>
            <TabsTrigger value="employee">Salarié</TabsTrigger>
            <TabsTrigger value="salary">Rémunération</TabsTrigger>
            <TabsTrigger value="contributions">Cotisations</TabsTrigger>
          </TabsList>
          
          {/* Onglet Employeur */}
          <TabsContent value="employer">
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'employeur</CardTitle>
                <CardDescription>
                  Saisissez les informations concernant l'entreprise qui émet la fiche de paie.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employer.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l'entreprise</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employer.siret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro SIRET</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="employer.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employer.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code postal</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employer.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="employer.ape"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code APE</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="button" onClick={goToNextTab}>Suivant</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Onglet Salarié */}
          <TabsContent value="employee">
            <Card>
              <CardHeader>
                <CardTitle>Informations du salarié</CardTitle>
                <CardDescription>
                  Saisissez les informations concernant le salarié qui reçoit la fiche de paie.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employee.firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employee.lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="employee.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employee.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code postal</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employee.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="employee.socialSecurityNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de sécurité sociale</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employee.position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poste</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employee.contractType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de contrat</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un type de contrat" />
                            </SelectTrigger>
                            <SelectContent>
                              {contractTypes.map((contract) => (
                                <SelectItem key={contract.value} value={contract.value}>
                                  {contract.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employee.employmentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date d'embauche</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={goToPrevTab}>Précédent</Button>
                <Button type="button" onClick={goToNextTab}>Suivant</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Onglet Rémunération */}
          <TabsContent value="salary">
            <Card>
              <CardHeader>
                <CardTitle>Informations de rémunération</CardTitle>
                <CardDescription>
                  Saisissez les détails concernant la période de paie et les montants.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="salary.period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Période</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salary.paymentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de paiement</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="salary.periodStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de début</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salary.periodEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de fin</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-lg">Éléments de salaire</h3>
                    <div className="flex gap-2">
                      <Select onValueChange={(value) => {
                        const item = commonSalaryItems.find(i => i.label === value);
                        if (item) {
                          addPredefinedItem(item.label, item.isAddition);
                        }
                      }}>
                        <SelectTrigger className="w-[250px]">
                          <SelectValue placeholder="Ajouter un élément prédéfini" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonSalaryItems.map((item, index) => (
                            <SelectItem key={index} value={item.label}>
                              {item.label} ({item.isAddition ? '+' : '-'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => append({
                          label: "",
                          base: undefined,
                          rate: undefined,
                          amount: 0,
                          isAddition: true,
                        })}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {fields.length === 0 ? (
                    <div className="text-center p-4 border border-dashed border-gray-200 rounded-md">
                      <p className="text-gray-500">Aucun élément de salaire. Ajoutez au moins un élément.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="border border-gray-200 rounded p-3 relative">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                          
                          <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-5">
                              <FormField
                                control={form.control}
                                name={`salary.items.${index}.label`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Libellé</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="col-span-2">
                              <FormField
                                control={form.control}
                                name={`salary.items.${index}.base`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Base</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.01"
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={(e) => {
                                          const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                          field.onChange(value);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="col-span-2">
                              <FormField
                                control={form.control}
                                name={`salary.items.${index}.rate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Taux</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.01"
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={(e) => {
                                          const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                          field.onChange(value);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="col-span-2">
                              <FormField
                                control={form.control}
                                name={`salary.items.${index}.amount`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Montant</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.01"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="col-span-1">
                              <FormField
                                control={form.control}
                                name={`salary.items.${index}.isAddition`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <FormControl>
                                      <Select
                                        onValueChange={(value) => field.onChange(value === "true")}
                                        defaultValue={field.value ? "true" : "false"}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="true">+</SelectItem>
                                          <SelectItem value="false">-</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="salary.grossSalary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salaire brut</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              {...field}
                              readOnly
                              className="bg-gray-50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="salary.totalEmployeeContributions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total cotisations salariales</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              {...field}
                              readOnly
                              className="bg-gray-50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="salary.netBeforeTax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Net avant impôt</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              {...field}
                              readOnly
                              className="bg-gray-50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="salary.netToPay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Net à payer</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="salary.netSocial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Net social</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="salary.totalEmployerContributions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total cotisations patronales</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="salary.paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mode de paiement</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un mode de paiement" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Virement bancaire">Virement bancaire</SelectItem>
                              <SelectItem value="Chèque">Chèque</SelectItem>
                              <SelectItem value="Espèces">Espèces</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={goToPrevTab}>Précédent</Button>
                <Button type="button" onClick={() => setCurrentTab('contributions')}>Cotisations</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Nouvel onglet Cotisations */}
          <TabsContent value="contributions">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des cotisations sociales</CardTitle>
                <CardDescription>
                  Sélectionnez et ajustez les cotisations sociales applicables à cette fiche de paie.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContributionsPanel 
                  grossSalary={grossSalary}
                  onContributionsChange={handleContributionsChange}
                  initialContributions={form.getValues("salary.contributions")}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentTab('salary')}>Rémunération</Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération en cours
                    </>
                  ) : (
                    'Générer la fiche de paie'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
} 