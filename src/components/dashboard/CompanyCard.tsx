"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MoreHorizontal, Users, Trash, Edit, Eye, UserPlus } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import { Company } from '@/services/company-service';
import { useToast } from '@/components/ui/use-toast';

interface CompanyCardProps {
  company: Company;
  layout?: 'grid' | 'list';
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, layout = 'grid' }) => {
  const router = useRouter();
  const { toast } = useToast();

  const handleView = () => {
    router.push(`/dashboard/companies/${company.id}`);
  };

  const handleEdit = () => {
    router.push(`/dashboard/companies/${company.id}/edit`);
  };

  const handleEmployeesList = () => {
    router.push(`/dashboard/employees?companyId=${company.id}`);
  };

  const handleDelete = async () => {
    if (typeof window !== 'undefined') {
      try {
        const companiesStr = localStorage.getItem('companies');
        if (companiesStr) {
          const companies = JSON.parse(companiesStr);
          const updatedCompanies = companies.filter((c: { id: string }) => c.id !== company.id);
          localStorage.setItem('companies', JSON.stringify(updatedCompanies));
          
          toast({
            title: "Entreprise supprimée",
            description: `L'entreprise "${company.name}" a été supprimée avec succès.`,
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
          description: "Impossible de supprimer l'entreprise.",
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
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">{company.name}</h3>
                <div className="flex items-center mt-1">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{company.employeeCount ?? 0} employés</span>
                  </Badge>
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
                onClick={handleEmployeesList}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Employés
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
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium">{company.name}</h3>
            <p className="text-sm text-muted-foreground">{company.siret}</p>
            <p className="text-sm text-muted-foreground truncate max-w-md">{company.address}</p>
            <div className="mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{company.employeeCount ?? 0} employés</span>
              </Badge>
            </div>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleEmployeesList}>
                <Users className="mr-2 h-4 w-4" />
                <span>Voir les employés</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600"
              >
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
};

export default CompanyCard; 