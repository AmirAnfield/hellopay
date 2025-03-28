import { Metadata } from "next";
import EditEmployeeClient from "./edit-client";

export const metadata: Metadata = {
  title: "Modifier l'employé | HelloPay",
  description: "Modifier les informations d'un employé",
};

interface EditEmployeePageProps {
  params: {
    id: string;
  };
}

export default function EditEmployeePage({ params }: EditEmployeePageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Modifier un employé</h1>
      <p className="text-muted-foreground">
        Modifiez les informations de l&apos;employé ci-dessous.
      </p>
      
      <EditEmployeeClient employeeId={params.id} />
    </div>
  );
} 