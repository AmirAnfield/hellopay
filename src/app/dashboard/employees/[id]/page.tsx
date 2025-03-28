import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  User, 
  Building2, 
  Calendar, 
  Badge as BadgeIcon, 
  Mail, 
  Phone, 
  Briefcase, 
  Euro, 
  FileText,
  MapPin,
  Pencil
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { PayslipTable } from "@/components/dashboard/PayslipTable";

export const metadata: Metadata = {
  title: "Détails de l'employé | HelloPay",
  description: "Consultez les informations détaillées d'un employé",
};

interface EmployeeDetailsPageProps {
  params: {
    id: string;
  };
}

async function getEmployee(id: string) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return employee;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'employé:", error);
    return null;
  }
}

export default async function EmployeeDetailsPage({ params }: EmployeeDetailsPageProps) {
  const employee = await getEmployee(params.id);
  
  if (!employee) {
    return (
      <div className="container py-10 max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <User className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Employé non trouvé</h1>
          <p className="text-muted-foreground mb-6">
            L&apos;employé que vous recherchez n&apos;existe pas ou a été supprimé.
          </p>
          <Link href="/dashboard/employees">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste des employés
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Formatage de date
  function formatDate(dateString: Date | null | undefined) {
    if (!dateString) return "—";
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  }

  // Formatage de montant
  function formatAmount(amount: number) {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
  
  return (
    <div className="container py-10 max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Link href={`/dashboard/employees`}>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Retour aux employés
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-2xl font-bold">
                {employee.firstName} {employee.lastName}
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={employee.isExecutive ? "default" : "secondary"} className="mt-1">
                {employee.isExecutive ? "Cadre" : "Non cadre"}
              </Badge>
              <Badge variant="outline" className="mt-1">
                {employee.contractType}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href={`/dashboard/employees/${employee.id}/edit`}>
              <Button variant="outline" className="w-full sm:w-auto">
                <Pencil className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </Link>
            <Link href={`/dashboard/employees/${employee.id}/payslips`}>
              <Button variant="outline" className="w-full sm:w-auto">
                <FileText className="h-4 w-4 mr-2" />
                Bulletins
              </Button>
            </Link>
            <Link href={`/payslip/new?employeeId=${employee.id}`}>
              <Button className="w-full sm:w-auto">
                <FileText className="h-4 w-4 mr-2" />
                Nouveau bulletin
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations professionnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Informations professionnelles
              </CardTitle>
              <CardDescription>
                Détails du poste et du contrat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Entreprise</p>
                  <p className="text-sm text-muted-foreground">
                    {employee.company?.name || "—"}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                <BadgeIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Poste</p>
                  <p className="text-sm text-muted-foreground">
                    {employee.position}
                    {employee.department && ` • ${employee.department}`}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date d&apos;embauche</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(employee.startDate)}
                  </p>
                </div>
              </div>
              
              {employee.endDate && (
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date de fin de contrat</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(employee.endDate)}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                <Euro className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Rémunération</p>
                  <p className="text-sm text-muted-foreground">
                    {formatAmount(employee.baseSalary)}/mois • {formatAmount(employee.hourlyRate)}/h • {employee.monthlyHours}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
              <CardDescription>
                Coordonnées et détails personnels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Adresse</p>
                  <p className="text-sm text-muted-foreground">
                    {employee.address}<br />
                    {employee.postalCode} {employee.city}<br />
                    {employee.country}
                  </p>
                </div>
              </div>
              
              {employee.email && (
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {employee.email}
                    </p>
                  </div>
                </div>
              )}
              
              {employee.phoneNumber && (
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Téléphone</p>
                    <p className="text-sm text-muted-foreground">
                      {employee.phoneNumber}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                <BadgeIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">N° de sécurité sociale</p>
                  <p className="text-sm text-muted-foreground">
                    {employee.socialSecurityNumber}
                  </p>
                </div>
              </div>
              
              {employee.birthDate && (
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date de naissance</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(employee.birthDate)}
                      {employee.birthPlace && ` à ${employee.birthPlace}`}
                    </p>
                  </div>
                </div>
              )}
              
              {employee.nationality && (
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <BadgeIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Nationalité</p>
                    <p className="text-sm text-muted-foreground">
                      {employee.nationality}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Derniers bulletins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Derniers bulletins de paie
            </CardTitle>
            <CardDescription>
              Bulletins de paie générés pour cet employé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PayslipTable employeeId={employee.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 