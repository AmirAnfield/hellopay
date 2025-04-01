"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, LayoutList, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { Company } from "@/services/company-service";
import CompanyCard from "@/components/dashboard/CompanyCard";
import { PageContainer, EmptyState, PageHeader, LoadingState } from "@/components/shared/PageContainer";
import { Building2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { toast } = useToast();

  const fetchCompanies = async () => {
    setIsLoading(true);
    
    try {
      // Simuler un délai pour le chargement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mode développement: lire depuis localStorage
      let mockCompanies: Company[] = [];
      if (typeof window !== 'undefined') {
        try {
          const companiesFromStorage = localStorage.getItem('companies');
          console.log("Récupération des entreprises depuis localStorage:", companiesFromStorage ? "données trouvées" : "aucune donnée");
          
          if (companiesFromStorage) {
            const parsedCompanies = JSON.parse(companiesFromStorage);
            console.log("Entreprises parsées:", parsedCompanies.length);
            
            // Transformation pour correspondre à l'interface Company
            mockCompanies = parsedCompanies.map((company: { 
              id?: string;
              name?: string;
              siret?: string;
              address?: string;
            }) => ({
              id: company.id || `company-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
              name: company.name || '',
              siret: company.siret || '',
              address: company.address || '',
              employeeCount: 0
            }));

            console.log("Entreprises transformées:", mockCompanies.length);
          } else {
            console.log("Aucune entreprise dans localStorage");
          }
        } catch (e) {
          console.error("Erreur lors de la lecture depuis localStorage:", e);
        }
      }
      
      setCompanies(mockCompanies);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    
    // Vérifier si l'utilisateur vient d'effectuer une action (ajout, modification, suppression)
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const name = urlParams.get('name');
    
    if (action) {
      let title = '';
      let description = '';
      
      switch (action) {
        case 'created':
          title = 'Entreprise créée';
          description = name 
            ? `L'entreprise "${name}" a été créée avec succès.` 
            : 'Votre entreprise a été créée avec succès.';
          break;
        case 'updated':
          title = 'Entreprise mise à jour';
          description = name 
            ? `Les informations de l'entreprise "${name}" ont été mises à jour avec succès.` 
            : 'Les informations de l\'entreprise ont été mises à jour avec succès.';
          break;
        case 'deleted':
          title = 'Entreprise supprimée';
          description = name 
            ? `L'entreprise "${name}" a été supprimée avec succès.` 
            : 'L\'entreprise a été supprimée avec succès.';
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
      description: "Mise à jour de la liste des entreprises...",
    });
    fetchCompanies();
  };
  
  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'grid' ? 'list' : 'grid');
  };
  
  if (isLoading) {
    return <LoadingState message="Chargement des entreprises..." />;
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Entreprises" 
        description="Gérez vos différentes entreprises"
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
              <Link href="/dashboard/companies/new">
                <Plus className="mr-2 h-4 w-4" /> Ajouter une entreprise
              </Link>
            </Button>
          </div>
        }
      />

      {companies.length === 0 ? (
        <EmptyState
          title="Aucune entreprise"
          description="Vous n'avez pas encore créé d'entreprise. Commencez par en ajouter une."
          icon={Building2}
          action={
            <Button asChild>
              <Link href="/dashboard/companies/new">
                <Plus className="mr-2 h-4 w-4" /> Ajouter une entreprise
              </Link>
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} layout="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} layout="list" />
          ))}
        </div>
      )}
    </PageContainer>
  );
} 