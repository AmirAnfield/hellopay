"use client";

import { useParams } from "next/navigation";
import EmployeeForm from "@/components/employee/EmployeeForm";

// Les métadonnées ne peuvent pas être exportées dans un composant client
// Elles doivent être définies dans un fichier layout.tsx du côté serveur

export default function EditEmployeeClientPage() {
  const params = useParams();
  // L'ID de l'employé est extrait des paramètres d'URL
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  return (
    <div className="container py-10 max-w-7xl mx-auto px-4 md:px-6">
      <EmployeeForm employeeId={id} />
    </div>
  );
} 