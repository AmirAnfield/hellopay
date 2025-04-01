"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { logoutUser } from "@/services/auth-service";
import { Company } from "@/services/company-service";
import Link from "next/link";
import { PlusCircle, Building, Users, FileText } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  
  // Récupérer les entreprises de l'utilisateur
  const { data: companies, loading: companiesLoading } = useFirestoreCollection<Company>(
    user ? `users/${user.uid}/companies` : '',
    { orderBy: [{ field: 'name' }] }
  );
  
  // Fonction pour se déconnecter
  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutUser();
      
      // Supprimer le cookie de session côté serveur
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });
      
      toast.success("Déconnexion réussie");
      router.push("/auth/login");
    } catch {
      toast.error("Erreur lors de la déconnexion");
    } finally {
      setLoggingOut(false);
    }
  };
  
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-gray-500">Bienvenue, {user.displayName || user.email}</p>
        </div>
        <Button onClick={handleLogout} variant="outline" disabled={loggingOut}>
          {loggingOut ? "Déconnexion..." : "Se déconnecter"}
        </Button>
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
                  <p className="text-sm">{company.address}, {company.postalCode} {company.city}</p>
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