"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import ContractForm from "../components/ContractForm";
import { toast } from "@/components/ui/use-toast";

interface Company {
  id: string;
  name: string;
}

export default function CreateContractPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Charger la liste des entreprises pour le formulaire
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch("/api/companies");
        const result = await response.json();

        if (result.success) {
          setCompanies(result.data || []);
        } else {
          console.error("Erreur lors de la récupération des entreprises:", result.message);
          toast({
            title: "Erreur",
            description: "Impossible de charger la liste des entreprises",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Gérer la soumission du formulaire
  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/contracts", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Contrat créé",
          description: "Le contrat a été créé avec succès",
        });
        router.push(`/dashboard/contracts/${result.data.id}`);
      } else {
        throw new Error(result.message || "Une erreur est survenue lors de la création");
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/dashboard/contracts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Créer un contrat</h1>
        </div>
        <Button type="submit" form="contract-form" disabled={isSaving || isLoading}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Enregistrer
        </Button>
      </div>

      {/* Formulaire */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du contrat</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <ContractForm
              onSubmit={handleSubmit}
              companies={companies}
              formId="contract-form"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 