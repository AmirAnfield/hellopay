"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateCertificateRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Rediriger vers la page de documents avec l'option pour créer une attestation
    router.push('/dashboard/documents?openCreateDialog=true&documentType=attestation');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Redirection vers le formulaire de création d'attestation...</p>
    </div>
  );
} 