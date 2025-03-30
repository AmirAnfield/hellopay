"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Plus, 
  MoreHorizontal, 
  FileText, 
  ExternalLink,
  Building,
  Briefcase,
  Calendar
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { 
  PageContainer, 
  PageHeader, 
  HeaderActions,
  EmptyState,
  LoadingState,
  NoDataMessage
} from "@/components/shared/PageContainer";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  startDate: string;
  companyId: string;
  company: {
    id: string;
    name: string;
  };
  active: boolean;
  contractCount: number;
}

interface Company {
  id: string;
  name: string;
}

export default function EmployeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(searchParams?.get("companyId") || "all");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");

  // Charger les données des employés et entreprises
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulons une requête API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Données fictives pour la démonstration
        const mockCompanies: Company[] = [
          { id: "1", name: "Tech Solutions" },
          { id: "2", name: "ABC Consulting" },
          { id: "3", name: "GreenLife Design" },
        ];
        
        const mockEmployees: Employee[] = [
          {
            id: "1",
            firstName: "Jean",
            lastName: "Dupont",
            email: "jean.dupont@example.com",
            position: "Développeur Frontend",
            startDate: "2022-03-15",
            companyId: "1",
            company: { id: "1", name: "Tech Solutions" },
            active: true,
            contractCount: 1
          },
          {
            id: "2",
            firstName: "Marie",
            lastName: "Martin",
            email: "marie.martin@example.com",
            position: "UI/UX Designer",
            startDate: "2021-09-01",
            companyId: "1",
            company: { id: "1", name: "Tech Solutions" },
            active: true,
            contractCount: 2
          },
          {
            id: "3",
            firstName: "Pierre",
            lastName: "Durand",
            email: "pierre.durand@example.com",
            position: "Chef de projet",
            startDate: "2020-11-20",
            companyId: "2",
            company: { id: "2", name: "ABC Consulting" },
            active: true,
            contractCount: 1
          },
          {
            id: "4",
            firstName: "Sophie",
            lastName: "Petit",
            email: "sophie.petit@example.com",
            position: "Développeur Backend",
            startDate: "2022-01-10",
            companyId: "2",
            company: { id: "2", name: "ABC Consulting" },
            active: true,
            contractCount: 1
          },
          {
            id: "5",
            firstName: "Thomas",
            lastName: "Leroy",
            email: "thomas.leroy@example.com",
            position: "Graphiste",
            startDate: "2021-05-05",
            companyId: "3",
            company: { id: "3", name: "GreenLife Design" },
            active: false,
            contractCount: 0
          }
        ];
        
        setCompanies(mockCompanies);
        setEmployees(mockEmployees);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
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
  }, [toast, searchParams]);

  // Filtrer les employés par recherche et entreprise sélectionnée
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      searchQuery === "" || 
      employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.company.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCompany = selectedCompanyId === "all" || employee.companyId === selectedCompanyId;
    
    return matchesSearch && matchesCompany;
  });

  // Actions pour les employés
  const handleView = (employeeId: string) => {
    router.push(`/dashboard/employees/${employeeId}`);
  };

  const handleEdit = (employeeId: string) => {
    router.push(`/dashboard/employees/${employeeId}/edit`);
  };

  const handleDelete = (employeeId: string, employeeName: string) => {
    // Normalement, on demanderait une confirmation et on enverrait une requête DELETE à l'API
    toast({
      title: "Employé supprimé",
      description: `L'employé "${employeeName}" a été supprimé avec succès.`,
    });
    setEmployees(prevEmployees => prevEmployees.filter(e => e.id !== employeeId));
  };

  const handleCreateNew = () => {
    router.push("/dashboard/employees/new");
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Employés"
          description="Gérez les employés de vos entreprises"
        />
        <LoadingState message="Chargement des employés..." />
      </PageContainer>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR').format(date);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Employés"
        description="Gérez les employés de vos entreprises"
        actions={
          <HeaderActions>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 flex-grow">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground flex-shrink-0" />
                  <Input
                    placeholder="Rechercher un employé..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-full"
                  />
                </div>
                <Select
                  value={selectedCompanyId}
                  onValueChange={setSelectedCompanyId}
                >
                  <SelectTrigger className="w-full md:w-[180px] flex-shrink-0">
                    <SelectValue placeholder="Toutes les entreprises" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les entreprises</SelectItem>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateNew} className="flex-shrink-0 w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Ajouter un employé</span>
              </Button>
            </div>
          </HeaderActions>
        }
      />

      <Tabs defaultValue="all" className="space-y-4 sm:space-y-6">
        <TabsList className="mb-2 flex w-full flex-wrap overflow-x-auto md:flex-nowrap">
          <TabsTrigger value="all" className="flex-1 min-w-[100px]">
            <span className="truncate">Tous</span>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex-1 min-w-[100px]">
            <span className="truncate">Actifs</span>
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex-1 min-w-[100px]">
            <span className="truncate">Inactifs</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center justify-end mb-4">
          <div className="space-x-2">
            <Button
              variant={view === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("grid")}
              className="w-full sm:w-auto"
            >
              <span className="truncate">Grille</span>
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("list")}
              className="w-full sm:w-auto"
            >
              <span className="truncate">Liste</span>
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="m-0">
          {filteredEmployees.length > 0 ? (
            view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredEmployees.map(employee => (
                  <Card key={employee.id} className="overflow-hidden">
                    <CardHeader className="px-4 sm:px-6 pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <CardTitle className="text-base">{employee.firstName} {employee.lastName}</CardTitle>
                          <CardDescription className="mt-1">{employee.position}</CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4 flex-shrink-0" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleView(employee.id)}>
                              <ExternalLink className="mr-2 h-4 w-4 flex-shrink-0" />
                              <span>Voir les détails</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(employee.id)}>
                              <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                              <span>Modifier</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}
                              className="text-red-600"
                            >
                              <span>Supprimer</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate">{employee.company.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">Depuis le {formatDate(employee.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">{employee.contractCount} contrat{employee.contractCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant={employee.active ? "default" : "secondary"}>
                          {employee.active ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="px-4 sm:px-6 pt-0 flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full sm:w-auto"
                        onClick={() => handleView(employee.id)}
                      >
                        <span>Voir le profil</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full sm:w-auto"
                        onClick={() => router.push(`/dashboard/payslips/generate?employeeId=${employee.id}`)}
                      >
                        <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span>Générer bulletin</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEmployees.map(employee => (
                  <Card key={employee.id}>
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium">{employee.firstName} {employee.lastName}</h3>
                          <p className="text-sm text-muted-foreground">{employee.position}</p>
                          <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Building className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{employee.company.name}</span>
                            </div>
                            <div className="hidden sm:block">•</div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>Depuis {formatDate(employee.startDate)}</span>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge variant={employee.active ? "default" : "secondary"}>
                              {employee.active ? "Actif" : "Inactif"}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3 flex-shrink-0" />
                              <span>{employee.contractCount} contrat{employee.contractCount !== 1 ? 's' : ''}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="w-full sm:w-auto"
                          onClick={() => handleView(employee.id)}
                        >
                          <span>Voir</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full sm:w-auto"
                          onClick={() => router.push(`/dashboard/payslips/generate?employeeId=${employee.id}`)}
                        >
                          <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span>Bulletin</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                              <MoreHorizontal className="h-4 w-4 flex-shrink-0" />
                              <span className="ml-2">Plus</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(employee.id)}>
                              <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                              <span>Modifier</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}
                              className="text-red-600"
                            >
                              <span>Supprimer</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <NoDataMessage 
              message={
                searchQuery || selectedCompanyId
                  ? `Aucun employé ne correspond à votre recherche`
                  : "Aucun employé trouvé"
              } 
            />
          )}
        </TabsContent>

        <TabsContent value="active" className="m-0">
          {filteredEmployees.filter(e => e.active).length > 0 ? (
            view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredEmployees
                  .filter(e => e.active)
                  .map(employee => (
                    <Card key={employee.id} className="overflow-hidden">
                      <CardHeader className="px-4 sm:px-6 pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <CardTitle className="text-base">{employee.firstName} {employee.lastName}</CardTitle>
                            <CardDescription className="mt-1">{employee.position}</CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4 flex-shrink-0" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleView(employee.id)}>
                                <ExternalLink className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span>Voir les détails</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(employee.id)}>
                                <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span>Modifier</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}
                                className="text-red-600"
                              >
                                <span>Supprimer</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 sm:px-6">
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{employee.company.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm">Depuis le {formatDate(employee.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm">{employee.contractCount} contrat{employee.contractCount !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="default">Actif</Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="px-4 sm:px-6 pt-0 flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="w-full sm:w-auto"
                          onClick={() => handleView(employee.id)}
                        >
                          <span>Voir le profil</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full sm:w-auto"
                          onClick={() => router.push(`/dashboard/payslips/generate?employeeId=${employee.id}`)}
                        >
                          <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span>Générer bulletin</span>
                        </Button>
                      </CardFooter>
                    </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEmployees
                  .filter(e => e.active)
                  .map(employee => (
                    <Card key={employee.id}>
                      <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium">{employee.firstName} {employee.lastName}</h3>
                            <p className="text-sm text-muted-foreground">{employee.position}</p>
                            <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Building className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate">{employee.company.name}</span>
                              </div>
                              <div className="hidden sm:block">•</div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>Depuis {formatDate(employee.startDate)}</span>
                              </div>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge variant="default">Actif</Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3 flex-shrink-0" />
                                <span>{employee.contractCount} contrat{employee.contractCount !== 1 ? 's' : ''}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="w-full sm:w-auto"
                            onClick={() => handleView(employee.id)}
                          >
                            <span>Voir</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full sm:w-auto"
                            onClick={() => router.push(`/dashboard/payslips/generate?employeeId=${employee.id}`)}
                          >
                            <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span>Bulletin</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                                <MoreHorizontal className="h-4 w-4 flex-shrink-0" />
                                <span className="ml-2">Plus</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEdit(employee.id)}>
                                <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span>Modifier</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}
                                className="text-red-600"
                              >
                                <span>Supprimer</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </Card>
                ))}
              </div>
            )
          ) : (
            <NoDataMessage 
              message={
                searchQuery || selectedCompanyId
                  ? `Aucun employé actif ne correspond à votre recherche`
                  : "Aucun employé actif"
              } 
            />
          )}
        </TabsContent>

        <TabsContent value="inactive" className="m-0">
          {filteredEmployees.filter(e => !e.active).length > 0 ? (
            view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredEmployees
                  .filter(e => !e.active)
                  .map(employee => (
                    <Card key={employee.id} className="overflow-hidden">
                      <CardHeader className="px-4 sm:px-6 pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <CardTitle className="text-base">{employee.firstName} {employee.lastName}</CardTitle>
                            <CardDescription className="mt-1">{employee.position}</CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4 flex-shrink-0" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleView(employee.id)}>
                                <ExternalLink className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span>Voir les détails</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(employee.id)}>
                                <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span>Modifier</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}
                                className="text-red-600"
                              >
                                <span>Supprimer</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 sm:px-6">
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{employee.company.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm">Depuis le {formatDate(employee.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm">{employee.contractCount} contrat{employee.contractCount !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="secondary">Inactif</Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="px-4 sm:px-6 pt-0 flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="w-full sm:w-auto"
                          onClick={() => handleView(employee.id)}
                        >
                          <span>Voir le profil</span>
                        </Button>
                      </CardFooter>
                    </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEmployees
                  .filter(e => !e.active)
                  .map(employee => (
                    <Card key={employee.id}>
                      <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium">{employee.firstName} {employee.lastName}</h3>
                            <p className="text-sm text-muted-foreground">{employee.position}</p>
                            <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Building className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate">{employee.company.name}</span>
                              </div>
                              <div className="hidden sm:block">•</div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>Depuis {formatDate(employee.startDate)}</span>
                              </div>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge variant="secondary">Inactif</Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3 flex-shrink-0" />
                                <span>{employee.contractCount} contrat{employee.contractCount !== 1 ? 's' : ''}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="w-full sm:w-auto"
                            onClick={() => handleView(employee.id)}
                          >
                            <span>Voir</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                                <MoreHorizontal className="h-4 w-4 flex-shrink-0" />
                                <span className="ml-2">Plus</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEdit(employee.id)}>
                                <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span>Modifier</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}
                                className="text-red-600"
                              >
                                <span>Supprimer</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </Card>
                ))}
              </div>
            )
          ) : (
            <NoDataMessage 
              message={
                searchQuery || selectedCompanyId
                  ? `Aucun employé inactif ne correspond à votre recherche`
                  : "Aucun employé inactif"
              } 
            />
          )}
        </TabsContent>
      </Tabs>

      {employees.length === 0 && !isLoading && !searchQuery && (
        <EmptyState
          title="Aucun employé trouvé"
          description="Vous n'avez pas encore ajouté d'employé. Commencez par en créer un nouveau."
          icon={Users}
          action={
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>Ajouter un employé</span>
            </Button>
          }
        />
      )}
    </PageContainer>
  );
} 