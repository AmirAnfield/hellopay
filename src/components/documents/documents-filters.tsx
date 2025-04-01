'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, FilterX } from 'lucide-react';

interface DocumentsFiltersProps {
  query: string;
  documentType: string;
  employeeId: string;
  status: string;
}

export function DocumentsFilters({
  query: initialQuery,
  documentType: initialType,
  employeeId: initialEmployee,
  status: initialStatus,
}: DocumentsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(initialQuery);
  const [documentType, setDocumentType] = useState(initialType);
  const [employeeId, setEmployeeId] = useState(initialEmployee);
  const [status, setStatus] = useState(initialStatus);
  
  // Créer un nouvel objet URLSearchParams
  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      // Supprimer les paramètres vides
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newSearchParams.set(key, value);
        } else {
          newSearchParams.delete(key);
        }
      });
      
      return newSearchParams.toString();
    },
    [searchParams]
  );
  
  const handleSearch = () => {
    const queryString = createQueryString({
      q: query,
      type: documentType,
      employee: employeeId,
      status,
      page: '1', // Revenir à la première page pour les nouvelles recherches
    });
    
    router.push(`${pathname}?${queryString}`);
  };
  
  const handleReset = () => {
    setQuery('');
    setDocumentType('');
    setEmployeeId('');
    setStatus('active');
    
    router.push(pathname);
  };
  
  const statusOptions = [
    { value: 'active', label: 'Actif' },
    { value: 'archived', label: 'Archivé' },
    { value: 'draft', label: 'Brouillon' },
    { value: 'all', label: 'Tous' },
  ];
  
  const documentTypeOptions = [
    { value: '', label: 'Tous les types' },
    { value: 'payslip', label: 'Bulletin de paie' },
    { value: 'contract', label: 'Contrat' },
    { value: 'certificate', label: 'Certificat' },
    { value: 'other', label: 'Autre' },
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="query">Recherche</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="query"
              placeholder="Rechercher un document..."
              className="pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="documentType">Type de document</Label>
          <Select
            value={documentType}
            onValueChange={setDocumentType}
          >
            <SelectTrigger id="documentType">
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              {documentTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="employeeId">ID de l&apos;employé</Label>
          <Input
            id="employeeId"
            placeholder="Filtrer par employé..."
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Statut</Label>
          <Select
            value={status}
            onValueChange={setStatus}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" onClick={handleReset}>
          <FilterX className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          Rechercher
        </Button>
      </div>
    </div>
  );
} 