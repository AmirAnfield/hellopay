'use client';

import React, { useEffect } from 'react';
import { ContractFormPage } from '@/components/contract-template/ContractFormPage';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function NewContractPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Non connecté",
          description: "Vous devez être connecté pour créer un contrat"
        });
        router.push('/auth/login');
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-xl font-medium">Chargement...</p>
      </div>
    );
  }

  return <ContractFormPage />;
} 