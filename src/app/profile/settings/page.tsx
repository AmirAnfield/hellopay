"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageContainer, LoadingState } from "@/components/shared/PageContainer";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page de profil avec l'onglet "security" sélectionné
    router.push("/profile?tab=security");
  }, [router]);

  return (
    <PageContainer>
      <LoadingState message="Redirection vers les paramètres de sécurité..." />
    </PageContainer>
  );
} 