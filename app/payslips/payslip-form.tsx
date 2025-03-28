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
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

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
  isExecutive: z.boolean().optional().default(false), // Statut cadre/non-cadre
});

// Schéma de validation Zod pour un élément de salaire
const salaryItemSchema = z.object({
  label: z.string().min(1, "Le libellé est requis"),
  base: z.union([z.number().optional(), z.nan().transform(() => undefined)]),
  rate: z.union([z.number().optional(), z.nan().transform(() => undefined)]),
  amount: z.number().min(0.01, "Le montant doit être supérieur à 0"),
  isAddition: z.boolean(),
  disabled: z.boolean().optional().default(false),
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
  remunerationTab: z.string().optional().default("brut"), // Pour suivre l'onglet actif
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
    isExecutive: false, // Non-cadre par défaut
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
        disabled: false,
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

// Définir des constantes pour les heures travaillées
const HOURS_35 = 151.67; // 35h/semaine
const HOURS_39 = 169; // 39h/semaine

// Cotisations spécifiques aux cadres
const CADRE_CONTRIBUTION_IDS = ['apec', 'cev_t2', 'agirc_arrco_t2'];

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

  // Initialiser les cotisations automatiquement au chargement du composant
  useEffect(() => {
    // Vérifier si les cotisations n'existent pas déjà
    if (!form.getValues("salary.contributions") || form.getValues("salary.contributions").length === 0) {
      // Importer et initialiser les cotisations
      import('@/src/components/payslip/FrenchContributions').then(module => {
        const defaultContributions = module.DEFAULT_FRENCH_CONTRIBUTIONS;
        form.setValue("salary.contributions", defaultContributions);
      });
    }
  }, [form]);

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
      disabled: false,
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

  // Fonction pour mettre à jour tous les montants nets en fonction du salaire brut
  const updateContributionsAndNetAmounts = (grossSalary: number) => {
    // Si les cotisations ne sont pas encore chargées, ne rien faire
    if (!form.watch("salary.contributions") || form.watch("salary.contributions").length === 0) {
      return;
    }
    
    // Récupérer le statut cadre
    const isExecutive = form.watch("employee.isExecutive");
    
    // Mettre à jour les cotisations spécifiques aux cadres
    let contributions = form.watch("salary.contributions").map(c => {
      if (CADRE_CONTRIBUTION_IDS.includes(c.id)) {
        return { ...c, isRequired: isExecutive }; // Activer uniquement pour les cadres
      }
      return c;
    });
    
    // Mettre à jour les contributions dans le formulaire
    form.setValue("salary.contributions", contributions);
    
    // Recalculer les totaux avec les cotisations mises à jour
    const activeCotisations = contributions.filter(c => c.isRequired);
    
    const totalEmployeeContributions = activeCotisations.reduce(
      (sum, c) => sum + (grossSalary * c.employeeRate / 100), 0
    );
    
    const totalEmployerContributions = activeCotisations.reduce(
      (sum, c) => sum + (grossSalary * c.employerRate / 100), 0
    );
    
    // Arrondir les valeurs à 2 décimales pour l'affichage
    const roundedEmployeeContributions = Math.round(totalEmployeeContributions * 100) / 100;
    const roundedEmployerContributions = Math.round(totalEmployerContributions * 100) / 100;
    const netBeforeTax = Math.round((grossSalary - roundedEmployeeContributions) * 100) / 100;
    const netToPay = Math.round((grossSalary - roundedEmployeeContributions) * 100) / 100;
    
    // Mettre à jour les valeurs dans le formulaire
    form.setValue("salary.totalEmployeeContributions", roundedEmployeeContributions);
    form.setValue("salary.totalEmployerContributions", roundedEmployerContributions);
    form.setValue("salary.netBeforeTax", netBeforeTax);
    form.setValue("salary.netToPay", netToPay);
    form.setValue("salary.netSocial", netToPay);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="employer" data-state={currentTab === "employer" ? "active" : currentTab === "employee" || currentTab === "remuneration" ? "complete" : "pending"}>
              {currentTab === "employee" || currentTab === "remuneration" ? "✓ " : ""}Employeur
            </TabsTrigger>
            <TabsTrigger value="employee" disabled={currentTab === "employer"} data-state={currentTab === "employee" ? "active" : currentTab === "remuneration" ? "complete" : "pending"}>
              {currentTab === "remuneration" ? "✓ " : ""}Salarié
            </TabsTrigger>
            <TabsTrigger value="remuneration" disabled={currentTab === "employer" || currentTab === "employee"} data-state={currentTab === "remuneration" ? "active" : "pending"}>
              Rémunération
            </TabsTrigger>
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
                  
                  <FormField
                    control={form.control}
                    name="employee.isExecutive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Statut cadre</FormLabel>
                          <FormDescription>
                            Le salarié a-t-il le statut cadre ?
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
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
          
          {/* Onglet Rémunération fusionné */}
          <TabsContent value="remuneration">
            <Card>
              <CardHeader>
                <CardTitle>Calcul de la rémunération</CardTitle>
                <CardDescription>
                  Configurez les éléments de salaire, les cotisations et les montants nets.
                </CardDescription>
                
                {/* Résumé des montants clés */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 p-6 bg-gray-50 rounded-md shadow-sm">
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Salaire brut</p>
                    <p className="text-2xl font-bold text-gray-900">{form.watch("salary.grossSalary").toFixed(2)} €</p>
                    <p className="text-xs text-gray-400 mt-1">100% de référence</p>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Cotisations salariales</p>
                    <p className="text-2xl font-bold text-gray-800">{form.watch("salary.totalEmployeeContributions").toFixed(2)} €</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {form.watch("salary.grossSalary") > 0 
                        ? ((form.watch("salary.totalEmployeeContributions") / form.watch("salary.grossSalary")) * 100).toFixed(2) 
                        : "0.00"}% du brut
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Cotisations patronales</p>
                    <p className="text-2xl font-bold text-orange-600">{form.watch("salary.totalEmployerContributions").toFixed(2)} €</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {form.watch("salary.grossSalary") > 0 
                        ? ((form.watch("salary.totalEmployerContributions") / form.watch("salary.grossSalary")) * 100).toFixed(2) 
                        : "0.00"}% du brut
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Net à payer</p>
                    <p className="text-2xl font-bold text-green-600">{form.watch("salary.netToPay").toFixed(2)} €</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {form.watch("salary.grossSalary") > 0 
                        ? ((form.watch("salary.netToPay") / form.watch("salary.grossSalary")) * 100).toFixed(2) 
                        : "0.00"}% du brut
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Section pour la sélection du type d'horaire */}
                <div className="bg-blue-50 p-4 rounded-md shadow-sm mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="work-type" className="text-gray-700 mb-2 block">
                        Type d'horaire
                      </Label>
                      <Select
                        onValueChange={(value) => {
                          // Trouver l'indice du salaire de base (ou créer s'il n'existe pas)
                          let baseIndex = fields.findIndex(f => f.label === "Salaire de base" && f.isAddition);
                          
                          // Si pas de salaire de base, l'ajouter
                          if (baseIndex === -1) {
                            append({
                              label: "Salaire de base",
                              base: value === "35h" ? HOURS_35 : value === "39h" ? HOURS_39 : 0,
                              rate: 11, // Taux horaire par défaut
                              amount: value === "35h" ? HOURS_35 * 11 : value === "39h" ? HOURS_39 * 11 : 0,
                              isAddition: true,
                              disabled: false,
                            });
                          } else {
                            // Mettre à jour le salaire de base existant
                            const hours = value === "35h" ? HOURS_35 : value === "39h" ? HOURS_39 : 0;
                            const rate = form.watch(`salary.items.${baseIndex}.rate`) || 11;
                            const newFields = [...fields];
                            
                            // Mettre à jour la base et recalculer le montant
                            newFields[baseIndex] = {
                              ...newFields[baseIndex],
                              base: hours,
                              amount: hours * rate
                            };
                            
                            form.setValue(`salary.items`, newFields);
                            
                            // Recalculer le total brut
                            const additions = newFields
                              .filter(item => item.isAddition && !item.disabled)
                              .reduce((sum, item) => sum + (item.amount || 0), 0);
                            
                            form.setValue("salary.grossSalary", additions);
                            
                            // Recalculer tous les montants
                            updateContributionsAndNetAmounts(additions);
                          }
                        }}
                        defaultValue="35h"
                      >
                        <SelectTrigger id="work-type" className="w-full">
                          <SelectValue placeholder="Sélectionnez un type d'horaire" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="35h">35h par semaine (151,67h/mois)</SelectItem>
                          <SelectItem value="39h">39h par semaine (169h/mois)</SelectItem>
                          <SelectItem value="forfait">Forfait jours</SelectItem>
                          <SelectItem value="custom">Personnalisé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="hourly-rate" className="text-gray-700 mb-2 block">
                        Taux horaire
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id="hourly-rate"
                          type="number"
                          step="0.01"
                          defaultValue="11.00"
                          className="border border-gray-300"
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            
                            // Trouver l'indice du salaire de base (ou créer s'il n'existe pas)
                            let baseIndex = fields.findIndex(f => f.label === "Salaire de base" && f.isAddition);
                            
                            // Si pas de salaire de base, l'ajouter
                            if (baseIndex === -1) {
                              append({
                                label: "Salaire de base",
                                base: HOURS_35, // Valeur par défaut
                                rate: value,
                                amount: HOURS_35 * value,
                                isAddition: true,
                                disabled: false,
                              });
                            } else {
                              // Mettre à jour le salaire de base existant
                              const base = form.watch(`salary.items.${baseIndex}.base`) || HOURS_35;
                              const newFields = [...fields];
                              
                              // Mettre à jour le taux et recalculer le montant
                              newFields[baseIndex] = {
                                ...newFields[baseIndex],
                                rate: value,
                                amount: base * value
                              };
                              
                              form.setValue(`salary.items`, newFields);
                              
                              // Recalculer le total brut
                              const additions = newFields
                                .filter(item => item.isAddition && !item.disabled)
                                .reduce((sum, item) => sum + (item.amount || 0), 0);
                              
                              form.setValue("salary.grossSalary", additions);
                              
                              // Recalculer tous les montants
                              updateContributionsAndNetAmounts(additions);
                            }
                          }}
                        />
                        <span className="ml-2 text-gray-500">€/heure</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="executive-status" className="text-gray-700 mb-2 block">
                        Statut cadre
                      </Label>
                      <div className="flex items-center mt-2">
                        <Switch
                          id="executive-status"
                          checked={form.watch("employee.isExecutive")}
                          onCheckedChange={(checked) => {
                            // Mettre à jour le statut cadre
                            form.setValue("employee.isExecutive", checked);
                            
                            // Si les cotisations sont déjà chargées
                            if (form.watch("salary.contributions") && form.watch("salary.contributions").length > 0) {
                              // Activer/désactiver les cotisations spécifiques aux cadres
                              const newContributions = form.watch("salary.contributions").map(c => {
                                if (CADRE_CONTRIBUTION_IDS.includes(c.id)) {
                                  return { ...c, isRequired: checked };
                                }
                                return c;
                              });
                              
                              form.setValue("salary.contributions", newContributions);
                              
                              // Recalculer les cotisations
                              const grossSalary = form.watch("salary.grossSalary");
                              updateContributionsAndNetAmounts(grossSalary);
                            }
                          }}
                        />
                        <Label htmlFor="executive-status" className="ml-2">
                          {form.watch("employee.isExecutive") ? "Cadre" : "Non-cadre"}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Sous-onglets pour les différentes sections */}
                <Tabs value="brut" onValueChange={(value) => form.setValue("remunerationTab", value)} className="w-full">
                  <TabsList className="grid grid-cols-3 md:grid-cols-7 mb-6 w-full">
                    <TabsTrigger value="brut" className="text-sm font-medium text-gray-700">Brut</TabsTrigger>
                    <TabsTrigger value="securite_sociale" className="text-sm font-medium text-gray-700">Sécurité sociale</TabsTrigger>
                    <TabsTrigger value="retraite" className="text-sm font-medium text-gray-700">Retraite</TabsTrigger>
                    <TabsTrigger value="chomage" className="text-sm font-medium text-gray-700">Chômage</TabsTrigger>
                    <TabsTrigger value="csg_crds" className="text-sm font-medium text-gray-700">CSG/CRDS</TabsTrigger>
                    <TabsTrigger value="autres" className="text-sm font-medium text-gray-700">Autres</TabsTrigger>
                    <TabsTrigger value="net" className="text-sm font-medium text-gray-700">Net à payer</TabsTrigger>
                  </TabsList>
                  
                  {/* Sous-onglet Brut */}
                  <TabsContent value="brut">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-6 px-4 py-3 bg-gray-50 rounded-md shadow-sm">
                        <h3 className="text-base font-medium text-gray-700">Éléments de salaire brut</h3>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-sm"
                            onClick={() => {
                              // Vérifier si un salaire de base existe déjà
                              const baseExists = fields.some(f => f.label === "Salaire de base" && f.isAddition && !f.disabled);
                              
                              if (!baseExists) {
                                append({
                                  label: "Salaire de base",
                                  base: HOURS_35,
                                  rate: 11,
                                  amount: HOURS_35 * 11,
                                  isAddition: true,
                                  disabled: false,
                                });
                                
                                // Recalculer le salaire brut
                                const grossSalary = HOURS_35 * 11;
                                form.setValue("salary.grossSalary", grossSalary);
                                
                                // Recalculer tous les montants
                                updateContributionsAndNetAmounts(grossSalary);
                              } else {
                                toast.error("Un salaire de base existe déjà");
                              }
                            }}
                          >
                            Salaire de base
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-sm"
                            onClick={() => append({
                              label: "Heures supplémentaires",
                              base: 0,
                              rate: 11 * 1.25, // Taux majoré à 25%
                              amount: 0,
                              isAddition: true,
                              disabled: false,
                            })}
                          >
                            Heures supp.
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-sm"
                            onClick={() => append({
                              label: "Prime",
                              base: undefined,
                              rate: undefined,
                              amount: 0,
                              isAddition: true,
                              disabled: false,
                            })}
                          >
                            Prime
                          </Button>
                        </div>
                      </div>
                      
                      {fields.filter(f => f.isAddition).length === 0 ? (
                        <div className="text-center p-6 border border-dashed border-gray-200 rounded-md bg-white">
                          <p className="text-gray-500">Aucun élément de salaire brut. Ajoutez au moins un élément.</p>
                        </div>
                      ) : (
                        <Accordion type="multiple" className="w-full space-y-3">
                          {fields.map((field, index) => (
                            field.isAddition && (
                              <AccordionItem key={field.id} value={field.id} className="border border-gray-200 rounded-md overflow-hidden shadow-sm">
                                <div className="flex items-center pr-4 hover:bg-gray-50 px-4 py-3 border-b border-gray-100">
                                  <Checkbox
                                    id={`active-item-${index}`}
                                    checked={!field.disabled}
                                    className="mr-3 h-5 w-5"
                                    onCheckedChange={(checked) => {
                                      // Au lieu de supprimer, on met à jour un flag "disabled"
                                      const newFields = [...fields];
                                      const updatedField = { ...field, disabled: !checked };
                                      newFields[index] = updatedField;
                                      form.setValue(`salary.items`, newFields);
                                      
                                      // Recalculer le salaire brut
                                      const additions = newFields
                                        .filter(item => item.isAddition && !item.disabled)
                                        .reduce((sum, item) => sum + (item.amount || 0), 0);
                                      
                                      form.setValue("salary.grossSalary", additions);
                                    }}
                                  />
                                  <AccordionTrigger className="flex-1 py-0">
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex items-center gap-2">
                                        <span className={`text-base ${field.disabled ? "text-gray-400" : "text-gray-700"}`}>
                                          {field.label || "Nouvel élément"}
                                        </span>
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center cursor-pointer">
                                                <Info className="h-3 w-3 text-blue-500" />
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-white p-2 text-sm shadow-md">
                                              <p>Détails de l'élément de salaire</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                      
                                      <div className="text-gray-700 text-base font-medium">
                                        {!field.disabled && field.amount !== undefined && (
                                          <span>{field.amount.toFixed(2)} €</span>
                                        )}
                                      </div>
                                    </div>
                                  </AccordionTrigger>
                                  <div className="ml-2">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              remove(index);
                                              
                                              // Recalculer le salaire brut après suppression
                                              const additions = fields
                                                .filter((item, i) => i !== index && item.isAddition && !item.disabled)
                                                .reduce((sum, item) => sum + (item.amount || 0), 0);
                                              
                                              form.setValue("salary.grossSalary", additions);
                                            }}
                                          >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white p-2 text-sm shadow-md">
                                          <p>Supprimer cet élément</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                                
                                <AccordionContent className="px-4 py-4 bg-white">
                                  {/* Description */}
                                  <p className="text-sm text-gray-600 mb-4">
                                    {field.label || "Nouvel élément"} - Élément de rémunération brute
                                  </p>
                                  
                                  <div className="grid grid-cols-12 gap-6">
                                    <div className="col-span-12 md:col-span-6">
                                      <FormField
                                        control={form.control}
                                        name={`salary.items.${index}.label`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-gray-700">Libellé</FormLabel>
                                            <FormControl>
                                              <Input 
                                                {...field} 
                                                className="border border-gray-300"
                                                disabled={fields[index].disabled}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    
                                    <div className="col-span-4 md:col-span-2">
                                      <FormField
                                        control={form.control}
                                        name={`salary.items.${index}.base`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="flex items-center gap-1 text-gray-700">
                                              Base
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Info className="h-3 w-3 text-gray-400" />
                                                  </TooltipTrigger>
                                                  <TooltipContent className="bg-white p-2 text-sm shadow-md">
                                                    <p>Base de calcul (ex: heures travaillées)</p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            </FormLabel>
                                            <FormControl>
                                              <Input 
                                                type="number" 
                                                step="0.01"
                                                {...field}
                                                disabled={fields[index].disabled}
                                                value={field.value ?? ''}
                                                className="border border-gray-300"
                                                onChange={(e) => {
                                                  const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                                  field.onChange(value);
                                                  
                                                  // Recalculer le montant si le taux existe
                                                  const rate = form.watch(`salary.items.${index}.rate`);
                                                  if (value !== undefined && rate !== undefined) {
                                                    const newAmount = value * rate;
                                                    form.setValue(`salary.items.${index}.amount`, newAmount);
                                                    
                                                    // Mettre à jour le total brut
                                                    const additions = fields
                                                      .filter(item => item.isAddition && !item.disabled)
                                                      .reduce((sum, item, i) => {
                                                        return sum + (i === index ? newAmount : (item.amount || 0));
                                                      }, 0);
                                                    
                                                    form.setValue("salary.grossSalary", additions);
                                                    
                                                    // Recalculer tous les montants nets
                                                    updateContributionsAndNetAmounts(additions);
                                                  }
                                                }}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    
                                    <div className="col-span-4 md:col-span-2">
                                      <FormField
                                        control={form.control}
                                        name={`salary.items.${index}.rate`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="flex items-center gap-1 text-gray-700">
                                              Taux
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Info className="h-3 w-3 text-gray-400" />
                                                  </TooltipTrigger>
                                                  <TooltipContent className="bg-white p-2 text-sm shadow-md">
                                                    <p>Taux horaire ou multiplicateur</p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            </FormLabel>
                                            <FormControl>
                                              <Input 
                                                type="number" 
                                                step="0.01"
                                                {...field}
                                                disabled={fields[index].disabled}
                                                value={field.value ?? ''}
                                                className="border border-gray-300"
                                                onChange={(e) => {
                                                  const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                                  field.onChange(value);
                                                  
                                                  // Recalculer le montant si la base existe
                                                  const base = form.watch(`salary.items.${index}.base`);
                                                  if (value !== undefined && base !== undefined) {
                                                    const newAmount = base * value;
                                                    form.setValue(`salary.items.${index}.amount`, newAmount);
                                                    
                                                    // Mettre à jour le total brut
                                                    const additions = fields
                                                      .filter(item => item.isAddition && !item.disabled)
                                                      .reduce((sum, item, i) => {
                                                        return sum + (i === index ? newAmount : (item.amount || 0));
                                                      }, 0);
                                                    
                                                    form.setValue("salary.grossSalary", additions);
                                                    
                                                    // Recalculer tous les montants nets
                                                    updateContributionsAndNetAmounts(additions);
                                                  }
                                                }}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    
                                    <div className="col-span-4 md:col-span-2">
                                      <FormField
                                        control={form.control}
                                        name={`salary.items.${index}.amount`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="flex items-center gap-1 text-gray-700">
                                              Montant
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Info className="h-3 w-3 text-gray-400" />
                                                  </TooltipTrigger>
                                                  <TooltipContent className="bg-white p-2 text-sm shadow-md">
                                                    <p>Montant total (Base × Taux ou valeur directe)</p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            </FormLabel>
                                            <FormControl>
                                              <Input 
                                                type="number" 
                                                step="0.01"
                                                {...field}
                                                disabled={fields[index].disabled}
                                                className="border border-gray-300 font-medium"
                                                onChange={(e) => {
                                                  const value = parseFloat(e.target.value) || 0;
                                                  field.onChange(value);
                                                  
                                                  // Mettre à jour le total brut
                                                  const additions = fields
                                                    .filter(item => item.isAddition && !item.disabled)
                                                    .reduce((sum, item, i) => {
                                                      return sum + (i === index ? value : (item.amount || 0));
                                                    }, 0);
                                                  
                                                  form.setValue("salary.grossSalary", additions);
                                                  
                                                  // Recalculer tous les montants nets
                                                  updateContributionsAndNetAmounts(additions);
                                                }}
                                              />
                                            </FormControl>
                                            <FormDescription className="text-xs text-gray-500 mt-1">
                                              Formule: {form.watch(`salary.items.${index}.base`) || '0'} × {form.watch(`salary.items.${index}.rate`) || '0'}
                                            </FormDescription>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )
                          ))}
                        </Accordion>
                      )}
                      
                      <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-100 shadow-sm">
                        <div className="flex justify-between items-center">
                          <h3 className="text-base font-medium text-gray-700">Total brut</h3>
                          <FormField
                            control={form.control}
                            name="salary.grossSalary"
                            render={({ field }) => (
                              <FormItem className="m-0">
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01"
                                    {...field}
                                    className="w-40 bg-white border border-blue-200 font-bold text-right text-lg"
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value) || 0;
                                      field.onChange(value);
                                      
                                      // Recalculer tous les montants nets
                                      updateContributionsAndNetAmounts(value);
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Sous-onglets des cotisations utilisant directement les parties nécessaires du ContributionsPanel */}
                  {["securite_sociale", "retraite", "chomage", "csg_crds", "autres"].map((category) => (
                    <TabsContent key={category} value={category}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium">Cotisations - {category === "securite_sociale" ? "Sécurité sociale" : 
                                              category === "retraite" ? "Retraite" : 
                                              category === "chomage" ? "Chômage" : 
                                              category === "csg_crds" ? "CSG/CRDS" : "Autres"}</h3>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`show-active-only-${category}`}
                              checked={false}
                              onCheckedChange={() => {}}
                            />
                            <Label htmlFor={`show-active-only-${category}`}>Afficher uniquement les cotisations actives</Label>
                          </div>
                        </div>
                        
                        <Accordion type="multiple" className="w-full">
                          {form.watch("salary.contributions", [])
                            .filter(c => c.category === category)
                            .map((contribution) => {
                              // Calculer les montants pour cette cotisation
                              const salaireBrut = form.watch("salary.grossSalary");
                              const baseAmount = salaireBrut; // Simplifié pour cet exemple
                              const employeeAmount = contribution.isRequired ? baseAmount * contribution.employeeRate / 100 : 0;
                              const employerAmount = contribution.isRequired ? baseAmount * contribution.employerRate / 100 : 0;
                              
                              return (
                                <AccordionItem key={contribution.id} value={contribution.id}>
                                  <div className="flex items-center pr-4 hover:bg-gray-50 px-4 rounded-md">
                                    <Checkbox
                                      id={`active-${contribution.id}`}
                                      checked={contribution.isRequired}
                                      onCheckedChange={(checked: boolean) => {
                                        // Mettre à jour la cotisation
                                        const newContributions = form.watch("salary.contributions", []).map(c => {
                                          if (c.id === contribution.id) {
                                            return { ...c, isRequired: !!checked };
                                          }
                                          return c;
                                        });
                                        
                                        // Recalculer les totaux
                                        const activeCotisations = newContributions.filter(c => c.isRequired);
                                        const totalEmployeeContributions = activeCotisations.reduce(
                                          (sum, c) => sum + (salaireBrut * c.employeeRate / 100), 0
                                        );
                                        const totalEmployerContributions = activeCotisations.reduce(
                                          (sum, c) => sum + (salaireBrut * c.employerRate / 100), 0
                                        );
                                        
                                        // Mettre à jour les valeurs
                                        form.setValue("salary.contributions", newContributions);
                                        form.setValue("salary.totalEmployeeContributions", totalEmployeeContributions);
                                        form.setValue("salary.totalEmployerContributions", totalEmployerContributions);
                                        form.setValue("salary.netBeforeTax", salaireBrut - totalEmployeeContributions);
                                        form.setValue("salary.netToPay", salaireBrut - totalEmployeeContributions);
                                      }}
                                      className="mr-2"
                                    />
                                    <AccordionTrigger className="flex-1">
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2">
                                          <span className={!contribution.isRequired ? "text-gray-400" : ""}>
                                            {contribution.name}
                                          </span>
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Info className="h-3 w-3 text-gray-400" />
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>{contribution.description || "Cotisation sociale"}</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </div>
                                        
                                        {contribution.isRequired && (
                                          <div className="hidden sm:flex gap-2 items-center text-sm">
                                            {contribution.employeeRate > 0 && (
                                              <span className="text-blue-600">
                                                Salarié: {employeeAmount.toFixed(2)}€
                                              </span>
                                            )}
                                            {contribution.employerRate > 0 && (
                                              <span className="text-green-600">
                                                Employeur: {employerAmount.toFixed(2)}€
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </AccordionTrigger>
                                  </div>
                                  
                                  <AccordionContent className="px-4 py-2">
                                    {contribution.description && (
                                      <p className="text-sm text-gray-600 mb-4">{contribution.description}</p>
                                    )}
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                      <div>
                                        <Label 
                                          htmlFor={`employee-rate-${contribution.id}`}
                                          className="flex items-center gap-1"
                                        >
                                          Taux salarial (%)
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Info className="h-3 w-3 text-gray-400" />
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Pourcentage retenu sur le salaire brut</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </Label>
                                        <div className="flex items-center gap-2 mt-1">
                            <Input 
                                            id={`employee-rate-${contribution.id}`}
                              type="number" 
                              step="0.01"
                                            min="0"
                                            max="100"
                                            disabled={!contribution.isRequired}
                                            value={contribution.employeeRate}
                                            onChange={(e) => {
                                              const newValue = parseFloat(e.target.value) || 0;
                                              
                                              // Mettre à jour la cotisation
                                              const newContributions = form.watch("salary.contributions", []).map(c => {
                                                if (c.id === contribution.id) {
                                                  return { ...c, employeeRate: newValue };
                                                }
                                                return c;
                                              });
                                              
                                              // Recalculer les totaux
                                              const activeCotisations = newContributions.filter(c => c.isRequired);
                                              const totalEmployeeContributions = activeCotisations.reduce(
                                                (sum, c) => sum + (salaireBrut * c.employeeRate / 100), 0
                                              );
                                              
                                              // Mettre à jour les valeurs
                                              form.setValue("salary.contributions", newContributions);
                                              form.setValue("salary.totalEmployeeContributions", totalEmployeeContributions);
                                              form.setValue("salary.netBeforeTax", salaireBrut - totalEmployeeContributions);
                                              form.setValue("salary.netToPay", salaireBrut - totalEmployeeContributions);
                                            }}
                                          />
                                          <span className="text-gray-500 text-sm w-20">
                                            {contribution.isRequired && employeeAmount.toFixed(2)} €
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                          Formule: {salaireBrut.toFixed(2)} € × {contribution.employeeRate}%
                                        </p>
                  </div>
                  
                                      <div>
                                        <Label 
                                          htmlFor={`employer-rate-${contribution.id}`}
                                          className="flex items-center gap-1"
                                        >
                                          Taux patronal (%)
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Info className="h-3 w-3 text-gray-400" />
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Pourcentage à la charge de l'employeur</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </Label>
                                        <div className="flex items-center gap-2 mt-1">
                            <Input 
                                            id={`employer-rate-${contribution.id}`}
                              type="number" 
                              step="0.01"
                                            min="0"
                                            max="100"
                                            disabled={!contribution.isRequired}
                                            value={contribution.employerRate}
                                            onChange={(e) => {
                                              const newValue = parseFloat(e.target.value) || 0;
                                              
                                              // Mettre à jour la cotisation
                                              const newContributions = form.watch("salary.contributions", []).map(c => {
                                                if (c.id === contribution.id) {
                                                  return { ...c, employerRate: newValue };
                                                }
                                                return c;
                                              });
                                              
                                              // Recalculer les totaux
                                              const activeCotisations = newContributions.filter(c => c.isRequired);
                                              const totalEmployerContributions = activeCotisations.reduce(
                                                (sum, c) => sum + (salaireBrut * c.employerRate / 100), 0
                                              );
                                              
                                              // Mettre à jour les valeurs
                                              form.setValue("salary.contributions", newContributions);
                                              form.setValue("salary.totalEmployerContributions", totalEmployerContributions);
                                            }}
                                          />
                                          <span className="text-gray-500 text-sm w-20">
                                            {contribution.isRequired && employerAmount.toFixed(2)} €
                                          </span>
                  </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                          Formule: {salaireBrut.toFixed(2)} € × {contribution.employerRate}%
                                        </p>
                </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              );
                            })}
                        </Accordion>
                      </div>
                    </TabsContent>
                  ))}
                  
                  {/* Sous-onglet Net à payer */}
                  <TabsContent value="net">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">Montants nets</h3>
                      </div>
                      
                      <Accordion type="multiple" defaultValue={["net-a-payer", "net-imposable", "net-social"]} className="w-full">
                        <AccordionItem value="net-a-payer">
                          <div className="flex items-center pr-4 hover:bg-gray-50 px-4 rounded-md bg-green-50">
                            <AccordionTrigger className="flex-1">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Net à payer</span>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-3 w-3 text-gray-400" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Montant final versé au salarié</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <span className="text-green-600 font-bold">
                                  {form.watch("salary.netToPay").toFixed(2)} €
                                </span>
                              </div>
                            </AccordionTrigger>
                          </div>
                          
                          <AccordionContent className="px-4 py-2">
                            <div className="mt-2">
                    <FormField
                      control={form.control}
                      name="salary.netToPay"
                      render={({ field }) => (
                        <FormItem>
                                    <FormLabel>Montant net à payer</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              {...field}
                                        className="font-bold"
                            />
                          </FormControl>
                                    <FormDescription>
                                      Formule: Salaire brut ({form.watch("salary.grossSalary").toFixed(2)} €) - Cotisations salariales ({form.watch("salary.totalEmployeeContributions").toFixed(2)} €)
                                    </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="net-imposable">
                          <div className="flex items-center pr-4 hover:bg-gray-50 px-4 rounded-md bg-blue-50">
                            <AccordionTrigger className="flex-1">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Net imposable</span>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-3 w-3 text-gray-400" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Base pour l'impôt sur le revenu</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <span className="text-blue-600 font-bold">
                                  {form.watch("salary.netBeforeTax").toFixed(2)} €
                                </span>
                              </div>
                            </AccordionTrigger>
                          </div>
                          
                          <AccordionContent className="px-4 py-2">
                            <div className="mt-2">
                    <FormField
                      control={form.control}
                                name="salary.netBeforeTax"
                      render={({ field }) => (
                        <FormItem>
                                    <FormLabel>Montant net imposable</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              {...field}
                                        className="font-bold"
                            />
                          </FormControl>
                                    <FormDescription>
                                      Formule: Salaire brut ({form.watch("salary.grossSalary").toFixed(2)} €) - Cotisations déductibles
                                    </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="net-social">
                          <div className="flex items-center pr-4 hover:bg-gray-50 px-4 rounded-md bg-purple-50">
                            <AccordionTrigger className="flex-1">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Net social</span>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-3 w-3 text-gray-400" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Net pour les charges sociales</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <span className="text-purple-600 font-bold">
                                  {form.watch("salary.netSocial").toFixed(2)} €
                                </span>
                              </div>
                            </AccordionTrigger>
                          </div>
                          
                          <AccordionContent className="px-4 py-2">
                            <div className="mt-2">
                    <FormField
                      control={form.control}
                                name="salary.netSocial"
                      render={({ field }) => (
                        <FormItem>
                                    <FormLabel>Montant net social</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              {...field}
                                        className="font-bold"
                            />
                          </FormControl>
                                    <FormDescription>
                                      Net pour les charges sociales
                                    </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="mode-paiement">
                          <div className="flex items-center pr-4 hover:bg-gray-50 px-4 rounded-md">
                            <AccordionTrigger className="flex-1">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Mode de paiement</span>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-3 w-3 text-gray-400" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Méthode utilisée pour verser le salaire</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <span className="text-gray-600">
                                  {form.watch("salary.paymentMethod")}
                                </span>
                              </div>
                            </AccordionTrigger>
                </div>
                
                          <AccordionContent className="px-4 py-2">
                            <div className="mt-2">
                  <FormField
                    control={form.control}
                    name="salary.paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                                    <FormLabel>Méthode de paiement</FormLabel>
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
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
          </TabsContent>
                </Tabs>
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement en cours
                    </>
                  ) : (
                    'Valider'
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