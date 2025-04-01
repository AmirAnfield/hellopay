"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useParams } from 'next/navigation';
import { Company } from '@/services/company-service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompanyDetail from '@/components/enterprise/CompanyDetail';
import DeleteCompanyButton from '@/components/enterprise/DeleteCompanyButton';
import CompanyEmployeesList from '@/components/enterprise/CompanyEmployeesList';
import { PageContainer, LoadingState } from '@/components/shared/PageContainer';
import { ArrowLeft } from 'lucide-react';

export default function CompanyClientPage() {
  const params = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Récupérer l'ID de l'entreprise depuis les paramètres d'URL
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    
    if (!id) {
      setError("ID d'entreprise non trouvé");
      setIsLoading(false);
      return;
    }
    
    // Fonction pour récupérer l'entreprise
    const getCompanyFromStorage = () => {
      try {
        console.log("Recherche de l'entreprise", id, "dans localStorage");
        const companiesStr = localStorage.getItem('companies');
        
        if (!companiesStr) {
          console.log("Aucune entreprise trouvée dans localStorage");
          setError("Entreprise non trouvée");
          setIsLoading(false);
          return;
        }

        const companies = JSON.parse(companiesStr);
        console.log("Entreprises trouvées:", companies.length);
        
        const foundCompany = companies.find((c: { id: string }) => c.id === id);
        
        if (foundCompany) {
          console.log("Entreprise trouvée:", foundCompany.name);
          setCompany(foundCompany);
        } else {
          console.log("Entreprise non trouvée avec l'ID:", id);
          setError("Entreprise non trouvée");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'entreprise:", error);
        setError("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };
    
    // Appeler la fonction après un court délai pour s'assurer que le DOM est prêt
    setTimeout(getCompanyFromStorage, 100);
  }, [params.id]);
  
  if (isLoading) {
    return <LoadingState message="Chargement des données de l'entreprise..." />;
  }
  
  if (error || !company) {
    return (
      <PageContainer>
        <Card>
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "Impossible de charger les détails de l'entreprise."}</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/companies">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste des entreprises
              </Link>
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <div className="grid gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/companies">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">{company.name}</h1>
          </div>
          <DeleteCompanyButton companyId={company.id} />
        </div>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="employees">Employés</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Informations de l&apos;entreprise</CardTitle>
                <CardDescription>
                  Coordonnées et informations légales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CompanyDetail company={company} />
                
                <div className="mt-6 flex justify-end">
                  <Button 
                    variant="outline" 
                    className="mr-2"
                    asChild
                  >
                    <Link href={`/dashboard/companies/${company.id}/edit`}>
                      Modifier
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Employés</CardTitle>
                <CardDescription>
                  Liste des employés de l&apos;entreprise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CompanyEmployeesList companyId={company.id} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                  Documents associés à l&apos;entreprise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Cette fonctionnalité sera bientôt disponible.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
} 