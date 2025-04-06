import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { firestore } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { auth } from '@/lib/firebase';

interface Company {
  id: string;
  name: string;
  siret?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  companyId?: string;
}

interface ContractTypeStepProps {
  onCreateContract: (companyId: string, employeeId: string) => Promise<void>;
  isLoading: boolean;
}

export function ContractTypeStep({ onCreateContract, isLoading }: ContractTypeStepProps) {
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState<boolean>(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState<boolean>(false);
  
  // Vérifier si tous les choix sont faits
  const isSelectionComplete = selectedCompany && selectedEmployee;
  
  // Charger les entreprises de l'utilisateur
  useEffect(() => {
    const loadCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        
        console.log("Chargement des entreprises pour:", userId);
        const companiesRef = collection(firestore, `users/${userId}/companies`);
        const snapshot = await getDocs(companiesRef);
        
        const companiesList: Company[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          companiesList.push({
            id: doc.id,
            name: data.name || '',
            siret: data.siret || '',
            address: data.address || '',
            city: data.city || '',
            postalCode: data.postalCode || '',
          });
        });
        
        console.log(`${companiesList.length} entreprises trouvées`);
        setCompanies(companiesList);
      } catch (error) {
        console.error("Erreur lors du chargement des entreprises:", error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    
    loadCompanies();
  }, []);
  
  // Charger les employés de l'utilisateur
  useEffect(() => {
    const loadEmployees = async () => {
      setIsLoadingEmployees(true);
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        
        console.log("Chargement des employés pour:", userId);
        const employeesRef = collection(firestore, `users/${userId}/employees`);
        const snapshot = await getDocs(employeesRef);
        
        const employeesList: Employee[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          employeesList.push({
            id: doc.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            position: data.position || '',
            companyId: data.companyId || '',
          });
        });
        
        console.log(`${employeesList.length} employés trouvés`);
        setEmployees(employeesList);
      } catch (error) {
        console.error("Erreur lors du chargement des employés:", error);
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    
    loadEmployees();
  }, []);
  
  // Filtrer les employés par entreprise sélectionnée
  useEffect(() => {
    if (selectedCompany && employees.length > 0) {
      const filtered = employees.filter(employee => employee.companyId === selectedCompany);
      setFilteredEmployees(filtered.length > 0 ? filtered : employees);
    } else {
      setFilteredEmployees(employees);
    }
  }, [selectedCompany, employees]);
  
  // Fonction pour soumettre la sélection complète et créer un nouveau contrat
  const handleSubmit = () => {
    if (selectedCompany && selectedEmployee) {
      onCreateContract(selectedCompany, selectedEmployee);
    }
  };

  // Obtenir le nom complet de l'employé
  const getEmployeeFullName = (employee: Employee) => {
    if (employee.firstName && employee.lastName) {
      return `${employee.firstName} ${employee.lastName}`;
    } else if (employee.firstName) {
      return employee.firstName;
    } else if (employee.lastName) {
      return employee.lastName;
    }
    return `Employé ${employee.id.substring(0, 4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Création d&apos;un nouveau contrat</h2>
        <p className="text-gray-500">Sélectionnez l&apos;entreprise et l&apos;employé pour ce contrat</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">1. Sélection de l&apos;entreprise</h3>
          
          {isLoadingCompanies ? (
            <div className="text-center p-4">
              <p>Chargement des entreprises...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
              <p className="font-medium">Aucune entreprise trouvée</p>
              <p className="text-sm mt-1">Vous devez d&apos;abord créer une entreprise dans la section "Entreprises".</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Select
                value={selectedCompany}
                onValueChange={setSelectedCompany}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une entreprise" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedCompany && companies.length > 0 && (
                <div className="mt-2">
                  {(() => {
                    const company = companies.find(c => c.id === selectedCompany);
                    if (!company) return null;
                    
                    return (
                      <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                        <div className="flex items-start">
                          <Building2 className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                          <div>
                            <h4 className="font-medium">{company.name}</h4>
                            {company.siret && (
                              <p className="text-xs text-gray-600 mt-0.5">SIRET: {company.siret}</p>
                            )}
                            {(company.address || company.postalCode || company.city) && (
                              <p className="text-xs text-gray-600 mt-0.5">
                                {company.address}{' '}
                                {company.postalCode}{' '}
                                {company.city}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        {selectedCompany && (
          <div>
            <h3 className="text-lg font-medium mb-3">2. Sélection de l&apos;employé</h3>
            
            {isLoadingEmployees ? (
              <div className="text-center p-4">
                <p>Chargement des employés...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
                <p className="font-medium">Aucun employé trouvé</p>
                <p className="text-sm mt-1">Vous devez d&apos;abord créer un employé dans la section "Employés".</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Select
                  value={selectedEmployee}
                  onValueChange={setSelectedEmployee}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {getEmployeeFullName(employee)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedEmployee && filteredEmployees.length > 0 && (
                  <div className="mt-2">
                    {(() => {
                      const employee = filteredEmployees.find(e => e.id === selectedEmployee);
                      if (!employee) return null;
                      
                      return (
                        <div className="bg-green-50 p-3 rounded-md border border-green-100">
                          <div className="flex items-start">
                            <User className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                            <div>
                              <h4 className="font-medium">{getEmployeeFullName(employee)}</h4>
                              {employee.position && (
                                <p className="text-xs text-gray-600 mt-0.5">Poste: {employee.position}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center mt-6">
        <Button 
          disabled={isLoading || !isSelectionComplete} 
          className="w-full md:w-auto"
          onClick={handleSubmit}
        >
          {isLoading ? 'Création en cours...' : 'Créer le contrat'}
        </Button>
      </div>
    </div>
  );
} 