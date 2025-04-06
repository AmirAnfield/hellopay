import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContractType } from '@/types/contract';
import { Briefcase } from 'lucide-react';

interface ContractTypeStepProps {
  onSelectType: (type: ContractType) => Promise<void>;
  selectedType?: ContractType;
  isLoading: boolean;
}

export function ContractTypeStep({ onSelectType, selectedType, isLoading }: ContractTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choisissez le type de contrat</h2>
        <p className="text-gray-500">Sélectionnez le type de contrat que vous souhaitez créer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer transition-all hover:border-primary ${selectedType === 'CDI' ? 'border-2 border-primary' : ''}`}
          onClick={() => !isLoading && onSelectType('CDI')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-primary" />
              Contrat à Durée Indéterminée
            </CardTitle>
            <CardDescription>CDI</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Le CDI est la forme normale et générale de la relation de travail. 
              Il peut être conclu à temps plein ou à temps partiel.
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:border-primary ${selectedType === 'CDD' ? 'border-2 border-primary' : ''}`}
          onClick={() => !isLoading && onSelectType('CDD')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-primary" /> 
              Contrat à Durée Déterminée
            </CardTitle>
            <CardDescription>CDD</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Le CDD est un contrat d'exception qui ne peut être conclu que pour l'exécution d'une 
              tâche précise et temporaire et uniquement dans les cas énumérés par la loi.
            </p>
          </CardContent>
        </Card>
      </div>

      {selectedType && (
        <div className="text-center mt-6">
          <Button 
            disabled={isLoading} 
            className="w-full md:w-auto"
            onClick={() => onSelectType(selectedType)}
          >
            {isLoading ? 'Enregistrement...' : 'Continuer'}
          </Button>
        </div>
      )}
    </div>
  );
} 