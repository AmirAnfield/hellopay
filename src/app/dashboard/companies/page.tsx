"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, LayoutList, LayoutGrid, PlusCircle } from "lucide-react";
import CompanyCard from "@/components/dashboard/CompanyCard";
import { PageContainer, EmptyState, PageHeader, LoadingState } from "@/components/shared/PageContainer";
import { Building2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import CompanyModal from "@/components/dashboard/CompanyModal";

// Type pour les entreprises
interface Company {
  id: string;
  name: string;
  siret: string;
  address?: string;
  city?: string;
  postalCode?: string;
  employeeCount?: number;
  country?: string;
  isArchived?: boolean;
  isLocked?: boolean;
  createdAt?: any;
  updatedAt?: any;
  ownerId?: string;
  legalForm?: string;
  apeCode?: string;
  urssafRegion?: string;
  collectiveAgreement?: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [openCompanyModal, setOpenCompanyModal] = useState(false);
  const { toast } = useToast();

  const fetchCompanies = async () => {
    setIsLoading(true);
    
    try {
      if (!auth.currentUser) {
        console.log("Utilisateur non authentifié");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      const userId = auth.currentUser.uid;
      const companiesRef = collection(db, `users/${userId}/companies`);
      const querySnapshot = await getDocs(companiesRef);
      
      const companiesData: Company[] = [];
      querySnapshot.forEach((doc) => {
        // Récupérer les données et les convertir au format attendu
        const data = doc.data();
        companiesData.push({
          id: doc.id,
          name: data.name || '',
          siret: data.siret || '',
          address: data.address || '',
          city: data.city || '',
          postalCode: data.postalCode || '',
          employeeCount: data.employeeCount || 0,
          country: data.country || '',
          isArchived: data.isArchived || false,
          isLocked: data.isLocked || false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          ownerId: data.ownerId || '',
          legalForm: data.legalForm || '',
          apeCode: data.apeCode || '',
          urssafRegion: data.urssafRegion || '',
          collectiveAgreement: data.collectiveAgreement || ''
        });
      });
      
      // Filtrer les entreprises non archivées
      const activeCompanies = companiesData.filter(company => !company.isArchived);
      setCompanies(activeCompanies);
      
      if (isRefreshing) {
        toast({
          title: "Actualisé",
          description: `${activeCompanies.length} entreprises récupérées.`
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger vos entreprises."
      });
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
        case 'archived':
          title = 'Entreprise archivée';
          description = name 
            ? `L'entreprise "${name}" a été archivée avec succès.` 
            : 'L\'entreprise a été archivée avec succès.';
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
  
  const handleCompanyCreated = () => {
    // Recharger les données après création
    fetchCompanies();
  };
  
  const handleCompanyArchived = () => {
    // Recharger les données après archivage
    fetchCompanies();
    
    toast({
      title: "Entreprise archivée",
      description: "L'entreprise a été déplacée vers les archives."
    });
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
            <Button variant="secondary" onClick={() => setOpenCompanyModal(true)}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter une entreprise
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
            <Button variant="secondary" onClick={() => setOpenCompanyModal(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter une entreprise
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard 
              key={company.id} 
              company={company} 
              layout="grid" 
              onArchive={handleCompanyArchived}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {companies.map((company) => (
            <CompanyCard 
              key={company.id} 
              company={company} 
              layout="list" 
              onArchive={handleCompanyArchived}
            />
          ))}
        </div>
      )}

      {/* Modale d'ajout d'entreprise */}
      <CompanyModal 
        open={openCompanyModal} 
        onOpenChange={setOpenCompanyModal} 
        onCompanyCreated={handleCompanyCreated} 
      />
    </PageContainer>
  );
} 