"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Trash, Edit, Eye, FileText, Building2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

interface EmployeeCardProps {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    companyId: string;
    companyName?: string;
  };
  layout?: 'grid' | 'list';
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, layout = 'grid' }) => {
  const router = useRouter();
  const { toast } = useToast();

  const handleView = () => {
    router.push(`/dashboard/employees/${employee.id}`);
  };

  const handleEdit = () => {
    router.push(`/dashboard/employees/${employee.id}/edit`);
  };

  const handleGeneratePayslip = () => {
    router.push(`/dashboard/payslips/new?employeeId=${employee.id}`);
  };

  const handleDelete = async () => {
    if (typeof window !== 'undefined') {
      try {
        const employeesStr = localStorage.getItem('employees');
        if (employeesStr) {
          const employees = JSON.parse(employeesStr);
          const updatedEmployees = employees.filter((e: { id: string }) => e.id !== employee.id);
          localStorage.setItem('employees', JSON.stringify(updatedEmployees));
          
          toast({
            title: "Employé supprimé",
            description: `L'employé "${employee.firstName} ${employee.lastName}" a été supprimé avec succès.`,
          });
          
          // Recharger la page pour afficher les changements
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (e) {
        console.error("Erreur lors de la suppression:", e);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de supprimer l'employé.",
        });
      }
    }
  };

  // Affichage en liste (pleine largeur simplifiée)
  if (layout === 'list') {
    return (
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">{employee.firstName} {employee.lastName}</h3>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-muted-foreground mr-3">{employee.position}</span>
                  {employee.companyName && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      <span>{employee.companyName}</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button 
                variant="default" 
                size="sm"
                onClick={handleView}
              >
                <Eye className="h-4 w-4 mr-1" /> 
                Voir
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4 mr-1" />
                Modifier
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGeneratePayslip}
              >
                <FileText className="h-4 w-4 mr-1" />
                Bulletin
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDelete}
              >
                <Trash className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Affichage en grille (format carte)
  return (
    <Card>
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium">{employee.firstName} {employee.lastName}</h3>
            <p className="text-sm text-muted-foreground">{employee.position}</p>
            {employee.companyName && (
              <div className="mt-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  <span>{employee.companyName}</span>
                </Badge>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-row gap-2 justify-end mt-2">
          <Button 
            variant="default" 
            size="sm"
            onClick={handleView}
          >
            Voir
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleEdit}
          >
            Modifier
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleGeneratePayslip}
          >
            Bulletin
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete}
          >
            Supprimer
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EmployeeCard; 