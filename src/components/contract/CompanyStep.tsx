import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Company } from '@/types/contract';
import { Building2, Plus, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CompanyStepProps {
  onSelectCompany: (company: Company) => Promise<void>;
  selectedCompanyId?: string;
  companies: Company[];
  isLoading: boolean;
  isLoadingCompanies: boolean;
  onBack: () => void;
}

export function CompanyStep({
  onSelectCompany,
  selectedCompanyId,
  companies,
  isLoading,
  isLoadingCompanies,
  onBack
}: CompanyStepProps) {
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(
    companies.find(c => c.id === selectedCompanyId)
  );

  // Mettre à jour le composant lorsque les entreprises sont chargées
  useEffect(() => {
    if (selectedCompanyId && companies.length > 0) {
      const company = companies.find(c => c.id === selectedCompanyId);
      if (company) {
        setSelectedCompany(company);
      }
    }
  }, [selectedCompanyId, companies]);

  // Gérer la sélection d'une entreprise
  const handleSelectChange = (value: string) => {
    const company = companies.find(c => c.id === value);
    if (company) {
      setSelectedCompany(company);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Sélectionner l&apos;entreprise</h2>
        <p className="text-gray-500">Choisissez l&apos;entreprise qui embauche</p>
      </div>

      {isLoadingCompanies ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : companies.length === 0 ? (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Aucune entreprise trouvée</AlertTitle>
          <AlertDescription>
            Vous devez d&apos;abord créer une entreprise avant de pouvoir établir un contrat.
            <div className="mt-4">
              <Link href="/dashboard/companies/create">
                <Button className="flex items-center" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une entreprise
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
              value={selectedCompany?.id}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
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
          </div>

          {selectedCompany && (
            <Card className="mt-4 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-white p-3 rounded-full border">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{selectedCompany.name}</h3>
                    {selectedCompany.siret && (
                      <p className="text-sm text-gray-600">SIRET: {selectedCompany.siret}</p>
                    )}
                    {(selectedCompany.address || selectedCompany.postalCode || selectedCompany.city) && (
                      <p className="text-sm text-gray-600">
                        {selectedCompany.address}{' '}
                        {selectedCompany.postalCode}{' '}
                        {selectedCompany.city}
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
        
        {selectedCompany && (
          <Button 
            disabled={isLoading || isLoadingCompanies} 
            className="w-full md:w-auto" 
            onClick={() => onSelectCompany(selectedCompany)}
          >
            {isLoading ? 'Enregistrement...' : 'Continuer'}
          </Button>
        )}
      </div>
    </div>
  );
} 