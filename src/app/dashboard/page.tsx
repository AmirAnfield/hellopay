"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Company } from "@/services/company-service";
import Link from "next/link";
import { PlusCircle, Building, Users, FileText } from "lucide-react";

// Hook personnalisé pour récupérer les entreprises du localStorage
function useLocalStorageCompanies<T>() {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Récupérer les entreprises depuis le localStorage
      if (typeof window !== 'undefined') {
        try {
          const companiesFromStorage = localStorage.getItem('companies');
          if (companiesFromStorage) {
            const parsedCompanies = JSON.parse(companiesFromStorage);
            setData(parsedCompanies as T[]);
          }
        } catch (e) {
          console.warn("Erreur lors de la récupération des entreprises du localStorage:", e);
        }
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, []);
  
  return {
    data,
    loading
  };
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  
  // Utiliser notre hook personnalisé qui retourne un tableau vide
  const { data: companies, loading: companiesLoading } = useLocalStorageCompanies<Company>();
  
  // Afficher un état de chargement
  if (authLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-12 w-full mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    return null; // Le middleware gérera la redirection
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-gray-500">Bienvenue, {user.displayName || user.email}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Entreprises</CardTitle>
            <CardDescription>Gérez vos entreprises</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{companiesLoading ? '...' : companies?.length || 0}</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/companies" className="w-full">
              <Button variant="outline" className="w-full">
                <Building className="mr-2 h-4 w-4" />
                Voir les entreprises
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Employés</CardTitle>
            <CardDescription>Gérez vos employés</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/employees" className="w-full">
              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Voir les employés
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Bulletins de paie</CardTitle>
            <CardDescription>Gérez vos bulletins</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/payslips" className="w-full">
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Voir les bulletins
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Vos entreprises</h2>
        {companiesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : companies && companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <Card key={company.id}>
                <CardHeader>
                  <CardTitle>{company.name}</CardTitle>
                  <CardDescription>SIRET: {company.siret}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{company.address || ''}, {company.postalCode || ''} {company.city || ''}</p>
                </CardContent>
                <CardFooter>
                  <Link href={`/dashboard/companies/${company.id}`} className="w-full">
                    <Button variant="outline" className="w-full">Gérer</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
            <Link href="/dashboard/companies/new">
              <Card className="h-full border-dashed cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center justify-center p-6">
                <PlusCircle className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 font-medium">Ajouter une entreprise</p>
              </Card>
            </Link>
          </div>
        ) : (
          <Card className="bg-gray-50">
            <CardContent className="p-6 flex flex-col items-center">
              <Building className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune entreprise</h3>
              <p className="text-gray-500 mb-4 text-center">Vous n&apos;avez pas encore créé d&apos;entreprise. Commencez par ajouter votre première entreprise.</p>
              <Link href="/dashboard/companies/new">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter une entreprise
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 