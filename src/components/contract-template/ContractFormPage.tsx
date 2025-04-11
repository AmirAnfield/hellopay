'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Building, 
  ClipboardList,
  Check
} from 'lucide-react';
import { ContractTemplate } from './ContractTemplate';
import { auth } from '@/lib/firebase';
import { firestore } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';

// Type pour les entreprises
interface CompanyOption {
  value: string;
  label: string;
  data: {
    name: string;
    address: string;
    siret: string;
    representant: string;
    conventionCollective?: string;
    sector?: string;
  };
}

// Type pour les employés
interface EmployeeOption {
  value: string;
  label: string;
  data: {
    firstName: string;
    lastName: string;
    address: string;
    birthDate?: string;
    nationality?: string;
    socialSecurityNumber?: string;
    gender?: 'M' | 'F' | 'U';
  };
}

// Schéma de validation Zod pour les données du formulaire
const contractFormSchema = z.object({
  // Données de l'entreprise
  company: z.object({
    name: z.string().min(1, { message: 'Le nom de l\'entreprise est requis' }),
    address: z.string().min(1, { message: 'L\'adresse est requise' }),
    siret: z.string().min(1, { message: 'Le SIRET est requis' }),
    representant: z.string().min(1, { message: 'Le représentant est requis' }),
    conventionCollective: z.string().optional(),
    sector: z.string().optional()
  }),
  
  // Données de l'employé
  employee: z.object({
    firstName: z.string().min(1, { message: 'Le prénom est requis' }),
    lastName: z.string().min(1, { message: 'Le nom est requis' }),
    address: z.string().min(1, { message: 'L\'adresse est requise' }),
    birthDate: z.string().optional(),
    nationality: z.string().optional(),
    socialSecurityNumber: z.string().optional(),
    gender: z.enum(['M', 'F', 'U']).optional()
  }),
  
  // Détails du contrat
  contractDetails: z.object({
    type: z.enum(['CDI', 'CDD']),
    workingHours: z.number().min(1).max(35),
    position: z.string().min(1, { message: 'Le poste est requis' }),
    isExecutive: z.boolean().default(false),
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
    showConventionCollective: z.boolean().default(true),
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
    showSignatures: z.boolean().default(true),
    addConventionCollective: z.boolean().default(false)
  })
});

// Type défini à partir du schéma
type ContractFormValues = z.infer<typeof contractFormSchema>;

// Valeurs par défaut pour le formulaire
const defaultValues: ContractFormValues = {
  company: {
    name: '',
    address: '',
    siret: '',
    representant: '',
    conventionCollective: '',
    sector: ''
  },
  employee: {
    firstName: '',
    lastName: '',
    address: '',
    birthDate: '',
    nationality: '',
    socialSecurityNumber: '',
    gender: 'U'
  },
  contractDetails: {
    type: 'CDI',
    workingHours: 35,
    position: '',
    isExecutive: false,
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
    showConventionCollective: true,
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
    showSignatures: true,
    addConventionCollective: false
  }
};

