'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { z } from 'zod';
import { 
  Building, 
  ClipboardList,
  Check
} from 'lucide-react';
import { ContractTemplate } from './ContractTemplate';
import { auth } from '@/lib/firebase';
import { getFirestore, collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadString } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { generatePDF, PDFDocument } from '../../services/pdf-generation-service';
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
    socialSecurityNumber: z.string().optional()
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
    socialSecurityNumber: ''
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

interface ContractFormPageProps {
  initialData?: ContractFormValues;
  contractId?: string;
}

// Hook personnalisé pour la génération de PDF
export const usePdfGenerator = (contractRef: React.RefObject<HTMLDivElement | null>) => {
  const { toast } = useToast();
  
  const generatePDFDoc = async (): Promise<PDFDocument | null> => {
    try {
      // Vérifier si l'élément est disponible
      if (!contractRef.current) {
        throw new Error("L'élément de contrat n'est pas disponible");
      }
      
      // Afficher un message de début de génération
      toast({
        title: "Génération du PDF",
        description: "Création du document en cours...",
      });
      
      // Utiliser notre service simplifié
      if (contractRef.current) {
        const pdf = await generatePDF(contractRef.current);
        
        if (!pdf) {
          throw new Error("Échec de la génération du PDF");
        }
        
        return pdf;
      }
      
      throw new Error("Référence du contrat invalide");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer le PDF. Veuillez réessayer."
      });
      return null;
    }
  };

  return { generatePDF: generatePDFDoc };
};

