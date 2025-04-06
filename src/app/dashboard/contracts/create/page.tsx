'use client';

import React from 'react';
import { ContractWizard } from '@/components/contract/ContractWizard';
import { ContractStateProvider } from '@/hooks/useContractState';

export default function CreateContractPage() {
  return (
    <ContractStateProvider>
      <ContractWizard />
    </ContractStateProvider>
  );
} 