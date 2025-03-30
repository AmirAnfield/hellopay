"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ContractTable from "./components/ContractTable";
import { fetchContracts, ContractFilter } from "@/lib/api/contracts";
import Pagination from "@/components/shared/Pagination";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader, LoadingState, EmptyState } from "@/components/shared/PageContainer";

// Définir des types pour status et contractType
type ContractStatus = "active" | "expired" | "terminated" | "draft" | undefined;
type ContractType = "employment" | "service" | "nda" | "partnership" | "other" | undefined;

export default function ContractsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // États pour les filtres et la pagination
  const [filters, setFilters] = useState<ContractFilter>({
    page: Number(searchParams.get("page") || 1),
    pageSize: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState<ContractStatus>(searchParams.get("status") as ContractStatus || undefined);
  const [contractType, setContractType] = useState<ContractType>(searchParams.get("type") as ContractType || undefined);

  // États pour les données
  const [contracts, setContracts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Mettre à jour l'URL avec les filtres
  const updateURL = useCallback(() => {
    const newParams = new URLSearchParams();
    
    newParams.set("page", filters.page.toString());
    
    if (search) {
      newParams.set("search", search);
    }
    
    if (status) {
      newParams.set("status", status);
    }
    
    if (contractType) {
      newParams.set("type", contractType);
    }
    
    router.push(`/dashboard/contracts?${newParams.toString()}`, { scroll: false });
  }, [router, filters, search, status, contractType]);

  // Chargement des contrats
  const loadContracts = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const result = await fetchContracts({
        ...filters,
        search: search || undefined,
        status: status,
        contractType: contractType,
      });

      setContracts(result.data);
      setPagination(result.pagination);
      updateURL();
    } catch (error) {
      console.error("Erreur lors du chargement des contrats:", error);
      setIsError(true);
      toast({
        title: "Erreur",
        description: "Impossible de charger les contrats",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les contrats au chargement initial et quand les filtres changent
  useEffect(() => {
    loadContracts();
  }, [filters]);

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Gérer la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Réinitialiser la page à 1 lors d'une nouvelle recherche
    setFilters((prev) => ({ ...prev, page: 1 }));
    loadContracts();
  };

  // Gérer les changements de filtres
  const handleFilterChange = (key: string, value: ContractStatus | ContractType) => {
    if (key === "status") setStatus(value as ContractStatus);
    if (key === "contractType") setContractType(value as ContractType);
    // Réinitialiser la page à 1 lors d'un changement de filtre
    setFilters((prev) => ({ ...prev, page: 1 }));
    loadContracts();
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearch("");
    setStatus(undefined);
    setContractType(undefined);
    setFilters({
      page: 1,
      pageSize: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = search || status || contractType;

  return (
    <PageContainer>
      <PageHeader 
        title="Contrats" 
        description="Gérez vos contrats et autres documents juridiques"
        actions={
          <Button asChild>
            <Link href="/dashboard/contracts/create">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau contrat
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Tous les contrats</CardTitle>
          <CardDescription>
            Visualisez, filtrez et gérez vos contrats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <TabsList className="mb-4 md:mb-0">
                <TabsTrigger value="all" onClick={() => setStatus(undefined)}>
                  Tous
                </TabsTrigger>
                <TabsTrigger value="active" onClick={() => handleFilterChange("status", "active")}>
                  Actifs
                </TabsTrigger>
                <TabsTrigger value="expired" onClick={() => handleFilterChange("status", "expired")}>
                  Expirés
                </TabsTrigger>
                <TabsTrigger value="terminated" onClick={() => handleFilterChange("status", "terminated")}>
                  Résiliés
                </TabsTrigger>
                <TabsTrigger value="draft" onClick={() => handleFilterChange("status", "draft")}>
                  Brouillons
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-col md:flex-row gap-2">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-auto md:w-[250px]"
                  />
                  <Button type="submit" variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>

                <div className="flex gap-2">
                  <Select
                    value={contractType || ""}
                    onValueChange={(value) => handleFilterChange("contractType", value || undefined)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <div className="flex items-center justify-between gap-2">
                        <Filter className="h-4 w-4" />
                        <span>{contractType ? "Type: " + contractType : "Type"}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les types</SelectItem>
                      <SelectItem value="employment">Contrat de travail</SelectItem>
                      <SelectItem value="service">Contrat de service</SelectItem>
                      <SelectItem value="nda">Accord de confidentialité</SelectItem>
                      <SelectItem value="partnership">Partenariat</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" onClick={resetFilters} className="h-10">
                    Réinitialiser
                  </Button>
                )}
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mb-4 flex flex-wrap gap-2">
                {search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Recherche: {search}
                    <button
                      className="ml-1 hover:bg-muted rounded-full"
                      onClick={() => {
                        setSearch("");
                        setFilters((prev) => ({ ...prev, page: 1 }));
                        loadContracts();
                      }}
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {status && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Statut: {status}
                    <button
                      className="ml-1 hover:bg-muted rounded-full"
                      onClick={() => {
                        setStatus(undefined);
                        setFilters((prev) => ({ ...prev, page: 1 }));
                        loadContracts();
                      }}
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {contractType && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Type: {contractType}
                    <button
                      className="ml-1 hover:bg-muted rounded-full"
                      onClick={() => {
                        setContractType(undefined);
                        setFilters((prev) => ({ ...prev, page: 1 }));
                        loadContracts();
                      }}
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}

            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <LoadingState />
              ) : isError ? (
                <div className="text-center py-8 text-muted-foreground">
                  Une erreur est survenue lors du chargement des contrats. 
                  <Button variant="link" onClick={loadContracts}>
                    Réessayer
                  </Button>
                </div>
              ) : contracts.length === 0 ? (
                <EmptyState 
                  title="Aucun contrat trouvé"
                  description={hasActiveFilters
                    ? "Aucun contrat ne correspond à vos critères de recherche."
                    : "Vous n'avez pas encore de contrats. Cliquez sur 'Nouveau contrat' pour en créer un."}
                  action={
                    !hasActiveFilters && (
                      <Button asChild>
                        <Link href="/dashboard/contracts/create">
                          <Plus className="h-4 w-4 mr-2" />
                          Nouveau contrat
                        </Link>
                      </Button>
                    )
                  }
                />
              ) : (
                <>
                  <ContractTable contracts={contracts} />
                  <div className="mt-4">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      totalItems={pagination.totalCount}
                      pageSize={pagination.pageSize}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            {/* Les autres TabsContent réutilisent le même contenu que "all" */}
            {["active", "expired", "terminated", "draft"].map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue} className="mt-0">
                {isLoading ? (
                  <LoadingState />
                ) : contracts.length === 0 ? (
                  <EmptyState 
                    title="Aucun contrat trouvé"
                    description="Aucun contrat ne correspond à vos critères de recherche."
                  />
                ) : (
                  <>
                    <ContractTable contracts={contracts} />
                    <div className="mt-4">
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                        totalItems={pagination.totalCount}
                        pageSize={pagination.pageSize}
                      />
                    </div>
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </PageContainer>
  );
} 