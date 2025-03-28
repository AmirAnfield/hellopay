import { Metadata } from "next";
import DashboardCompany from "@/components/dashboard/DashboardCompany";

export const metadata: Metadata = {
  title: "Entreprises | HelloPay",
  description: "Gérez vos entreprises et leurs informations",
};

export default function CompaniesPage() {
  return (
    <div className="container py-10 max-w-7xl mx-auto px-4 md:px-6">
      <DashboardCompany />
    </div>
  );
} 