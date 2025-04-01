"use client";

import { useParams } from "next/navigation";
import CompanyForm from "@/components/dashboard/CompanyForm";

export default function EditCompanyClientPage() {
  const params = useParams();
  // L'ID de l'entreprise est extrait des paramètres d'URL
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  return (
    <div className="container py-10 max-w-7xl mx-auto px-4 md:px-6">
      <CompanyForm companyId={id} />
    </div>
  );
} 