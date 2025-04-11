'use client';

import React, { useEffect, useState } from 'react';
import { ContractFormPage } from '@/components/contract-template/ContractFormPage';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface EditContractPageProps {
  params: {
    id: string;
  };
}

// Type pour les données du contrat
type ContractData = {
  company: {
    name: string;
    address: string;
    siret: string;
    representant: string;
    conventionCollective?: string;
    sector?: string;
  };
  employee: {
    firstName: string;
    lastName: string;
    address: string;
    birthDate?: string;
    nationality?: string;
    socialSecurityNumber?: string;
  };
  contractDetails: {
    type: 'CDI' | 'CDD';
    workingHours: number;
    position: string;
    isExecutive?: boolean;
    classification?: string;
    startDate: string;
    endDate?: string;
    motifCDD?: string;
    trialPeriod?: boolean;
    trialPeriodDuration?: string;
    workplace: string;
    mobilityClause?: boolean;
    mobilityRadius?: number;
    scheduleType?: string;
    workingDays?: string;
    salary: number;
    hourlyRate?: number;
    paymentDate?: string;
    benefits?: Record<string, any>;
    customLeaves?: boolean;
    customLeavesDetails?: string;
    nonCompete?: boolean;
    nonCompeteDuration?: string;
    nonCompeteArea?: string;
    nonCompeteCompensation?: string;
    nonSolicitation?: boolean;
    noticePeriod?: string;
  };
  displayOptions: {
    hasPreambule: boolean;
    includeDataProtection?: boolean;
    includeImageRights?: boolean;
    includeWorkRules?: boolean;
    includeWorkClothes?: boolean;
    includeInternalRules?: boolean;
    includeConfidentiality?: boolean;
    includeIntellectualProperty?: boolean;
    includeTeleworking?: boolean;
    teleworkingType?: string;
    employerProvidesEquipment?: boolean;
    showSignatures?: boolean;
    showConventionCollective?: boolean;
    addConventionCollective?: boolean;
  };
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  pdfUrl?: string;
};

export default function EditContractPage({ params }: EditContractPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const { id } = params;

  // Référence Firestore
  const firestore = getFirestore();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté et récupérer les données du contrat
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Non connecté",
          description: "Vous devez être connecté pour éditer un contrat"
        });
        router.push('/auth/login');
        return;
      }

      try {
        // Récupérer les données du contrat
        const contractDocRef = doc(firestore, `users/${user.uid}/contracts/${id}`);
        const contractDoc = await getDoc(contractDocRef);

        if (!contractDoc.exists()) {
          toast({
            variant: "destructive",
            title: "Contrat introuvable",
            description: "Le contrat que vous essayez d'éditer n'existe pas"
          });
          router.push('/documents/contracts');
          return;
        }

        setContractData(contractDoc.data() as ContractData);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération du contrat:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur s'est produite lors de la récupération du contrat"
        });
        router.push('/documents/contracts');
      }
    });

    return () => unsubscribe();
  }, [id, router, toast, firestore]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-xl font-medium">Chargement du contrat...</p>
      </div>
    );
  }

  return <ContractFormPage initialData={contractData} contractId={id} />;
} 