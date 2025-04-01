"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageContainer, LoadingState } from "@/components/shared/PageContainer";

export default function BillingPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page de profil avec l'onglet "billing" sélectionné
    router.push("/profile?tab=billing");
  }, [router]);

  return (
    <PageContainer>
      <LoadingState message="Redirection vers les informations de facturation..." />
    </PageContainer>
  );
} 