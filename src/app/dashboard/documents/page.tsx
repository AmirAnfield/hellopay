"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  FileText, 
  Download, 
  Check, 
  FileBadge,
  Plus,
  AlertCircle,
  FileSignature,
  Eye,
  ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  PageContainer, 
  PageHeader, 
  EmptyState, 
  LoadingState
} from "@/components/shared/PageContainer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LoadingButton } from "@/components/shared/LoadingButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useSearchParams } from "next/navigation";

// Types pour les documents
interface Document {
  id: string;
  type: 'attestation' | 'contrat' | 'autre';
  title: string;
  date: Date;
  employeeName: string;
  companyName: string;
  status: 'generated' | 'pending' | 'validated' | 'draft' | 'signed' | 'archived';
  pdfUrl?: string;
  config?: {
    showSalary: boolean;
    salaryType: 'monthly' | 'annual';
    salaryAmount: number;
    startDate: string;
    position: string;
    contractType: string;
    noEndDate: boolean;
  };
  contractConfig?: {
    employeeId: string;
    companyId: string;
    type: 'CDI' | 'CDD';
    startDate: string;
    endDate?: string;
    trialPeriodEndDate?: string;
    isFullTime: boolean;
    monthlyHours: number;
    baseSalary: number;
    conventions?: string[];
    specificClauses?: string[];
  };
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  companyId: string;
  company: string;
  startDate: string;
  position: string;
  baseSalary: number;
}

interface Company {
  id: string;
  name: string;
}

type EmployeeData = Record<string, unknown>;
type DocumentData = Record<string, unknown>;

