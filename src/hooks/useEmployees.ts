/**
 * Hook personnalisé pour gérer les employés
 * Utilisant les types partagés
 */
import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { 
  getEmployees, 
  getEmployee, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  EmployeeFilterParams 
} from '@/lib/api/employees';
import type { EmployeeResponseDTO, EmployeeCreateRequestDTO, EmployeeUpdateRequestDTO } from '@/lib/types/employees/employee';

interface UseEmployeesOptions {
  initialFilters?: EmployeeFilterParams;
  autoLoad?: boolean;
}

export function useEmployees(options: UseEmployeesOptions = {}) {
  const { initialFilters = {}, autoLoad = true } = options;
  
  // États
  const [employees, setEmployees] = useState<EmployeeResponseDTO[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeResponseDTO | null>(null);
  const [filters, setFilters] = useState<EmployeeFilterParams>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters.page || 1);
  
  // Fonction pour charger la liste des employés
  const loadEmployees = useCallback(async (newFilters?: EmployeeFilterParams) => {
    setIsLoading(true);
    setError(null);
    
    const effectiveFilters = newFilters || filters;
    
    try {
      const result = await getEmployees(effectiveFilters);
      
      setEmployees(result.data);
      setTotalCount(result.meta.total);
      setTotalPages(result.meta.totalPages);
      setCurrentPage(result.meta.page);
      
      if (newFilters) {
        setFilters(newFilters);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des employés:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de charger les employés',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);
  
  // Charger un employé par son ID
  const loadEmployee = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getEmployee(id);
      setCurrentEmployee(result.data);
      return result.data;
    } catch (err) {
      console.error(`Erreur lors du chargement de l'employé ${id}:`, err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de charger les détails de l\'employé',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Créer un nouvel employé
  const addEmployee = useCallback(async (employee: EmployeeCreateRequestDTO) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await createEmployee(employee);
      
      // Mettre à jour la liste si on est sur la première page
      if (filters.page === 1 || !filters.page) {
        loadEmployees();
      }
      
      toast({
        title: 'Employé créé',
        description: 'L\'employé a été créé avec succès',
      });
      
      return result.data;
    } catch (err) {
      console.error('Erreur lors de la création de l\'employé:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de créer l\'employé',
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [filters.page, loadEmployees, toast]);
  
  // Mettre à jour un employé existant
  const editEmployee = useCallback(async (id: string, employee: EmployeeUpdateRequestDTO) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await updateEmployee(id, employee);
      
      // Mettre à jour la liste des employés
      loadEmployees();
      
      // Mettre à jour l'employé actuel s'il est sélectionné
      if (currentEmployee && currentEmployee.id === id) {
        setCurrentEmployee(result.data);
      }
      
      toast({
        title: 'Employé mis à jour',
        description: 'L\'employé a été mis à jour avec succès',
      });
      
      return result.data;
    } catch (err) {
      console.error(`Erreur lors de la mise à jour de l'employé ${id}:`, err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de mettre à jour l\'employé',
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [currentEmployee, loadEmployees, toast]);
  
  // Supprimer un employé
  const removeEmployee = useCallback(async (id: string) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await deleteEmployee(id);
      
      // Mettre à jour la liste des employés
      loadEmployees();
      
      // Réinitialiser l'employé actuel s'il correspond à celui qui a été supprimé
      if (currentEmployee && currentEmployee.id === id) {
        setCurrentEmployee(null);
      }
      
      toast({
        title: 'Employé supprimé',
        description: 'L\'employé a été supprimé avec succès',
      });
      
      return true;
    } catch (err) {
      console.error(`Erreur lors de la suppression de l'employé ${id}:`, err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de supprimer l\'employé',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [currentEmployee, loadEmployees, toast]);
  
  // Mise à jour des filtres
  const updateFilters = useCallback((newFilters: Partial<EmployeeFilterParams>) => {
    const updatedFilters = { ...filters, ...newFilters };
    loadEmployees(updatedFilters);
  }, [filters, loadEmployees]);
  
  // Changer de page
  const changePage = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);
  
  // Chargement initial
  useEffect(() => {
    if (autoLoad) {
      loadEmployees();
    }
  }, [autoLoad, loadEmployees]);
  
  return {
    // Données
    employees,
    currentEmployee,
    totalCount,
    totalPages,
    currentPage,
    filters,
    
    // États
    isLoading,
    isSubmitting,
    error,
    
    // Actions
    loadEmployees,
    loadEmployee,
    addEmployee,
    editEmployee,
    removeEmployee,
    updateFilters,
    changePage,
    setCurrentEmployee,
  };
} 