"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateCertificateRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Rediriger vers la page de création d'attestation
    router.push('/dashboard/documents/certificates/new');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Redirection vers le formulaire de création d&apos;attestation...</p>
    </div>
  );
} 