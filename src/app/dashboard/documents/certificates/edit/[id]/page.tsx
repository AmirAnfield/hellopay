"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PageContainer, PageHeader, LoadingState } from "@/components/shared/PageContainer";
import { getCertificate } from "@/services/certificate-service";
import { Certificate } from "@/types/firebase";
import { useAuth } from "@/hooks/useAuth";
import CertificateGenerator from "@/components/certificates/CertificateGenerator";

export default function EditCertificatePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const certificateId = params.id;
  const [isLoading, setIsLoading] = useState(true);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchCertificate = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const cert = await getCertificate(certificateId);
        if (!cert) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de trouver le certificat"
          });
          router.push("/dashboard/documents/certificates");
          return;
        }
        
        setCertificate(cert);
      } catch (error) {
        console.error("Erreur lors du chargement du certificat:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger le certificat. Veuillez réessayer."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchCertificate();
    }
  }, [certificateId, router, toast, user]);
  
  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Modification de l'attestation"
          description="Chargement des informations..."
        />
        <LoadingState />
      </PageContainer>
    );
  }
  
  if (!certificate) {
    return (
      <PageContainer>
        <PageHeader
          title="Erreur"
          description="Certificat non trouvé"
          actions={
            <Button variant="outline" onClick={() => router.push("/dashboard/documents/certificates")}>
              Retour à la liste
            </Button>
          }
        />
        <div className="text-center py-8">
          <p>Le certificat que vous essayez de modifier n&apos;existe pas ou a été supprimé.</p>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <PageHeader
        title="Modifier l'attestation"
        description="Modifiez les informations de l'attestation"
        actions={
          <Button variant="outline" onClick={() => router.push("/dashboard/documents/certificates")}>
            Annuler
          </Button>
        }
      />
      
      <CertificateGenerator 
        type={certificate.type as 'attestation-travail' | 'attestation-salaire' | 'attestation-presence'} 
        initialData={certificate}
        certificateId={certificateId}
      />
    </PageContainer>
  );
} 