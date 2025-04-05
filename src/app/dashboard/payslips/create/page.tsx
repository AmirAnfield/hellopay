'use client'

// Ce fichier a été mis à jour pour inclure les fonctionnalités de génération de bulletins de paie
// qui récupèrent les données d'un employé à partir de sa date d'entrée et de son salaire de base.
// L'interface permet de:
// 1. Sélectionner un employé et voir toutes les périodes de paie depuis sa date d'entrée
// 2. Configurer les éléments variables du salaire (heures supp, primes, absences, etc.)
// 3. Générer un bulletin avec toutes les lignes de paie pré-remplies
// 4. Avoir une prévisualisation du bulletin avant génération
// 5. Sauvegarder les bulletins générés

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
// import { v4 as uuidv4 } from "uuid";
// import Link from "next/link";
import { 
  ChevronLeft as ArrowLeft,
  // Calendar,
  // User,
  // Building,
  // Euro,
  // Download,
  // FileText,
  Calculator, 
} from "lucide-react";
/*
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
*/
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
/*
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
*/
import {
  format,
  parse,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  // isAfter,
  isBefore,
  // differenceInMonths,
  parseISO
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingButton } from '@/components/shared/LoadingButton';
import { PageContainer, PageHeader, EmptyState, LoadingState } from '@/components/shared/PageContainer';

// Types
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  companyId: string;
  company: string;
  startDate: string; // Format ISO
  position: string;
  baseSalary: number;
  isExecutive?: boolean;
  contractType?: string;
}

interface Company {
  id: string;
  name: string;
  siret?: string;
  address?: string;
  postalCode?: string;
  city?: string;
}

interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  companyId: string;
  companyName: string;
  month: number; // 1-12
  year: number;
  periodStart: string; // Format ISO
  periodEnd: string; // Format ISO
  paymentDate: string; // Format ISO
  baseSalary: number;
  grossSalary: number;
  netSalary: number;
  hoursWorked: number;
  status: 'draft' | 'final' | 'paid';
  payslipLines: PayslipLine[];
  additionalInfo: {
    taxRate?: number;
    overtimeHours?: number;
    bonusAmount?: number;
    absenceDays?: number;
    paidLeaveDays?: number;
    sickLeaveDays?: number;
  };
  createdAt: string;
  pdfUrl?: string;
}

interface PayslipLine {
  id: string;
  code: string;
  label: string;
  base: number;
  rate: number;
  employeeAmount: number;
  employerAmount: number;
  type: 'earning' | 'deduction' | 'contribution' | 'total';
  category: 'base' | 'health' | 'retirement' | 'unemployment' | 'tax' | 'other';
  order: number;
}

