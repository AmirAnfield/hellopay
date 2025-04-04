"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  User,
  FileText,
  FileSpreadsheet,
  FileCheck,
  ArrowLeft,
  Plus,
  Download,
  Edit,
  Trash2,
  Printer,
  Eye,
} from "lucide-react";
import { PageContainer, PageHeader, LoadingState, EmptyState } from "@/components/shared/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Types
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
  department: string;
  companyId: string;
  companyName?: string;
  startDate: string;
  contractType: string;
  isExecutive: boolean;
  baseSalary: number;
}

interface Document {
  id: string;
  type: "attestation" | "contrat" | "autre";
  title: string;
  date: Date | string;
  employeeId: string;
  employeeName: string;
  status: "draft" | "pending" | "signed" | "generated";
  pdfUrl?: string;
}

interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  baseSalary: number;
  grossSalary: number;
  netSalary: number;
  status: string;
  createdAt: string;
}

export default function EmployeeHubPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams?.get("id");
  const { toast } = useToast();
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  useEffect(() => {
    if (!employeeId) {
      router.push("/dashboard/employees");
      return;
    }
    
    fetchEmployeeData();
  }, [employeeId, router]);
  
  const fetchEmployeeData = async () => {
    setIsLoading(true);
    
    try {
      // Récupérer les données de l'employé depuis localStorage
      const employeesStr = localStorage.getItem("employees");
      if (!employeesStr) {
        throw new Error("Aucun employé trouvé");
      }
      
      const employees = JSON.parse(employeesStr);
      const foundEmployee = employees.find((e: any) => e.id === employeeId);
      
      if (!foundEmployee) {
        throw new Error("Employé non trouvé");
      }
      
      setEmployee(foundEmployee);
      
      // Récupérer les documents associés à cet employé
      const docsStr = localStorage.getItem("userDocuments");
      if (docsStr) {
        const docs = JSON.parse(docsStr);
        const employeeDocs = docs.filter((doc: any) => doc.employeeId === employeeId);
        setDocuments(employeeDocs);
      }
      
      // Récupérer les bulletins de paie associés à cet employé
      const payslipsStr = localStorage.getItem("payslips");
      if (payslipsStr) {
        const allPayslips = JSON.parse(payslipsStr);
        const employeePayslips = allPayslips.filter((p: any) => p.employeeId === employeeId);
        setPayslips(employeePayslips);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données de l'employé."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Générer un nouveau document
  const handleCreateDocument = (type: "attestation" | "contrat" | "autre") => {
    if (!employee) return;
    
    const params = new URLSearchParams();
    params.append("employeeId", employee.id);
    params.append("documentType", type);
    params.append("openCreateDialog", "true");
    
    router.push(`/dashboard/documents?${params.toString()}`);
  };
  
  // Générer un nouveau bulletin de paie
  const handleCreatePayslip = () => {
    if (!employee) return;
    
    router.push(`/dashboard/payslips/create?employeeId=${employee.id}`);
  };
  
  // Afficher le statut d'un document
  const renderDocumentStatus = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Brouillon</Badge>;
      case "pending":
        return <Badge variant="secondary">En attente</Badge>;
      case "signed":
        return <Badge variant="success">Signé</Badge>;
      case "generated":
        return <Badge variant="default">Généré</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return <LoadingState message="Chargement des données de l'employé..." />;
  }
  
  if (!employee) {
    return (
      <EmptyState 
        title="Employé non trouvé"
        description="L'employé que vous recherchez n'existe pas ou a été supprimé."
        icon={User}
        action={
          <Button asChild>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste des employés
          </Button>
        }
      />
    );
  }
  
  return (
    <PageContainer>
      <PageHeader
        title={`${employee.firstName} ${employee.lastName}`}
        description={employee.position}
        icon={User}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Button asChild>
              <a href={`/dashboard/employees/${employee.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </a>
            </Button>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Entreprise</h3>
                <p>{employee.companyName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Poste</h3>
                <p>{employee.position}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Service</h3>
                <p>{employee.department || "-"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Date d'entrée</h3>
                <p>{employee.startDate ? format(new Date(employee.startDate), 'dd/MM/yyyy') : "-"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Type de contrat</h3>
                <p>{employee.contractType}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Statut</h3>
                <p>{employee.isExecutive ? "Cadre" : "Non-cadre"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p>{employee.email || "-"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Téléphone</h3>
                <p>{employee.phoneNumber || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button onClick={() => handleCreateDocument("contrat")} className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Générer un contrat
              </Button>
              <Button onClick={() => handleCreateDocument("attestation")} className="w-full justify-start">
                <FileCheck className="mr-2 h-4 w-4" />
                Générer une attestation
              </Button>
              <Button onClick={handleCreatePayslip} className="w-full justify-start">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Générer un bulletin de paie
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-md mb-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="payslips">Bulletins de paie</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
              <CardDescription>Vue d'ensemble des documents et bulletins de paie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">Documents récents</h3>
                  {documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.slice(0, 3).map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{doc.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(doc.date), "dd MMM yyyy", { locale: fr })}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {renderDocumentStatus(doc.status)}
                          </div>
                        </div>
                      ))}
                      {documents.length > 3 && (
                        <Button variant="link" onClick={() => setActiveTab("documents")} className="p-0">
                          Voir tous les documents
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun document</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Bulletins de paie récents</h3>
                  {payslips.length > 0 ? (
                    <div className="space-y-3">
                      {payslips.slice(0, 3).map((payslip) => (
                        <div key={payslip.id} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center">
                            <FileSpreadsheet className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">
                                {format(new Date(payslip.year, payslip.month - 1), "MMMM yyyy", { locale: fr })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(payslip.netSalary)}
                              </p>
                            </div>
                          </div>
                          <Badge>{payslip.status}</Badge>
                        </div>
                      ))}
                      {payslips.length > 3 && (
                        <Button variant="link" onClick={() => setActiveTab("payslips")} className="p-0">
                          Voir tous les bulletins
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun bulletin de paie</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Tous les documents relatifs à cet employé</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleCreateDocument("contrat")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Type</th>
                        <th className="text-left p-3 font-medium">Titre</th>
                        <th className="text-left p-3 font-medium">Date</th>
                        <th className="text-left p-3 font-medium">Statut</th>
                        <th className="text-right p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc.id} className="border-b">
                          <td className="p-3">
                            <div className="flex items-center">
                              {doc.type === "contrat" ? (
                                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                              ) : doc.type === "attestation" ? (
                                <FileCheck className="h-4 w-4 mr-2 text-green-500" />
                              ) : (
                                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                              )}
                              <span className="capitalize">{doc.type}</span>
                            </div>
                          </td>
                          <td className="p-3">{doc.title}</td>
                          <td className="p-3">
                            {format(new Date(doc.date), "dd/MM/yyyy")}
                          </td>
                          <td className="p-3">
                            {renderDocumentStatus(doc.status)}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="Aucun document"
                  description="Cet employé n'a pas encore de documents. Créez-en un maintenant."
                  icon={FileText}
                  action={
                    <Button onClick={() => handleCreateDocument("contrat")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer un document
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payslips">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Bulletins de paie</CardTitle>
                <CardDescription>Tous les bulletins de paie de cet employé</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreatePayslip}>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un bulletin
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {payslips.length > 0 ? (
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Période</th>
                        <th className="text-left p-3 font-medium">Brut</th>
                        <th className="text-left p-3 font-medium">Net</th>
                        <th className="text-left p-3 font-medium">Statut</th>
                        <th className="text-right p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payslips.map((payslip) => (
                        <tr key={payslip.id} className="border-b">
                          <td className="p-3">
                            <div className="flex items-center">
                              <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />
                              <span>
                                {format(new Date(payslip.year, payslip.month - 1), "MMMM yyyy", { locale: fr })}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(payslip.grossSalary)}
                          </td>
                          <td className="p-3">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(payslip.netSalary)}
                          </td>
                          <td className="p-3">
                            <Badge>{payslip.status}</Badge>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="Aucun bulletin de paie"
                  description="Cet employé n'a pas encore de bulletins de paie. Créez-en un maintenant."
                  icon={FileSpreadsheet}
                  action={
                    <Button onClick={handleCreatePayslip}>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer un bulletin
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
} 