import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft,
  Building2,
  MapPin,
  User,
  Mail,
  Phone,
  Globe,
  Briefcase,
  FileText,
  Hash,
  CreditCard,
  Pencil,
  Users
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import DashboardEmployee from "@/components/dashboard/DashboardEmployee";
import { PayslipTable } from "@/components/dashboard/PayslipTable";

export const metadata: Metadata = {
  title: "Détails de l'entreprise | HelloPay",
  description: "Consultez les informations détaillées d'une entreprise",
};

interface CompanyDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getCompany(id: string) {
  try {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            employees: true,
            payslips: true,
          },
        },
      },
    });
    return company;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'entreprise:", error);
    return null;
  }
}

export default async function CompanyDetailsPage({ params }: CompanyDetailsPageProps) {
  const { id } = await params;
  const company = await getCompany(id);
  
  if (!company) {
    return (
      <div className="container py-10 max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <Building2 className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Entreprise non trouvée</h1>
          <p className="text-muted-foreground mb-6">
            L&apos;entreprise que vous recherchez n&apos;existe pas ou a été supprimée.
          </p>
          <Link href="/dashboard/companies">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste des entreprises
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Formatage de date
  function formatDate(dateString: Date) {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  }
  
  return (
    <div className="container py-10 max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Link href={`/dashboard/companies`}>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Retour aux entreprises
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-2xl font-bold">
                {company.name}
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="mt-1">
                {company.legalForm || "Entreprise"}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href={`/dashboard/companies/${company.id}/edit`}>
              <Button variant="outline" className="w-full sm:w-auto">
                <Pencil className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </Link>
            <Link href={`/dashboard/companies/${company.id}/employees`}>
              <Button variant="outline" className="w-full sm:w-auto">
                <Users className="h-4 w-4 mr-2" />
                Employés
              </Button>
            </Link>
            <Link href={`/payslip/new?companyId=${company.id}`}>
              <Button className="w-full sm:w-auto">
                <FileText className="h-4 w-4 mr-2" />
                Nouveau bulletin
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations générales
              </CardTitle>
              <CardDescription>
                Informations principales de l&apos;entreprise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">SIRET</p>
                  <p className="text-sm text-muted-foreground">
                    {company.siret}
                  </p>
                </div>
              </div>
              
              {company.activityCode && (
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Code APE/NAF</p>
                    <p className="text-sm text-muted-foreground">
                      {company.activityCode}
                    </p>
                  </div>
                </div>
              )}
              
              {company.vatNumber && (
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">N° TVA Intracommunautaire</p>
                    <p className="text-sm text-muted-foreground">
                      {company.vatNumber}
                    </p>
                  </div>
                </div>
              )}
              
              {company.urssafNumber && (
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">N° URSSAF</p>
                    <p className="text-sm text-muted-foreground">
                      {company.urssafNumber}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Adresse</p>
                  <p className="text-sm text-muted-foreground">
                    {company.address}<br />
                    {company.postalCode} {company.city}<br />
                    {company.country}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Coordonnées */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Coordonnées
              </CardTitle>
              <CardDescription>
                Informations de contact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.email && (
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {company.email}
                    </p>
                  </div>
                </div>
              )}
              
              {company.phoneNumber && (
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Téléphone</p>
                    <p className="text-sm text-muted-foreground">
                      {company.phoneNumber}
                    </p>
                  </div>
                </div>
              )}
              
              {company.website && (
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Site web</p>
                    <p className="text-sm text-muted-foreground">
                      <a 
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline text-primary"
                      >
                        {company.website}
                      </a>
                    </p>
                  </div>
                </div>
              )}
              
              {company.legalRepresentative && (
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Représentant légal</p>
                    <p className="text-sm text-muted-foreground">
                      {company.legalRepresentative}
                      {company.legalRepresentativeRole && ` (${company.legalRepresentativeRole})`}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Activité</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="font-normal">
                      {company._count.employees} employé{company._count.employees !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="outline" className="font-normal">
                      {company._count.payslips} bulletin{company._count.payslips !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Employés de l'entreprise */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employés
                </CardTitle>
                <CardDescription>
                  Liste des employés de l&apos;entreprise
                </CardDescription>
              </div>
              <Link href={`/dashboard/employees/new?companyId=${company.id}`}>
                <Button size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Ajouter un employé
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <DashboardEmployee companyId={company.id} />
          </CardContent>
        </Card>
        
        {/* Derniers bulletins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Derniers bulletins de paie
            </CardTitle>
            <CardDescription>
              Bulletins de paie générés pour cette entreprise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PayslipTable companyId={company.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 