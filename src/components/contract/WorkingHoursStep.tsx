import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkingHours } from '@/types/contract';
import { Clock } from 'lucide-react';

interface WorkingHoursStepProps {
  onSelectHours: (hours: WorkingHours) => Promise<void>;
  selectedHours?: WorkingHours;
  isLoading: boolean;
  onBack: () => void;
}

export function WorkingHoursStep({ 
  onSelectHours, 
  selectedHours, 
  isLoading, 
  onBack 
}: WorkingHoursStepProps) {
  // Heures disponibles
  const availableHours: WorkingHours[] = [24, 28, 30, 35];
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Nombre d'heures hebdomadaires</h2>
        <p className="text-gray-500">Sélectionnez le nombre d'heures de travail par semaine</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {availableHours.map((hours) => (
          <Card
            key={hours}
            className={`cursor-pointer transition-all hover:border-primary ${
              selectedHours === hours ? 'border-2 border-primary' : ''
            }`}
            onClick={() => !isLoading && onSelectHours(hours)}
          >
            <CardContent className="p-4 text-center">
              <Clock className="mx-auto h-8 w-8 text-primary mb-2" />
              <div className="text-lg font-bold">{hours}h</div>
              <div className="text-xs mt-1">
                {hours < 35 ? 'Temps partiel' : 'Temps complet'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex space-x-4 justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={onBack} 
          disabled={isLoading}
        >
          Retour
        </Button>
        
        {selectedHours && (
          <Button 
            disabled={isLoading} 
            className="w-full md:w-auto"
            onClick={() => onSelectHours(selectedHours)}
          >
            {isLoading ? 'Enregistrement...' : 'Continuer'}
          </Button>
        )}
      </div>

      {selectedHours && (
        <div className={`mt-4 p-4 rounded-md ${selectedHours < 35 ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
          <h3 className="font-medium mb-1">
            {selectedHours < 35 ? 'Contrat à temps partiel' : 'Contrat à temps complet'}
          </h3>
          <p className="text-sm">
            {selectedHours < 35 
              ? `Votre contrat sera à temps partiel (${selectedHours}h/semaine). Des règles spécifiques s'appliquent à ce type de contrat.`
              : 'Votre contrat sera à temps complet (35h/semaine), correspondant à la durée légale du travail en France.'
            }
          </p>
        </div>
      )}
    </div>
  );
} 