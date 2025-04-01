"use client";

import { useSearchParams } from "next/navigation";
import EmployeeForm from "@/components/employee/EmployeeForm";

/**
 * Redirection vers la nouvelle URL standardisée
 * Cette page existe pour maintenir la compatibilité avec les liens existants
 */
export default function NewEmployeePage() {
  const searchParams = useSearchParams();
  const companyId = searchParams?.get("companyId") || undefined;
  
  return (
    <div className="container py-10 max-w-7xl mx-auto px-4 md:px-6">
      <EmployeeForm defaultCompanyId={companyId} />
    </div>
  );
} 