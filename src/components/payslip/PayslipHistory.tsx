'use client';

import { useState, useEffect } from 'react';
import type { PayslipData } from './PayslipCalculator';

interface PayslipHistoryProps {
  employeeName: string;
  onSelectPayslip?: (payslip: PayslipData) => void;
}

export default function PayslipHistory({ employeeName, onSelectPayslip }: PayslipHistoryProps) {
  const [payslips, setPayslips] = useState<PayslipData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const response = await fetch(`/api/payslips?employeeName=${encodeURIComponent(employeeName)}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des fiches de paie');
        }
        const data = await response.json();
        setPayslips(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, [employeeName]);

  const handleResetCumulatives = async () => {
    try {
      setIsResetting(true);
      const response = await fetch(`/api/payslips?employeeName=${encodeURIComponent(employeeName)}`, {
        method: 'PATCH'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la réinitialisation des cumuls');
      }

      // Recharger les fiches de paie
      const payslipsResponse = await fetch(`/api/payslips?employeeName=${encodeURIComponent(employeeName)}`);
      if (!payslipsResponse.ok) {
        throw new Error('Erreur lors de la récupération des fiches de paie');
      }
      const data = await payslipsResponse.json();
      setPayslips(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsResetting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return <div className="text-center p-4">Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

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
            {payslips.map((payslip) => (
              <tr key={payslip.periodStart.toString()} className="hover:bg-gray-50">
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
                    onClick={() => onSelectPayslip?.(payslip)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Voir
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