import { useSearchParams } from "next/navigation";
import { Metadata } from "next";
import EmployeeForm from "@/components/dashboard/EmployeeForm";
import NewEmployeeClient from "./new-client";

export const metadata: Metadata = {
  title: "Ajouter un employé | HelloPay",
  description: "Créez un nouvel employé pour votre entreprise",
};

export default function NewEmployeePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Ajouter un employé</h1>
      <p className="text-muted-foreground">
        Remplissez le formulaire ci-dessous pour ajouter un nouvel employé.
      </p>
      
      <NewEmployeeClient />
    </div>
  );
} 