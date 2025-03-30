"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { 
  Building2, 
  Users, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Phone, 
  Mail, 
  Globe, 
  AlertCircle 
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

// Type pour représenter un employé
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

// Type pour représenter une entreprise
interface Company {
  id: string;
  name: string;
  siret: string;
  address: string;
  city: string;
  postalCode: string;
  activityCode?: string;
  urssafNumber?: string;
  legalForm?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  legalRepresentative?: string;
  legalRepresentativeRole?: string;
  createdAt: string;
  employees?: Employee[]; // Liste des employés de l'entreprise
}

export default function DashboardCompany() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Fonction pour récupérer les entreprises de l'utilisateur
  async function fetchCompanies() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/companies");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des entreprises");
      }
      const data = await response.json();
      setCompanies(data.companies || []);
      setError(null);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les entreprises. Veuillez réessayer.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les entreprises. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Fonction pour supprimer une entreprise
  async function deleteCompany(id: string) {
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'entreprise");
      }

      // Mettre à jour la liste locale
      setCompanies(companies.filter(company => company.id !== id));
      
      toast({
        title: "Entreprise supprimée",
        description: "L'entreprise a été supprimée avec succès."
      });
    } catch (err) {
      console.error("Erreur:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'entreprise. Veuillez réessayer."
      });
    }
  }

  // Fonction pour naviguer vers la page d'édition
  function editCompany(id: string) {
    router.push(`/dashboard/companies/${id}/edit`);
  }

  // Fonction pour naviguer vers la page de détail
  function viewCompanyDetails(id: string) {
    router.push(`/dashboard/companies/${id}`);
  }

  // Fonction pour naviguer vers la page de création
  function createCompany() {
    router.push("/dashboard/companies/new");
  }

  // Fonction pour afficher la liste des employés
  function viewEmployees(id: string) {
    router.push(`/dashboard/companies/${id}/employees`);
  }

  // Fonction pour créer un bulletin de paie pour cette entreprise
  function createPayslip(id: string) {
    router.push(`/payslip/new?companyId=${id}`);
  }

  // Formatage de date
  function formatDate(dateString: string) {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
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
        action={<Button onClick={fetchCompanies}>Réessayer</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mes entreprises</h2>
          <p className="text-muted-foreground">
            Gérez vos entreprises et leurs informations
          </p>
        </div>
        <HeaderActions>
          <Button onClick={createCompany} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Ajouter une entreprise
          </Button>
        </HeaderActions>
      </div>

      {companies.length === 0 ? (
        <EmptyState
          title="Aucune entreprise"
          description="Vous n'avez pas encore ajouté d'entreprise. Créez votre première entreprise pour commencer à générer des bulletins de paie."
          icon={Building2}
          action={
            <Button onClick={createCompany} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter ma première entreprise
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Card key={company.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle 
                    onClick={() => viewCompanyDetails(company.id)}
                    className="text-xl font-bold line-clamp-1 cursor-pointer hover:text-primary hover:underline transition-colors"
                  >
                    {company.name}
                  </CardTitle>
                  <Badge variant="outline" className="font-normal">
                    {company.legalForm || "Entreprise"}
                  </Badge>
                </div>
                <CardDescription>
                  SIRET: {company.siret}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3 space-y-4">
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {company.address}, {company.postalCode} {company.city}
                  </div>
                </div>

                {company.phoneNumber && (
                  <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{company.phoneNumber}</span>
                  </div>
                )}

                {company.email && (
                  <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm truncate">{company.email}</span>
                  </div>
                )}

                {company.website && (
                  <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm truncate">{company.website}</span>
                  </div>
                )}

                <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Créée le {formatDate(company.createdAt)}
                  </span>
                </div>

                {company.employees && (
                  <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">
                      {company.employees.length} salarié{company.employees.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </CardContent>
              <Separator />
              <CardFooter className="flex justify-between pt-4">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => editCompany(company.id)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => viewEmployees(company.id)}>
                    <Users className="h-4 w-4 mr-1" />
                    Salariés
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => createPayslip(company.id)}>
                    <FileText className="h-4 w-4 mr-1" />
                    Bulletin
                  </Button>
                  <DeleteConfirmationDialog
                    itemName="l'entreprise"
                    onConfirm={() => deleteCompany(company.id)}
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