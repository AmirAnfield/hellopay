'use client';

import { useState } from 'react';
import { PayslipData } from './PayslipCalculator';
import { formatDate, formatCurrency } from '@/lib/utils';

interface PayslipHistoryProps {
  payslips: PayslipData[];
  onViewPayslip: (payslip: PayslipData) => void;
  onDownloadPayslip: (payslip: PayslipData) => void;
  onDeletePayslip: (payslip: PayslipData) => void;
}

export function PayslipHistory({ payslips, onViewPayslip, onDownloadPayslip, onDeletePayslip }: PayslipHistoryProps) {
  const [isResetting, setIsResetting] = useState(false);

  const handleResetCumulatives = () => {
    setIsResetting(true);
    // Simuler une réinitialisation (dans une vraie application, cela appellerait une API)
    setTimeout(() => {
      setIsResetting(false);
      alert('Les cumuls ont été réinitialisés');
    }, 1000);
  };

  if (payslips.length === 0) {
    return <div className="text-center p-4">Aucune fiche de paie trouvée</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Historique des fiches de paie</h2>
        <button
          onClick={handleResetCumulatives}
          disabled={isResetting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          {isResetting ? 'Réinitialisation...' : 'Réinitialiser les cumuls'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Période
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salaire Brut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salaire Net
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cumul Brut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cumul Net
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payslips.map((payslip, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(payslip.periodStart)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(payslip.grossSalary)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(payslip.netSalary)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(payslip.cumulativeGrossSalary)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(payslip.cumulativeNetSalary)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onViewPayslip(payslip)}
                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                  >
                    Voir
                  </button>
                  <button
                    onClick={() => onDownloadPayslip(payslip)}
                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                  >
                    Télécharger
                  </button>
                  <button
                    onClick={() => onDeletePayslip(payslip)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 