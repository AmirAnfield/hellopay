import { Metadata } from "next";
import CompanyForm from "@/components/dashboard/CompanyForm";

export const metadata: Metadata = {
  title: "Ajouter une entreprise | HelloPay",
  description: "Créez une nouvelle entreprise pour commencer à gérer vos bulletins de paie",
};

export default function NewCompanyPage() {
  return (
    <div className="container py-10 max-w-7xl mx-auto px-4 md:px-6">
      <CompanyForm />
    </div>
  );
} 