"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2, Receipt, Plus, ArrowRight } from "lucide-react";
import { 
  PageContainer, 
  PageHeader, 
  EmptyState 
} from "@/components/shared/PageContainer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PayslipsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation d'un chargement pour démontrer la transition
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader
          title="Bulletins de paie"
          description="Gérez les bulletins de paie de vos employés"
        />
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-muted-foreground text-sm">Chargement...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Bulletins de paie"
        description="Gérez les bulletins de paie de vos employés"
        actions={
          <Button onClick={() => router.push("/dashboard/payslips/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau bulletin
          </Button>
        }
      />
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/dashboard/payslips/create")}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Receipt className="h-5 w-5 mr-2 text-blue-500" />
              Créer un bulletin de paie
            </CardTitle>
            <CardDescription>
              Générez un nouveau bulletin de paie pour un employé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sélectionnez un employé, choisissez une période et configurez les détails du bulletin.
            </p>
            <Button variant="ghost" size="sm" className="mt-4">
              Commencer <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Receipt className="h-5 w-5 mr-2 text-green-500" />
              Bulletins précédents
            </CardTitle>
            <CardDescription>
              Consultez l&apos;historique des bulletins de paie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Accédez à tous les bulletins générés et téléchargez-les au format PDF.
            </p>
            <Button variant="ghost" size="sm" className="mt-4">
              Voir l&apos;historique <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Receipt className="h-5 w-5 mr-2 text-amber-500" />
              Configuration de paie
            </CardTitle>
            <CardDescription>
              Personnalisez les paramètres de calcul des salaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Définissez les taux de cotisation, les règles de congés et autres paramètres.
            </p>
            <Button variant="ghost" size="sm" className="mt-4">
              Configurer <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <EmptyState
          title="Fonctionnalité en développement"
          description="Le système de gestion des bulletins de paie est actuellement en développement. Des fonctionnalités supplémentaires seront disponibles prochainement."
          icon={Receipt}
          action={
            <Button onClick={() => router.push("/dashboard/payslips/create")}>
              Créer un bulletin
            </Button>
          }
        />
      </div>
    </PageContainer>
  );
} 