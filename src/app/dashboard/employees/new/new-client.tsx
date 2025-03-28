"use client";

import { useSearchParams } from "next/navigation";
import EmployeeForm from "@/components/dashboard/EmployeeForm";

export default function NewEmployeeClient() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId");
  
  return (
    <EmployeeForm initialCompanyId={companyId || undefined} />
  );
} 