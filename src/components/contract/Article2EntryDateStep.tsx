import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { format, getDay, startOfMonth, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Article2EntryDate {
  startDate: Date | string;
  startMonth: number;
  startYear: number;
  includeTrialPeriodReference: boolean;
  trialPeriodArticleNumber?: string;
}

interface Article2EntryDateStepProps {
  onSaveEntryDate: (data: Article2EntryDate) => Promise<void>;
  initialData?: Article2EntryDate;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

// Fonction pour trouver le premier lundi d'un mois
const getFirstMondayOfMonth = (year: number, month: number): Date => {
  const firstDayOfMonth = startOfMonth(new Date(year, month - 1));
  // Si le premier jour est un lundi (1), on le retourne, sinon on ajoute les jours nécessaires
  const dayOfWeek = getDay(firstDayOfMonth);
  // getDay() retourne 0 pour dimanche, 1 pour lundi, etc.
  // Donc si c'est 1, c'est déjà un lundi
  // Sinon, on ajoute les jours nécessaires pour arriver au prochain lundi
  return dayOfWeek === 1 
    ? firstDayOfMonth 
    : addDays(firstDayOfMonth, dayOfWeek === 0 ? 1 : 8 - dayOfWeek);
};

// Générer les années, en commençant par 2023 jusqu'à 5 ans dans le futur
const generateYearOptions = (): number[] => {
  const years = [];
  const currentYear = 2023;
  const futureYear = currentYear + 5;
  
  for (let year = currentYear; year <= futureYear; year++) {
    years.push(year);
  }
  
  return years;
};

// Générer les mois
const generateMonthOptions = (): { value: number; label: string }[] => {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: format(new Date(2021, i, 1), 'MMMM', { locale: fr }),
  }));
};

export function Article2EntryDateStep({
  onSaveEntryDate,
  initialData,
  isLoading,
  onBack,
  onNext
}: Article2EntryDateStepProps) {
  // Année et mois par défaut
  const currentDate = new Date();
  const currentYear = 2023;
  const currentMonth = currentDate.getMonth() + 1;
  
  const [startMonth, setStartMonth] = useState<number>(
    initialData?.startMonth || currentMonth
  );
  
  const [startYear, setStartYear] = useState<number>(
    initialData?.startYear || currentYear
  );
  
  const [calculatedStartDate, setCalculatedStartDate] = useState<Date>(() => 
    getFirstMondayOfMonth(startYear, startMonth)
  );
  
  const [includeTrialPeriodReference, setIncludeTrialPeriodReference] = useState<boolean>(
    initialData?.includeTrialPeriodReference || false
  );
  
  const [trialPeriodArticleNumber, setTrialPeriodArticleNumber] = useState<string>(
    initialData?.trialPeriodArticleNumber || '6'
  );

  // Recalculer la date de début quand l'année ou le mois change
  useEffect(() => {
    const date = getFirstMondayOfMonth(startYear, startMonth);
    setCalculatedStartDate(date);
  }, [startYear, startMonth]);

  const handleSave = async () => {
    const data: Article2EntryDate = {
      startDate: calculatedStartDate,
      startMonth,
      startYear,
      includeTrialPeriodReference,
      trialPeriodArticleNumber: includeTrialPeriodReference ? trialPeriodArticleNumber : undefined
    };
    
    await onSaveEntryDate(data);
    onNext();
  };

  const formatDate = (date: Date): string => {
    return format(date, 'dd MMMM yyyy', { locale: fr });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Article 2 – Date d&apos;entrée en fonction</h2>
        <p className="text-gray-500">Choisissez le mois et l&apos;année de début du contrat</p>
      </div>

      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <p className="text-sm text-blue-700 font-medium">Contrat à Durée Indéterminée (CDI)</p>
        <p className="text-sm text-blue-600 mt-1">
          L&apos;article définira la date de prise d&apos;effet du contrat, sans limitation de durée,
          conformément à l&apos;article L.1221-1 du Code du travail.
        </p>
        <p className="text-sm text-blue-600 mt-1">
          <span className="font-medium">Note:</span> La date d&apos;entrée en fonction sera automatiquement fixée au premier lundi du mois sélectionné.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Date d&apos;entrée en fonction</Label>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <div>
              <Label htmlFor="month-select" className="text-sm">Mois</Label>
              <Select 
                value={startMonth.toString()}
                onValueChange={(value) => setStartMonth(parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger id="month-select" className="w-full sm:w-40">
                  <SelectValue placeholder="Mois" />
                </SelectTrigger>
                <SelectContent>
                  {generateMonthOptions().map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="year-select" className="text-sm">Année</Label>
              <Select 
                value={startYear.toString()}
                onValueChange={(value) => setStartYear(parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger id="year-select" className="w-full sm:w-32">
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                  {generateYearOptions().map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Label className="text-sm">Date calculée:</Label>
            <div className="p-2 bg-gray-100 rounded mt-1 text-sm font-medium">
              {formatDate(calculatedStartDate)} (premier lundi du mois)
            </div>
          </div>

          <div className="mt-6 mb-4">
            <p className="text-gray-600 italic text-sm">
              Aperçu du texte qui sera généré :
            </p>
            <div className="p-4 bg-gray-50 rounded-md border mt-2">
              <p className="text-sm">
                Le présent contrat prendra effet à compter du <span className="font-medium">{formatDate(calculatedStartDate)}</span>, date à laquelle le Salarié débutera ses fonctions au sein de l&apos;Entreprise.
              </p>
              <p className="text-sm mt-2">
                Le contrat est conclu sans limitation de durée, conformément à l&apos;article L.1221-1 du Code du travail.
              </p>
              {includeTrialPeriodReference && (
                <p className="text-sm mt-2 text-blue-600">
                  Cette date marque également le début de la période d&apos;essai mentionnée à l&apos;article {trialPeriodArticleNumber} du présent contrat.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center space-x-2">
            <Checkbox
              id="include-trial-period"
              checked={includeTrialPeriodReference}
              onCheckedChange={(checked) => setIncludeTrialPeriodReference(checked as boolean)}
              disabled={isLoading}
            />
            <Label 
              htmlFor="include-trial-period" 
              className="cursor-pointer"
            >
              Ajouter une référence à la période d&apos;essai
            </Label>
          </div>

          {includeTrialPeriodReference && (
            <div className="mt-3 ml-6">
              <Label htmlFor="trial-article-number">Numéro de l&apos;article concernant la période d&apos;essai</Label>
              <Input
                id="trial-article-number"
                className="w-20 mt-1"
                value={trialPeriodArticleNumber}
                onChange={(e) => setTrialPeriodArticleNumber(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Par convention, la période d&apos;essai est généralement mentionnée à l&apos;article 6 du contrat.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isLoading} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <Button 
          onClick={handleSave}
          disabled={isLoading} 
          className="flex items-center"
        >
          {isLoading ? 'Enregistrement...' : 'Continuer'}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
} 