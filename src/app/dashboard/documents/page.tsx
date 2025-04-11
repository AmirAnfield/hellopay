"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
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
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";

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

export default function DocumentsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  
  // États pour le formulaire de création de contrat
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [contractType, setContractType] = useState<string>("CDI");
  const [contractFormStep, setContractFormStep] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>("");
  const [baseSalary, setBaseSalary] = useState<string>("");

  // Fonction pour créer un nouveau contrat
  const createContract = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Rediriger vers la page de création de contrat
    window.location.href = "/dashboard/contracts/create";
  };

  // Fonction pour passer à l'étape suivante
  const goToNextStep = () => {
    if (contractFormStep === 1) {
      if (!selectedCompany || !selectedEmployee) {
        toast({
          title: "Sélection incomplète",
          description: "Veuillez sélectionner une entreprise et un employé.",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (contractFormStep < 2) {
      setContractFormStep(contractFormStep + 1);
    } else {
      // Soumettre le formulaire complet
      handleContractSubmit();
    }
  };
  
  // Fonction pour revenir à l'étape précédente
  const goToPreviousStep = () => {
    if (contractFormStep > 1) {
      setContractFormStep(contractFormStep - 1);
    }
  };
  
  // Fonction pour soumettre le formulaire de contrat
  const handleContractSubmit = () => {
    // Pour l'instant, juste afficher un message
    toast({
      title: "Formulaire soumis",
      description: "La fonctionnalité de création complète sera disponible prochainement."
    });
    setContractDialogOpen(false);
  };

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.uid) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const userId = user.uid;
        const companiesList: Company[] = [];
        const employeesList: Employee[] = [];
        const documentsList: Document[] = [];
        
        // 1. Charger les entreprises depuis Firestore
        try {
          const companiesRef = collection(db, `users/${userId}/companies`);
          const companiesSnapshot = await getDocs(companiesRef);
          
          companiesSnapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.isArchived) {
              companiesList.push({
                id: doc.id,
                name: data.name || 'Entreprise sans nom'
              });
            }
          });
          
          setCompanies(companiesList);
        } catch (error) {
          console.error("Erreur lors de la récupération des entreprises:", error);
        }
        
        // 2. Charger les employés depuis Firestore
        try {
          const employeesRef = collection(db, `users/${userId}/employees`);
          const employeesSnapshot = await getDocs(employeesRef);
          
          employeesSnapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.isArchived) {
              const company = companiesList.find(c => c.id === data.companyId);
              employeesList.push({
                id: doc.id,
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                companyId: data.companyId || '',
                company: company ? company.name : 'Entreprise inconnue',
                startDate: data.startDate || data.hiringDate || '',
                position: data.position || '',
                baseSalary: Number(data.baseSalary || 0)
              });
            }
          });
          
          setEmployees(employeesList);
        } catch (error) {
          console.error("Erreur lors de la récupération des employés:", error);
        }
        
        // 3. Charger les documents depuis Firestore
        try {
          const documentsRef = collection(db, `users/${userId}/documents`);
          const documentsSnapshot = await getDocs(documentsRef);
          
          if (!documentsSnapshot.empty) {
            documentsSnapshot.forEach((doc) => {
              const data = doc.data();
              documentsList.push({
                id: doc.id,
                type: (data.type || 'autre') as 'attestation' | 'contrat' | 'autre',
                title: data.title || '',
                date: data.date ? new Date(data.date.toDate ? data.date.toDate() : data.date) : new Date(),
                employeeName: data.employeeName || '',
                companyName: data.companyName || '',
                status: (data.status || 'draft') as 'generated' | 'pending' | 'validated' | 'draft' | 'signed' | 'archived',
                pdfUrl: data.pdfUrl || undefined
              });
            });
          }
          
          setDocuments(documentsList);
        } catch (err) {
          console.error("Erreur lors du chargement des documents:", err);
        }
        
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
    };
    
    fetchData();
  }, [toast, user]);

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

  // Gérer le click sur voir les détails
  const handleViewDetails = (docId: string) => {
    setSelectedDocId(docId);
    setDetailsOpen(true);
  };
  
  // Reprendre l'édition d'un brouillon
  const resumeEditingDraft = (docId: string) => {
    window.location.href = `/dashboard/contracts/edit/${docId}`;
  };

  // Gérer le click sur les éléments du menu dropdown
  const handleDocumentTypeSelect = (type: 'attestation' | 'contrat' | 'autre', e: React.MouseEvent) => {
    // Empêcher toute navigation par défaut
    e.preventDefault();
    e.stopPropagation();
    
    // Pour l'instant, juste afficher un message
    toast({
      title: "Fonctionnalité à venir",
      description: "La création de documents sera bientôt disponible"
    });
  };

  // Afficher un badge selon le statut du document
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return <Badge variant="secondary" className="flex gap-1 items-center bg-green-50 text-green-600 hover:bg-green-50 hover:text-green-600"><Check className="h-3 w-3" /> Généré</Badge>;
      case 'pending':
        return <Badge variant="outline" className="flex gap-1 items-center">En attente</Badge>;
      case 'validated':
        return <Badge variant="secondary" className="flex gap-1 items-center bg-blue-50 text-blue-600 hover:bg-blue-50 hover:text-blue-600"><Check className="h-3 w-3" /> Validé</Badge>;
      case 'draft':
        return <Badge variant="outline" className="flex gap-1 items-center text-gray-500">Brouillon</Badge>;
      case 'signed':
        return <Badge variant="secondary" className="flex gap-1 items-center bg-amber-50 text-amber-600 hover:bg-amber-50 hover:text-amber-600"><Check className="h-3 w-3" /> Signé</Badge>;
      case 'archived':
        return <Badge variant="outline" className="flex gap-1 items-center text-gray-400">Archivé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Icône selon le type de document
  const renderDocTypeIcon = (type: string) => {
    switch (type) {
      case 'attestation':
        return <FileBadge className="h-4 w-4 text-amber-500" />;
      case 'contrat':
        return <FileSignature className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
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
        description="Gérez tous vos documents et attestations"
        actions={
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="h-8 px-3">
                  <Plus className="h-4 w-4 mr-1" />
                  Créer un document
                  <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Type de document</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => handleDocumentTypeSelect('attestation', e)}>
                  <FileBadge className="mr-2 h-4 w-4 text-amber-500" />
                  <span>Attestation de travail</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleDocumentTypeSelect('contrat', e)}>
                  <FileSignature className="mr-2 h-4 w-4 text-blue-500" />
                  <span>Contrat de travail</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleDocumentTypeSelect('autre', e)}>
                  <FileText className="mr-2 h-4 w-4 text-gray-500" />
                  <span>Autre document</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {/* Cartes d'actions rapides */}
      <div className="grid gap-4 mb-6 grid-cols-1 md:grid-cols-3">
        {/* Créer un document */}
        <Card className="shadow-sm border border-gray-100 hover:border-gray-200 transition-colors">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <FileSignature className="h-4 w-4 mr-2 text-blue-500" />
              Créer un contrat
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Reliez une entreprise à un employé avec un contrat de travail
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Button 
              size="sm" 
              className="w-full text-xs"
              onClick={createContract}
            >
              Nouveau contrat
            </Button>
            <div className="mt-2">
              <Button
                variant="link"
                size="sm"
                className="text-xs p-0 h-auto"
                asChild
              >
                <Link href="/dashboard/documents/contracts">
                  Voir tous les contrats
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configurer un document */}
        <Card className="shadow-sm border border-gray-100 hover:border-gray-200 transition-colors">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <FileBadge className="h-4 w-4 mr-2 text-amber-500" />
              Configurer des documents
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Personnalisez vos attestations selon vos besoins
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sm pl-0 font-normal text-muted-foreground hover:text-foreground" 
              onClick={(e) => handleDocumentTypeSelect('attestation', e)}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Configurer une attestation
            </Button>
          </CardContent>
        </Card>

        {/* Générer des documents */}
        <Card className="shadow-sm border border-gray-100 hover:border-gray-200 transition-colors">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Download className="h-4 w-4 mr-2 text-green-500" />
              Générer des documents
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Créez des PDF prêts pour signature et validation
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sm pl-0 font-normal text-muted-foreground hover:text-foreground"
              onClick={(e) => handleDocumentTypeSelect('autre', e)}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Télécharger un document
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start space-y-0">
            <div>
              <CardTitle className="text-lg font-medium">Documents disponibles</CardTitle>
              <CardDescription className="text-sm">
                Attestations, contrats et autres fichiers
              </CardDescription>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-8">
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs h-8">Tous</TabsTrigger>
                <TabsTrigger value="attestations" className="text-xs h-8">Attestations</TabsTrigger>
                <TabsTrigger value="contrats" className="text-xs h-8">Contrats</TabsTrigger>
                <TabsTrigger value="autres" className="text-xs h-8">Autres</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {isLoading ? (
            <LoadingState message="Chargement des documents..." />
          ) : filteredDocuments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[250px]">Document</TableHead>
                  <TableHead>Employé</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="h-[60px]">
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        {renderDocTypeIcon(doc.type)}
                        <span className="font-medium">{doc.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="text-sm">{doc.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{doc.companyName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(doc.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(doc.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDetails(doc.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {doc.status === 'draft' && doc.type === 'contrat' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => resumeEditingDraft(doc.id)}>
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        {doc.pdfUrl && (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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
              title="Aucun document disponible"
              description="Créez votre premier contrat de travail ou attestation pour générer automatiquement des documents officiels."
              icon={FileText}
              action={
                <Button variant="secondary" onClick={() => toast({ title: "Bientôt disponible", description: "La création de documents sera implémentée prochainement." })}>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer mon premier document
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedDocument && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {renderDocTypeIcon(selectedDocument.type)}
                  {selectedDocument.title}
                </DialogTitle>
                <DialogDescription>
                  Créé le {format(new Date(selectedDocument.date), 'dd MMMM yyyy', { locale: fr })}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-2">
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
                
                <Separator className="my-1" />
                
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Statut:</span>
                    {renderStatusBadge(selectedDocument.status)}
                  </div>
                  {selectedDocument.pdfUrl && (
                    <Button 
                      size="sm"
                      className="h-8 px-3"
                    >
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

      {/* Boîte de dialogue pour la création de contrat */}
      <Dialog open={contractDialogOpen} onOpenChange={setContractDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un contrat</DialogTitle>
            <DialogDescription>
              {contractFormStep === 1 
                ? "Reliez une entreprise à un employé avec un contrat de travail."
                : "Précisez les détails du contrat."}
            </DialogDescription>
          </DialogHeader>
          
          {/* Étape 1: Sélection de l'entreprise et de l'employé */}
          {contractFormStep === 1 && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <Select
                  value={selectedCompany}
                  onValueChange={setSelectedCompany}
                >
                  <SelectTrigger id="company">
                    <SelectValue placeholder="Sélectionner une entreprise" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employee">Employé</Label>
                <Select
                  value={selectedEmployee}
                  onValueChange={setSelectedEmployee}
                  disabled={!selectedCompany}
                >
                  <SelectTrigger id="employee">
                    <SelectValue placeholder={selectedCompany ? "Sélectionner un employé" : "Sélectionnez d'abord une entreprise"} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(emp => emp.companyId === selectedCompany)
                      .map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {selectedCompany && employees.filter(emp => emp.companyId === selectedCompany).length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Aucun employé trouvé pour cette entreprise.
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contract-type">Type de contrat</Label>
                <Select
                  value={contractType}
                  onValueChange={setContractType}
                >
                  <SelectTrigger id="contract-type">
                    <SelectValue placeholder="Sélectionner un type de contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="CDD">CDD</SelectItem>
                    <SelectItem value="Alternance">Alternance</SelectItem>
                    <SelectItem value="Stage">Stage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {/* Étape 2: Détails du contrat */}
          {contractFormStep === 2 && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Date de début</Label>
                  <Input 
                    id="start-date" 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                
                {(contractType !== "CDI") && (
                  <div className="space-y-2">
                    <Label htmlFor="end-date">Date de fin</Label>
                    <Input 
                      id="end-date" 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="base-salary">Salaire mensuel brut (€)</Label>
                <Input 
                  id="base-salary" 
                  type="number" 
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  placeholder="Ex: 2500"
                />
              </div>
              
              {/* Résumé des données de l'étape 1 */}
              <div className="mt-4 bg-muted p-3 rounded-md">
                <h4 className="font-medium text-sm mb-2">Récapitulatif</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Entreprise:</span>{" "}
                    {companies.find(c => c.id === selectedCompany)?.name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Employé:</span>{" "}
                    {(() => {
                      const emp = employees.find(e => e.id === selectedEmployee);
                      return emp ? `${emp.firstName} ${emp.lastName}` : "";
                    })()}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Type de contrat:</span>{" "}
                    {contractType}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between space-x-2 pt-4">
            {contractFormStep > 1 ? (
              <Button variant="outline" onClick={goToPreviousStep}>
                Précédent
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setContractDialogOpen(false)}>
                Annuler
              </Button>
            )}
            
            <Button 
              onClick={goToNextStep}
              disabled={
                (contractFormStep === 1 && (!selectedCompany || !selectedEmployee)) ||
                (contractFormStep === 2 && (
                  !startDate ||
                  (contractType !== "CDI" && !endDate) ||
                  !baseSalary
                ))
              }
            >
              {contractFormStep < 2 ? "Suivant" : "Créer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}