export function ContractFormPage({ initialData, contractId }: ContractFormPageProps = {}) {
  const [activeTab, setActiveTab] = useState('identification');
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contractIdState, setContractIdState] = useState<string>(contractId || '');
  const [showPreview, setShowPreview] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Configuration du formulaire avec les données initiales ou les valeurs par défaut
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: initialData || defaultValues
  });
  
  // Référence Firestore
  const firestore = getFirestore();
  const storage = getStorage();
  
  // Fonction pour charger les entreprises
  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      // Vérifier si l'utilisateur est connecté
      
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
      
      
      const companiesRef = collection(firestore, `users/${userId}/companies`);
      
      const snapshot = await getDocs(companiesRef);
      
      const companyOptions: CompanyOption[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
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
      
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        console.error("Utilisateur non connecté");
        return;
      }
      
      
      const employeesRef = collection(firestore, `users/${userId}/employees`);
      
      const snapshot = await getDocs(employeesRef);
      
      const employeeOptions: EmployeeOption[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
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
    }
  };
  
  // Fonction pour générer un PDF à partir du contrat HTML
  const { generatePDF } = usePdfGenerator(contractRef);

  // Fonction pour sauvegarder le contrat dans Firestore
  const saveContract = async (data: ContractFormValues) => {
    setIsSaving(true);
    
    try {
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Non connecté",
          description: "Vous devez être connecté pour sauvegarder le contrat"
        });
        setIsSaving(false);
        return;
      }
      
      // Générer un ID unique si c'est un nouveau contrat
      const newContractId = contractIdState || uuidv4();
      setContractIdState(newContractId);
      
      // Chemin de sauvegarde: users/{userId}/contracts/{contractId}
      const contractDocRef = doc(firestore, `users/${userId}/contracts/${newContractId}`);
      
      // Sauvegarder les données du contrat
      await setDoc(contractDocRef, {
        ...data,
        updatedAt: new Date().toISOString(),
        createdAt: contractIdState ? undefined : new Date().toISOString(),
        id: newContractId
      }, { merge: true });
      
      // Notifier l'utilisateur que les données sont sauvegardées
      toast({
        title: "Données sauvegardées",
        description: "Les données du contrat ont été sauvegardées"
      });
      
      // Générer et sauvegarder le PDF de manière indépendante pour éviter le blocage
      try {
        const pdf = await generatePDF();
        
        if (pdf) {
          // Chemin dans Storage: users/{userId}/Documents/contratdetravail-{contractId}.pdf
          const pdfRef = ref(storage, `users/${userId}/Documents/contratdetravail-${newContractId}.pdf`);
          
          // Convertir le PDF en blob puis en data URI
          const pdfBlob = pdf.output('blob') as Blob;
          const reader = new FileReader();
          
          // Utiliser une promesse pour attendre la conversion
          const dataUrl = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(pdfBlob);
          });
          
          // Uploader le PDF avec le data URI
          try {
            await uploadString(pdfRef, dataUrl, 'data_url');
            
            // Mettre à jour le document avec le lien du PDF
            await setDoc(contractDocRef, {
              pdfUrl: `users/${userId}/Documents/contratdetravail-${newContractId}.pdf`
            }, { merge: true });
            
            toast({
              title: "PDF généré",
              description: "Le PDF du contrat a été généré et sauvegardé"
            });
          } catch (uploadError) {
            console.error("Erreur lors de l'upload du PDF:", uploadError);
            toast({
              variant: "destructive",
              title: "Erreur d'upload",
              description: `Impossible d'uploader le PDF: ${uploadError instanceof Error ? uploadError.message : "Erreur inconnue"}`
            });
          }
        }
      } catch (pdfError) {
        console.error("Erreur lors de la génération du PDF:", pdfError);
        toast({
          variant: "warning",
          title: "Attention",
          description: "Les données sont sauvegardées mais le PDF n'a pas pu être généré"
        });
        // Ne pas bloquer la sauvegarde si le PDF échoue
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la sauvegarde du contrat"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour prévisualiser le contrat
  const previewContract = () => {
    if (form.formState.isValid) {
      setShowPreview(true);
    } else {
      // Déclenche les validations pour montrer les erreurs
      form.trigger();
      toast({
        variant: "destructive",
        title: "Formulaire incomplet",
        description: "Veuillez compléter tous les champs requis avant de prévisualiser le contrat"
      });
    }
  };

  // Fonction pour télécharger le PDF
  const downloadPDF = async () => {
    try {
      setIsLoading(true);
      const pdf = await generatePDF();
      
      if (pdf) {
        // Générer un nom de fichier basé sur l'employé et la date
        const employeeName = `${form.getValues('employee.firstName')}-${form.getValues('employee.lastName')}`.replace(/\s+/g, '-');
        const date = new Date().toISOString().split('T')[0];
        const filename = `contrat-${employeeName}-${date}.pdf`;
        
        // Télécharger le PDF
        pdf.save(filename);
        
        toast({
          title: "Téléchargement réussi",
          description: "Le contrat a été téléchargé avec succès"
        });
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de télécharger le PDF. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de soumission du formulaire
  const onSubmit = (data: ContractFormValues) => {
    saveContract(data);
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
        {/* Barre de navigation avec boutons fonctionnels */}
        <div className="bg-white border-b p-2 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.history.back()}
              className="px-3 py-1 rounded border hover:bg-slate-50 flex items-center text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
              Retour
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={previewContract}
              className="px-3 py-1 rounded border hover:bg-slate-50 flex items-center text-sm"
              disabled={isLoading || isSaving}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              Aperçu
            </button>
            <button 
              onClick={downloadPDF}
              className="px-3 py-1 rounded border hover:bg-slate-50 flex items-center text-sm"
              disabled={isLoading || isSaving}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Télécharger
            </button>
            <button 
              onClick={form.handleSubmit(onSubmit)}
              className="px-3 py-1 rounded border bg-primary text-white hover:bg-primary/90 flex items-center text-sm"
              disabled={isLoading || isSaving}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </div>
        
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
          
          {/* Aperçu du contrat à droite */}
          <div className="flex-1 max-w-[calc(100%-400px)] overflow-auto h-[calc(100vh-60px)]">
            <div ref={contractRef}>
              <ContractTemplate 
                company={form.getValues('company')}
                employee={form.getValues('employee')}
                contractDetails={form.getValues('contractDetails')}
                displayOptions={form.getValues('displayOptions')}
              />
            </div>
          </div>
        </div>
        
        {/* Modal d'aperçu */}
        {showPreview && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-md w-11/12 max-w-4xl h-5/6 overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Aperçu du contrat</h2>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                <ContractTemplate 
                  company={form.getValues('company')}
                  employee={form.getValues('employee')}
                  contractDetails={form.getValues('contractDetails')}
                  displayOptions={form.getValues('displayOptions')}
                />
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Fermer
                </button>
                <button
                  onClick={downloadPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  disabled={isLoading || isSaving}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Télécharger PDF
                </button>
                <button
                  onClick={form.handleSubmit(onSubmit)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  disabled={isLoading || isSaving}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 