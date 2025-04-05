"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, LayoutList, LayoutGrid } from "lucide-react";
import EmployeeCard from "@/components/dashboard/EmployeeCard";
import CompanyCard from "@/components/dashboard/CompanyCard";
import { PageContainer, EmptyState, PageHeader, LoadingState } from "@/components/shared/PageContainer";
import { Archive } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  addressComplement?: string;
  postalCode: string;
  city: string;
  birthDate: string;
  birthPlace?: string;
  nationality?: string;
  socialSecurityNumber?: string;
  iban?: string;
  hiringDate?: string;
  position?: string;
  isLocked?: boolean;
  isArchived?: boolean;
  company?: {
    id: string;
    name: string;
  };
  companyId?: string;
  companyName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Company {
  id: string;
  name: string;
  siret: string;
  isArchived?: boolean;
}

export default function ArchivesPage() {
  const [archivedEmployees, setArchivedEmployees] = useState<Employee[]>([]);
  const [archivedCompanies, setArchivedCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchArchives = async () => {
    setIsLoading(true);
    
    try {
      if (!user || !user.uid) {
        console.log("Utilisateur non authentifié");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      const userId = user.uid;
      
      // Récupérer les employés archivés
      try {
        const employeesRef = collection(db, `users/${userId}/employees`);
        const employeesSnapshot = await getDocs(employeesRef);
        
        const archivedEmployeesList: Employee[] = [];
        
        employeesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.isArchived) {
            archivedEmployeesList.push({
              id: doc.id,
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              position: data.position || '',
              companyId: data.companyId || '',
              companyName: data.companyName || '',
              email: data.email || '',
              phoneNumber: data.phoneNumber || '',
              address: data.address || '',
              addressComplement: data.addressComplement,
              postalCode: data.postalCode || '',
              city: data.city || '',
              birthDate: data.birthDate || '',
              birthPlace: data.birthPlace,
              nationality: data.nationality,
              socialSecurityNumber: data.socialSecurityNumber,
              iban: data.iban,
              hiringDate: data.hiringDate,
              isArchived: true,
              isLocked: data.isLocked || false,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });
          }
        });
        
        setArchivedEmployees(archivedEmployeesList);
      } catch (error) {
        console.error("Erreur lors de la récupération des employés archivés:", error);
      }
      
      // Récupérer les entreprises archivées
      try {
        const companiesRef = collection(db, `users/${userId}/companies`);
        const companiesSnapshot = await getDocs(companiesRef);
        
        const archivedCompaniesList: Company[] = [];
        
        companiesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.isArchived) {
            archivedCompaniesList.push({
              id: doc.id,
              name: data.name || '',
              siret: data.siret || '',
              isArchived: true
            });
          }
        });
        
        setArchivedCompanies(archivedCompaniesList);
      } catch (error) {
        console.error("Erreur lors de la récupération des entreprises archivées:", error);
      }
      
      if (isRefreshing) {
        toast({
          title: "Archives actualisées",
          description: `${archivedEmployees.length} employés et ${archivedCompanies.length} entreprises archivés.`
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des archives:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les archives."
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, [toast]);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    toast({
      title: "Rafraîchissement",
      description: "Mise à jour des archives...",
    });
    fetchArchives();
  };
  
  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'grid' ? 'list' : 'grid');
  };
  
  const handleEmployeeUnarchived = () => {
    // Recharger les données après le désarchivage
    fetchArchives();
    
    toast({
      title: "Employé désarchivé",
      description: "L'employé a été retiré des archives."
    });
  };
  
  const handleCompanyUnarchived = () => {
    // Recharger les données après le désarchivage
    fetchArchives();
    
    toast({
      title: "Entreprise désarchivée",
      description: "L'entreprise a été retirée des archives."
    });
  };

  if (isLoading) {
    return <LoadingState message="Chargement des archives..." />;
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Archives" 
        description="Consultez et gérez vos éléments archivés"
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
          </div>
        }
      />
      
      <Tabs defaultValue="employees" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="employees">Employés</TabsTrigger>
          <TabsTrigger value="companies">Entreprises</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employees">
          {archivedEmployees.length === 0 ? (
            <EmptyState
              title="Aucun employé archivé"
              description="Il n'y a aucun employé dans les archives."
              icon={Archive}
            />
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {archivedEmployees.map((employee) => (
                <EmployeeCard 
                  key={employee.id} 
                  employee={employee} 
                  layout="grid" 
                  onUnarchive={handleEmployeeUnarchived} 
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {archivedEmployees.map((employee) => (
                <EmployeeCard 
                  key={employee.id} 
                  employee={employee} 
                  layout="list" 
                  onUnarchive={handleEmployeeUnarchived} 
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="companies">
          {archivedCompanies.length === 0 ? (
            <EmptyState
              title="Aucune entreprise archivée"
              description="Il n'y a aucune entreprise dans les archives."
              icon={Archive}
            />
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {archivedCompanies.map((company) => (
                <CompanyCard 
                  key={company.id} 
                  company={company} 
                  layout="grid" 
                  onUnarchive={handleCompanyUnarchived} 
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {archivedCompanies.map((company) => (
                <CompanyCard 
                  key={company.id} 
                  company={company} 
                  layout="list" 
                  onUnarchive={handleCompanyUnarchived} 
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
} 