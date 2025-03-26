import React from 'react';
import { Contribution } from './FrenchContributions';

export interface EmployeeData {
  firstName: string;
  lastName: string;
  address: string;
  postalCode: string;
  city: string;
  socialSecurityNumber: string;
  position: string;
  contractType: string;
  employmentDate: string;
}

export interface EmployerData {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  siret: string;
  ape: string;
}

export interface SalaryItem {
  label: string;
  base?: number;
  rate?: number;
  amount: number;
  isAddition: boolean;
}

export interface SalaryData {
  period: string;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  items: SalaryItem[];
  grossSalary: number;
  netBeforeTax: number;
  netToPay: number;
  netSocial: number;
  totalEmployeeContributions: number;
  totalEmployerContributions: number;
  paymentMethod: string;
  contributions?: Contribution[];
}

export interface PayslipProps {
  employee: EmployeeData;
  employer: EmployerData;
  salary: SalaryData;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
};

const formatNumber = (value: number | undefined): string => {
  if (value === undefined) return '';
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const formatPercent = (value: number | undefined): string => {
  if (value === undefined) return '';
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const ContributionsTable = ({ 
  contributions,
  grossSalary 
}: { 
  contributions?: Contribution[],
  grossSalary: number
}) => {
  if (!contributions || contributions.length === 0) {
    return null;
  }

  const activeContributions = contributions.filter(c => c.isRequired);

  const categorizedContributions: Record<string, Contribution[]> = {};
  
  activeContributions.forEach(contribution => {
    if (!categorizedContributions[contribution.category]) {
      categorizedContributions[contribution.category] = [];
    }
    categorizedContributions[contribution.category].push(contribution);
  });

  const calculateAmount = (rate: number, baseType: string) => {
    if (baseType === 'total') {
      return (grossSalary * rate) / 100;
    } else if (baseType === 'plafond' || baseType === 'trancheA') {
      const cap = 3864;
      return (Math.min(grossSalary, cap) * rate) / 100;
    } else if (baseType === 'trancheB') {
      const cap = 3864;
      const excess = Math.max(0, Math.min(grossSalary, cap * 8) - cap);
      return (excess * rate) / 100;
    }
    return 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  let totalEmployeeAmount = 0;
  let totalEmployerAmount = 0;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-2">Détail des cotisations sociales</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 text-left p-2">Cotisation</th>
            <th className="border border-gray-300 text-center p-2">Base</th>
            <th className="border border-gray-300 text-center p-2">Taux salarial</th>
            <th className="border border-gray-300 text-center p-2">Montant salarial</th>
            <th className="border border-gray-300 text-center p-2">Taux patronal</th>
            <th className="border border-gray-300 text-center p-2">Montant patronal</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(categorizedContributions).map(([category, contribs]) => {
            let categoryEmployeeTotal = 0;
            let categoryEmployerTotal = 0;
            
            contribs.forEach(contrib => {
              categoryEmployeeTotal += calculateAmount(contrib.employeeRate, contrib.baseType);
              categoryEmployerTotal += calculateAmount(contrib.employerRate, contrib.baseType);
            });
            
            totalEmployeeAmount += categoryEmployeeTotal;
            totalEmployerAmount += categoryEmployerTotal;
            
            return (
              <React.Fragment key={category}>
                <tr className="bg-gray-50">
                  <td colSpan={6} className="border border-gray-300 p-2 font-medium">
                    {category === 'securite_sociale' && 'Sécurité Sociale'}
                    {category === 'retraite' && 'Retraite'}
                    {category === 'chomage' && 'Chômage'}
                    {category === 'csg_crds' && 'CSG / CRDS'}
                    {category === 'autres' && 'Autres cotisations'}
                  </td>
                </tr>
                {contribs.map((contrib, index) => {
                  const employeeAmount = calculateAmount(contrib.employeeRate, contrib.baseType);
                  const employerAmount = calculateAmount(contrib.employerRate, contrib.baseType);
                  
                  return (
                    <tr key={contrib.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 p-2">{contrib.name}</td>
                      <td className="border border-gray-300 p-2 text-center">
                        {contrib.baseType === 'total' && formatCurrency(grossSalary)}
                        {contrib.baseType === 'plafond' && 
                          `${formatCurrency(Math.min(grossSalary, 3864))} (P.SS)`}
                        {contrib.baseType === 'trancheA' && 
                          `${formatCurrency(Math.min(grossSalary, 3864))} (T.A)`}
                        {contrib.baseType === 'trancheB' && 
                          `${formatCurrency(Math.max(0, Math.min(grossSalary, 3864 * 8) - 3864))} (T.B)`}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {contrib.employeeRate > 0 ? `${contrib.employeeRate.toFixed(2)}%` : '-'}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {employeeAmount > 0 ? formatCurrency(employeeAmount) : '-'}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {contrib.employerRate > 0 ? `${contrib.employerRate.toFixed(2)}%` : '-'}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {employerAmount > 0 ? formatCurrency(employerAmount) : '-'}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-100">
                  <td className="border border-gray-300 p-2 font-medium">Total {category}</td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2 text-right font-medium">
                    {formatCurrency(categoryEmployeeTotal)}
                  </td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2 text-right font-medium">
                    {formatCurrency(categoryEmployerTotal)}
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
          <tr className="bg-gray-200 font-bold">
            <td className="border border-gray-300 p-2">Total des cotisations</td>
            <td className="border border-gray-300 p-2"></td>
            <td className="border border-gray-300 p-2"></td>
            <td className="border border-gray-300 p-2 text-right">
              {formatCurrency(totalEmployeeAmount)}
            </td>
            <td className="border border-gray-300 p-2"></td>
            <td className="border border-gray-300 p-2 text-right">
              {formatCurrency(totalEmployerAmount)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export const PayslipTemplate: React.FC<PayslipProps> = ({ employee, employer, salary }) => {
  // Styliser avec Tailwind en s'assurant que les styles sont adaptés pour l'impression
  return (
    <div className="max-w-[210mm] mx-auto bg-white p-6 print:p-0" style={{ fontFamily: 'sans-serif' }}>
      {/* En-tête de la fiche de paie */}
      <div className="flex justify-between items-start border-b border-gray-300 pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Bulletin de paie</h1>
          <p className="text-gray-600">Période: {salary.period}</p>
          <p className="text-gray-600">Du {salary.periodStart} au {salary.periodEnd}</p>
        </div>
        <div className="text-right">
          <p className="font-bold">{employer.name}</p>
          <p>{employer.address}</p>
          <p>{employer.postalCode} {employer.city}</p>
          <p>SIRET: {employer.siret}</p>
          <p>Code APE: {employer.ape}</p>
        </div>
      </div>

      {/* Informations du salarié */}
      <div className="border-b border-gray-300 pb-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="font-bold mb-2">Salarié</h2>
            <p className="font-bold">{employee.lastName} {employee.firstName}</p>
            <p>{employee.address}</p>
            <p>{employee.postalCode} {employee.city}</p>
            <p>N° SS: {employee.socialSecurityNumber}</p>
          </div>
          <div>
            <h2 className="font-bold mb-2">Emploi</h2>
            <p>{employee.position}</p>
            <p>Type de contrat: {employee.contractType === 'cdi' ? 'CDI' : 
              employee.contractType === 'cdd' ? 'CDD' : 
              employee.contractType === 'apprentissage' ? 'Contrat d\'apprentissage' : 
              employee.contractType === 'interim' ? 'Intérim' : 
              employee.contractType === 'stage' ? 'Stage' : 
              employee.contractType === 'partiel' ? 'Temps partiel' : 
              employee.contractType}</p>
            <p>Date d'embauche: {employee.employmentDate}</p>
          </div>
        </div>
      </div>

      {/* Détails de la rémunération */}
      <div className="mb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Désignation</th>
              <th className="border border-gray-300 p-2 text-right">Base</th>
              <th className="border border-gray-300 p-2 text-right">Taux</th>
              <th className="border border-gray-300 p-2 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            {salary.items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 p-2 text-left">{item.label}</td>
                <td className="border border-gray-300 p-2 text-right">{formatNumber(item.base)}</td>
                <td className="border border-gray-300 p-2 text-right">{item.rate !== undefined ? formatPercent(item.rate) : ''}</td>
                <td className="border border-gray-300 p-2 text-right font-semibold">
                  {item.isAddition ? '+' : '-'} {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Résumé des totaux */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-100 p-3 rounded">
          <h3 className="font-bold mb-1 text-sm">Salaire brut</h3>
          <p className="text-xl font-semibold">{formatCurrency(salary.grossSalary)}</p>
        </div>
        <div className="bg-gray-100 p-3 rounded">
          <h3 className="font-bold mb-1 text-sm">Net à payer avant impôt</h3>
          <p className="text-xl font-semibold">{formatCurrency(salary.netBeforeTax)}</p>
        </div>
        <div className="bg-gray-100 p-3 rounded">
          <h3 className="font-bold mb-1 text-sm">Net à payer</h3>
          <p className="text-xl font-semibold text-green-600">{formatCurrency(salary.netToPay)}</p>
        </div>
      </div>

      {/* Net social et détails des cotisations */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 border border-gray-300 rounded">
          <h3 className="font-bold mb-1 text-sm">Net social (pour calcul prime d'activité)</h3>
          <p className="text-lg font-semibold">{formatCurrency(salary.netSocial)}</p>
        </div>
        <div className="p-3 border border-gray-300 rounded">
          <div className="flex justify-between mb-1">
            <h3 className="font-bold text-sm">Total cotisations salariales</h3>
            <p className="font-semibold">{formatCurrency(salary.totalEmployeeContributions)}</p>
          </div>
          <div className="flex justify-between">
            <h3 className="font-bold text-sm">Total cotisations patronales</h3>
            <p className="font-semibold">{formatCurrency(salary.totalEmployerContributions)}</p>
          </div>
        </div>
      </div>

      {/* Méthode de paiement et mentions légales */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 border border-gray-300 rounded bg-gray-50">
          <h3 className="font-bold mb-1 text-sm">Mode de paiement</h3>
          <p>{salary.paymentMethod}</p>
          <p>Date: {salary.paymentDate}</p>
        </div>
        <div className="p-3 border border-gray-300 rounded bg-gray-50">
          <p className="text-xs text-gray-600">
            Ce bulletin de salaire est à conserver sans limitation de durée.<br />
            Pour information, l'ensemble des cotisations sont versées à l'URSSAF.
          </p>
        </div>
      </div>

      {/* Informations supplémentaires et footer */}
      <div className="text-center text-xs text-gray-500 mt-8">
        <p>Bulletin de paie édité par HelloPay</p>
        <p>Conforme à la législation française en vigueur</p>
      </div>

      <ContributionsTable 
        contributions={salary.contributions}
        grossSalary={salary.grossSalary}
      />
    </div>
  );
};

export default PayslipTemplate; 