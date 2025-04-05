"use client";

import { useEffect, useState } from "react";
import { PageContainer, PageHeader, NoDataMessage } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";
import { Plus, Search, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import EmployeeCard from "@/components/dashboard/EmployeeCard";
import { useFirestorePagination } from "@/hooks";
import { Employee } from "@/types/firebase";
import { Pagination, PaginationInfo, PageSizeSelector } from "@/components/shared/Pagination";
import { Input } from "@/components/ui/input";
import EmployeeModal from "@/components/dashboard/EmployeeModal";

/**
 * Page de gestion des employés avec pagination optimisée
 */
export default function EmployeesPage() {
  const { user } = useAuth();
  const [openEmployeeModal, setOpenEmployeeModal] = useState(false);
  
  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState("");
  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Utilisation du hook personnalisé pour la pagination Firestore
  const {
    data: employees,
    loading,
    error: firestoreError,
    hasMore,
    totalCount,
    refresh,
    loadMore
  } = useFirestorePagination<Employee>(
    "employees",
    {
      limit: pageSize,
      sortBy: "lastName",
      sortDirection: "asc",
      whereConditions: searchTerm 
        ? [{ field: "lastName", operator: ">=", value: searchTerm }] 
        : undefined,
      autoLoad: true,
      fetchTotalCount: true
    }
  );

  // Synchroniser l'état de chargement
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Pour la pagination côté client, on peut simplement mettre à jour currentPage
    // Pour une vraie pagination côté serveur, on devrait appeler refresh() avec les bons paramètres
  };

  // Gérer le changement de taille de page
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    refresh();
  };

  // Gérer la soumission de la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refresh();
  };

  // Gérer la création d'un nouvel employé
  const handleEmployeeCreated = () => {
    refresh();
  };

  // Calculer le nombre total de pages
  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : 0;

  // Vérifier si l'utilisateur est connecté
  if (!user) {
    return null; // L'utilisateur sera redirigé par le middleware
  }

  return (
    <PageContainer>
      <PageHeader
        title="Gestion des employés"
        description="Ajoutez et gérez les employés de votre entreprise"
        actions={
          <Button onClick={() => setOpenEmployeeModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un employé
          </Button>
        }
      />

      {/* Filtres et recherche */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Rechercher par nom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" variant="secondary">
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {employees.length === 0 ? (
            <NoDataMessage message="Aucun employé n'a été trouvé. Ajoutez un employé pour commencer." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onEmployeeUpdated={refresh}
                />
              ))}
            </div>
          )}

          {/* Contrôles de pagination */}
          {employees.length > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              {totalCount !== null && (
                <PaginationInfo
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalItems={totalCount}
                />
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <PageSizeSelector
                  pageSize={pageSize}
                  onPageSizeChange={handlePageSizeChange}
                />
                
                {totalPages > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </div>
          )}

          {/* Bouton "Charger plus" pour l'alternative de pagination infinie */}
          {hasMore && (
            <div className="text-center pt-6">
              <Button 
                variant="outline" 
                onClick={() => loadMore()}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Charger plus
              </Button>
            </div>
          )}

          {/* Afficher une erreur si nécessaire */}
          {firestoreError && (
            <div className="mt-4 p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
              <p className="font-medium">Une erreur est survenue</p>
              <p className="text-sm mt-1">{firestoreError.message}</p>
            </div>
          )}
        </>
      )}

      <EmployeeModal
        open={openEmployeeModal}
        onOpenChange={setOpenEmployeeModal}
        onEmployeeCreated={handleEmployeeCreated}
      />
    </PageContainer>
  );
} 