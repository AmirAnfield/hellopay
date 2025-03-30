"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Users, 
  FileText, 
  ExternalLink 
} from "lucide-react";
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

interface Company {
  id: string;
  name: string;
  siret: string;
  address: string;
  employeeCount: number;
  active: boolean;
}

export default function CompaniesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");

  // Charger les données des entreprises
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        // Simulons une requête API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Données fictives pour la démonstration
        const mockCompanies: Company[] = [
          {
            id: "1",
            name: "Tech Solutions",
            siret: "12345678901234",
            address: "123 Rue de la Technologie, 75000 Paris",
            employeeCount: 8,
            active: true
          },
          {
            id: "2",
            name: "ABC Consulting",
            siret: "98765432101234",
            address: "45 Avenue des Consultants, 69000 Lyon",
            employeeCount: 4,
            active: true
          },
          {
            id: "3",
            name: "GreenLife Design",
            siret: "45678901231234",
            address: "78 Boulevard Écologique, 33000 Bordeaux",
            employeeCount: 0,
            active: false
          }
        ];
        
        setCompanies(mockCompanies);
      } catch (error) {
        console.error("Erreur lors du chargement des entreprises:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les entreprises. Veuillez réessayer."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCompanies();
  }, [toast]);

  // Filtrer les entreprises par recherche
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.siret.includes(searchQuery) ||
    company.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Actions pour les entreprises
  const handleView = (companyId: string) => {
    router.push(`/dashboard/companies/${companyId}`);
  };

  const handleEdit = (companyId: string) => {
    router.push(`/dashboard/companies/${companyId}/edit`);
  };

  const handleDelete = (companyId: string, companyName: string) => {
    // Normalement, on demanderait une confirmation et on enverrait une requête DELETE à l'API
    toast({
      title: "Entreprise supprimée",
      description: `L'entreprise "${companyName}" a été supprimée avec succès.`,
    });
    setCompanies(prevCompanies => prevCompanies.filter(c => c.id !== companyId));
  };

  const handleEmployeesList = (companyId: string) => {
    router.push(`/dashboard/employees?companyId=${companyId}`);
  };

  const handleCreateNew = () => {
    router.push("/dashboard/companies/new");
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Entreprises"
          description="Gérez les entreprises pour lesquelles vous générez des bulletins de paie"
        />
        <LoadingState message="Chargement des entreprises..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Entreprises"
        description="Gérez les entreprises pour lesquelles vous générez des bulletins de paie"
        actions={
          <HeaderActions>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="relative flex-grow">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Rechercher une entreprise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
              <Button onClick={handleCreateNew} className="flex-shrink-0 w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Ajouter une entreprise</span>
              </Button>
            </div>
          </HeaderActions>
        }
      />

      <Tabs defaultValue="all" className="space-y-4 sm:space-y-6">
        <TabsList className="mb-2 flex w-full flex-wrap overflow-x-auto md:flex-nowrap">
          <TabsTrigger value="all" className="flex-1 min-w-[100px]">
            <span className="truncate">Toutes</span>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex-1 min-w-[100px]">
            <span className="truncate">Actives</span>
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex-1 min-w-[100px]">
            <span className="truncate">Inactives</span>
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
          {filteredCompanies.length > 0 ? (
            view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredCompanies.map(company => (
                  <Card key={company.id} className="overflow-hidden">
                    <CardHeader className="px-4 sm:px-6 pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Building className="h-5 w-5 text-primary flex-shrink-0" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{company.name}</CardTitle>
                            <CardDescription>{company.siret}</CardDescription>
                          </div>
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
                            <DropdownMenuItem onClick={() => handleView(company.id)}>
                              <ExternalLink className="mr-2 h-4 w-4 flex-shrink-0" />
                              <span>Voir les détails</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(company.id)}>
                              <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                              <span>Modifier</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEmployeesList(company.id)}>
                              <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                              <span>Voir les employés</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(company.id, company.name)}
                              className="text-red-600"
                            >
                              <span>Supprimer</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                      <div className="text-sm text-muted-foreground truncate">
                        {company.address}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant={company.active ? "default" : "secondary"}>
                          {company.active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="h-3 w-3 flex-shrink-0" />
                          <span>{company.employeeCount} employés</span>
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="px-4 sm:px-6 pt-0 flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full sm:w-auto"
                        onClick={() => handleView(company.id)}
                      >
                        <span>Voir</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full sm:w-auto"
                        onClick={() => handleEmployeesList(company.id)}
                      >
                        <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span>{company.employeeCount} employés</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCompanies.map(company => (
                  <Card key={company.id}>
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                          <Building className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium">{company.name}</h3>
                          <p className="text-sm text-muted-foreground">{company.siret}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-md">{company.address}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge variant={company.active ? "default" : "secondary"}>
                              {company.active ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Users className="h-3 w-3 flex-shrink-0" />
                              <span>{company.employeeCount} employés</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="w-full sm:w-auto"
                          onClick={() => handleView(company.id)}
                        >
                          <span>Voir</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full sm:w-auto"
                          onClick={() => handleEdit(company.id)}
                        >
                          <span>Modifier</span>
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
                            <DropdownMenuItem onClick={() => handleEmployeesList(company.id)}>
                              <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                              <span>Voir les employés</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(company.id, company.name)}
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
                searchQuery 
                  ? `Aucune entreprise ne correspond à "${searchQuery}"`
                  : "Aucune entreprise trouvée"
              } 
            />
          )}
        </TabsContent>

        <TabsContent value="active" className="m-0">
          {filteredCompanies.filter(c => c.active).length > 0 ? (
            view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredCompanies
                  .filter(c => c.active)
                  .map(company => (
                    <Card key={company.id} className="overflow-hidden">
                      <CardHeader className="px-4 sm:px-6 pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Building className="h-5 w-5 text-primary flex-shrink-0" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{company.name}</CardTitle>
                              <CardDescription>{company.siret}</CardDescription>
                            </div>
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
                              <DropdownMenuItem onClick={() => handleView(company.id)}>
                                <ExternalLink className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span>Voir les détails</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(company.id)}>
                                <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span>Modifier</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEmployeesList(company.id)}>
                                <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span>Voir les employés</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(company.id, company.name)}
                                className="text-red-600"
                              >
                                <span>Supprimer</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 sm:px-6">
                        <div className="text-sm text-muted-foreground truncate">
                          {company.address}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="default">Active</Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="h-3 w-3 flex-shrink-0" />
                            <span>{company.employeeCount} employés</span>
                          </Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="px-4 sm:px-6 pt-0 flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="w-full sm:w-auto"
                          onClick={() => handleView(company.id)}
                        >
                          <span>Voir</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full sm:w-auto"
                          onClick={() => handleEmployeesList(company.id)}
                        >
                          <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span>{company.employeeCount} employés</span>
                        </Button>
                      </CardFooter>
                    </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCompanies
                  .filter(c => c.active)
                  .map(company => (
                    <Card key={company.id}>
                      <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                            <Building className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium">{company.name}</h3>
                            <p className="text-sm text-muted-foreground">{company.siret}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-md">{company.address}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge variant="default">Active</Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Users className="h-3 w-3 flex-shrink-0" />
                                <span>{company.employeeCount} employés</span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="w-full sm:w-auto"
                            onClick={() => handleView(company.id)}
                          >
                            <span>Voir</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full sm:w-auto"
                            onClick={() => handleEdit(company.id)}
                          >
                            <span>Modifier</span>
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
                              <DropdownMenuItem onClick={() => handleEmployeesList(company.id)}>
                                <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span>Voir les employés</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(company.id, company.name)}
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
                searchQuery 
                  ? `Aucune entreprise active ne correspond à "${searchQuery}"`
                  : "Aucune entreprise active"
              } 
            />
          )}
        </TabsContent>

        <TabsContent value="inactive" className="m-0">
          {filteredCompanies.filter(c => !c.active).length > 0 ? (
            view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredCompanies
                  .filter(c => !c.active)
                  .map(company => (
                    <Card key={company.id} className="overflow-hidden">
                      <CardHeader className="px-4 sm:px-6 pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Building className="h-5 w-5 text-primary flex-shrink-0" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{company.name}</CardTitle>
                              <CardDescription>{company.siret}</CardDescription>
                            </div>
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
                              <DropdownMenuItem onClick={() => handleView(company.id)}>
                                <ExternalLink className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span>Voir les détails</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(company.id)}>
                                <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span>Modifier</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEmployeesList(company.id)}>
                                <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span>Voir les employés</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(company.id, company.name)}
                                className="text-red-600"
                              >
                                <span>Supprimer</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 sm:px-6">
                        <div className="text-sm text-muted-foreground truncate">
                          {company.address}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="secondary">Inactive</Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="h-3 w-3 flex-shrink-0" />
                            <span>{company.employeeCount} employés</span>
                          </Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="px-4 sm:px-6 pt-0 flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="w-full sm:w-auto"
                          onClick={() => handleView(company.id)}
                        >
                          <span>Voir</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full sm:w-auto"
                          onClick={() => handleEmployeesList(company.id)}
                        >
                          <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span>{company.employeeCount} employés</span>
                        </Button>
                      </CardFooter>
                    </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCompanies
                  .filter(c => !c.active)
                  .map(company => (
                    <Card key={company.id}>
                      <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                            <Building className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium">{company.name}</h3>
                            <p className="text-sm text-muted-foreground">{company.siret}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-md">{company.address}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge variant="secondary">Inactive</Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Users className="h-3 w-3 flex-shrink-0" />
                                <span>{company.employeeCount} employés</span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="w-full sm:w-auto"
                            onClick={() => handleView(company.id)}
                          >
                            <span>Voir</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full sm:w-auto"
                            onClick={() => handleEdit(company.id)}
                          >
                            <span>Modifier</span>
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
                              <DropdownMenuItem onClick={() => handleEmployeesList(company.id)}>
                                <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span>Voir les employés</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(company.id, company.name)}
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
                searchQuery 
                  ? `Aucune entreprise inactive ne correspond à "${searchQuery}"`
                  : "Aucune entreprise inactive"
              } 
            />
          )}
        </TabsContent>
      </Tabs>

      {companies.length === 0 && !isLoading && !searchQuery && (
        <EmptyState
          title="Aucune entreprise trouvée"
          description="Vous n'avez pas encore ajouté d'entreprise. Commencez par en créer une nouvelle."
          icon={Building}
          action={
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>Ajouter une entreprise</span>
            </Button>
          }
        />
      )}
    </PageContainer>
  );
} 