"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { 
  User, 
  Users, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Briefcase, 
  Calendar, 
  Phone, 
  Mail, 
  Tag, 
  Check, 
  X, 
  Building2, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  Euro
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Type pour représenter un employé
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string;
  birthPlace?: string;
  nationality?: string;
  socialSecurityNumber: string;
  position: string;
  department?: string;
  contractType: string;
  isExecutive: boolean;
  startDate: string;
  endDate?: string;
  hourlyRate: number;
  monthlyHours: number;
  baseSalary: number;
  createdAt: string;
  companyId: string;
  company?: {
    id: string;
    name: string;
  };
  payslips?: any[]; // Optionnel, si les bulletins sont inclus
}

interface DashboardEmployeeProps {
  companyId?: string;
}

export default function DashboardEmployee({ companyId }: DashboardEmployeeProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<{ id: string; name: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Utiliser l'ID d'entreprise passé en prop, ou celui dans les paramètres d'URL
  const currentCompanyId = companyId || searchParams.get('companyId') || undefined;

  useEffect(() => {
    fetchEmployees();

    // Si un ID d'entreprise est fourni, récupérer les détails de l'entreprise
    if (currentCompanyId) {
      fetchCompanyDetails(currentCompanyId);
    }
  }, [currentCompanyId]);

  // Fonction pour récupérer les détails d'une entreprise
  async function fetchCompanyDetails(id: string) {
    try {
      const response = await fetch(`/api/companies/${id}`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des détails de l'entreprise");
      }
      const data = await response.json();
      if (data.company) {
        setCompany({
          id: data.company.id,
          name: data.company.name
        });
      }
    } catch (err) {
      console.error("Erreur:", err);
    }
  }

  // Fonction pour récupérer les employés
  async function fetchEmployees() {
    setIsLoading(true);
    try {
      const url = currentCompanyId 
        ? `/api/employees?companyId=${currentCompanyId}`
        : "/api/employees";
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des employés");
      }
      const data = await response.json();
      setEmployees(data.employees || []);
      setError(null);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les employés. Veuillez réessayer.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les employés. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Fonction pour supprimer un employé
  async function deleteEmployee(id: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible.")) {
      return;
    }

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la suppression de l'employé");
      }

      // Mettre à jour la liste locale
      setEmployees(employees.filter(employee => employee.id !== id));
      
      toast({
        title: "Employé supprimé",
        description: "L'employé a été supprimé avec succès."
      });
    } catch (err) {
      console.error("Erreur:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de supprimer l'employé."
      });
    }
  }

  // Fonction pour naviguer vers la page d'édition
  function editEmployee(id: string) {
    router.push(`/dashboard/employees/${id}/edit`);
  }

  // Fonction pour naviguer vers la page de détail
  function viewEmployeeDetails(id: string) {
    router.push(`/dashboard/employees/${id}`);
  }

  // Fonction pour naviguer vers la page de création
  function createEmployee() {
    const url = currentCompanyId 
      ? `/dashboard/employees/new?companyId=${currentCompanyId}`
      : "/dashboard/employees/new";
    router.push(url);
  }

  // Fonction pour voir les bulletins de paie d'un employé
  function viewPayslips(id: string) {
    router.push(`/dashboard/employees/${id}/payslips`);
  }

  // Fonction pour créer un bulletin de paie pour cet employé
  function createPayslip(id: string) {
    router.push(`/payslip/new?employeeId=${id}`);
  }

  // Fonction pour revenir à la liste des entreprises
  function backToCompanies() {
    router.push("/dashboard/companies");
  }

  // Formatage de date
  function formatDate(dateString: string) {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  }

  // Formatage de montant
  function formatAmount(amount: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  }

  // Affichage du chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Affichage d'erreur
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-semibold mb-2">Erreur de chargement</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchEmployees}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {currentCompanyId && company ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Button variant="ghost" size="sm" className="p-0 h-8" onClick={backToCompanies}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Retour aux entreprises
                </Button>
              </div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {company.name}
              </h2>
              <p className="text-muted-foreground">
                Gérez les employés de cette entreprise
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Tous les employés</h2>
              <p className="text-muted-foreground">
                Gérez les employés de toutes vos entreprises
              </p>
            </div>
          )}
        </div>
        <Button onClick={createEmployee} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un employé
        </Button>
      </div>

      {employees.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun employé</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {currentCompanyId 
                ? "Vous n'avez pas encore ajouté d'employé à cette entreprise."
                : "Vous n'avez pas encore ajouté d'employé à vos entreprises."}
              Créez votre premier employé pour commencer à générer des bulletins de paie.
            </p>
            <Button onClick={createEmployee} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter mon premier employé
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {employees.map((employee) => (
            <Card key={employee.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold line-clamp-1">
                    {employee.firstName} {employee.lastName}
                  </CardTitle>
                  <Badge variant={employee.isExecutive ? "default" : "secondary"} className="font-normal">
                    {employee.isExecutive ? "Cadre" : "Non cadre"}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {employee.position}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3 space-y-4">
                {!currentCompanyId && employee.company && (
                  <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium truncate">{employee.company.name}</span>
                  </div>
                )}

                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <div className="flex items-center">
                    <span className="text-sm mr-2">{employee.contractType}</span>
                    {employee.department && (
                      <Badge variant="outline" className="text-xs font-normal">
                        {employee.department}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">
                    Embauché le {formatDate(employee.startDate)}
                  </span>
                </div>

                <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                  <Euro className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {formatAmount(employee.baseSalary)}/mois ({employee.monthlyHours}h)
                  </span>
                </div>

                {employee.email && (
                  <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm truncate">{employee.email}</span>
                  </div>
                )}

                {employee.phoneNumber && (
                  <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{employee.phoneNumber}</span>
                  </div>
                )}

                {employee.payslips && (
                  <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">
                      {employee.payslips.length} bulletin{employee.payslips.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </CardContent>
              <Separator />
              <CardFooter className="flex justify-between pt-4">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => editEmployee(employee.id)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => viewEmployeeDetails(employee.id)}>
                    <User className="h-4 w-4 mr-1" />
                    Détails
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => createPayslip(employee.id)}>
                    <FileText className="h-4 w-4 mr-1" />
                    Bulletin
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => deleteEmployee(employee.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Supprimer</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 