'use client';

import { useState } from 'react';
import PayslipGenerator from '../components/payslip/PayslipGenerator';
import PayslipHistory from '../components/payslip/PayslipHistory';
import type { PayslipData } from '../components/payslip/PayslipCalculator';

export default function Home() {
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipData | null>(null);
  const [employeeName, setEmployeeName] = useState<string>('');

  const handlePayslipGenerated = async (payslip: PayslipData) => {
    try {
      const response = await fetch('/api/payslips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payslip),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement de la fiche de paie');
      }

      setEmployeeName(payslip.employeeName);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de l\'enregistrement de la fiche de paie');
    }
  };

  return (
    <main className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des fiches de paie</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Générer une fiche de paie</h2>
          <PayslipGenerator onGenerate={handlePayslipGenerated} />
        </div>

        {employeeName && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Historique des fiches de paie</h2>
            <PayslipHistory
              employeeName={employeeName}
              onSelectPayslip={setSelectedPayslip}
            />
          </div>
        )}
      </div>
    </main>
  );
} 