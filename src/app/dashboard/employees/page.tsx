"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, LayoutList, LayoutGrid, PlusCircle } from "lucide-react";
import EmployeeCard from "@/components/dashboard/EmployeeCard";
import { PageContainer, EmptyState, PageHeader, LoadingState } from "@/components/shared/PageContainer";
import { UserRound } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import EmployeeModal from "@/components/dashboard/EmployeeModal";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  companyId: string;
  companyName?: string;
  isArchived?: boolean;
  isLocked?: boolean;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { toast } = useToast();
  const [openEmployeeModal, setOpenEmployeeModal] = useState(false);
  const { user } = useAuth();

  const fetchEmployees = async () => {
    setIsLoading(true);
    
    try {
      if (!user || !user.uid) {
        console.log("Utilisateur non authentifié");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      const userId = user.uid;
      const employeesData: Employee[] = [];
      
      // Récupérer les employés directement dans la collection employés
      try {
        const employeesRef = collection(db, `users/${userId}/employees`);
        const employeesSnapshot = await getDocs(employeesRef);
        
        console.log(`Récupération des employés: ${employeesSnapshot.size} trouvés.`);
        
        employeesSnapshot.forEach((doc) => {
          const data = doc.data();
          employeesData.push({
            id: doc.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            position: data.position || '',
            companyId: data.companyId || '',
            companyName: data.companyName || '',
            isArchived: data.isArchived || false,
            isLocked: data.isLocked || false
          });
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des employés:", error);
      }
      
      // Filtrer les employés non archivés
      const activeEmployees = employeesData.filter(employee => !employee.isArchived);
      setEmployees(activeEmployees);
      
      if (isRefreshing) {
        toast({
          title: "Actualisé",
          description: `${activeEmployees.length} employés récupérés.`
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger vos employés."
      });
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
        case 'archived':
          title = 'Employé archivé';
          description = name 
            ? `L'employé "${name}" a été archivé avec succès.` 
            : 'L\'employé a été archivé avec succès.';
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
  
  const handleEmployeeCreated = () => {
    // Recharger les données
    fetchEmployees();
  };
  
  const handleEmployeeArchived = () => {
    // Recharger les données après l'archivage
    fetchEmployees();
    
    toast({
      title: "Employé archivé",
      description: "L'employé a été déplacé vers les archives."
    });
  };

  if (isLoading) {
    return <LoadingState message="Chargement des employés..." />;
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Employés" 
        description="Gérez vos différents employés"
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
            <Button variant="secondary" onClick={() => setOpenEmployeeModal(true)}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter un employé
            </Button>
          </div>
        }
      />

      {employees.length === 0 ? (
        <EmptyState
          title="Aucun employé"
          description="Vous n'avez pas encore créé d'employé. Commencez par en ajouter un."
          icon={UserRound}
          action={
            <Button variant="secondary" onClick={() => setOpenEmployeeModal(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter un employé
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {employees.map((employee) => (
            <EmployeeCard 
              key={employee.id} 
              employee={employee} 
              layout="grid" 
              onDelete={fetchEmployees} 
              onArchive={handleEmployeeArchived}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {employees.map((employee) => (
            <EmployeeCard 
              key={employee.id} 
              employee={employee} 
              layout="list" 
              onDelete={fetchEmployees} 
              onArchive={handleEmployeeArchived}
            />
          ))}
        </div>
      )}

      {/* Modale d'ajout d'employé */}
      <EmployeeModal 
        open={openEmployeeModal} 
        onOpenChange={setOpenEmployeeModal} 
        onEmployeeCreated={handleEmployeeCreated}
      />
    </PageContainer>
  );
} 