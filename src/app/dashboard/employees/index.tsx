'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageContainer, PageHeader } from '@/components/shared/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  MoreHorizontal, 
  Plus, 
  Eye, 
  FileEdit, 
  Trash2, 
  Search, 
  UserPlus, 
  FileDown,
  Users 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  phoneNumber: string;
  contractType: string;
  startDate: string;
  endDate: string | null;
  isExecutive: boolean;
  companyName: string;
  companyId: string;
}

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Charger les employés
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/employees');
        if (response.ok) {
          const data = await response.json();
          setEmployees(data.data || []);
          setFilteredEmployees(data.data || []);
        } else {
          toast.error('Erreur lors du chargement des employés');
        }
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Filtrer les employés
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = employees.filter(
        (employee) =>
          employee.firstName.toLowerCase().includes(term) ||
          employee.lastName.toLowerCase().includes(term) ||
          employee.position.toLowerCase().includes(term) ||
          employee.companyName.toLowerCase().includes(term)
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchTerm, employees]);

  // Supprimer un employé
  const confirmDelete = (id: string) => {
    setEmployeeToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;
    
    try {
      const response = await fetch(`/api/employees/${employeeToDelete}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Mettre à jour l'état local
        const updatedEmployees = employees.filter(employee => employee.id !== employeeToDelete);
        setEmployees(updatedEmployees);
        setFilteredEmployees(updatedEmployees);
        toast.success('Employé supprimé avec succès');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setEmployeeToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  // Formater le type de contrat
  const formatContractType = (type: string) => {
    const types: Record<string, string> = {
      CDI: 'CDI',
      CDD: 'CDD',
      Apprentissage: 'Apprentissage',
      Stage: 'Stage',
      Intérim: 'Intérim',
    };
    return types[type] || type;
  };

  // Déterminer la couleur du badge selon le type de contrat
  const getBadgeVariant = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      CDI: 'default',
      CDD: 'secondary',
      Apprentissage: 'outline',
      Stage: 'outline',
      Intérim: 'destructive',
    };
    return variants[type] || 'default';
  };

  return (
    <PageContainer>
      <PageHeader
        title="Employés"
        description="Gérez les employés de votre entreprise"
        actions={
          <Button asChild>
            <Link href="/dashboard/employees/add">
              <UserPlus className="mr-2 h-4 w-4" />
              Ajouter un employé
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Liste des employés</CardTitle>
          <CardDescription>
            Liste de tous les employés de votre entreprise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un employé..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <p>Chargement des employés...</p>
            </div>
          ) : filteredEmployees.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Type de contrat</TableHead>
                    <TableHead>Date de début</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        {employee.firstName} {employee.lastName}
                      </TableCell>
                      <TableCell>{employee.companyName}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(employee.contractType)}>
                          {formatContractType(employee.contractType)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(employee.startDate)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Ouvrir le menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/employees/${employee.id}`)}>
                              <Eye className="mr-2 h-4 w-4" /> Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/employees/${employee.id}/edit`)}>
                              <FileEdit className="mr-2 h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/employees/${employee.id}/generate`)}>
                              <FileDown className="mr-2 h-4 w-4" /> Générer bulletins
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={() => confirmDelete(employee.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-60">
              <Users className="h-8 w-8 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">Aucun employé trouvé</h3>
              <p className="text-muted-foreground text-sm text-center max-w-xs mb-4">
                {searchTerm 
                  ? "Aucun employé ne correspond à votre recherche" 
                  : "Vous n'avez pas encore ajouté d'employés"}
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link href="/dashboard/employees/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un employé
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible.
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