// Page de création de bulletins de paie
export default function CreatePayslip() {
  const router = useRouter();
  
  // États
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [availablePeriods, setAvailablePeriods] = useState<{label: string, value: string}[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [activeTab, setActiveTab] = useState("configuration");
  const [configOpen, setConfigOpen] = useState(false);
  const [calculatedValues, setCalculatedValues] = useState({
    grossSalary: 0,
    employeeContributions: 0,
    employerContributions: 0,
    netSalary: 0,
    taxAmount: 0
  });
  
  // Configuration de paie
  const [payConfig, setPayConfig] = useState({
    taxRate: 0,
    socialContribRate: 22,
    employerContribRate: 42,
    healthInsuranceRate: 7.5,
    retirementRate: 8.5,
    unemploymentRate: 4.0,
    pssValue: 3428, // Plafond Sécurité Sociale 2023
    useProgTax: true,
    paymentDay: 28
  });
  
  // Données du bulletin sélectionné
  const [currentPayslip, setCurrentPayslip] = useState<Payslip | null>(null);
  
  // Options supplémentaires pour le bulletin
  const [payslipOptions, setPayslipOptions] = useState({
    hoursWorked: 151.67,
    overtimeHours: 0,
    bonusAmount: 0,
    absenceDays: 0,
    paidLeaveDays: 0,
    sickLeaveDays: 0,
    notes: ''
  });

  // Dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  
  // Pour stocker les contrats
  const [contracts, setContracts] = useState<any[]>([]);
  
  // État pour stocker tous les bulletins pré-générés pour un employé
  const [prePeriods, setPrePeriods] = useState<{
    period: string; // format "MM/YYYY"
    label: string;
    preCalculated: {
      grossSalary: number;
      employeeContributions: number;
      employerContributions: number;
      netSalary: number;
      taxAmount: number;
    };
    validated: boolean;
  }[]>([]);
  
  // Chargement initial des données
  useEffect(() => {
    fetchData();
  }, []);
  
  // Memoize la fonction de calcul pour éviter les rendus infinis
  const calculatePayslipMemo = useCallback((options: any) => {
    // Trouver si l'employé est cadre pour appliquer le bon taux
    const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);
    if (!selectedEmployeeData) return null;
    
    const isExecutive = selectedEmployeeData.isExecutive || false;
    
    // Conversion des valeurs en nombres
    const baseSalary = selectedEmployeeData.baseSalary;
    const overtimeHours = options.overtimeHours || 0;
    const bonusAmount = options.bonusAmount || 0;
    const absenceDays = options.absenceDays || 0;
    
    // Calcul du salaire pour les heures supplémentaires (majoration de 25%)
    const hourlyRate = baseSalary / 151.67;
    const overtimePay = overtimeHours * hourlyRate * 1.25;
    
    // Calcul des absences (1 jour = 7h environ)
    const absenceDeduction = absenceDays > 0 ? (absenceDays * 7 * hourlyRate) : 0;
    
    // Salaire brut total
    const grossSalary = baseSalary + overtimePay + bonusAmount - absenceDeduction;
    
    // Taux de cotisations selon la configuration et le statut cadre/non-cadre
    const employeeRate = isExecutive ? payConfig.socialContribRate / 100 : (payConfig.socialContribRate - 3) / 100;
    const employerRate = isExecutive ? payConfig.employerContribRate / 100 : (payConfig.employerContribRate - 2) / 100;
    
    // Calcul des cotisations
    const employeeContributions = grossSalary * employeeRate;
    const employerContributions = grossSalary * employerRate;
    
    // Calcul du taux progressif d'impôt sur le revenu
    let taxRate = payConfig.taxRate / 100;
    if (payConfig.useProgTax) {
      // Simulation d'un barème progressif d'impôt simplifié
      if (grossSalary <= 1500) taxRate = 0;
      else if (grossSalary <= 2500) taxRate = 0.11;
      else if (grossSalary <= 3500) taxRate = 0.13;
      else if (grossSalary <= 5000) taxRate = 0.15;
      else taxRate = 0.17;
    }
    
    // Calcul de l'impôt à la source
    const taxAmount = (grossSalary - employeeContributions) * taxRate;
    
    // Salaire net
    const netSalary = grossSalary - employeeContributions - taxAmount;
    
    return {
      grossSalary,
      employeeContributions,
      employerContributions,
      netSalary,
      taxAmount,
      overtimePay,
      absenceDeduction
    };
  }, [employees, selectedEmployee, payConfig]);

  // Calcul automatique lorsque les options changent
  useEffect(() => {
    let isMounted = true;
    
    if (selectedEmployee && employees.length > 0) {
      // Utiliser un délai pour éviter les calculs inutiles
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          const result = calculatePayslipMemo(payslipOptions);
          if (result) {
            setCalculatedValues({
              grossSalary: result.grossSalary,
              employeeContributions: result.employeeContributions,
              employerContributions: result.employerContributions,
              netSalary: result.netSalary,
              taxAmount: result.taxAmount
            });
          }
        }
      }, 100);
      
      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
      };
    }
  }, [selectedEmployee, payslipOptions, employees, calculatePayslipMemo]);
  
  // Wrapper pour la fonction de calcul - ne met plus à jour l'état directement
  const calculatePayslip = useCallback((options: any) => {
    return calculatePayslipMemo(options);
  }, [calculatePayslipMemo]);

  // Charger les données des employés et entreprises
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // 1. Charger les entreprises depuis le localStorage
      const savedCompanies = localStorage.getItem('companies');
      const companiesList: Company[] = savedCompanies ? JSON.parse(savedCompanies) : [];
      
      // 2. Charger les employés depuis le localStorage
      const savedEmployees = localStorage.getItem('employees');
      const employeesList = savedEmployees ? JSON.parse(savedEmployees) : [];
      
      // 3. Charger les contrats depuis le localStorage
      const savedDocuments = localStorage.getItem('userDocuments');
      let contractsList: any[] = [];
      
      if (savedDocuments) {
        const allDocuments = JSON.parse(savedDocuments);
        // Filtrer pour ne garder que les contrats
        contractsList = allDocuments.filter((doc: any) => doc.type === 'contrat');
      }
      
      setContracts(contractsList);
      
      // Enrichir les employés avec les noms d'entreprises et le salaire du contrat le plus récent
      const employeesWithCompanyNames = employeesList.map((emp: any) => {
        const company = companiesList.find((c: Company) => c.id === emp.companyId);
        
        // Essayer de trouver le contrat le plus récent pour cet employé
        let baseSalary = Number(emp.baseSalary || 0);
        
        if (contractsList.length > 0) {
          // Filtrer les contrats pour cet employé
          const empContracts = contractsList.filter((contract: any) => 
            contract.contractConfig?.employeeId === emp.id
          );
          
          if (empContracts.length > 0) {
            // Trier par date décroissante pour avoir le plus récent en premier
            empContracts.sort((a: any, b: any) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            
            // Utiliser le salaire du contrat le plus récent s'il existe
            if (empContracts[0].contractConfig?.baseSalary) {
              baseSalary = Number(empContracts[0].contractConfig.baseSalary);
            }
          }
        }
        
        return {
          id: String(emp.id || ''),
          firstName: String(emp.firstName || ''),
          lastName: String(emp.lastName || ''),
          companyId: String(emp.companyId || ''),
          company: company ? company.name : 'Entreprise inconnue',
          startDate: String(emp.startDate || ''),
          position: String(emp.position || ''),
          baseSalary: baseSalary,
          isExecutive: Boolean(emp.isExecutive || false),
          contractType: String(emp.contractType || 'CDI')
        } as Employee;
      });
      
      setEmployees(employeesWithCompanyNames);
      setCompanies(companiesList);
      
      // 4. Charger les bulletins existants
      const savedPayslips = localStorage.getItem('payslips');
      const payslipsList: Payslip[] = savedPayslips ? JSON.parse(savedPayslips) : [];
      setPayslips(payslipsList);
      
      toast.success("Données chargées", {
        description: `${employeesWithCompanyNames.length} employés et ${payslipsList.length} bulletins chargés`
      });
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      toast.error("Erreur", {
        description: "Impossible de charger les données. Veuillez réessayer."
      });
      } finally {
      setIsLoading(false);
    }
  };

  // Format de la période actuelle (MM/YYYY)
  function getCurrentPeriod() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${month}/${year}`;
  }
  
  // Mise à jour du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Ne plus traiter l'employé ici, c'est géré par le composant Select
    if (name === 'period') {
      setSelectedPeriod(value);
      return;
    }
    
    // Pour les autres champs, mettre à jour les options du bulletin
    setPayslipOptions(prev => ({
          ...prev,
      [name]: name === 'notes' ? value : parseFloat(value)
    }));
    // Le calcul est maintenant géré automatiquement par useEffect
  };
  
  // Mise à jour du formulaire lorsqu'un employé est sélectionné
  const handleEmployeeChange = (value: string) => {
    setSelectedEmployee(value);
    
    // Rechercher l'employé sélectionné
    const employee = employees.find(emp => emp.id === value);
    if (!employee) return;
    
    // Réinitialiser les options de bulletin avec les valeurs par défaut de l'employé
    setPayslipOptions(prev => ({
      ...prev,
      hoursWorked: 151.67, // Heures standard par mois
      overtimeHours: 0,
      bonusAmount: 0,
      absenceDays: 0,
      paidLeaveDays: 0,
      sickLeaveDays: 0,
      notes: ''
    }));
    
    // Générer les périodes disponibles pour cet employé
    if (employee && employee.startDate) {
      try {
        // Essayer de parser la date au format ISO (yyyy-MM-dd)
        const start = parse(employee.startDate, 'yyyy-MM-dd', new Date());
        
        if (isNaN(start.getTime())) {
          throw new Error("Date invalide");
        }
        
        const periods = [];
        const today = new Date();
        let currentDate = startOfMonth(start);
        
        // Générer toutes les périodes du mois d'entrée jusqu'au mois actuel
        while (isBefore(currentDate, today) || currentDate.getMonth() === today.getMonth()) {
          const monthValue = format(currentDate, 'MM/yyyy');
          const monthLabel = format(currentDate, 'MMMM yyyy', { locale: fr });
          
          periods.push({
            value: monthValue,
            label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
          });
          
          currentDate = addMonths(currentDate, 1);
        }
        
        setAvailablePeriods(periods);
        if (periods.length > 0) {
          setSelectedPeriod(format(new Date(), 'MM/yyyy'));
        }
      } catch (error) {
        console.error("Erreur lors du parsing de la date:", error);
        // En cas d'erreur, générer les 12 derniers mois
        const fallbackPeriods = [];
        const today = new Date();
        let currentDate = subMonths(startOfMonth(today), 11);
        
        while (isBefore(currentDate, today) || currentDate.getMonth() === today.getMonth()) {
          const monthValue = format(currentDate, 'MM/yyyy');
          const monthLabel = format(currentDate, 'MMMM yyyy', { locale: fr });
          
          fallbackPeriods.push({
            value: monthValue,
            label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
          });
          
          currentDate = addMonths(currentDate, 1);
        }
        
        setAvailablePeriods(fallbackPeriods);
        if (fallbackPeriods.length > 0) {
          setSelectedPeriod(format(new Date(), 'MM/yyyy'));
        }
        
        // Afficher un avertissement concernant la date manquante ou invalide
        toast.warning("Date d'entrée invalide", {
          description: "La date d'entrée de l'employé est manquante ou invalide. Les périodes sont basées sur les 12 derniers mois."
        });
      }
    } else {
      // Si la date d'entrée est manquante, utiliser les 12 derniers mois
      const fallbackPeriods = [];
      const today = new Date();
      let currentDate = subMonths(startOfMonth(today), 11);
      
      while (isBefore(currentDate, today) || currentDate.getMonth() === today.getMonth()) {
        const monthValue = format(currentDate, 'MM/yyyy');
        const monthLabel = format(currentDate, 'MMMM yyyy', { locale: fr });
        
        fallbackPeriods.push({
          value: monthValue,
          label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
        });
        
        currentDate = addMonths(currentDate, 1);
      }
      
      setAvailablePeriods(fallbackPeriods);
      if (fallbackPeriods.length > 0) {
        setSelectedPeriod(format(new Date(), 'MM/yyyy'));
      }
      
      // Afficher un avertissement concernant la date manquante
      toast.warning("Date d'entrée manquante", {
        description: "La date d'entrée de l'employé n'est pas définie. Veuillez la configurer dans le profil de l'employé."
      });
    }
    
    // Vérifier si un contrat existe pour cet employé
    if (contracts.length > 0) {
      // Filtrer les contrats pour cet employé
      const empContracts = contracts.filter(contract => 
        contract.contractConfig?.employeeId === value
      );
      
      if (empContracts.length > 0) {
        // Trier par date décroissante pour avoir le plus récent en premier
        empContracts.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        // Utiliser les informations du contrat le plus récent
        const latestContract = empContracts[0];
        if (latestContract.contractConfig) {
          // Ajuster les heures travaillées selon le contrat
          setPayslipOptions(prev => ({
            ...prev,
            hoursWorked: latestContract.contractConfig.isFullTime ? 151.67 : Number(latestContract.contractConfig.monthlyHours)
          }));
          
          // Afficher un message indiquant que les informations viennent du contrat
          toast.info("Contrat détecté", {
            description: `Les informations de salaire (${latestContract.contractConfig.baseSalary}€) et d'heures (${latestContract.contractConfig.monthlyHours}h) ont été récupérées du contrat.`
          });
        }
      }
    }
  };
  
  // Générer des bulletins de base pour tous les mois depuis l'entrée de l'employé
  const generateAllPayslips = useCallback(() => {
    if (!selectedEmployee || employees.length === 0) return;
    
    const employee = employees.find(emp => emp.id === selectedEmployee);
    if (!employee) return;
    
    const generatedPeriods = availablePeriods.map(period => {
      // Calculer les valeurs de base pour chaque période
      const baseCalculation = {
        grossSalary: employee.baseSalary,
        employeeContributions: employee.baseSalary * (employee.isExecutive ? payConfig.socialContribRate / 100 : (payConfig.socialContribRate - 3) / 100),
        employerContributions: employee.baseSalary * (employee.isExecutive ? payConfig.employerContribRate / 100 : (payConfig.employerContribRate - 2) / 100),
        netSalary: 0,
        taxAmount: 0
      };
      
      // Calculer le net
      let taxRate = 0;
      if (payConfig.useProgTax) {
        if (employee.baseSalary <= 1500) taxRate = 0;
        else if (employee.baseSalary <= 2500) taxRate = 0.11;
        else if (employee.baseSalary <= 3500) taxRate = 0.13;
        else if (employee.baseSalary <= 5000) taxRate = 0.15;
        else taxRate = 0.17;
      } else {
        taxRate = payConfig.taxRate / 100;
      }
      
      baseCalculation.taxAmount = (baseCalculation.grossSalary - baseCalculation.employeeContributions) * taxRate;
      baseCalculation.netSalary = baseCalculation.grossSalary - baseCalculation.employeeContributions - baseCalculation.taxAmount;
      
      return {
        period: period.value,
        label: period.label,
        preCalculated: baseCalculation,
        validated: false
      };
    });
    
    setPrePeriods(generatedPeriods);
    
    // Si aucune période n'est sélectionnée, sélectionner le mois actuel
    if (!selectedPeriod && generatedPeriods.length > 0) {
      const currentMonthPeriod = format(new Date(), 'MM/yyyy');
      const hasCurrent = generatedPeriods.some(p => p.period === currentMonthPeriod);
      
      if (hasCurrent) {
        setSelectedPeriod(currentMonthPeriod);
      } else {
        // Sinon, prendre la dernière période
        setSelectedPeriod(generatedPeriods[generatedPeriods.length - 1].period);
      }
    }
  }, [selectedEmployee, employees, payConfig, availablePeriods, selectedPeriod]);
  
  // Générer automatiquement les bulletins quand l'employé change
  useEffect(() => {
    if (selectedEmployee && availablePeriods.length > 0) {
      generateAllPayslips();
    } else {
      setPrePeriods([]);
    }
  }, [selectedEmployee, availablePeriods, generateAllPayslips]);
  
  // Mise à jour des calculs quand on change de période
  useEffect(() => {
    if (selectedPeriod && prePeriods.length > 0) {
      const selectedPrePeriod = prePeriods.find(p => p.period === selectedPeriod);
      if (selectedPrePeriod) {
        setCalculatedValues(selectedPrePeriod.preCalculated);
      }
    }
  }, [selectedPeriod, prePeriods]);
  
  // Valider le bulletin pour une période spécifique
  const validatePayslip = (period: string) => {
    setPrePeriods(prev => prev.map(p => 
      p.period === period ? { ...p, validated: true } : p
    ));
    
    toast.success("Bulletin validé", {
      description: `Le bulletin de ${period} a été validé`
    });
  };
  
  // Générer tous les bulletins validés
  const generateAllValidatedPayslips = async () => {
    const validatedPeriods = prePeriods.filter(p => p.validated);
    
    if (validatedPeriods.length === 0) {
      toast.error("Aucun bulletin validé", {
        description: "Veuillez valider au moins un bulletin avant de générer"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Simuler la génération de tous les bulletins validés
      const newPayslips = await Promise.all(validatedPeriods.map(async (period) => {
        const employee = employees.find(emp => emp.id === selectedEmployee);
        if (!employee) return null;
        
        const company = companies.find(c => c.id === employee.companyId);
        if (!company) return null;
        
        // Calculer les dates de la période
        const [month, year] = period.period.split('/');
        const periodStart = startOfMonth(new Date(parseInt(year), parseInt(month) - 1, 1)).toISOString();
        const periodEnd = endOfMonth(new Date(parseInt(year), parseInt(month) - 1, 1)).toISOString();
        
        // Date de paiement (par défaut le 28 du mois)
        const paymentDate = new Date(parseInt(year), parseInt(month) - 1, payConfig.paymentDay);
        
        // Générer les lignes du bulletin
        const payslipLines = generatePayslipLines(
          employee,
          period.preCalculated,
          { hoursWorked: 151.67 } // Utiliser les valeurs par défaut
        );
        
        // Créer le nouveau bulletin
        const newPayslip: Payslip = {
          id: `payslip-${Date.now()}-${month}-${year}`,
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          companyId: company.id,
          companyName: company.name,
          month: parseInt(month),
          year: parseInt(year),
          periodStart,
          periodEnd,
          paymentDate: paymentDate.toISOString(),
          baseSalary: employee.baseSalary,
          grossSalary: period.preCalculated.grossSalary,
          netSalary: period.preCalculated.netSalary,
          hoursWorked: 151.67,
          status: 'draft',
          payslipLines,
          additionalInfo: {
            taxRate: payConfig.taxRate,
            overtimeHours: 0,
            bonusAmount: 0,
            absenceDays: 0,
            paidLeaveDays: 0,
            sickLeaveDays: 0
          },
          createdAt: new Date().toISOString()
        };
        
        return newPayslip;
      }));
      
      // Filtrer les bulletins nuls
      const validPayslips = newPayslips.filter(p => p !== null) as Payslip[];
      
      // Ajouter tous les bulletins à la liste existante
      const updatedPayslips = [...validPayslips, ...payslips];
      setPayslips(updatedPayslips);
      
      // Sauvegarder dans localStorage
      localStorage.setItem('payslips', JSON.stringify(updatedPayslips));
      
      toast.success("Bulletins générés", {
        description: `${validPayslips.length} bulletins ont été générés avec succès`
      });
      
      // Rediriger vers la page des bulletins
      router.push('/dashboard/payslips');
      
    } catch (error) {
      console.error("Erreur lors de la génération des bulletins:", error);
      toast.error("Erreur", {
        description: `Impossible de générer les bulletins: ${error instanceof Error ? error.message : "Erreur inconnue"}`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Générer les lignes du bulletin de paie (décomposition des cotisations)
  const generatePayslipLines = (
    employee: Employee, 
    calculation: any, 
    options: any
  ): PayslipLine[] => {
    const lines: PayslipLine[] = [];
    let order = 1;
    
    // Salaire de base
    lines.push({
      id: `line-${Date.now()}-${order}`,
      code: "SALBASE",
      label: "Salaire de base",
      base: options.hoursWorked,
      rate: employee.baseSalary / 151.67,
      employeeAmount: employee.baseSalary,
      employerAmount: 0,
      type: "earning",
      category: "base",
      order: order++
    });
    
    // Heures supplémentaires
    if (options.overtimeHours > 0) {
      lines.push({
        id: `line-${Date.now()}-${order}`,
        code: "HSUP",
        label: "Heures supplémentaires (25%)",
        base: options.overtimeHours,
        rate: (employee.baseSalary / 151.67) * 1.25,
        employeeAmount: calculation.overtimePay,
        employerAmount: 0,
        type: "earning",
        category: "base",
        order: order++
      });
    }
    
    // Prime/bonus
    if (options.bonusAmount > 0) {
      lines.push({
        id: `line-${Date.now()}-${order}`,
        code: "PRIME",
        label: "Prime exceptionnelle",
        base: 1,
        rate: options.bonusAmount,
        employeeAmount: options.bonusAmount,
        employerAmount: 0,
        type: "earning",
        category: "base",
        order: order++
      });
    }
    
    // Absences
    if (options.absenceDays > 0) {
      lines.push({
        id: `line-${Date.now()}-${order}`,
        code: "ABS",
        label: "Absences non rémunérées",
        base: options.absenceDays,
        rate: -1 * (employee.baseSalary / 22), // Approximation: 1 jour = 1/22 du salaire mensuel
        employeeAmount: -1 * calculation.absenceDeduction,
        employerAmount: 0,
        type: "deduction",
        category: "other",
        order: order++
      });
    }
    
    // Total brut
    lines.push({
      id: `line-${Date.now()}-${order}`,
      code: "BRUT",
      label: "TOTAL BRUT",
      base: 0,
      rate: 0,
      employeeAmount: calculation.grossSalary,
      employerAmount: 0,
      type: "total",
      category: "base",
      order: order++
    });
    
    // Cotisation santé
    const healthAmount = calculation.grossSalary * (payConfig.healthInsuranceRate / 100);
    lines.push({
      id: `line-${Date.now()}-${order}`,
      code: "SANTE",
      label: "Assurance maladie",
      base: calculation.grossSalary,
      rate: payConfig.healthInsuranceRate / 100,
      employeeAmount: -1 * healthAmount,
      employerAmount: -1 * (healthAmount * 1.7), // Côté employeur plus élevé
      type: "contribution",
      category: "health",
      order: order++
    });
    
    // Cotisation retraite
    const retirementAmount = calculation.grossSalary * (payConfig.retirementRate / 100);
    lines.push({
      id: `line-${Date.now()}-${order}`,
      code: "RETR",
      label: "Retraite",
      base: calculation.grossSalary,
      rate: payConfig.retirementRate / 100,
      employeeAmount: -1 * retirementAmount,
      employerAmount: -1 * (retirementAmount * 1.6), // Côté employeur plus élevé
      type: "contribution",
      category: "retirement",
      order: order++
    });
    
    // Cotisation chômage
    const unemploymentAmount = calculation.grossSalary * (payConfig.unemploymentRate / 100);
    lines.push({
      id: `line-${Date.now()}-${order}`,
      code: "CHOM",
      label: "Assurance chômage",
      base: calculation.grossSalary,
      rate: payConfig.unemploymentRate / 100,
      employeeAmount: -1 * unemploymentAmount,
      employerAmount: -1 * (unemploymentAmount * 2.5), // Côté employeur plus élevé
      type: "contribution",
      category: "unemployment",
      order: order++
    });
    
    // Total des cotisations
    lines.push({
      id: `line-${Date.now()}-${order}`,
      code: "TOTCOT",
      label: "TOTAL COTISATIONS",
      base: 0,
      rate: 0,
      employeeAmount: -1 * calculation.employeeContributions,
      employerAmount: -1 * calculation.employerContributions,
      type: "total",
      category: "other",
      order: order++
    });
    
    // Impôt sur le revenu
    lines.push({
      id: `line-${Date.now()}-${order}`,
      code: "IR",
      label: "Impôt sur le revenu",
      base: calculation.grossSalary - calculation.employeeContributions,
      rate: calculation.taxAmount / (calculation.grossSalary - calculation.employeeContributions),
      employeeAmount: -1 * calculation.taxAmount,
      employerAmount: 0,
      type: "deduction",
      category: "tax",
      order: order++
    });
    
    // Net à payer
    lines.push({
      id: `line-${Date.now()}-${order}`,
      code: "NET",
      label: "NET À PAYER",
      base: 0,
      rate: 0,
      employeeAmount: calculation.netSalary,
      employerAmount: 0,
      type: "total",
      category: "other",
      order: order++
    });
    
    return lines;
  };
  
  // Formatage des valeurs monétaires
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  // Calcul des lignes du bulletin pour le tableau de prévisualisation
  const payslipTableLines = React.useMemo(() => {
    if (!selectedEmployee || employees.length === 0) return [];
    
    const employee = employees.find(e => e.id === selectedEmployee);
    if (!employee) return [];
    
    // Utiliser les valeurs déjà calculées
    const calculation = {
      grossSalary: calculatedValues.grossSalary,
      employeeContributions: calculatedValues.employeeContributions,
      employerContributions: calculatedValues.employerContributions,
      netSalary: calculatedValues.netSalary,
      taxAmount: calculatedValues.taxAmount,
      overtimePay: payslipOptions.overtimeHours * (employee.baseSalary / 151.67) * 1.25,
      absenceDeduction: payslipOptions.absenceDays * 7 * (employee.baseSalary / 151.67)
    };
    
    return generatePayslipLines(employee, calculation, payslipOptions);
  }, [selectedEmployee, employees, calculatedValues, payslipOptions]);
  
  // Affichage de la page de chargement
  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Génération de bulletin de paie"
          description="Créez et gérez les bulletins de paie de vos employés"
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          }
        />
        <LoadingState message="Chargement des données..." />
      </PageContainer>
    );
  }

  // Si aucun employé n'est trouvé
  if (employees.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="Génération de bulletin de paie"
          description="Créez et gérez les bulletins de paie de vos employés"
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          }
        />
        <EmptyState
          title="Aucun employé trouvé"
          description="Vous devez d'abord créer des employés avant de pouvoir générer des bulletins de paie."
          action={
            <Button onClick={() => router.push('/dashboard/employees')}>
              Gérer les employés
            </Button>
          }
        />
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <PageHeader
        title="Génération de bulletin de paie"
        description="Créez et gérez les bulletins de paie de vos employés"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
            <Button variant="secondary" onClick={() => setConfigOpen(true)}>
              <Calculator className="h-4 w-4 mr-2" />
              Configuration
            </Button>
        </div>
        }
      />

      <Tabs defaultValue="configuration" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="periodes">Périodes</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
                </TabsList>
        
        <TabsContent value="configuration" className="space-y-6 mt-6">
          <form className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informations générales</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="employee">Sélectionnez un employé</Label>
                  <Select
                    value={selectedEmployee}
                    onValueChange={handleEmployeeChange}
                  >
                    <SelectTrigger id="employee">
                      <SelectValue placeholder="Sélectionner un employé" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName} ({employee.company})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  </div>
                  
                {selectedEmployee && (
                  <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
                      {(() => {
                      const employee = employees.find(e => e.id === selectedEmployee);
                      if (!employee) return null;
                        
                        return (
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Nom</span>
                            <span className="font-medium">{employee.firstName} {employee.lastName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Poste</span>
                            <span className="font-medium">{employee.position}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Statut</span>
                            <span className="font-medium">{employee.isExecutive ? 'Cadre' : 'Non-cadre'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Date d&apos;entrée</span>
                            <span className="font-medium">{employee.startDate ? format(new Date(employee.startDate), 'dd/MM/yyyy') : 'Non spécifiée'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Salaire mensuel brut</span>
                            <span className="font-medium">{formatCurrency(employee.baseSalary)}</span>
                            </div>
                          </div>
                      );
                      })()}
                    </div>
                  )}
                  </div>
                    </div>
                    
            <div className="flex justify-end">
              <Button 
                type="button" 
                onClick={() => setActiveTab("periodes")}
                disabled={!selectedEmployee}
              >
                Suivant - Gestion des périodes
              </Button>
                    </div>
          </form>
                </TabsContent>
                
        <TabsContent value="periodes" className="mt-6 space-y-6">
          <div className="border rounded-md p-6 bg-white dark:bg-slate-900">
            <h3 className="text-lg font-medium mb-4">Périodes de paie disponibles</h3>
            
            {prePeriods.length > 0 ? (
              <>
                <div className="space-y-4">
                  {!employees.find(e => e.id === selectedEmployee)?.startDate && (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                      <div className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    <div>
                          <p className="font-medium text-amber-800">Date d&apos;entrée manquante</p>
                          <p className="text-sm text-amber-700 mt-1">
                            La date d&apos;entrée de cet employé n&apos;est pas définie. Les périodes affichées sont basées sur les 12 derniers mois.
                            Pour plus de précision, veuillez <a href={`/dashboard/employees/${selectedEmployee}/edit`} className="underline font-medium">mettre à jour le profil de l&apos;employé</a>.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500 mb-4">
                    Sélectionnez les périodes à traiter et validez-les. Vous pourrez ensuite générer tous les bulletins validés.
                  </p>
                  
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Période</TableHead>
                          <TableHead>Salaire brut</TableHead>
                          <TableHead>Salaire net</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prePeriods.map((period) => (
                          <TableRow key={period.period} className={period.period === selectedPeriod ? "bg-slate-50 dark:bg-slate-800" : ""}>
                            <TableCell>
                              <div className="font-medium">{period.label}</div>
                            </TableCell>
                            <TableCell>{formatCurrency(period.preCalculated.grossSalary)}</TableCell>
                            <TableCell>{formatCurrency(period.preCalculated.netSalary)}</TableCell>
                            <TableCell>
                              {period.validated ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Validé
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  En attente
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => {
                                    setSelectedPeriod(period.period);
                                    setActiveTab("preview");
                                  }}
                                >
                                  Aperçu
                                </Button>
                                
                                {!period.validated && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => validatePayslip(period.period)}
                                  >
                                    Valider
                                  </Button>
                                )}
                        </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setActiveTab("configuration")}>
                      Retour
                    </Button>
                    
                    <LoadingButton
                      onClick={generateAllValidatedPayslips}
                      isLoading={isGenerating}
                      loadingText="Génération..."
                      disabled={!prePeriods.some(p => p.validated)}
                    >
                      Générer tous les bulletins validés
                    </LoadingButton>
                  </div>
              </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {selectedEmployee ? 
                    "Aucune période disponible. Vérifiez que l'employé a une date d'entrée valide." :
                    "Veuillez d'abord sélectionner un employé pour voir les périodes disponibles."}
                </p>
                {selectedEmployee && (
                  <div className="mt-4">
                    <p className="text-sm text-amber-600 mb-3">
                      Si vous avez sélectionné un employé et ne voyez pas de périodes, il est probable que:
                    </p>
                    <ul className="text-sm text-gray-600 list-disc list-inside mb-4 text-left max-w-md mx-auto">
                      <li>La date d&apos;entrée n&apos;est pas définie pour cet employé</li>
                      <li>La date d&apos;entrée est invalide ou mal formatée</li>
                      <li>Une erreur s&apos;est produite lors du chargement des données</li>
                    </ul>
                <Button 
                  variant="outline" 
                      onClick={() => router.push(`/dashboard/employees/${selectedEmployee}/edit`)}
                >
                      Modifier le profil de l&apos;employé
                </Button>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab("configuration")}
                >
                  Retour à la configuration
                </Button>
              </div>
            )}
        </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-6">
          <div className="border rounded-md p-6 bg-white dark:bg-slate-900 space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold">BULLETIN DE SALAIRE</h2>
              {selectedEmployee && selectedPeriod && (
                <>
                  <p>
                    {(() => {
                      const employee = employees.find(e => e.id === selectedEmployee);
                      if (!employee) return null;
                      return `${employee.firstName} ${employee.lastName}`;
                    })()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Période : {(() => {
                      const [month, year] = selectedPeriod.split('/');
                      return format(new Date(parseInt(year), parseInt(month) - 1, 1), 'MMMM yyyy', { locale: fr });
                    })()}
                  </p>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">EMPLOYEUR</h3>
                <div className="text-sm space-y-1">
                  {selectedEmployee && (() => {
                    const employee = employees.find(e => e.id === selectedEmployee);
                    if (!employee) return null;
                    
                    const company = companies.find(c => c.id === employee.companyId);
                    if (!company) return null;
                    
                    return (
                      <>
                        <p>{company.name}</p>
                        {company.address && (
                          <p>{company.address}</p>
                        )}
                        {company.postalCode && company.city && (
                          <p>{company.postalCode} {company.city}</p>
                        )}
                        {company.siret && (
                          <p>SIRET : {company.siret}</p>
                        )}
                      </>
                    );
                  })()}
                </div>
                  </div>
              
              <div>
                <h3 className="font-medium mb-2">SALARIÉ</h3>
                <div className="text-sm space-y-1">
                  {selectedEmployee && (() => {
                    const employee = employees.find(e => e.id === selectedEmployee);
                    if (!employee) return null;
                    
                    return (
                      <>
                        <p>{employee.firstName} {employee.lastName}</p>
                        <p>Emploi : {employee.position}</p>
                        <p>Statut : {employee.isExecutive ? 'Cadre' : 'Non-cadre'}</p>
                        <p>Date d&apos;entrée : {employee.startDate ? format(new Date(employee.startDate), 'dd/MM/yyyy') : 'Non spécifiée'}</p>
                      </>
                    );
                  })()}
                    </div>
                    </div>
                </div>
            
            <div className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rubrique</TableHead>
                    <TableHead className="text-right">Base</TableHead>
                    <TableHead className="text-right">Taux</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Part employeur</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedEmployee && employees.length > 0 && payslipTableLines.map(line => (
                    <TableRow key={line.id} className={line.type === 'total' ? 'font-bold' : ''}>
                      <TableCell>{line.label}</TableCell>
                      <TableCell className="text-right">
                        {line.base > 0 ? line.base.toFixed(2) : ''}
                      </TableCell>
                      <TableCell className="text-right">
                        {line.rate > 0 ? (line.rate * 100).toFixed(2) + '%' : ''}
                      </TableCell>
                      <TableCell className="text-right">
                        {line.employeeAmount >= 0 
                          ? formatCurrency(line.employeeAmount) 
                          : `- ${formatCurrency(Math.abs(line.employeeAmount))}`}
                      </TableCell>
                      <TableCell className="text-right">
                        {line.employerAmount < 0 
                          ? `- ${formatCurrency(Math.abs(line.employerAmount))}` 
                          : line.employerAmount > 0 
                            ? formatCurrency(line.employerAmount) 
                            : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
              
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-medium mb-2">CUMULS ANNÉE</h3>
                <div className="text-sm space-y-2">
                <div className="flex justify-between">
                    <span>Brut imposable</span>
                    <span>{formatCurrency(calculatedValues.grossSalary)}</span>
                </div>
                  <div className="flex justify-between">
                    <span>Net imposable</span>
                    <span>{formatCurrency(calculatedValues.netSalary)}</span>
              </div>
                <div className="flex justify-between">
                    <span>Total cotisations</span>
                    <span>{formatCurrency(calculatedValues.employeeContributions)}</span>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-medium mb-2">CONGÉS</h3>
                <div className="text-sm space-y-2">
                <div className="flex justify-between">
                    <span>Congés acquis</span>
                    <span>2.5 jours</span>
                </div>
                  <div className="flex justify-between">
                    <span>Congés pris</span>
                    <span>{payslipOptions.paidLeaveDays} jours</span>
              </div>
                  <div className="flex justify-between">
                    <span>Solde restant</span>
                    <span>21.5 jours</span>
              </div>
              </div>
            </div>
          </div>
            
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Document non contractuel - Simulation</p>
        </div>
      </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
} 