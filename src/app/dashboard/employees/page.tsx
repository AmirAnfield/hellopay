"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, LayoutList, LayoutGrid } from "lucide-react";
import Link from "next/link";
import EmployeeCard from "@/components/dashboard/EmployeeCard";
import { PageContainer, EmptyState, PageHeader, LoadingState } from "@/components/shared/PageContainer";
import { User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  companyId: string;
  companyName?: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { toast } = useToast();

  const fetchEmployees = async () => {
    setIsLoading(true);
    
    try {
      // Simuler un délai pour le chargement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mode développement: lire depuis localStorage
      let mockEmployees: Employee[] = [];
      if (typeof window !== 'undefined') {
        try {
          const employeesFromStorage = localStorage.getItem('employees');
          console.log("Récupération des employés depuis localStorage:", employeesFromStorage ? "données trouvées" : "aucune donnée");
          
          if (employeesFromStorage) {
            const parsedEmployees = JSON.parse(employeesFromStorage);
            console.log("Employés parsés:", parsedEmployees.length);
            
            // Transformation pour correspondre à l'interface Employee
            mockEmployees = parsedEmployees;
          } else {
            console.log("Aucun employé dans localStorage");
          }
        } catch (e) {
          console.error("Erreur lors de la lecture depuis localStorage:", e);
        }
      }
      
      setEmployees(mockEmployees);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    
    // Vérifier si l'utilisateur vient d'effectuer une action (ajout, modification, suppression)
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const name = urlParams.get('name');
    
    if (action) {
      let title = '';
      let description = '';
      
      switch (action) {
        case 'created':
          title = 'Employé créé';
          description = name 
            ? `L'employé "${name}" a été créé avec succès.` 
            : 'L\'employé a été créé avec succès.';
          break;
        case 'updated':
          title = 'Employé mis à jour';
          description = name 
            ? `Les informations de l'employé "${name}" ont été mises à jour avec succès.` 
            : 'Les informations de l\'employé ont été mises à jour avec succès.';
          break;
        case 'deleted':
          title = 'Employé supprimé';
          description = name 
            ? `L'employé "${name}" a été supprimé avec succès.` 
            : 'L\'employé a été supprimé avec succès.';
          break;
      }
      
      if (title) {
        toast({
          title,
          description,
        });
        
        // Nettoyer l'URL pour éviter des notifications répétées lors des rechargements
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [toast]);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    toast({
      title: "Rafraîchissement",
      description: "Mise à jour de la liste des employés...",
    });
    fetchEmployees();
  };
  
  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'grid' ? 'list' : 'grid');
  };
  
  if (isLoading) {
    return <LoadingState message="Chargement des employés..." />;
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Employés" 
        description="Gérez vos employés"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={toggleViewMode} size="sm">
              {viewMode === 'grid' ? (
                <>
                  <LayoutList className="mr-2 h-4 w-4" />
                  Vue liste
                </>
              ) : (
                <>
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Vue grille
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Rafraîchissement...' : 'Rafraîchir'}
            </Button>
            <Button asChild>
              <Link href="/dashboard/employees/new">
                <Plus className="mr-2 h-4 w-4" /> Ajouter un employé
              </Link>
            </Button>
          </div>
        }
      />

      {employees.length === 0 ? (
        <EmptyState
          title="Aucun employé"
          description="Vous n'avez pas encore créé d'employé. Commencez par en ajouter un."
          icon={User}
          action={
            <Button asChild>
              <Link href="/dashboard/employees/new">
                <Plus className="mr-2 h-4 w-4" /> Ajouter un employé
              </Link>
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {employees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} layout="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {employees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} layout="list" />
          ))}
        </div>
      )}
    </PageContainer>
  );
} 