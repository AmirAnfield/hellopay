import { useState } from 'react';
import { PayslipData } from './PayslipCalculator';
import { PayslipHistory } from './PayslipHistory';
import { PayslipTemplate } from './PayslipTemplate';
import { PayslipGenerator } from './PayslipGenerator';

export function PayslipCalculator() {
  const [payslipData, setPayslipData] = useState<PayslipData | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);

  const handleCalculate = async (data: PayslipData) => {
    try {
      const response = await fetch('/api/payslips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde de la fiche de paie');
      }

      setPayslipData(data);
      setSelectedEmployee(data.employeeName);
      setShowHistory(true);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la sauvegarde de la fiche de paie');
    }
  };

  const handleSelectPayslip = (payslip: PayslipData) => {
    setPayslipData(payslip);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h1 className="text-2xl font-bold mb-4">Calculateur de fiche de paie</h1>
          <PayslipTemplate onCalculate={handleCalculate} />
        </div>
        <div>
          {showHistory && selectedEmployee && (
            <PayslipHistory
              employeeName={selectedEmployee}
              onSelectPayslip={handleSelectPayslip}
            />
          )}
          {payslipData && (
            <div className="mt-8">
              <PayslipGenerator payslipData={payslipData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 