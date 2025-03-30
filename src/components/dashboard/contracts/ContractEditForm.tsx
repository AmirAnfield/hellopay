'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';
import ContractForm from '../../../app/dashboard/contracts/components/ContractForm';
import { Contract } from '../../../app/dashboard/contracts/components/ContractTable';

interface ContractEditFormProps {
  contractId: string;
}

export default function ContractEditForm({ contractId }: ContractEditFormProps) {
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les données du contrat existant
  useEffect(() => {
    const fetchContract = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/contracts/${contractId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Contrat non trouvé");
          }
          throw new Error("Erreur lors de la récupération du contrat");
        }

        const result = await response.json();

        if (result.success) {
          setContract(result.data);
        } else {
          throw new Error(result.message || "Une erreur est survenue");
        }
      } catch (error) {
        console.error("Erreur:", error);
        setError(error instanceof Error ? error.message : "Une erreur inconnue est survenue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  // Gérer la soumission du formulaire pour mettre à jour le contrat
  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Contrat mis à jour",
          description: "Le contrat a été mis à jour avec succès",
        });
        router.push(`/dashboard/contracts/${contractId}`);
      } else {
        throw new Error(result.message || "Une erreur est survenue lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4 h-96 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Chargement du contrat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <div className="mt-4">
          <Button asChild>
            <Link href="/dashboard/contracts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux contrats
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Information!</strong>
          <span className="block sm:inline"> Ce contrat n'existe pas ou a été supprimé.</span>
        </div>
        <div className="mt-4">
          <Button asChild>
            <Link href="/dashboard/contracts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux contrats
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href={`/dashboard/contracts/${contractId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Modifier le contrat</h1>
        </div>
        <Button type="submit" form="contract-form" disabled={isSaving}>
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
          <ContractForm 
            onSubmit={handleSubmit} 
            initialData={contract} 
            formId="contract-form" 
            isEdit={true}
          />
        </CardContent>
      </Card>
    </div>
  );
} 