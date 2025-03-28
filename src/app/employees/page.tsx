import React from 'react';
import { EmployeeForm } from '@/components/employee/EmployeeForm';

export default function EmployeesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des employés</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Ajouter un employé</h2>
        <EmployeeForm 
          onSubmit={(data) => {
            console.log('Employé soumis:', data);
            // Ici vous appelleriez votre API pour sauvegarder l'employé
          }} 
        />
      </div>
    </div>
  );
} 