/**
 * Hook personnalisé pour gérer la récupération des entreprises et des employés
 */

import { useState, useEffect, useCallback } from 'react';
import { CompanyService, EmployeeService } from '@/services';
import { Company } from '@/services/company-service';
import { Employee } from '@/services/employee-service';
import { useAuth } from './useAuth';

interface UseCompanyEmployeesOptions {
  loadOnMount?: boolean;
  companyId?: string;
}

interface UseCompanyEmployeesResult {
  companies: Company[];
  employees: Employee[];
  selectedCompany: Company | null;
  loading: boolean;
  error: string | null;
  loadCompanies: () => Promise<void>;
  loadEmployees: (companyId: string) => Promise<void>;
  selectCompany: (companyId: string) => void;
  refreshData: () => Promise<void>;
}

/**
 * Hook personnalisé pour gérer la récupération et la gestion des entreprises et des employés
 * 
 * @param options Options de configuration du hook
 * @returns Objets et fonctions pour gérer les entreprises et les employés
 */
export function useCompanyEmployees(options: UseCompanyEmployeesOptions = {}): UseCompanyEmployeesResult {
  const { loadOnMount = true, companyId: initialCompanyId } = options;
  const { user } = useAuth();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les entreprises
  const loadCompanies = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const companiesData = await CompanyService.getUserCompanies(user.uid);
      setCompanies(companiesData);
      
      // Si un ID d'entreprise initial est fourni, sélectionner cette entreprise
      if (initialCompanyId) {
        const company = companiesData.find(c => c.id === initialCompanyId) || null;
        setSelectedCompany(company);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des entreprises:', err);
      setError('Impossible de charger les entreprises. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [user, initialCompanyId]);

  // Fonction pour charger les employés d'une entreprise
  const loadEmployees = useCallback(async (companyId: string) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const employeesData = await EmployeeService.getCompanyEmployees(companyId, user.uid);
      setEmployees(employeesData);
    } catch (err) {
      console.error('Erreur lors du chargement des employés:', err);
      setError('Impossible de charger les employés. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fonction pour sélectionner une entreprise et charger ses employés
  const selectCompany = useCallback((companyId: string) => {
    const company = companies.find(c => c.id === companyId) || null;
    setSelectedCompany(company);
    
    if (company) {
      loadEmployees(company.id);
    } else {
      setEmployees([]);
    }
  }, [companies, loadEmployees]);

  // Fonction pour rafraîchir toutes les données
  const refreshData = useCallback(async () => {
    await loadCompanies();
    
    if (selectedCompany) {
      await loadEmployees(selectedCompany.id);
    }
  }, [loadCompanies, loadEmployees, selectedCompany]);

  // Chargement initial des données
  useEffect(() => {
    if (loadOnMount && user) {
      loadCompanies();
    }
  }, [loadOnMount, loadCompanies, user]);

  return {
    companies,
    employees,
    selectedCompany,
    loading,
    error,
    loadCompanies,
    loadEmployees,
    selectCompany,
    refreshData
  };
} 