"use client";

import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import EmployeeForm from "@/components/dashboard/EmployeeForm";

export default function NewEmployeePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Ajouter un employé"
        description="Créez un nouvel employé et associez-le à une entreprise"
      />
      <div className="max-w-3xl mx-auto mt-6">
        <EmployeeForm />
      </div>
    </PageContainer>
  );
} 