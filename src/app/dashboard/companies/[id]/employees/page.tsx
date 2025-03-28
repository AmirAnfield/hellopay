import { Metadata } from "next";
import DashboardEmployee from "@/components/dashboard/DashboardEmployee";

export const metadata: Metadata = {
  title: "Employés de l'entreprise | HelloPay",
  description: "Gérez les employés de votre entreprise",
};

interface EmployeesPageProps {
  params: {
    id: string;
  };
}

export default function EmployeesPage({ params }: EmployeesPageProps) {
  return (
    <div className="container py-10 max-w-7xl mx-auto px-4 md:px-6">
      <DashboardEmployee companyId={params.id} />
    </div>
  );
} 