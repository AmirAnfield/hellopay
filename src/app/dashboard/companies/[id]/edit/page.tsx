import { Metadata } from "next";
import CompanyForm from "@/components/dashboard/CompanyForm";

export const metadata: Metadata = {
  title: "Modifier l'entreprise | HelloPay",
  description: "Modifier les informations d'une entreprise",
};

interface EditCompanyPageProps {
  params: {
    id: string;
  };
}

export default function EditCompanyPage({ params }: EditCompanyPageProps) {
  return (
    <div className="container py-10 max-w-7xl mx-auto px-4 md:px-6">
      <CompanyForm companyId={params.id} />
    </div>
  );
} 