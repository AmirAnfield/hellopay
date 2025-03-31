/**
 * Composant de liste des employés
 * Utilisant les types partagés et les hooks personnalisés
 */
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { 
  Search,
  Plus,
  UserRound,
  ArrowUpDown,
  Loader2,
  FileText,
  Pencil,
  Trash
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEmployees } from '@/hooks/useEmployees';
import type { EmployeeResponseDTO, ContractType } from '@/lib/types/employees/employee';

// Couleurs des badges pour chaque type de contrat
const contractTypeColors: Record<string, string> = {
  'CDI': 'bg-green-500/20 text-green-700',
  'CDD': 'bg-blue-500/20 text-blue-700',
  'Alternance': 'bg-purple-500/20 text-purple-700',
  'Stage': 'bg-yellow-500/20 text-yellow-700',
  'Intérim': 'bg-orange-500/20 text-orange-700',
  'Autre': 'bg-gray-500/20 text-gray-700',
};

interface EmployeeListProps {
  companyId?: string;
  onViewEmployee?: (employee: EmployeeResponseDTO) => void;
  onCreateEmployee?: () => void;
  onEditEmployee?: (employee: EmployeeResponseDTO) => void;
  onDeleteEmployee?: (employee: EmployeeResponseDTO) => void;
  onGeneratePayslip?: (employee: EmployeeResponseDTO) => void;
}

export function EmployeeList({
  companyId,
  onViewEmployee,
  onCreateEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onGeneratePayslip
}: EmployeeListProps) {
  // État local pour la recherche
  const [searchQuery, setSearchQuery] = useState('');
  
  // Utilisation de notre hook personnalisé
  const {
    employees,
    isLoading,
    isSubmitting,
    totalCount,
    totalPages,
    currentPage,
    filters,
    changePage,
    updateFilters,
    removeEmployee
  } = useEmployees({
    initialFilters: { 
      companyId, 
      page: 1, 
      limit: 10,
      sortBy: 'lastName',
      sortOrder: 'asc'
    },
    autoLoad: true
  });

  // Gérer la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchQuery, page: 1 });
  };
  
  // Gérer le tri
  const handleSort = (field: string) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    updateFilters({ sortBy: field, sortOrder: newOrder });
  };
  
  // Gérer le filtrage par type de contrat
  const handleContractTypeFilter = (value: string) => {
    updateFilters({ 
      contractType: value === 'all' ? undefined : value,
      page: 1
    });
  };
  
  // Gérer la suppression
  const handleDelete = async (employee: EmployeeResponseDTO) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${employee.firstName} ${employee.lastName} ?`)) {
      const success = await removeEmployee(employee.id);
      
      if (success && onDeleteEmployee) {
        onDeleteEmployee(employee);
      }
    }
  };
  
  // Formater la date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'PP', { locale: fr });
    } catch {
      return dateString;
    }
  };
  
  return (
    <div className="space-y-4">
      {/* En-tête avec filtres et recherche */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Employés</h2>
          <Badge variant="outline" className="font-normal">
            {totalCount} {totalCount > 1 ? 'employés' : 'employé'}
          </Badge>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Sélecteur de type de contrat */}
          <Select 
            value={filters.contractType || 'all'} 
            onValueChange={handleContractTypeFilter}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type de contrat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les contrats</SelectItem>
              <SelectItem value="CDI">CDI</SelectItem>
              <SelectItem value="CDD">CDD</SelectItem>
              <SelectItem value="Alternance">Alternance</SelectItem>
              <SelectItem value="Stage">Stage</SelectItem>
              <SelectItem value="Intérim">Intérim</SelectItem>
              <SelectItem value="Autre">Autre</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Formulaire de recherche */}
          <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="search"
              placeholder="Rechercher un employé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-w-[200px]"
            />
            <Button type="submit" variant="outline" size="icon">
              <Search className="h-4 w-4" />
              <span className="sr-only">Rechercher</span>
            </Button>
          </form>
          
          {/* Bouton Ajouter */}
          {onCreateEmployee && (
            <Button onClick={onCreateEmployee} className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          )}
        </div>
      </div>
      
      {/* Tableau des employés */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => handleSort('lastName')}
                >
                  Nom
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => handleSort('position')}
                >
                  Poste
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Type de contrat</TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => handleSort('startDate')}
                >
                  Date d&apos;embauche
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin mr-2 text-primary" />
                    <span>Chargement des employés...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="flex flex-col items-center gap-2">
                    <UserRound className="w-8 h-8 text-muted-foreground" />
                    <p>Aucun employé trouvé</p>
                    {filters.search && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchQuery('');
                          updateFilters({ search: undefined });
                        }}
                      >
                        Effacer la recherche
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell 
                    className="font-medium cursor-pointer hover:underline"
                    onClick={() => onViewEmployee && onViewEmployee(employee)}
                  >
                    {employee.firstName} {employee.lastName}
                  </TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>
                    <Badge className={contractTypeColors[employee.contractType as ContractType] || contractTypeColors.Autre}>
                      {employee.contractType}
                      {employee.isExecutive && ' • Cadre'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(employee.startDate)}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {onViewEmployee && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onViewEmployee(employee)}
                        title="Voir les détails"
                      >
                        <UserRound className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {onEditEmployee && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onEditEmployee(employee)}
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {onGeneratePayslip && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onGeneratePayslip(employee)}
                        title="Générer un bulletin"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {onDeleteEmployee && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(employee)}
                        disabled={isSubmitting}
                        title="Supprimer"
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={changePage}
            disabled={isLoading || isSubmitting}
          />
        </div>
      )}
    </div>
  );
} 