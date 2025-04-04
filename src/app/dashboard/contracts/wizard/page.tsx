"use client";

import { useSearchParams } from "next/navigation";
import ContractWizard from "@/components/contracts/ContractWizard";

export default function ContractWizardPage() {
  const searchParams = useSearchParams();
  const contractId = searchParams.get("id");
  const initialStep = searchParams.get("step") || "entity";

  return (
    <div className="container mx-auto py-6">
      <ContractWizard 
        contractId={contractId || undefined} 
        initialStep={initialStep} 
      />
    </div>
  );
} 