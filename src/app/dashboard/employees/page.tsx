import { Metadata } from "next";
import DashboardEmployee from "@/components/dashboard/DashboardEmployee";

export const metadata: Metadata = {
  title: "HELLOPAY | Gestion des employés",
  description: "Gérez vos employés et leurs bulletins de paie",
};

export default function EmployeesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Gestion des employés</h1>
      <p className="text-muted-foreground">
        Cette page vous permet de gérer tous vos employés et de visualiser leurs bulletins de paie.
      </p>
      
      <DashboardEmployee />
    </div>
  );
} 