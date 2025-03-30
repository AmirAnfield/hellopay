'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { FileText, Download, Trash2, Search, FileDown, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageContainer, PageHeader, LoadingState, EmptyState } from "@/components/shared/PageContainer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Pagination from "@/components/shared/Pagination";
import { cn } from "@/lib/utils";

// Type pour les fiches de paie
type Payslip = {
  id: string;
  periodStart: string;
  periodEnd: string;
  employeeId: string;
  companyId: string;
  employeeName: string;
  employerName: string;
  employerSiret: string;
  employeePosition: string;
  grossSalary: number;
  netSalary: number;
  employeeContributions: number;
  employerContributions: number;
  paymentDate: string;
  createdAt: string;
  status: 'draft' | 'final';
  pdfUrl: string | null;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
  };
  company: {
    id: string;
    name: string;
  };
};

interface Company {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  success: boolean;
}

export default function PayslipsDashboard() {
  const { status } = useSession();
  const router = useRouter();
  
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [payslipToDelete, setPayslipToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filtres et pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 10;
  
  // Générer les périodes disponibles (12 derniers mois)
  const availablePeriods = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy", { locale: fr })
    };
  });
  
  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (status === 'unauthenticated') {
    redirect('/auth/login');
  }

  // Charger la liste des entreprises
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        if (response.ok) {
          const data = await response.json();
          setCompanies(data.data || data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des entreprises:', error);
      }
    };
    
    if (status === 'authenticated') {
      fetchCompanies();
    }
  }, [status]);
  
  // Charger les employés lorsqu'une entreprise est sélectionnée
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        if (status !== 'authenticated') return;

        let url = '/api/employees';
        if (selectedCompany) {
          url += `?companyId=${selectedCompany}`;
        }
          
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setEmployees(data.data || data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des employés:', error);
      }
    };
    
    fetchEmployees();
  }, [selectedCompany, status]);

  // Charger les bulletins de paie avec les filtres
  useEffect(() => {
    const fetchPayslips = async () => {
      if (status !== 'authenticated') return;
      
      try {
        setIsLoading(true);
        
        // Construire l'URL avec les filtres
        let url = `/api/payslips?page=${currentPage}&limit=${itemsPerPage}`;
        
        if (searchTerm) {
          url += `&search=${encodeURIComponent(searchTerm)}`;
        }
        
        if (selectedCompany) {
          url += `&companyId=${selectedCompany}`;
        }
        
        if (selectedEmployee) {
          url += `&employeeId=${selectedEmployee}`;
        }
        
        if (selectedPeriod) {
          url += `&period=${selectedPeriod}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const result: PaginatedResponse<Payslip> = await response.json();
          setPayslips(result.data);
          setTotalItems(result.meta.total);
        } else {
          toast.error("Impossible de charger les bulletins de paie");
        }
      } catch (error) {
        console.error('Erreur lors du chargement des bulletins:', error);
        toast.error("Une erreur est survenue");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPayslips();
  }, [currentPage, searchTerm, selectedCompany, selectedEmployee, selectedPeriod, status]);

  // Gérer la navigation vers le détail d'un bulletin
  const handleViewPayslip = (id: string) => {
    router.push(`/dashboard/payslips/${id}`);
  };

  // Télécharger un bulletin
  const handleDownloadPayslip = (id: string) => {
    window.open(`/api/payslips/${id}/download`, '_blank');
  };

  // Supprimer une fiche de paie
  const confirmDelete = (id: string) => {
    setPayslipToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!payslipToDelete) return;
    
    try {
      const response = await fetch(`/api/payslips/${payslipToDelete}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Mettre à jour l'état local
        const updatedPayslips = payslips.filter(payslip => payslip.id !== payslipToDelete);
        setPayslips(updatedPayslips);
        toast.success('Bulletin de paie supprimé avec succès');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setPayslipToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  // Navigation vers la page de génération
  const handleGenerateNewPayslip = () => {
    router.push('/dashboard/payslips/generate');
  };

  // Pagination - aller à la page
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Formater un montant en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <PageContainer>
      <PageHeader 
        title="Bulletins de paie" 
        description="Consultez et gérez les bulletins de paie"
        actions={
          <Button onClick={handleGenerateNewPayslip}>
            <FileDown className="mr-2 h-4 w-4" />
            Générer un bulletin
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Historique des bulletins</CardTitle>
            <CardDescription>
              {totalItems} bulletin{totalItems !== 1 ? 's' : ''} trouvé{totalItems !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-8 w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={cn("", showFilters && "bg-accent")}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        {showFilters && (
          <div className="px-6 pb-4 border-b">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Entreprise</label>
                <Select 
                  value={selectedCompany} 
                  onValueChange={setSelectedCompany}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Toutes les entreprises" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les entreprises</SelectItem>
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
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tous les employés" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les employés</SelectItem>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Période</label>
                <Select 
                  value={selectedPeriod} 
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Toutes les périodes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les périodes</SelectItem>
                    {availablePeriods.map(period => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
        
        <CardContent>
          {isLoading ? (
            <LoadingState />
          ) : payslips.length > 0 ? (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Salarié</TableHead>
                      <TableHead>Entreprise</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead className="text-right">Brut</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payslips.map((payslip) => (
                      <TableRow 
                        key={payslip.id}
                        className="cursor-pointer"
                        onClick={() => handleViewPayslip(payslip.id)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <FileText className="mr-2 h-4 w-4 text-blue-500" />
                            <div>
                              <div>{payslip.employeeName || `${payslip.employee?.firstName} ${payslip.employee?.lastName}`}</div>
                              <div className="text-xs text-muted-foreground">{payslip.employeePosition}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{payslip.employerName || payslip.company?.name}</TableCell>
                        <TableCell>
                          {format(new Date(payslip.periodStart), 'MMMM yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(payslip.grossSalary)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(payslip.netSalary)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadPayslip(payslip.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-100"
                              onClick={() => confirmDelete(payslip.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    totalItems={totalItems}
                    pageSize={itemsPerPage}
                  />
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="Aucun bulletin de paie trouvé"
              description={searchTerm || selectedCompany || selectedEmployee || selectedPeriod
                ? "Aucun résultat pour les filtres sélectionnés." 
                : "Vous n'avez pas encore généré de bulletins de paie."}
              action={
                !(searchTerm || selectedCompany || selectedEmployee || selectedPeriod) && (
                  <Button 
                    className="mt-4"
                    onClick={handleGenerateNewPayslip}
                  >
                    Générer votre premier bulletin
                  </Button>
                )
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce bulletin de paie ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
} 