import { Metadata } from "next";
import ContractEditForm from "@/components/dashboard/contracts/ContractEditForm";

export const metadata: Metadata = {
  title: "Modifier un contrat | HelloPay",
  description: "Modifiez les informations d'un contrat existant",
};

interface EditContractPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditContractPage({ params }: EditContractPageProps) {
  const { id } = await params;
  
  return (
    <div className="container max-w-5xl py-8">
      <ContractEditForm contractId={id} />
    </div>
  );
} 