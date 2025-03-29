'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MonthSelector } from '@/components/payslip/MonthSelector';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  startDate: string;
  grossSalary: number;
}

interface Company {
  id: string;
  name: string;
}

interface PayslipData {
  id: string;
  period: string;
  grossSalary: number;
  netSalary: number;
  employerCost: number;
  employeeContributions?: {
    total: number;
    [key: string]: number;
  };
  status?: string;
  locked?: boolean;
}

interface MonthData {
  key: string;
  date: Date;
  label: string;
  selected: boolean;
  grossSalary: number;
  netSalary: number;
  contributions: number;
  employerCost: number;
  locked: boolean;
  validated: boolean;
}

export default function PayslipsGeneratePage() {
  const { data: session, status } = useSession();
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPaid, setHasPaid] = useState(true);
  const [generatedPayslips, setGeneratedPayslips] = useState<PayslipData[]>([]);
  const [currentTab, setCurrentTab] = useState('selection');
  const [existingPayslips, setExistingPayslips] = useState<PayslipData[]>([]);
  
  // Charger les entreprises
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/companies');
        if (response.ok) {
          const data = await response.json();
          setCompanies(data.companies);
        } else {
          toast.error('Impossible de charger les entreprises');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des entreprises', error);
        toast.error('Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (status === 'authenticated') {
      fetchCompanies();
    }
  }, [status]);
  
  // Charger les employés lorsqu'une entreprise est sélectionnée
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!selectedCompany) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/companies/${selectedCompany}/employees`);
        if (response.ok) {
          const data = await response.json();
          setEmployees(data.employees);
        } else {
          toast.error('Impossible de charger les employés');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des employés', error);
        toast.error('Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (selectedCompany) {
      fetchEmployees();
      setSelectedEmployee('');
      setExistingPayslips([]);
    }
  }, [selectedCompany]);
  
  // Mettre à jour l'employé actuel lorsqu'il est sélectionné
  useEffect(() => {
    if (selectedEmployee) {
      const employee = employees.find(e => e.id === selectedEmployee);
      setCurrentEmployee(employee || null);
      
      // Charger les bulletins existants pour cet employé
      if (employee) {
        fetchEmployeePayslips(employee.id);
      }
    } else {
      setCurrentEmployee(null);
      setExistingPayslips([]);
    }
  }, [selectedEmployee, employees]);
  
  // Récupérer les bulletins existants pour un employé
  const fetchEmployeePayslips = async (employeeId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/employees/${employeeId}/payslips`);
      if (response.ok) {
        const data = await response.json();
        setExistingPayslips(data.payslips || []);
      } else {
        console.error('Erreur lors de la récupération des bulletins');
        // On ne montre pas d'erreur à l'utilisateur car ce n'est pas bloquant
      }
    } catch (error) {
      console.error('Erreur lors du chargement des bulletins', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Simuler le paiement pour débloquer les bulletins
  const handlePayment = async () => {
    // Dans une version réelle, on redirigerait vers une page de paiement
    toast.loading('Traitement du paiement...');
    
    // Simuler un temps de traitement
    setTimeout(() => {
      setHasPaid(true);
      toast.dismiss();
      toast.success('Paiement réussi ! Bulletins débloqués');
    }, 2000);
  };
  
  // Gérer la génération des bulletins
  const handleGeneratePayslips = async (selectedMonths: MonthData[]) => {
    setIsLoading(true);
    const generatedResults: PayslipData[] = [];
    const toastId = toast.loading('Génération des bulletins en cours...');
    
    try {
      for (const month of selectedMonths) {
        const payslipData = {
          employeeId: currentEmployee?.id,
          companyId: selectedCompany,
          period: month.key,
          grossSalary: month.grossSalary,
        };
        
        const response = await fetch('/api/payslips/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payslipData),
        });
        
        if (response.ok) {
          const result = await response.json();
          generatedResults.push(result);
        } else {
          const error = await response.json();
          toast.error(`Erreur: ${error.message || 'Impossible de générer le bulletin'}`);
        }
      }
      
      setGeneratedPayslips(generatedResults);
      
      if (generatedResults.length > 0) {
        toast.success(`${generatedResults.length} bulletin(s) généré(s) avec succès`);
        setCurrentTab('results');
        
        // Rafraîchir les bulletins existants pour montrer les nouveaux statuts
        if (currentEmployee) {
          fetchEmployeePayslips(currentEmployee.id);
        }
      } else {
        toast.error('Aucun bulletin n\'a pu être généré');
      }
    } catch (error) {
      console.error('Erreur lors de la génération des bulletins', error);
      toast.error('Une erreur est survenue lors de la génération des bulletins');
    } finally {
      setIsLoading(false);
      toast.dismiss(toastId);
    }
  };
  
  // Déverrouiller un bulletin (pour les admins)
  const handleUnlock = async (payslipId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/payslips/${payslipId}/lock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locked: false }),
      });
      
      if (response.ok) {
        // Mettre à jour le statut local
        setExistingPayslips(prevPayslips => 
          prevPayslips.map(p => 
            p.id === payslipId ? { ...p, locked: false } : p
          )
        );
        toast.success('Bulletin déverrouillé avec succès');
      } else {
        toast.error('Impossible de déverrouiller le bulletin');
      }
    } catch (error) {
      console.error('Erreur lors du déverrouillage', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Télécharger les bulletins sélectionnés
  const handleDownloadPayslips = async () => {
    if (generatedPayslips.length === 0) return;
    
    try {
      setIsLoading(true);
      const toastId = toast.loading('Préparation du téléchargement...');
      
      const payslipIds = generatedPayslips.map(p => p.id);
      const response = await fetch('/api/payslips/download-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payslipIds }),
      });
      
      if (response.ok) {
        // Télécharger le fichier zip
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bulletins_${currentEmployee?.lastName}_${currentEmployee?.firstName}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Téléchargement réussi');
      } else {
        toast.error('Impossible de télécharger les bulletins');
      }
      
      toast.dismiss(toastId);
    } catch (error) {
      console.error('Erreur lors du téléchargement', error);
      toast.error('Une erreur est survenue lors du téléchargement');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/dashboard/payslips" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Génération de bulletins de paie</h1>
        </div>
        
        {!hasPaid && (
          <Button 
            onClick={handlePayment}
            className="bg-green-600 hover:bg-green-700"
          >
            Débloquer les bulletins
          </Button>
        )}
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="selection">Sélection</TabsTrigger>
          <TabsTrigger value="results" disabled={generatedPayslips.length === 0}>
            Résultats
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="selection">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sélectionner un employé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Entreprise</label>
                  <Select 
                    value={selectedCompany} 
                    onValueChange={setSelectedCompany}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une entreprise" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map(company => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Employé</label>
                  <Select 
                    value={selectedEmployee} 
                    onValueChange={setSelectedEmployee}
                    disabled={isLoading || !selectedCompany || employees.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un employé" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {isLoading && !currentEmployee ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
            </div>
          ) : currentEmployee ? (
            <MonthSelector 
              employeeStartDate={new Date(currentEmployee.startDate)}
              defaultGrossSalary={currentEmployee.grossSalary}
              currentPayslips={existingPayslips}
              onGeneratePayslips={handleGeneratePayslips}
              isAdmin={session?.user?.role === 'admin'}
              hasPaid={hasPaid}
              onUnlockPayslip={handleUnlock}
              onRequestPayment={handlePayment}
            />
          ) : (
            <Card className="p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h2 className="text-xl font-medium mb-2">Aucun employé sélectionné</h2>
              <p className="text-gray-500 mb-4">
                Veuillez sélectionner une entreprise et un employé pour continuer.
              </p>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Bulletins générés</CardTitle>
                <Button 
                  onClick={handleDownloadPayslips}
                  disabled={generatedPayslips.length === 0 || isLoading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger tous
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
                </div>
              ) : generatedPayslips.length > 0 ? (
                <div className="space-y-4">
                  {generatedPayslips.map(payslip => (
                    <div 
                      key={payslip.id} 
                      className="flex items-center justify-between p-4 border rounded-md"
                    >
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <div className="font-medium">
                            {payslip.period || 'Période non spécifiée'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Brut: {new Intl.NumberFormat('fr-FR', { 
                              style: 'currency', 
                              currency: 'EUR' 
                            }).format(payslip.grossSalary)}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // Télécharger un bulletin individuel
                          window.open(`/api/payslips/${payslip.id}/download`, '_blank');
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {/* Bloc récapitulatif des totaux */}
                  <div className="mt-8 p-4 border rounded-md bg-gray-50">
                    <h3 className="font-semibold mb-3">Récapitulatif</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Brut total</p>
                        <p className="font-medium">
                          {new Intl.NumberFormat('fr-FR', { 
                            style: 'currency', 
                            currency: 'EUR' 
                          }).format(
                            generatedPayslips.reduce((sum, p) => sum + p.grossSalary, 0)
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Net total</p>
                        <p className="font-medium">
                          {new Intl.NumberFormat('fr-FR', { 
                            style: 'currency', 
                            currency: 'EUR' 
                          }).format(
                            generatedPayslips.reduce((sum, p) => sum + p.netSalary, 0)
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Coût employeur total</p>
                        <p className="font-medium">
                          {new Intl.NumberFormat('fr-FR', { 
                            style: 'currency', 
                            currency: 'EUR' 
                          }).format(
                            generatedPayslips.reduce((sum, p) => sum + p.employerCost, 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Aucun bulletin n&apos;a été généré</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setCurrentTab('selection')}>
              Retour à la sélection
            </Button>
            
            <Button 
              onClick={handleDownloadPayslips}
              disabled={generatedPayslips.length === 0 || isLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              Télécharger tous les bulletins
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 