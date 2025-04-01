"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  User,
  Plus,
  MoreHorizontal,
  FileText,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { EmptyState, LoadingState } from '@/components/shared/PageContainer';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  phone?: string;
  status: 'active' | 'inactive';
}

interface CompanyEmployeesListProps {
  companyId: string;
}

const CompanyEmployeesList: React.FC<CompanyEmployeesListProps> = ({ companyId }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      
      try {
        // Simuler un délai pour le chargement
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // En mode développement, on n'a pas d'employés stockés
        setEmployees([]);
      } catch (error) {
        console.error("Erreur lors du chargement des employés:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les employés. Veuillez réessayer.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmployees();
  }, [companyId, toast]);

  const handleAddEmployee = () => {
    router.push(`/dashboard/employees/new?companyId=${companyId}`);
  };

  const handleViewEmployee = (employeeId: string) => {
    router.push(`/dashboard/employees/${employeeId}`);
  };

  const handleEditEmployee = (employeeId: string) => {
    router.push(`/dashboard/employees/${employeeId}/edit`);
  };

  const handleDeleteEmployee = (employeeId: string, employeeName: string) => {
    toast({
      title: "Employé supprimé",
      description: `L'employé "${employeeName}" a été supprimé avec succès.`,
    });
    
    setEmployees(prevEmployees => prevEmployees.filter(e => e.id !== employeeId));
  };

  const handleGeneratePayslip = (employeeId: string) => {
    router.push(`/dashboard/payslips/new?employeeId=${employeeId}`);
  };

  if (isLoading) {
    return <LoadingState message="Chargement des employés..." />;
  }

  if (employees.length === 0) {
    return (
      <EmptyState
        title="Aucun employé trouvé"
        description="Vous n'avez pas encore ajouté d'employé pour cette entreprise. Commencez par en ajouter un."
        icon={User}
        action={
          <Button onClick={handleAddEmployee}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un employé
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddEmployee}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un employé
        </Button>
      </div>
      
      {employees.map(employee => (
        <Card key={employee.id}>
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">{employee.firstName} {employee.lastName}</h3>
                <div className="mt-1">
                  <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                    {employee.status === 'active' ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5 mr-2" />
                    <span>{employee.position}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 mr-2" />
                    <span>{employee.email}</span>
                  </div>
                  {employee.phone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 mr-2" />
                      <span>{employee.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="default" 
                size="sm"
                onClick={() => handleViewEmployee(employee.id)}
              >
                Voir
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEditEmployee(employee.id)}
              >
                Modifier
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="ml-2">Plus</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleGeneratePayslip(employee.id)}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Générer un bulletin</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleDeleteEmployee(employee.id, `${employee.firstName} ${employee.lastName}`)}
                    className="text-red-600"
                  >
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CompanyEmployeesList; 