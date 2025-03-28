import React from 'react';
import { PayslipForm } from '../payslip-form';

export default function CreatePayslipPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Nouvelle fiche de paie</h1>
      <PayslipForm />
    </div>
  );
} 