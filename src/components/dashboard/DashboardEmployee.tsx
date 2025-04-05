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
  Building2, 
  ArrowLeft,
  AlertCircle,
  Euro
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  EmptyState, 
  HeaderActions 
} from "@/components/shared/PageContainer";
import { DeleteConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { TableLoader } from "@/components/shared/SkeletonLoader";
import { collection, getDocs, getDoc, doc, deleteDoc, query, where } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase/config";

// Type pour représenter un bulletin de paie
interface Payslip {
  id: string;
  period: string;
  createdAt: string;
}

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
  payslips?: Payslip[]; // Bulletins de paie de l'employé
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
    const checkAuthAndFetchData = () => {
      if (!auth.currentUser) {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            fetchEmployees(user.uid);
            // Si un ID d'entreprise est fourni, récupérer les détails de l'entreprise
            if (currentCompanyId) {
              fetchCompanyDetails(user.uid, currentCompanyId);
            }
          } else {
            setIsLoading(false);
            setError("Vous devez être connecté pour accéder à cette fonctionnalité.");
            toast({
              variant: "destructive",
              title: "Erreur d'authentification",
              description: "Vous devez être connecté pour accéder à cette fonctionnalité."
            });
          }
          unsubscribe();
        });
      } else {
        fetchEmployees(auth.currentUser.uid);
        // Si un ID d'entreprise est fourni, récupérer les détails de l'entreprise
        if (currentCompanyId) {
          fetchCompanyDetails(auth.currentUser.uid, currentCompanyId);
        }
      }
    };
    
    checkAuthAndFetchData();
  }, [currentCompanyId, toast]);

  // Fonction pour récupérer les détails d'une entreprise
  async function fetchCompanyDetails(userId: string, companyId: string) {
    try {
      const companyRef = doc(firestore, `users/${userId}/companies`, companyId);
      const companySnap = await getDoc(companyRef);
      
      if (companySnap.exists()) {
        const companyData = companySnap.data();
        setCompany({
          id: companySnap.id,
          name: companyData.name || companyData.raisonSociale || "Sans nom"
        });
      } else {
        console.error("Entreprise non trouvée");
      }
    } catch (err) {
      console.error("Erreur:", err);
    }
  }

  // Fonction pour récupérer les employés
  async function fetchEmployees(userId: string) {
    setIsLoading(true);
    try {
      let employeesRef;
      
      if (currentCompanyId) {
        // Récupérer les employés d'une entreprise spécifique
        employeesRef = query(
          collection(firestore, `users/${userId}/employees`),
          where("companyId", "==", currentCompanyId)
        );
      } else {
        // Récupérer tous les employés
        employeesRef = collection(firestore, `users/${userId}/employees`);
      }
      
      const employeesSnapshot = await getDocs(employeesRef);
      
      if (employeesSnapshot.empty) {
        setEmployees([]);
      } else {
        const employeesData: Employee[] = [];
        const companies = new Map<string, { id: string; name: string }>();
        
        // Première passe pour récupérer les employés
        employeesSnapshot.forEach((doc) => {
          const data = doc.data();
          
          if (data.companyId && !companies.has(data.companyId)) {
            companies.set(data.companyId, { id: data.companyId, name: "" });
          }
          
          employeesData.push({
            id: doc.id,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            address: data.address || "",
            city: data.city || "",
            postalCode: data.postalCode || "",
            country: data.country || "France",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            birthDate: data.birthDate || "",
            birthPlace: data.birthPlace || "",
            nationality: data.nationality || "",
            socialSecurityNumber: data.socialSecurityNumber || "",
            position: data.position || "",
            department: data.department || "",
            contractType: data.contractType || "CDI",
            isExecutive: data.isExecutive || false,
            startDate: data.startDate || new Date().toISOString(),
            endDate: data.endDate || "",
            hourlyRate: data.hourlyRate || 0,
            monthlyHours: data.monthlyHours || 0,
            baseSalary: data.baseSalary || 0,
            createdAt: data.createdAt || new Date().toISOString(),
            companyId: data.companyId || "",
            payslips: data.payslips || []
          });
        });
        
        // Deuxième passe pour charger les noms des entreprises si nécessaire
        if (!currentCompanyId && companies.size > 0) {
          await Promise.all(Array.from(companies.keys()).map(async (companyId) => {
            try {
              const companyRef = doc(firestore, `users/${userId}/companies`, companyId);
              const companySnapshot = await getDoc(companyRef);
              
              if (companySnapshot.exists()) {
                const companyData = companySnapshot.data();
                companies.set(companyId, {
                  id: companyId,
                  name: companyData.name || companyData.raisonSociale || "Sans nom"
                });
              }
            } catch (err) {
              console.error(`Erreur lors de la récupération de l'entreprise ${companyId}:`, err);
            }
          }));
          
          // Associer les entreprises aux employés
          employeesData.forEach(employee => {
            if (employee.companyId && companies.has(employee.companyId)) {
              employee.company = companies.get(employee.companyId);
            }
          });
        }
        
        setEmployees(employeesData);
      }
      
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
    try {
      if (!auth.currentUser) {
        throw new Error("Vous devez être connecté pour effectuer cette action");
      }
      
      const userId = auth.currentUser.uid;
      const employeeRef = doc(firestore, `users/${userId}/employees`, id);
      await deleteDoc(employeeRef);

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
    return <TableLoader rows={3} columns={3} />;
  }

  // Affichage d'erreur
  if (error) {
    return (
      <EmptyState
        title="Erreur de chargement"
        description={error}
        icon={AlertCircle}
        action={<Button onClick={() => {
          if (auth.currentUser) {
            fetchEmployees(auth.currentUser.uid);
          }
        }}>Réessayer</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
        <HeaderActions>
          <Button onClick={createEmployee} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un employé
          </Button>
        </HeaderActions>
      </div>

      {employees.length === 0 ? (
        <EmptyState
          title="Aucun employé"
          description={
            currentCompanyId 
              ? "Vous n'avez pas encore ajouté d'employé à cette entreprise. Créez votre premier employé pour commencer à générer des bulletins de paie."
              : "Vous n'avez pas encore ajouté d'employé à vos entreprises. Créez votre premier employé pour commencer à générer des bulletins de paie."
          }
          icon={Users}
          action={
            <Button onClick={createEmployee} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter mon premier employé
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {employees.map((employee) => (
            <Card key={employee.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle 
                    className="text-xl font-bold line-clamp-1 cursor-pointer hover:text-primary hover:underline transition-colors"
                    onClick={() => viewEmployeeDetails(employee.id)}
                  >
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
                  <DeleteConfirmationDialog
                    itemName={`l'employé ${employee.firstName} ${employee.lastName}`}
                    onConfirm={() => deleteEmployee(employee.id)}
                    trigger={
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    }
                  />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 