export function ContractFormPage() {
  const [activeTab, setActiveTab] = useState('identification');
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Configuration du formulaire
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues
  });
  
  // Observer les changements du formulaire en temps réel
  const formValues = form.watch();
  
  // Fonction pour charger les entreprises
  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      // Vérifier si l'utilisateur est connecté
      console.log("Auth state:", auth);
      console.log("User:", auth.currentUser);
      
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        console.error("Utilisateur non connecté");
        toast({
          variant: "destructive",
          title: "Non connecté",
          description: "Vous devez être connecté pour voir vos entreprises",
        });
        return;
      }
      
      console.log("Chargement des entreprises pour l'utilisateur:", userId);
      
      const companiesRef = collection(firestore, `users/${userId}/companies`);
      console.log("Chemin Firestore:", `users/${userId}/companies`);
      
      const snapshot = await getDocs(companiesRef);
      console.log("Nombre de documents:", snapshot.size);
      
      const companyOptions: CompanyOption[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Entreprise trouvée:", doc.id, data);
        companyOptions.push({
          value: doc.id,
          label: data.name || "Entreprise sans nom",
          data: {
            name: data.name || "",
            address: data.address || "",
            siret: data.siret || "",
            representant: data.legalRepresentative || data.representant || "",
            conventionCollective: data.collectiveAgreement || data.conventionCollective || "",
            sector: data.activityCode || data.sector || "",
          }
        });
      });
      
      setCompanies(companyOptions);
      
      if (companyOptions.length > 0) {
        toast({
          title: "Entreprises chargées",
          description: `${companyOptions.length} entreprises disponibles`,
        });
      } else {
        console.log("Aucune entreprise trouvée");
        toast({
          title: "Aucune entreprise",
          description: "Vous n'avez pas encore créé d'entreprise",
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des entreprises:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les entreprises. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour charger les employés
  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      // Vérifier si l'utilisateur est connecté
      console.log("Chargement des employés...");
      
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        console.error("Utilisateur non connecté");
        return;
      }
      
      console.log("Chargement des employés pour l'utilisateur:", userId);
      
      const employeesRef = collection(firestore, `users/${userId}/employees`);
      console.log("Chemin Firestore:", `users/${userId}/employees`);
      
      const snapshot = await getDocs(employeesRef);
      console.log("Nombre d'employés:", snapshot.size);
      
      const employeeOptions: EmployeeOption[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Employé trouvé:", doc.id, data);
        employeeOptions.push({
          value: doc.id,
          label: `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Employé sans nom",
          data: {
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            address: data.address || "",
            birthDate: data.birthDate || "",
            nationality: data.nationality || "",
            socialSecurityNumber: data.socialSecurityNumber || "",
            gender: data.gender || "U",
          }
        });
      });
      
      setEmployees(employeeOptions);
      
      if (employeeOptions.length > 0) {
        toast({
          title: "Employés chargés",
          description: `${employeeOptions.length} employés disponibles`,
        });
      } else {
        console.log("Aucun employé trouvé");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les employés. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Charger les entreprises et les employés au chargement du composant
  useEffect(() => {
    loadCompanies();
    loadEmployees();
  }, []);  
  
  // Fonction pour sélectionner une entreprise et remplir les champs
  const handleCompanySelect = (companyId: string) => {
    setSelectedCompany(companyId);
    
    const selectedCompanyData = companies.find(company => company.value === companyId);
    
    if (selectedCompanyData) {
      form.setValue('company.name', selectedCompanyData.data.name);
      form.setValue('company.address', selectedCompanyData.data.address);
      form.setValue('company.siret', selectedCompanyData.data.siret);
      form.setValue('company.representant', selectedCompanyData.data.representant);
      form.setValue('company.conventionCollective', selectedCompanyData.data.conventionCollective || '');
      form.setValue('company.sector', selectedCompanyData.data.sector || '');
    }
  };
  
  // Fonction pour sélectionner un employé et remplir les champs
  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    
    const selectedEmployeeData = employees.find(employee => employee.value === employeeId);
    
    if (selectedEmployeeData) {
      form.setValue('employee.firstName', selectedEmployeeData.data.firstName);
      form.setValue('employee.lastName', selectedEmployeeData.data.lastName);
      form.setValue('employee.address', selectedEmployeeData.data.address);
      
      if (selectedEmployeeData.data.birthDate) {
        form.setValue('employee.birthDate', selectedEmployeeData.data.birthDate);
      }
      
      if (selectedEmployeeData.data.nationality) {
        form.setValue('employee.nationality', selectedEmployeeData.data.nationality);
      }
      
      if (selectedEmployeeData.data.socialSecurityNumber) {
        form.setValue('employee.socialSecurityNumber', selectedEmployeeData.data.socialSecurityNumber);
      }
      
      if (selectedEmployeeData.data.gender) {
        form.setValue('employee.gender', selectedEmployeeData.data.gender);
      }
    }
  };
  
  // Fonction de soumission du formulaire
  const onSubmit = (data: ContractFormValues) => {
    console.log('Formulaire soumis:', data);
    // Ici, vous pourriez sauvegarder les données ou générer le PDF
  };
  
  // Observer l'état de validité du formulaire pour mettre à jour le style du bouton Valider
  useEffect(() => {
    const isFormValid = form.formState.isValid;
    
    // Trouver le bouton Valider dans le layout et mettre à jour son style
    const validateButton = document.querySelector('button[form="contract-form"][type="submit"]');
    if (validateButton) {
      if (isFormValid) {
        validateButton.classList.remove('bg-transparent', 'hover:bg-accent', 'hover:text-accent-foreground');
        validateButton.classList.add('bg-green-500', 'text-white', 'hover:bg-green-600');
      } else {
        validateButton.classList.remove('bg-green-500', 'text-white', 'hover:bg-green-600');
        validateButton.classList.add('bg-transparent', 'hover:bg-accent', 'hover:text-accent-foreground');
      }
    }
  }, [form.formState.isValid]);
  
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
        <div className="flex flex-row flex-1">
          {/* Menu de configuration à gauche - Design amélioré */}
          <div className="w-[400px] min-w-[400px] border-r p-3 h-[calc(100vh-60px)] overflow-y-auto bg-gray-50/50">
            <Form {...form}>
              <form id="contract-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 mb-2 h-7">
                    <TabsTrigger value="identification" onClick={() => setActiveTab('identification')} className="text-xs py-0.5">
                      <Building className="h-4 w-4 mr-1" />
                      Identification
                    </TabsTrigger>
                    <TabsTrigger value="contract" onClick={() => setActiveTab('contract')} className="text-xs py-0.5">
                      <ClipboardList className="h-3 w-3 mr-1" />
                      Contrat
                    </TabsTrigger>
                    <TabsTrigger value="options" onClick={() => setActiveTab('options')} className="text-xs py-0.5">
                      <Check className="h-3 w-3 mr-1" />
                      Options
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Nouvelle section fusionnée Identification (Entreprise + Employé) */}
                  <TabsContent value="identification" className="space-y-4 mt-0">
                    {/* Section Entreprise */}
                    <div className="border rounded-md p-3 pb-4 space-y-3 bg-white">
                      <h3 className="font-medium text-sm">Entreprise</h3>
                      <div className="space-y-3">
                        {/* Sélecteur d'entreprise */}
                        <div className="space-y-1">
                          <FormLabel className="text-xs">Sélectionner une entreprise</FormLabel>
                          <Select
                            value={selectedCompany || ""}
                            onValueChange={handleCompanySelect}
                            disabled={isLoading}
                          >
                            <FormControl>
                              <SelectTrigger className="h-7 text-sm">
                                <SelectValue 
                                  placeholder={isLoading ? "Chargement..." : "Sélectionner une entreprise"} 
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {companies.map((company) => (
                                <SelectItem key={company.value} value={company.value}>
                                  {company.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Gestion de la convention collective */}
                        <div className="space-y-1">
                          {form.watch('company.conventionCollective') ? (
                            <div className="space-y-2">
                              <FormLabel className="text-xs flex items-center justify-between">
                                <span>Convention collective détectée</span>
                                <span className="text-green-600 text-[10px]">✓ Trouvée</span>
                              </FormLabel>
                              <div className="bg-slate-50 p-2 rounded border text-xs">
                                {form.watch('company.conventionCollective')}
                              </div>
                              <FormField
                                control={form.control}
                                name="displayOptions.showConventionCollective"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-2 space-y-0 mt-1">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        defaultChecked={true}
                                      />
                                    </FormControl>
                                    <div className="space-y-0.5 leading-none">
                                      <FormLabel className="text-xs">
                                        Inclure dans le contrat
                                      </FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <FormField
                                control={form.control}
                                name="displayOptions.addConventionCollective"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="space-y-0.5 leading-none">
                                      <FormLabel className="text-xs">
                                        Ajouter une convention collective
                                      </FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                              
                              {form.watch('displayOptions.addConventionCollective') && (
                                <FormField
                                  control={form.control}
                                  name="company.conventionCollective"
                                  render={({ field }) => (
                                    <FormItem className="space-y-0.5">
                                      <Select
                                        value={field.value || ""}
                                        onValueChange={field.onChange}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="h-7 text-xs">
                                            <SelectValue placeholder="Sélectionner une convention" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="Convention collective nationale des bureaux d'études techniques (SYNTEC)">SYNTEC - Bureaux d&apos;études techniques</SelectItem>
                                          <SelectItem value="Convention collective nationale de la métallurgie">Métallurgie</SelectItem>
                                          <SelectItem value="Convention collective nationale du bâtiment">Bâtiment</SelectItem>
                                          <SelectItem value="Convention collective nationale du commerce et de la distribution">Commerce et distribution</SelectItem>
                                          <SelectItem value="Convention collective nationale de l'hôtellerie et de la restauration">Hôtellerie et restauration</SelectItem>
                                          <SelectItem value="Convention collective nationale des transports routiers">Transports routiers</SelectItem>
                                          <SelectItem value="Convention collective nationale des télécommunications">Télécommunications</SelectItem>
                                          <SelectItem value="Convention collective nationale des entreprises de propreté">Entreprises de propreté</SelectItem>
                                          <SelectItem value="Convention collective nationale des industries chimiques">Industries chimiques</SelectItem>
                                          <SelectItem value="Convention collective nationale de la banque">Banque</SelectItem>
                                          <SelectItem value="Convention collective nationale des sociétés d'assurances">Assurances</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage className="text-xs" />
                                    </FormItem>
                                  )}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Section Employé */}
                    <div className="border rounded-md p-3 pb-4 space-y-3 bg-white">
                      <h3 className="font-medium text-sm">Salarié</h3>
                      <div className="space-y-3">
                        {/* Sélecteur d'employé */}
                        <div className="space-y-1">
                          <FormLabel className="text-xs">Sélectionner un employé</FormLabel>
                          <Select
                            value={selectedEmployee || ""}
                            onValueChange={handleEmployeeSelect}
                            disabled={isLoading}
                          >
                            <FormControl>
                              <SelectTrigger className="h-7 text-sm">
                                <SelectValue 
                                  placeholder={isLoading ? "Chargement..." : "Sélectionner un employé"} 
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employees.map((employee) => (
                                <SelectItem key={employee.value} value={employee.value}>
                                  {employee.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Sélection du genre grammatical */}
                        <div className="space-y-1">
                          <FormLabel className="text-xs">Forme grammaticale</FormLabel>
                          <FormField
                            control={form.control}
                            name="employee.gender"
                            render={({ field }) => (
                              <div className="grid grid-cols-3 gap-1">
                                <div 
                                  className={`border rounded p-2 text-center text-xs cursor-pointer ${field.value === 'M' ? 'bg-primary text-white' : 'bg-slate-50 hover:bg-slate-100'}`}
                                  onClick={() => field.onChange('M')}
                                >
                                  <div>Masculin</div>
                                  <div className="font-semibold mt-1">Le salarié</div>
                                </div>
                                <div 
                                  className={`border rounded p-2 text-center text-xs cursor-pointer ${field.value === 'F' ? 'bg-primary text-white' : 'bg-slate-50 hover:bg-slate-100'}`}
                                  onClick={() => field.onChange('F')}
                                >
                                  <div>Féminin</div>
                                  <div className="font-semibold mt-1">La salariée</div>
                                </div>
                                <div 
                                  className={`border rounded p-2 text-center text-xs cursor-pointer ${field.value === 'U' ? 'bg-primary text-white' : 'bg-slate-50 hover:bg-slate-100'}`}
                                  onClick={() => field.onChange('U')}
                                >
                                  <div>Inclusif</div>
                                  <div className="font-semibold mt-1">L&apos;employé·e</div>
                                </div>
                              </div>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Bouton de validation */}
                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        className="w-full bg-primary text-white py-2 rounded-md font-medium hover:bg-primary/90"
                        onClick={() => setActiveTab('contract')}
                      >
                        Suivant - Configurer le contrat
                      </button>
                    </div>
                  </TabsContent>
                  
                  {/* Onglet Contrat */}
                  <TabsContent value="contract" className="space-y-2 mt-0">
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="contractDetails.type"
                        render={({ field }) => (
                          <FormItem className="space-y-0.5">
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
                          <FormItem className="space-y-0.5">
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
                      
                      <FormField
                        control={form.control}
                        name="contractDetails.isExecutive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-0.5 leading-none">
                              <FormLabel className="text-xs">
                                Statut cadre
                              </FormLabel>
                              <p className="text-[10px] text-muted-foreground">
                                Le salarié bénéficie du statut cadre
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      {/* Options pour le préambule et la convention collective */}
                      <div className="border-t pt-2 mt-2">
                        <FormField
                          control={form.control}
                          name="displayOptions.hasPreambule"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-0.5 leading-none">
                                <FormLabel className="text-xs">
                                  Inclure un préambule
                                </FormLabel>
                                <p className="text-[10px] text-muted-foreground">
                                  Recommandé pour contextualiser la relation de travail
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="contractDetails.position"
                      render={({ field }) => (
                        <FormItem className="space-y-0.5">
                          <FormLabel className="text-xs">Poste</FormLabel>
                          <FormControl>
                            <Input className="h-7 text-sm" placeholder="Développeur web" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contractDetails.classification"
                      render={({ field }) => (
                        <FormItem className="space-y-0.5">
                          <FormLabel className="text-xs">Classification / Niveau</FormLabel>
                          <FormControl>
                            <Input className="h-7 text-sm" placeholder="Ex: Niveau III, Échelon 2, Coefficient 300" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="contractDetails.startDate"
                        render={({ field }) => (
                          <FormItem className="space-y-0.5">
                            <FormLabel className="text-xs">Date de début</FormLabel>
                            <FormControl>
                              <Input type="date" className="h-7 text-sm" {...field} />
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
                            <FormItem className="space-y-0.5">
                              <FormLabel className="text-xs">Date de fin (CDD)</FormLabel>
                              <FormControl>
                                <Input type="date" className="h-7 text-sm" {...field} />
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
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-0.5 leading-none">
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
                          <FormItem className="space-y-0.5">
                            <FormLabel className="text-xs">Durée de la période d&apos;essai</FormLabel>
                            <FormControl>
                              <Input className="h-7 text-sm" placeholder="Ex: 2 mois" {...field} />
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
                        <FormItem className="space-y-0.5">
                          <FormLabel className="text-xs">Lieu de travail</FormLabel>
                          <FormControl>
                            <Input className="h-7 text-sm" placeholder="1 rue de la Paix, 75001 Paris" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contractDetails.salary"
                      render={({ field }) => (
                        <FormItem className="space-y-0.5">
                          <FormLabel className="text-xs">Salaire brut mensuel (€)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              className="h-7 text-sm" 
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
                          <FormItem className="space-y-0.5">
                            <FormLabel className="text-xs">Motif du CDD</FormLabel>
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className="h-7 text-sm">
                                  <SelectValue placeholder="Sélectionner un motif" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Remplacement d'un salarié absent">Remplacement d&apos;un salarié absent</SelectItem>
                                <SelectItem value="Accroissement temporaire d'activité">Accroissement temporaire d&apos;activité</SelectItem>
                                <SelectItem value="Emploi saisonnier">Emploi saisonnier</SelectItem>
                                <SelectItem value="Contrat à objet défini">Contrat à objet défini</SelectItem>
                                <SelectItem value="Attente recrutement CDI">Attente de l&apos;entrée en service d&apos;un CDI</SelectItem>
                                <SelectItem value="CDD d'usage">CDD d&apos;usage (secteurs spécifiques)</SelectItem>
                                <SelectItem value="CDD à terme imprécis">CDD à terme imprécis</SelectItem>
                                <SelectItem value="custom">Autre motif (à préciser)</SelectItem>
                              </SelectContent>
                            </Select>
                            {field.value === "custom" && (
                              <div className="mt-1">
                                <Input 
                                  className="h-7 text-sm" 
                                  placeholder="Précisez le motif" 
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </div>
                            )}
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="contractDetails.mobilityClause"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-0.5 leading-none">
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
                          <FormItem className="space-y-0.5">
                            <FormLabel className="text-xs">Rayon de mobilité (km)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                className="h-7 text-sm" 
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
                        <FormItem className="space-y-0.5">
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
                          <FormItem className="space-y-0.5">
                            <FormLabel className="text-xs">Répartition des horaires (temps partiel)</FormLabel>
                            <FormControl>
                              <Input className="h-7 text-sm" placeholder="Ex: Lundi, Mardi, Mercredi matin" {...field} />
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
                        <FormItem className="space-y-0.5">
                          <FormLabel className="text-xs">Date de paiement du salaire</FormLabel>
                          <FormControl>
                            <Input className="h-7 text-sm" placeholder="Ex: 25" {...field} />
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
                          <FormItem className="space-y-0.5">
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
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="contractDetails.nonCompete"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-0.5 leading-none">
                                <FormLabel className="text-xs">
                                  Inclure une clause de non-concurrence
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        {form.watch('contractDetails.nonCompete') && (
                          <div className="space-y-2 pl-5">
                            <FormField
                              control={form.control}
                              name="contractDetails.nonCompeteDuration"
                              render={({ field }) => (
                                <FormItem className="space-y-0.5">
                                  <FormLabel className="text-xs">Durée</FormLabel>
                                  <FormControl>
                                    <Input className="h-7 text-sm" placeholder="12 mois" {...field} />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="contractDetails.nonCompeteArea"
                              render={({ field }) => (
                                <FormItem className="space-y-0.5">
                                  <FormLabel className="text-xs">Zone géographique</FormLabel>
                                  <FormControl>
                                    <Input className="h-7 text-sm" placeholder="100 km autour de Paris" {...field} />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="contractDetails.nonCompeteCompensation"
                              render={({ field }) => (
                                <FormItem className="space-y-0.5">
                                  <FormLabel className="text-xs">Indemnité (%)</FormLabel>
                                  <FormControl>
                                    <Input className="h-7 text-sm" placeholder="30" {...field} />
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
                  <TabsContent value="options" className="space-y-2 mt-0">
                    <FormField
                      control={form.control}
                      name="displayOptions.includeDataProtection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-0.5 leading-none">
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
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-0.5 leading-none">
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
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-0.5 leading-none">
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
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-0.5 leading-none">
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
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-0.5 leading-none">
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
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-0.5 leading-none">
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
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-0.5 leading-none">
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
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-0.5 leading-none">
                            <FormLabel className="text-xs">
                              Inclure l&apos;article &quot;Télétravail&quot;
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch('displayOptions.includeTeleworking') && (
                      <div className="space-y-2 pl-5">
                        <FormField
                          control={form.control}
                          name="displayOptions.teleworkingType"
                          render={({ field }) => (
                            <FormItem className="space-y-0.5">
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
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-0.5 leading-none">
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
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-0.5 leading-none">
                            <FormLabel className="text-xs">
                              Afficher les blocs de signature
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          </div>
          
          {/* Aperçu du contrat - Ajusté pour voir le début */}
          <div className="flex-1 p-2 overflow-auto h-[calc(100vh-60px)] flex items-start justify-center">
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