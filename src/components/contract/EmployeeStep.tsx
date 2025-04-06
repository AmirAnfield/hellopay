import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Employee } from '@/types/contract';
import { User, Plus, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface EmployeeStepProps {
  onSelectEmployee: (employee: Employee) => Promise<void>;
  selectedEmployeeId?: string;
  employees: Employee[];
  isLoading: boolean;
  isLoadingEmployees: boolean;
  onBack: () => void;
}

export function EmployeeStep({
  onSelectEmployee,
  selectedEmployeeId,
  employees,
  isLoading,
  isLoadingEmployees,
  onBack
}: EmployeeStepProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(
    employees.find(e => e.id === selectedEmployeeId)
  );

  // Mettre à jour le composant lorsque les employés sont chargés
  useEffect(() => {
    if (selectedEmployeeId && employees.length > 0) {
      const employee = employees.find(e => e.id === selectedEmployeeId);
      if (employee) {
        setSelectedEmployee(employee);
      }
    }
  }, [selectedEmployeeId, employees]);

  // Gérer la sélection d'un employé
  const handleSelectChange = (value: string) => {
    const employee = employees.find(e => e.id === value);
    if (employee) {
      setSelectedEmployee(employee);
    }
  };

  // Formater la date de naissance pour l'affichage
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Obtenir le nom complet de l'employé
  const getEmployeeFullName = (employee: Employee) => {
    if (employee.fullName) return employee.fullName;
    if (employee.firstName && employee.lastName) return `${employee.firstName} ${employee.lastName}`;
    if (employee.firstName) return employee.firstName;
    if (employee.lastName) return employee.lastName;
    return `Employé ${employee.id.substring(0, 4)}`;
  };

  // Afficher les détails du nom de l'employé
  const renderEmployeeNameDetails = (employee: Employee) => {
    if (employee.fullName) {
      return employee.fullName;
    }
    
    if (employee.firstName || employee.lastName) {
      return `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
    }
    
    return `Employé ${employee.id.substring(0, 4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Sélectionner l&apos;employé</h2>
        <p className="text-gray-500">Choisissez l&apos;employé pour lequel ce contrat est établi</p>
      </div>

      {isLoadingEmployees ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : employees.length === 0 ? (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Aucun employé trouvé</AlertTitle>
          <AlertDescription>
            Vous devez d&apos;abord créer un employé avant de pouvoir établir un contrat.
            <div className="mt-4">
              <Link href="/dashboard/employees/create">
                <Button className="flex items-center" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un employé
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid gap-4">
            <Select 
              onValueChange={handleSelectChange}
              value={selectedEmployee?.id}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un employé" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {getEmployeeFullName(employee)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEmployee && (
            <Card className="mt-4 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-white p-3 rounded-full border">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{renderEmployeeNameDetails(selectedEmployee)}</h3>
                    
                    {(selectedEmployee.birthDate || selectedEmployee.birthPlace) && (
                      <p className="text-sm text-gray-600">
                        {selectedEmployee.birthDate && `Né(e) le ${formatDate(selectedEmployee.birthDate)}`}
                        {selectedEmployee.birthPlace && selectedEmployee.birthDate && ` à ${selectedEmployee.birthPlace}`}
                        {selectedEmployee.birthPlace && !selectedEmployee.birthDate && `Lieu de naissance: ${selectedEmployee.birthPlace}`}
                      </p>
                    )}
                    
                    {selectedEmployee.socialSecurityNumber && (
                      <p className="text-sm text-gray-600">N° SS: {selectedEmployee.socialSecurityNumber}</p>
                    )}
                    
                    {(selectedEmployee.address || selectedEmployee.postalCode || selectedEmployee.city) && (
                      <p className="text-sm text-gray-600">
                        Adresse: {selectedEmployee.address}{' '}
                        {selectedEmployee.postalCode}{' '}
                        {selectedEmployee.city}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="flex space-x-4 justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={onBack} 
          disabled={isLoading}
        >
          Retour
        </Button>
        
        {selectedEmployee && (
          <Button 
            disabled={isLoading || isLoadingEmployees} 
            className="w-full md:w-auto" 
            onClick={() => onSelectEmployee(selectedEmployee)}
          >
            {isLoading ? 'Enregistrement...' : 'Continuer'}
          </Button>
        )}
      </div>
    </div>
  );
} 