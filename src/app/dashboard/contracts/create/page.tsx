"use client";

import { AuthProvider } from '@/contexts/AuthContext';
import GenerativeAIContractWizard from '@/components/GenerativeAIContractWizard';

export default function ContractCreationPage() {
  return (
    <AuthProvider>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Création de contrat</h1>
        <GenerativeAIContractWizard />
      </div>
    </AuthProvider>
  );
} 