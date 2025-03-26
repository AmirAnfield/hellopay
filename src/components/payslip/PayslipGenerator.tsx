'use client';

import { useState } from 'react';
import { PayslipCalculator } from './PayslipCalculator';
import type { PayslipData } from './PayslipCalculator';
import { getValidationMessage } from '../../utils/validation';

interface PayslipGeneratorProps {
  onGenerate: (payslip: PayslipData) => void;
}

export default function PayslipGenerator({ onGenerate }: PayslipGeneratorProps) {
  const [formData, setFormData] = useState({
    employerName: '',
    employerAddress: '',
    employerSiret: '',
    employerUrssaf: '',
    employeeName: '',
    employeeAddress: '',
    employeePosition: '',
    employeeSocialSecurityNumber: '',
    isExecutive: false,
    periodStart: '',
    periodEnd: '',
    paymentDate: '',
    hourlyRate: '',
    hoursWorked: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs
    const newErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const message = getValidationMessage(key, value);
        if (message) {
          newErrors[key] = message;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const calculator = new PayslipCalculator({
      ...formData,
      hourlyRate: parseFloat(formData.hourlyRate),
      hoursWorked: parseFloat(formData.hoursWorked),
      periodStart: new Date(formData.periodStart),
      periodEnd: new Date(formData.periodEnd),
      paymentDate: new Date(formData.paymentDate)
    });

    const payslip = calculator.calculate();
    onGenerate(payslip);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Validation en temps réel
    const message = getValidationMessage(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: message || ''
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations employeur */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Informations employeur</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom de l'entreprise</label>
            <input
              type="text"
              name="employerName"
              value={formData.employerName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Adresse</label>
            <textarea
              name="employerAddress"
              value={formData.employerAddress}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Numéro SIRET</label>
            <input
              type="text"
              name="employerSiret"
              value={formData.employerSiret}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 ${
                errors.employerSiret ? 'border-red-500' : 'border-gray-300 focus:border-indigo-500'
              }`}
              required
            />
            {errors.employerSiret && (
              <p className="mt-1 text-sm text-red-600">{errors.employerSiret}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Numéro URSSAF</label>
            <input
              type="text"
              name="employerUrssaf"
              value={formData.employerUrssaf}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 ${
                errors.employerUrssaf ? 'border-red-500' : 'border-gray-300 focus:border-indigo-500'
              }`}
              required
            />
            {errors.employerUrssaf && (
              <p className="mt-1 text-sm text-red-600">{errors.employerUrssaf}</p>
            )}
          </div>
        </div>

        {/* Informations salarié */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Informations salarié</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom du salarié</label>
            <input
              type="text"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Adresse</label>
            <textarea
              name="employeeAddress"
              value={formData.employeeAddress}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Poste</label>
            <input
              type="text"
              name="employeePosition"
              value={formData.employeePosition}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Numéro de sécurité sociale</label>
            <input
              type="text"
              name="employeeSocialSecurityNumber"
              value={formData.employeeSocialSecurityNumber}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 ${
                errors.employeeSocialSecurityNumber ? 'border-red-500' : 'border-gray-300 focus:border-indigo-500'
              }`}
              required
            />
            {errors.employeeSocialSecurityNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.employeeSocialSecurityNumber}</p>
            )}
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isExecutive"
              checked={formData.isExecutive}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label className="ml-2 block text-sm text-gray-700">Cadre</label>
          </div>
        </div>
      </div>

      {/* Période et rémunération */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Période</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date de début</label>
            <input
              type="date"
              name="periodStart"
              value={formData.periodStart}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date de fin</label>
            <input
              type="date"
              name="periodEnd"
              value={formData.periodEnd}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date de paiement</label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Rémunération</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Taux horaire (€)</label>
            <input
              type="number"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Heures travaillées</label>
            <input
              type="number"
              name="hoursWorked"
              value={formData.hoursWorked}
              onChange={handleChange}
              step="0.5"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Générer la fiche de paie
        </button>
      </div>
    </form>
  );
} 