export default function DocumentsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [documentType, setDocumentType] = useState<'attestation' | 'contrat' | 'autre'>('attestation');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Configuration de l'attestation
  const [showSalary, setShowSalary] = useState(false);
  const [salaryType, setSalaryType] = useState<'monthly' | 'annual'>('monthly');
  const [salaryAmount, setSalaryAmount] = useState<number>(0);
  const [position, setPosition] = useState("");
  const [startDate, setStartDate] = useState("");
  const [contractType, setContractType] = useState("CDI");
  const [noEndDate, setNoEndDate] = useState(true);

  // Configuration des contrats
  const [isFullTime, setIsFullTime] = useState(true);
  const [monthlyHours, setMonthlyHours] = useState(151.67); // 35h hebdo par défaut
  const [endDate, setEndDate] = useState("");
  const [trialPeriodEndDate, setTrialPeriodEndDate] = useState("");
  const [conventions, setConventions] = useState<string[]>([]);
  const [specificClauses, setSpecificClauses] = useState<string[]>([]);

  // Vérifier les paramètres d'URL pour ouvrir le dialogue si demandé
  useEffect(() => {
    const openCreateDialog = searchParams.get('openCreateDialog');
    const requestedDocType = searchParams.get('documentType') as 'attestation' | 'contrat' | 'autre' | null;
    
    if (openCreateDialog === 'true' && requestedDocType) {
      setDocumentType(requestedDocType);
      setOpenDialog(true);
    }
  }, [searchParams]);

  // Chargement des données
  useEffect(() => {
    try {
      setIsLoading(true);
      
      // 1. Charger les entreprises depuis le localStorage
      const savedCompanies = localStorage.getItem('companies');
      const companiesList: Company[] = savedCompanies ? JSON.parse(savedCompanies) : [];
      
      // 2. Charger les employés depuis le localStorage avec les noms des entreprises
      const savedEmployees = localStorage.getItem('employees');
      const employeesList: EmployeeData[] = savedEmployees ? JSON.parse(savedEmployees) : [];
      
      // Enrichir les employés avec les noms d'entreprises
      const employeesWithCompanyNames = employeesList.map((emp: EmployeeData) => {
        const company = companiesList.find((c: Company) => c.id === emp.companyId);
        return {
          id: String(emp.id || ''),
          firstName: String(emp.firstName || ''),
          lastName: String(emp.lastName || ''),
          companyId: String(emp.companyId || ''),
          company: company ? company.name : 'Entreprise inconnue',
          startDate: String(emp.startDate || ''),
          position: String(emp.position || ''),
          baseSalary: Number(emp.baseSalary || 0)
        } as Employee;
      });
      
      setEmployees(employeesWithCompanyNames);
      
      // 3. Charger les documents depuis le localStorage
      const savedDocs = localStorage.getItem('userDocuments');
      const parsedDocs: DocumentData[] = savedDocs ? JSON.parse(savedDocs) : [];
      
      // Convertir les dates de string à Date
      const documentsList = parsedDocs.map((doc: DocumentData) => ({
        id: String(doc.id || ''),
        type: (doc.type || 'autre') as 'attestation' | 'contrat' | 'autre',
        title: String(doc.title || ''),
        date: new Date(doc.date ? String(doc.date) : Date.now()),
        employeeName: String(doc.employeeName || ''),
        companyName: String(doc.companyName || ''),
        status: (doc.status || 'draft') as 'generated' | 'pending' | 'validated' | 'draft' | 'signed' | 'archived',
        pdfUrl: doc.pdfUrl ? String(doc.pdfUrl) : undefined,
        config: doc.config as Document['config']
      }));
      
      // N'afficher que les documents créés par l'utilisateur (avec ID commençant par 'doc-')
      const userDocuments = documentsList.filter(doc => doc.id.startsWith('doc-'));
      
      setDocuments(userDocuments);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError("Impossible de charger les données. Veuillez réessayer.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Filtrer les documents selon l'onglet actif
  const filteredDocuments = documents.filter(doc => {
    if (activeTab === "all") return true;
    if (activeTab === "attestations") return doc.type === "attestation";
    if (activeTab === "contrats") return doc.type === "contrat";
    if (activeTab === "autres") return doc.type === "autre";
    return true;
  });

  // Obtenir le document sélectionné pour les détails
  const selectedDocument = selectedDocId ? documents.find(d => d.id === selectedDocId) : null;

  // Mettre à jour les champs du formulaire lorsqu'un employé est sélectionné
  useEffect(() => {
    if (selectedEmployee) {
      const employee = employees.find(e => e.id === selectedEmployee);
      if (employee) {
        setPosition(employee.position);
        setStartDate(employee.startDate);
        setSalaryAmount(employee.baseSalary);
      }
    }
  }, [selectedEmployee, employees]);

  // Gérer le click sur voir les détails
  const handleViewDetails = (docId: string) => {
    setSelectedDocId(docId);
    setDetailsOpen(true);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setSelectedEmployee("");
    setShowSalary(false);
    setSalaryType('monthly');
    setSalaryAmount(0);
    setPosition("");
    setStartDate("");
    setContractType("CDI");
    setNoEndDate(true);
    setDocumentType('attestation');
    // Champs spécifiques aux contrats
    setIsFullTime(true);
    setMonthlyHours(151.67);
    setEndDate("");
    setTrialPeriodEndDate("");
    setConventions([]);
    setSpecificClauses([]);
  };

  // Générer un nouveau document PDF et ouvrir dans un nouvel onglet
  const generatePdf = (doc: Document) => {
    // Construire l'URL avec tous les paramètres nécessaires
    const params = new URLSearchParams();
    
    // Paramètres communs
    params.append('id', doc.id);
    params.append('type', doc.type);
    params.append('employeeName', doc.employeeName);
    params.append('companyName', doc.companyName);
    
    // Paramètres spécifiques selon le type de document
    if (doc.type === 'attestation' && doc.config) {
      params.append('position', doc.config.position);
      params.append('startDate', doc.config.startDate);
      params.append('contractType', doc.config.contractType);
      params.append('noEndDate', doc.config.noEndDate.toString());
      
      if (doc.config.showSalary) {
        params.append('showSalary', 'true');
        params.append('salaryType', doc.config.salaryType);
        params.append('salaryAmount', doc.config.salaryAmount.toString());
      } else {
        params.append('showSalary', 'false');
      }
    } 
    else if (doc.type === 'contrat' && doc.contractConfig) {
      params.append('position', doc.config?.position || '');
      params.append('startDate', doc.contractConfig.startDate);
      params.append('contractType', doc.contractConfig.type);
      params.append('salaryAmount', doc.contractConfig.baseSalary.toString());
      
      if (doc.contractConfig.endDate) {
        params.append('endDate', doc.contractConfig.endDate);
      }
      
      if (doc.contractConfig.trialPeriodEndDate) {
        params.append('trialPeriodEndDate', doc.contractConfig.trialPeriodEndDate);
      }
      
      params.append('isFullTime', doc.contractConfig.isFullTime.toString());
      params.append('monthlyHours', doc.contractConfig.monthlyHours.toString());
    }
    
    // Ouvrir le PDF dans un nouvel onglet
    window.open(`/api/generate-pdf?${params.toString()}`, '_blank');
  };

  // Générer une nouvelle attestation ou contrat
  const handleGenerateDocument = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Empêcher toute navigation par défaut
    if (e) e.preventDefault();
    
    if (!selectedEmployee) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un employé."
      });
      return;
    }
    
    // Vérifier si l'employé a une date d'entrée définie
    const employee = employees.find(emp => emp.id === selectedEmployee);
    if (employee && !employee.startDate) {
      toast({
        variant: "warning",
        title: "Attention",
        description: "L'employé n'a pas de date d'entrée définie. Cela peut causer des problèmes pour les bulletins de paie."
      });
      
      // Demander confirmation avant de continuer
      if (!confirm("L'employé n'a pas de date d'entrée. Voulez-vous continuer quand même ou mettre à jour le profil de l'employé d'abord?")) {
        // Rediriger vers la page de modification de l'employé
        window.location.href = `/dashboard/employees/${selectedEmployee}/edit`;
        return;
      }
    }
    
    setIsGenerating(true);
    
    try {
      // Simuler la génération
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const employee = employees.find(emp => emp.id === selectedEmployee);
      
      if (!employee) throw new Error("Employé non trouvé");
      
      const company = companies.find(c => c.id === employee.companyId);
      
      if (!company) throw new Error("Entreprise non trouvée");
      
      let title = '';
      if (documentType === 'attestation') title = 'Attestation de travail';
      else if (documentType === 'contrat') title = `Contrat de travail - ${contractType}`;
      else title = 'Document';
      
      // Créer un nouveau document
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        type: documentType,
        title,
        date: new Date(),
        employeeName: `${employee.firstName} ${employee.lastName}`,
        companyName: employee.company,
        status: 'generated',
        pdfUrl: `/api/generate-pdf?id=doc-${Date.now()}&type=${documentType}` // URL vers notre API
      };
      
      // Ajouter la configuration spécifique selon le type de document
      if (documentType === 'attestation') {
        newDoc.config = {
          showSalary,
          salaryType,
          salaryAmount,
          startDate,
          position,
          contractType,
          noEndDate
        };
      } else if (documentType === 'contrat') {
        newDoc.contractConfig = {
          employeeId: employee.id,
          companyId: employee.companyId,
          type: contractType as 'CDI' | 'CDD',
          startDate,
          endDate: endDate || undefined,
          trialPeriodEndDate: trialPeriodEndDate || undefined,
          isFullTime,
          monthlyHours,
          baseSalary: salaryAmount,
          conventions,
          specificClauses
        };
      }
      
      // Mettre à jour l'état local
      const updatedDocs = [newDoc, ...documents];
      setDocuments(updatedDocs);
      
      // Sauvegarder dans localStorage pour la persistance
      // Convertir les dates en strings pour le stockage
      const docsToSave = updatedDocs.map(doc => ({
        ...doc,
        date: doc.date.toISOString()
      }));
      localStorage.setItem('userDocuments', JSON.stringify(docsToSave));
      
      toast({
        title: "Document généré",
        description: `${title} pour ${newDoc.employeeName} généré avec succès.`,
      });
      
      setOpenDialog(false);
      
      // Réinitialiser les champs de configuration
      resetForm();
      
      // Ouvrir le PDF généré
      generatePdf(newDoc);
    } catch (err) {
      console.error("Erreur lors de la génération du document:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer le document. Veuillez réessayer."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Afficher un badge selon le statut du document
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return <Badge variant="default" className="flex gap-1 items-center"><Check className="h-3 w-3" /> Généré</Badge>;
      case 'pending':
        return <Badge variant="outline" className="flex gap-1 items-center">En attente</Badge>;
      case 'validated':
        return <Badge variant="secondary" className="flex gap-1 items-center"><Check className="h-3 w-3" /> Validé</Badge>;
      case 'draft':
        return <Badge variant="outline" className="flex gap-1 items-center">Brouillon</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Icône pour le type de document
  const renderDocTypeIcon = (type: string) => {
    switch (type) {
      case 'attestation':
        return <FileBadge className="h-5 w-5 text-amber-500" />;
      case 'contrat':
        return <FileSignature className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  // Gérer le click sur les éléments du menu dropdown
  const handleDocumentTypeSelect = (type: 'attestation' | 'contrat' | 'autre', e: React.MouseEvent) => {
    // Empêcher toute navigation par défaut
    e.preventDefault();
    e.stopPropagation();
    
    // Définir le type de document et ouvrir la boîte de dialogue
    setDocumentType(type);
    setOpenDialog(true);
  };

  // Si une erreur est survenue lors du chargement
  if (error) {
    return (
      <PageContainer>
        <PageHeader
          title="Documents"
          description="Gérez vos documents"
        />
        <EmptyState
          title="Erreur de chargement"
          description={error}
          icon={AlertCircle}
          action={
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Documents"
        description="Générez et consultez vos documents"
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer un document
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-950">
              <DropdownMenuItem onClick={(e) => handleDocumentTypeSelect('attestation', e)}>
                <FileBadge className="h-4 w-4 mr-2" />
                Attestation de travail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleDocumentTypeSelect('contrat', e)}>
                <FileSignature className="h-4 w-4 mr-2" />
                Contrat de travail
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => handleDocumentTypeSelect('autre', e)}>
                <FileText className="h-4 w-4 mr-2" />
                Autre document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Formulaire de création de document */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {documentType === 'attestation' ? 'Créer une attestation de travail' :
               documentType === 'contrat' ? 'Créer un contrat de travail' :
               'Créer un document'}
            </DialogTitle>
            <DialogDescription>
              Configurez les détails du document pour l&apos;employé sélectionné
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Employé</Label>
              <Select
                value={selectedEmployee}
                onValueChange={setSelectedEmployee}
              >
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  {employees.length > 0 ? (
                    employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName} ({employee.company})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-employees" disabled>
                      Aucun employé trouvé. Veuillez en créer d&apos;abord.
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {employees.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Vous n&apos;avez pas encore créé d&apos;employé. Veuillez d&apos;abord ajouter un employé dans la section Employés.
                </p>
              )}
            </div>

            <Separator />

            {/* Contenu du dialogue selon le type de document */}
            {documentType === 'attestation' ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="employee" className="text-right">
                    Employé
                  </Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner un employé" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="position" className="text-right">
                    Poste
                  </Label>
                  <Input
                    id="position"
                    className="col-span-3"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date d&apos;entrée
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    className="col-span-3"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contractType" className="text-right">
                    Type de contrat
                  </Label>
                  <Select
                    value={contractType}
                    onValueChange={setContractType}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Type de contrat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="showSalary" className="text-right">
                    Afficher salaire
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Switch
                      id="showSalary"
                      checked={showSalary}
                      onCheckedChange={setShowSalary}
                    />
                    <Label htmlFor="showSalary">
                      {showSalary ? "Oui" : "Non"}
                    </Label>
                  </div>
                </div>
                
                {showSalary && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="salaryType" className="text-right">
                        Type de salaire
                      </Label>
                      <Select
                        value={salaryType}
                        onValueChange={(value) => setSalaryType(value as 'monthly' | 'annual')}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Type de salaire" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensuel</SelectItem>
                          <SelectItem value="annual">Annuel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="salaryAmount" className="text-right">
                        Montant brut
                      </Label>
                      <Input
                        id="salaryAmount"
                        type="number"
                        className="col-span-3"
                        value={salaryAmount}
                        onChange={(e) => setSalaryAmount(parseFloat(e.target.value))}
                      />
                    </div>
                  </>
                )}
                
                {contractType === 'CDD' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="noEndDate" className="text-right">
                      Sans date de fin
                    </Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Switch
                        id="noEndDate"
                        checked={noEndDate}
                        onCheckedChange={setNoEndDate}
                      />
                      <Label htmlFor="noEndDate">
                        {noEndDate ? "Oui" : "Non"}
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            ) : documentType === 'contrat' ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="employee" className="text-right">
                    Employé
                  </Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner un employé" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="position" className="text-right">
                    Poste
                  </Label>
                  <Input
                    id="position"
                    className="col-span-3"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">
                    Date d&apos;entrée
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    className="col-span-3"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contractType" className="text-right">
                    Type de contrat
                  </Label>
                  <Select
                    value={contractType}
                    onValueChange={setContractType}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Type de contrat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {contractType === 'CDD' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endDate" className="text-right">
                      Date de fin
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      className="col-span-3"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="trialPeriodEndDate" className="text-right">
                    Fin période d&apos;essai
                  </Label>
                  <Input
                    id="trialPeriodEndDate"
                    type="date"
                    className="col-span-3"
                    value={trialPeriodEndDate}
                    onChange={(e) => setTrialPeriodEndDate(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isFullTime" className="text-right">
                    Temps plein
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Switch
                      id="isFullTime"
                      checked={isFullTime}
                      onCheckedChange={setIsFullTime}
                    />
                    <Label htmlFor="isFullTime">
                      {isFullTime ? "Oui" : "Non"}
                    </Label>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="monthlyHours" className="text-right">
                    Heures mensuelles
                  </Label>
                  <Input
                    id="monthlyHours"
                    type="number"
                    className="col-span-3"
                    value={monthlyHours}
                    onChange={(e) => setMonthlyHours(parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="salaryAmount" className="text-right">
                    Salaire brut mensuel
                  </Label>
                  <Input
                    id="salaryAmount"
                    type="number"
                    className="col-span-3"
                    value={salaryAmount}
                    onChange={(e) => setSalaryAmount(parseFloat(e.target.value))}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="employee" className="text-right">
                    Employé
                  </Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner un employé" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="py-2 text-center text-sm text-muted-foreground">
                  Cette fonctionnalité est en développement...
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Annuler
            </Button>
            <LoadingButton 
              onClick={handleGenerateDocument}
              isLoading={isGenerating}
              loadingText="Génération..."
              disabled={employees.length === 0 || !selectedEmployee}
            >
              Générer le document
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue pour les détails */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          {selectedDocument && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {renderDocTypeIcon(selectedDocument.type)}
                  {selectedDocument.title}
                </DialogTitle>
                <DialogDescription>
                  Créé le {format(new Date(selectedDocument.date), 'dd MMMM yyyy', { locale: fr })}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Employé</h4>
                    <p className="text-sm">{selectedDocument.employeeName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Entreprise</h4>
                    <p className="text-sm">{selectedDocument.companyName}</p>
                  </div>
                </div>
                
                <Separator />
                
                {selectedDocument.config && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Poste</h4>
                        <p className="text-sm">{selectedDocument.config.position}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Date d&apos;entrée</h4>
                        <p className="text-sm">{
                          selectedDocument.config.startDate ? 
                          format(new Date(selectedDocument.config.startDate), 'dd/MM/yyyy') : 
                          'Non spécifiée'
                        }</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Type de contrat</h4>
                        <p className="text-sm">{selectedDocument.config.contractType}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Contrat en cours</h4>
                        <p className="text-sm">{selectedDocument.config.noEndDate ? 'Oui' : 'Non'}</p>
                      </div>
                    </div>
                    
                    {selectedDocument.config.showSalary && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Salaire {selectedDocument.config.salaryType === 'monthly' ? 'mensuel' : 'annuel'}</h4>
                        <p className="text-sm">{selectedDocument.config.salaryAmount.toLocaleString()} €</p>
                      </div>
                    )}
                  </>
                )}
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Statut:</span>
                    {renderStatusBadge(selectedDocument.status)}
                  </div>
                  {selectedDocument.pdfUrl && (
                    <Button onClick={() => generatePdf(selectedDocument)}>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Mes documents</CardTitle>
              <CardDescription>
                Consultez et gérez vos documents
              </CardDescription>
            </div>
            <Tabs 
              defaultValue="all" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full max-w-[400px]"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="attestations">Attestations</TabsTrigger>
                <TabsTrigger value="contrats">Contrats</TabsTrigger>
                <TabsTrigger value="autres">Autres</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState message="Chargement des documents..." />
          ) : filteredDocuments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Employé</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {renderDocTypeIcon(doc.type)}
                        <span className="font-medium">{doc.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{doc.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{doc.companyName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(doc.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(doc.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetails(doc.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {doc.pdfUrl && (
                          <Button variant="ghost" size="icon" onClick={() => generatePdf(doc)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Aucun document"
              description="Vous n'avez pas encore généré de document."
              icon={FileText}
              action={
                <Button onClick={() => setOpenDialog(true)} disabled={employees.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un document
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
} 