import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, HelpCircle, Plus, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContractType, WorkingHours } from '@/types/contract';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface Article5WorkingSchedule {
  weeklyHours: number;
  useCollectiveSchedule: boolean;
  scheduleType: 'fixed' | 'variable';
  dailySchedules?: {
    day: string;
    startTime: string;
    endTime: string;
    breakDuration?: number;
  }[];
  scheduleDetails?: string;
  includeRestDetails: boolean;
}

interface Article5WorkingScheduleStepProps {
  onSaveWorkingSchedule: (data: Article5WorkingSchedule) => Promise<void>;
  initialData?: Article5WorkingSchedule;
  contractType: ContractType;
  workingHours: WorkingHours;
  isPartTime: boolean;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

// Jours de la semaine en français
const WEEKDAYS = [
  { value: 'lundi', label: 'Lundi' },
  { value: 'mardi', label: 'Mardi' },
  { value: 'mercredi', label: 'Mercredi' },
  { value: 'jeudi', label: 'Jeudi' },
  { value: 'vendredi', label: 'Vendredi' },
  { value: 'samedi', label: 'Samedi' },
  { value: 'dimanche', label: 'Dimanche' },
];

export function Article5WorkingScheduleStep({
  onSaveWorkingSchedule,
  initialData,
  contractType,
  workingHours,
  isPartTime,
  isLoading,
  onBack,
  onNext
}: Article5WorkingScheduleStepProps) {
  const isCDI = contractType === 'CDI';
  
  // Générer des horaires par défaut en fonction du temps de travail
  const generateDefaultSchedules = () => {
    if (!isPartTime) {
      // Pour temps plein, 7h par jour du lundi au vendredi
      return WEEKDAYS.slice(0, 5).map(day => ({
        day: day.value,
        startTime: '09:00',
        endTime: '17:00',
        breakDuration: 60
      }));
    } else {
      // Pour temps partiel, répartition sur moins de jours
      const daysCount = Math.ceil(workingHours / 7);
      return WEEKDAYS.slice(0, daysCount).map(day => ({
        day: day.value,
        startTime: '09:00',
        endTime: workingHours === 24 ? '15:00' : '17:00',
        breakDuration: 60
      }));
    }
  };
  
  // États
  const weeklyHours = initialData?.weeklyHours || workingHours;
  
  const [useCollectiveSchedule, setUseCollectiveSchedule] = useState<boolean>(
    initialData?.useCollectiveSchedule || (!isPartTime)
  );
  
  const [scheduleType, setScheduleType] = useState<'fixed' | 'variable'>(
    initialData?.scheduleType || 'fixed'
  );
  
  const [dailySchedules, setDailySchedules] = useState<Article5WorkingSchedule['dailySchedules']>(
    initialData?.dailySchedules || generateDefaultSchedules()
  );
  
  const [scheduleDetails, setScheduleDetails] = useState<string>(
    initialData?.scheduleDetails || ''
  );
  
  const [includeRestDetails, setIncludeRestDetails] = useState<boolean>(
    initialData?.includeRestDetails || true
  );

  // Ajouter un jour de travail
  const addWorkday = () => {
    const remainingDays = WEEKDAYS.filter(
      day => !dailySchedules?.some(schedule => schedule.day === day.value)
    );
    
    if (remainingDays.length > 0) {
      setDailySchedules([
        ...(dailySchedules || []),
        {
          day: remainingDays[0].value,
          startTime: '09:00',
          endTime: '17:00',
          breakDuration: 60
        }
      ]);
    }
  };

  // Supprimer un jour de travail
  const removeWorkday = (index: number) => {
    const newSchedules = [...(dailySchedules || [])];
    newSchedules.splice(index, 1);
    setDailySchedules(newSchedules);
  };

  // Mettre à jour un horaire
  const updateSchedule = (index: number, field: string, value: string | number) => {
    const newSchedules = [...(dailySchedules || [])];
    newSchedules[index] = {
      ...newSchedules[index],
      [field]: value
    };
    setDailySchedules(newSchedules);
  };

  // Formater les horaires pour l'affichage
  const formatScheduleForDisplay = () => {
    if (scheduleType === 'variable') {
      return scheduleDetails || "Selon planning communiqué au moins 7 jours à l'avance";
    }
    
    if (!dailySchedules || dailySchedules.length === 0) {
      return "Aucun horaire défini";
    }
    
    return dailySchedules
      .sort((a, b) => {
        const aIndex = WEEKDAYS.findIndex(day => day.value === a.day);
        const bIndex = WEEKDAYS.findIndex(day => day.value === b.day);
        return aIndex - bIndex;
      })
      .map(schedule => {
        const dayName = WEEKDAYS.find(d => d.value === schedule.day)?.label || schedule.day;
        return `${dayName} : ${schedule.startTime} - ${schedule.endTime}${schedule.breakDuration ? ` avec une pause de ${schedule.breakDuration} min` : ''}`;
      })
      .join('\n');
  };

  const handleSave = async () => {
    const data: Article5WorkingSchedule = {
      weeklyHours,
      useCollectiveSchedule,
      scheduleType,
      dailySchedules: scheduleType === 'fixed' ? dailySchedules : undefined,
      scheduleDetails: scheduleType === 'variable' ? scheduleDetails : undefined,
      includeRestDetails
    };
    
    await onSaveWorkingSchedule(data);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Article 5 – Durée et organisation du travail</h2>
        <p className="text-gray-500">
          {isPartTime 
            ? 'Définissez la répartition des horaires pour un temps partiel' 
            : 'Définissez l\'organisation du temps de travail à temps complet'}
        </p>
      </div>

      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <p className="text-sm text-blue-700 font-medium">
          {isCDI 
            ? 'Contrat à Durée Indéterminée (CDI)' 
            : 'Contrat à Durée Déterminée (CDD)'} - 
          {isPartTime ? ' Temps partiel' : ' Temps complet'}
        </p>
        <p className="text-sm text-blue-600 mt-1">
          Durée hebdomadaire de travail : <span className="font-medium">{workingHours} heures</span>
        </p>
        {isPartTime && (
          <p className="text-sm text-red-600 mt-1 font-medium">
            ⚠️ Pour les temps partiels, l&apos;absence d&apos;indication précise sur la répartition des horaires peut entraîner une requalification en temps plein.
          </p>
        )}
      </div>

      <div className="space-y-6">
        {!isPartTime && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="collective-schedule"
                checked={useCollectiveSchedule}
                onCheckedChange={setUseCollectiveSchedule}
                disabled={isLoading}
              />
              <Label htmlFor="collective-schedule" className="cursor-pointer">
                Appliquer l&apos;horaire collectif en vigueur dans l&apos;entreprise
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Si l&apos;entreprise dispose d&apos;horaires collectifs, le salarié suivra le même planning que l&apos;ensemble des salariés.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Label className="text-base font-medium">Type d&apos;horaires</Label>
          <RadioGroup 
            value={scheduleType}
            onValueChange={(value) => setScheduleType(value as 'fixed' | 'variable')}
          >
            <div className="flex flex-col space-y-3 mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed-schedule" />
                <Label htmlFor="fixed-schedule">Horaires fixes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="variable" id="variable-schedule" />
                <Label htmlFor="variable-schedule">Horaires variables</Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {scheduleType === 'fixed' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium">Jours et horaires de travail</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addWorkday}
                disabled={isLoading || dailySchedules?.length === 7}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter un jour
              </Button>
            </div>
            
            <div className="space-y-3">
              {dailySchedules?.map((schedule, index) => {
                return (
                  <div key={index} className="border p-3 rounded-md bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <Select
                          value={schedule.day}
                          onValueChange={(value) => updateSchedule(index, 'day', value)}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Jour" />
                          </SelectTrigger>
                          <SelectContent>
                            {WEEKDAYS.map((day) => (
                              <SelectItem 
                                key={day.value} 
                                value={day.value}
                                disabled={dailySchedules?.some(s => s.day === day.value && s !== schedule)}
                              >
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeWorkday(index)}
                        disabled={isLoading || dailySchedules.length <= 1}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor={`start-time-${index}`} className="text-sm">Début</Label>
                        <Input
                          id={`start-time-${index}`}
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                          disabled={isLoading}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`end-time-${index}`} className="text-sm">Fin</Label>
                        <Input
                          id={`end-time-${index}`}
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                          disabled={isLoading}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`break-${index}`} className="text-sm">Pause (min)</Label>
                        <Input
                          id={`break-${index}`}
                          type="number"
                          min="0"
                          max="120"
                          value={schedule.breakDuration}
                          onChange={(e) => updateSchedule(index, 'breakDuration', parseInt(e.target.value))}
                          disabled={isLoading}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {(!dailySchedules || dailySchedules.length === 0) && (
                <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md">
                  Veuillez ajouter au moins un jour de travail
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Label htmlFor="schedule-details" className="text-base font-medium">Précisions sur les horaires variables</Label>
            <Textarea
              id="schedule-details"
              value={scheduleDetails}
              onChange={(e) => setScheduleDetails(e.target.value)}
              placeholder="Ex: Les horaires seront communiqués par planning hebdomadaire remis au salarié au moins 7 jours à l'avance..."
              rows={4}
              disabled={isLoading}
            />
            {isPartTime && (
              <p className="text-sm text-amber-600">
                Pour un temps partiel à horaires variables, précisez les moyens par lesquels les horaires seront communiqués au salarié et le délai de prévenance.
              </p>
            )}
          </div>
        )}

        <div className="mt-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="include-rest"
              checked={includeRestDetails}
              onCheckedChange={setIncludeRestDetails}
              disabled={isLoading}
            />
            <Label htmlFor="include-rest" className="cursor-pointer">
              Mentionner les repos légaux et jours fériés
            </Label>
          </div>
        </div>

        <div className="mt-6 mb-4">
          <p className="text-gray-600 italic text-sm mb-2">
            Aperçu du texte qui sera généré :
          </p>
          <div className="p-4 bg-gray-50 rounded-md border">
            {isCDI ? (
              isPartTime ? (
                // CDI Temps partiel
                <>
                  <p className="text-sm">
                    Le présent contrat est conclu pour une durée hebdomadaire de travail de <span className="font-medium">{weeklyHours} heures</span>, correspondant à <span className="font-medium">{Math.round((weeklyHours / 35) * 100)}%</span> d&apos;un temps plein.
                  </p>
                  
                  <p className="text-sm mt-2 font-medium">
                    La répartition hebdomadaire des horaires de travail est la suivante :
                  </p>

                  <pre className="text-sm mt-1 whitespace-pre-line">
                    {formatScheduleForDisplay()}
                  </pre>
                  
                  <p className="text-sm mt-2">
                    Toute modification de cette répartition fera l&apos;objet d&apos;un avenant écrit, sauf cas d&apos;urgence ou accord exprès du salarié.
                  </p>
                </>
              ) : (
                // CDI Temps plein
                <>
                  <p className="text-sm">
                    Le temps de travail du Salarié est fixé à 35 heures hebdomadaires, 
                    {useCollectiveSchedule 
                      ? " réparties selon l'horaire collectif en vigueur dans l'entreprise." 
                      : "."}
                  </p>
                  
                  <p className="text-sm mt-2 font-medium">
                    Les horaires de travail sont les suivants :
                  </p>
                  
                  <pre className="text-sm mt-1 whitespace-pre-line">
                    {formatScheduleForDisplay()}
                  </pre>
                  
                  {includeRestDetails && (
                    <p className="text-sm mt-2">
                      Le Salarié bénéficie des repos légaux et des jours fériés selon les dispositions du Code du travail et de la convention collective applicable.
                    </p>
                  )}
                </>
              )
            ) : (
              // CDD (temps plein ou partiel)
              <>
                <p className="text-sm">
                  Le temps de travail est fixé à <span className="font-medium">{weeklyHours} heures</span> par semaine, réparties selon les besoins liés au motif du contrat.
                </p>
                
                <p className="text-sm mt-2 font-medium">
                  Les horaires de travail sont :
                </p>
                
                <pre className="text-sm mt-1 whitespace-pre-line">
                  {formatScheduleForDisplay()}
                </pre>
                
                {isPartTime && (
                  <p className="text-sm mt-2">
                    Cette répartition hebdomadaire ne pourra être modifiée sans l&apos;accord écrit du salarié ou un avenant.
                  </p>
                )}
                
                {includeRestDetails && (
                  <p className="text-sm mt-2">
                    Le Salarié bénéficie des repos légaux et des jours fériés selon les dispositions du Code du travail et de la convention collective applicable.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isLoading} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <Button 
          onClick={handleSave}
          disabled={
            isLoading || 
            (scheduleType === 'fixed' && (!dailySchedules || dailySchedules.length === 0)) ||
            (scheduleType === 'variable' && isPartTime && !scheduleDetails)
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