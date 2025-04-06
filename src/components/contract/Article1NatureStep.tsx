import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { Article1Nature } from '@/services/contractArticlesService';
import { ContractType } from '@/types/contract';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, differenceInCalendarMonths, isBefore, startOfMonth, endOfMonth, getDay, addDays, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Article1NatureStepProps {
  onSaveNature: (natureData: Article1Nature) => Promise<void>;
  initialData?: Article1Nature;
  contractType: ContractType; // CDI ou CDD
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

// Motifs possibles pour un CDD
const CDD_REASONS = [
  { id: 'surcroit', label: 'Surcroît temporaire d\'activité' },
  { id: 'remplacement', label: 'Remplacement d\'un salarié absent' },
  { id: 'saisonnier', label: 'Emploi saisonnier' },
  { id: 'usage', label: 'Contrat d\'usage' },
  { id: 'projet', label: 'Contrat à objet défini (projet)' }
];

// Mois pour la sélection
const MONTHS = [
  { value: "0", label: 'Janvier' },
  { value: "1", label: 'Février' },
  { value: "2", label: 'Mars' },
  { value: "3", label: 'Avril' },
  { value: "4", label: 'Mai' },
  { value: "5", label: 'Juin' },
  { value: "6", label: 'Juillet' },
  { value: "7", label: 'Août' },
  { value: "8", label: 'Septembre' },
  { value: "9", label: 'Octobre' },
  { value: "10", label: 'Novembre' },
  { value: "11", label: 'Décembre' }
];

// Années disponibles pour la sélection (année actuelle + 3 ans)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 4 }, (_, i) => (currentYear + i).toString());

// Trouver le premier lundi du mois
function getFirstMondayOfMonth(year: number, month: number): Date {
  const firstDay = startOfMonth(new Date(year, month));
  const dayOfWeek = getDay(firstDay);
  
  // Si le premier jour est déjà un lundi (1), retourner ce jour
  // Sinon, ajouter le nombre de jours nécessaires pour atteindre le lundi suivant
  return dayOfWeek === 1 ? firstDay : addDays(firstDay, (8 - dayOfWeek) % 7);
}

// Trouver le dernier vendredi du mois
function getLastFridayOfMonth(year: number, month: number): Date {
  const lastDay = endOfMonth(new Date(year, month));
  const dayOfWeek = getDay(lastDay);
  
  // Si le dernier jour est un vendredi (5), retourner ce jour
  // Sinon, soustraire le nombre de jours nécessaires pour atteindre le vendredi précédent
  return dayOfWeek === 5 ? lastDay : subDays(lastDay, (dayOfWeek + 2) % 7);
}

export function Article1NatureStep({
  onSaveNature,
  initialData,
  contractType,
  isLoading,
  onBack,
  onNext
}: Article1NatureStepProps) {
  // Pour les CDI - juste un aperçu du texte
  const [cdiValidated, setCdiValidated] = useState(false);
  
  // États pour CDD
  const [reason, setReason] = useState<string | undefined>(initialData?.reason);
  
  // Pour la sélection des dates et calcul de la durée
  const initialStartDate = initialData?.startDate ? new Date(initialData.startDate) : null;
  const initialEndDate = initialData?.endDate ? new Date(initialData.endDate) : null;
  
  const [startMonth, setStartMonth] = useState<string | undefined>(
    initialStartDate ? initialStartDate.getMonth().toString() : undefined
  );
  const [startYear, setStartYear] = useState<string | undefined>(
    initialStartDate ? initialStartDate.getFullYear().toString() : currentYear.toString()
  );
  const [endMonth, setEndMonth] = useState<string | undefined>(
    initialEndDate ? initialEndDate.getMonth().toString() : undefined
  );
  const [endYear, setEndYear] = useState<string | undefined>(
    initialEndDate ? initialEndDate.getFullYear().toString() : currentYear.toString()
  );
  
  // Dates calculées
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate);
  const [durationMonths, setDurationMonths] = useState<number>(initialData?.durationMonths || 0);
  
  // Message d'erreur pour les dates
  const [dateError, setDateError] = useState<string | null>(null);
  
  // Calculer la date de début lorsque le mois ou l'année change
  useEffect(() => {
    if (startMonth && startYear) {
      try {
        const firstMonday = getFirstMondayOfMonth(parseInt(startYear), parseInt(startMonth));
        setStartDate(firstMonday);
      } catch (error) {
        console.error("Erreur lors du calcul de la date de début:", error);
      }
    }
  }, [startMonth, startYear]);
  
  // Calculer la date de fin lorsque le mois ou l'année change
  useEffect(() => {
    if (endMonth && endYear) {
      try {
        const lastFriday = getLastFridayOfMonth(parseInt(endYear), parseInt(endMonth));
        setEndDate(lastFriday);
      } catch (error) {
        console.error("Erreur lors du calcul de la date de fin:", error);
      }
    }
  }, [endMonth, endYear]);
  
  // Calculer la durée et vérifier les erreurs
  useEffect(() => {
    // Vérifier les dates et calculer la durée
    if (startDate && endDate) {
      if (isBefore(endDate, startDate)) {
        setDateError("La date de fin doit être postérieure à la date de début");
        setDurationMonths(0);
      } else {
        const months = Math.max(1, differenceInCalendarMonths(endDate, startDate) + 1);
        if (months > 18) {
          setDateError("La durée du CDD ne peut pas dépasser 18 mois");
        } else {
          setDateError(null);
        }
        setDurationMonths(months);
      }
    } else {
      setDateError(null);
    }
  }, [startDate, endDate]);
  
  const handleSave = async () => {
    if (contractType === 'CDI') {
      // Pour CDI, aucune donnée spécifique à sauvegarder
      await onSaveNature({});
    } else if (startDate && endDate && reason) {
      // Pour CDD
      await onSaveNature({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        durationMonths,
        reason
      });
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          Article 1 – {contractType === 'CDI' ? 'Nature du contrat' : 'Nature et motif du contrat'}
        </h2>
        <p className="text-gray-500">
          {contractType === 'CDI' 
            ? 'Contrat à Durée Indéterminée' 
            : 'Contrat à Durée Déterminée - définissez la période et le motif'}
        </p>
      </div>

      {contractType === 'CDI' ? (
        /* Affichage pour CDI */
        <div className="space-y-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-800">Contrat à Durée Indéterminée (CDI)</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Le CDI est la forme normale et générale de la relation de travail.
                    Il est conclu sans limitation de durée.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-gray-50 border rounded-md p-6">
            <h3 className="font-semibold mb-4">Aperçu de l&apos;article</h3>
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-2">Article 1 – Nature du contrat</p>
              <p>
                Le présent contrat est conclu pour une durée indéterminée, conformément 
                aux dispositions des articles L.1221-1 et suivants du Code du travail.
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <input 
              type="checkbox" 
              id="cdi-validation" 
              checked={cdiValidated}
              onChange={() => setCdiValidated(!cdiValidated)}
              className="h-4 w-4 rounded border-gray-300 text-primary"
            />
            <Label htmlFor="cdi-validation" className="text-sm cursor-pointer">
              J&apos;ai pris connaissance de cet article et je souhaite continuer
            </Label>
          </div>
        </div>
      ) : (
        /* Affichage pour CDD */
        <div className="space-y-6">
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-amber-800">Contrat à Durée Déterminée (CDD)</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Le CDD est un contrat d&apos;exception qui ne peut être conclu que pour l&apos;exécution 
                    d&apos;une tâche précise et temporaire et uniquement dans les cas prévus par la loi.
                    La mention du motif est obligatoire, son absence peut entraîner la requalification en CDI.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="cdd-motif" className="text-base font-medium">Motif du CDD</Label>
              <Select
                value={reason}
                onValueChange={setReason}
                disabled={isLoading}
              >
                <SelectTrigger id="cdd-motif">
                  <SelectValue placeholder="Sélectionnez le motif du CDD" />
                </SelectTrigger>
                <SelectContent>
                  {CDD_REASONS.map((motif) => (
                    <SelectItem key={motif.id} value={motif.id}>
                      {motif.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sélection du mois et année de début */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Mois de début</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Select
                      value={startMonth}
                      onValueChange={setStartMonth}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Mois" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      value={startYear}
                      onValueChange={setStartYear}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Année" />
                      </SelectTrigger>
                      <SelectContent>
                        {YEARS.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {startDate && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md border">
                    Date précise de début: <span className="font-medium">{format(startDate, 'dd MMMM yyyy', { locale: fr })}</span>
                    <div className="text-xs text-gray-500 mt-1">Premier jour ouvrable du mois</div>
                  </div>
                )}
              </div>
              
              {/* Sélection du mois et année de fin */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Mois de fin</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Select
                      value={endMonth}
                      onValueChange={setEndMonth}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Mois" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      value={endYear}
                      onValueChange={setEndYear}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Année" />
                      </SelectTrigger>
                      <SelectContent>
                        {YEARS.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {endDate && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md border">
                    Date précise de fin: <span className="font-medium">{format(endDate, 'dd MMMM yyyy', { locale: fr })}</span>
                    <div className="text-xs text-gray-500 mt-1">Dernier jour ouvrable du mois</div>
                  </div>
                )}
              </div>
            </div>
            
            {dateError && (
              <div className="text-red-500 text-sm">{dateError}</div>
            )}
            
            <div className="space-y-2 mt-2">
              <Label className="text-base font-medium">Durée calculée</Label>
              <div className="p-3 border rounded-md bg-blue-50 text-blue-700 font-medium">
                {startDate && endDate && durationMonths > 0 && !dateError
                  ? `${durationMonths} mois`
                  : 'À déterminer après sélection des mois de début et de fin'
                }
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 border rounded-md p-6 mt-4">
            <h3 className="font-semibold mb-4">Aperçu de l&apos;article</h3>
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-2">Article 1 – Nature et motif du contrat</p>
              <p>
                Le présent contrat est conclu pour une durée déterminée, 
                du {startDate ? format(startDate, 'dd/MM/yyyy', { locale: fr }) : '______'} 
                au {endDate ? format(endDate, 'dd/MM/yyyy', { locale: fr }) : '______'}, 
                en application des articles L.1242-1 et suivants du Code du travail.
              </p>
              <p className="mt-2">
                Il est établi pour le motif suivant : {reason ? 
                  CDD_REASONS.find(m => m.id === reason)?.label || reason 
                  : '_________________'}.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isLoading} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <Button 
          onClick={handleSave}
          disabled={
            isLoading || 
            (contractType === 'CDI' 
              ? !cdiValidated 
              : !reason || !startDate || !endDate || !!dateError
            )
          } 
          className="flex items-center"
        >
          {isLoading ? 'Enregistrement...' : 'Continuer'}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
} 