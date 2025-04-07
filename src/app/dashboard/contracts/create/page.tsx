'use client';

import React from 'react';
import { ContractFormPage } from '@/components/contract-template';
import AuthGuard from "@/components/auth/AuthGuard";

export default function CreateContractPage() {
  return (
    <AuthGuard>
      <ContractFormPage />
    </AuthGuard>
  );
} 