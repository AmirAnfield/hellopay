import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, HelpCircle, Plus, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContractType } from '@/types/contract';
import { Switch } from '@/components/ui/switch';
import { Separator } from "@/components/ui/separator";
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
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

export interface Article13Teleworking {
  includeTeleworking: boolean;
  teleworkingType: 'regular' | 'occasional' | 'mixed';
  teleworkingDays?: string[];
  teleworkingEquipment?: string[];
  employerProvidesEquipment: boolean;
  hasCustomText: boolean;
  customTeleworkingText?: string;
}

interface Article13TeleworkingStepProps {
  onSaveTeleworking: (data: Article13Teleworking) => Promise<void>;
  initialData?: Article13Teleworking;
  contractType: ContractType;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

const EQUIPMENT_OPTIONS = [
  { id: 'computer', label: 'Ordinateur' },
  { id: 'phone', label: 'Téléphone' },
  { id: 'internet', label: 'Connexion internet' },
  { id: 'vpn', label: 'VPN/Accès sécurisé' },
  { id: 'desk', label: 'Bureau/chaise' },
  { id: 'software', label: 'Logiciels spécifiques' }
];

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Lundi' },
  { id: 'tuesday', label: 'Mardi' },
  { id: 'wednesday', label: 'Mercredi' },
  { id: 'thursday', label: 'Jeudi' },
  { id: 'friday', label: 'Vendredi' }
];

export function Article13TeleworkingStep({
  onSaveTeleworking,
  initialData,
  contractType,
  isLoading,
  onBack,
  onNext
}: Article13TeleworkingStepProps) {
  const isCDI = contractType === 'CDI';
  
  // États
  const [includeTeleworking, setIncludeTeleworking] = useState<boolean>(
    initialData?.includeTeleworking ?? false
  );
  
  const [teleworkingType, setTeleworkingType] = useState<'regular' | 'occasional' | 'mixed'>(
    initialData?.teleworkingType || 'regular'
  );
  
  const [teleworkingDays, setTeleworkingDays] = useState<string[]>(
    initialData?.teleworkingDays || []
  );
  
  const [employerProvidesEquipment, setEmployerProvidesEquipment] = useState<boolean>(
    initialData?.employerProvidesEquipment ?? true
  );
  
  const [teleworkingEquipment, setTeleworkingEquipment] = useState<string[]>(
    initialData?.teleworkingEquipment || ['computer', 'vpn']
  );
  
  const [hasCustomText, setHasCustomText] = useState<boolean>(
    initialData?.hasCustomText || false
  );
  
  const [customTeleworkingText, setCustomTeleworkingText] = useState<string>(
    initialData?.customTeleworkingText || ''
  );

  const handleDayToggle = (day: string) => {
    setTeleworkingDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  const handleEquipmentToggle = (equipment: string) => {
    setTeleworkingEquipment(prev => 
      prev.includes(equipment) 
        ? prev.filter(e => e !== equipment) 
        : [...prev, equipment]
    );
  };

  const handleSave = async () => {
    const data: Article13Teleworking = {
      includeTeleworking,
      teleworkingType: includeTeleworking ? teleworkingType : 'occasional',
      teleworkingDays: includeTeleworking && (teleworkingType === 'regular' || teleworkingType === 'mixed') ? teleworkingDays : undefined,
      employerProvidesEquipment: includeTeleworking ? employerProvidesEquipment : false,
      teleworkingEquipment: includeTeleworking && employerProvidesEquipment ? teleworkingEquipment : undefined,
      hasCustomText,
      customTeleworkingText: hasCustomText ? customTeleworkingText : undefined
    };
    
    await onSaveTeleworking(data);
    onNext();
  };

  // Formatter les jours pour l'affichage
  const formatDays = () => {
    if (!teleworkingDays.length) return '';
    
    const sortedDays = [...teleworkingDays].sort((a, b) => {
      const dayOrder = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4 };
      return dayOrder[a as keyof typeof dayOrder] - dayOrder[b as keyof typeof dayOrder];
    });
    
    return sortedDays.map(day => {
      const dayObj = DAYS_OF_WEEK.find(d => d.id === day);
      return dayObj ? dayObj.label : day;
    }).join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Article 13 – Télétravail</h2>
        <p className="text-gray-500">
          Définissez les modalités de télétravail si applicable
        </p>
      </div>

      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <p className="text-sm text-blue-700 font-medium">
          {isCDI 
            ? 'Contrat à Durée Indéterminée (CDI)' 
            : 'Contrat à Durée Déterminée (CDD)'}
        </p>
        <p className="text-sm text-blue-600 mt-1">
          Cet article est optionnel et à inclure uniquement si le poste prévoit la possibilité de télétravail.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Label className="text-base font-medium">Autoriser le télétravail</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="include-teleworking"
              checked={includeTeleworking}
              onCheckedChange={setIncludeTeleworking}
              disabled={isLoading}
            />
            <Label htmlFor="include-teleworking" className="cursor-pointer">
              Inclure l&apos;article sur le télétravail
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Activez cette option pour inclure les modalités de télétravail dans le contrat.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {includeTeleworking && (
          <>
            <div className="mt-4 p-4 bg-gray-50 rounded-md space-y-6">
              <div>
                <Label className="text-sm font-medium">Type de télétravail</Label>
                <RadioGroup 
                  value={teleworkingType} 
                  onValueChange={(value) => setTeleworkingType(value as 'regular' | 'occasional' | 'mixed')}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regular" id="telework-regular" />
                    <Label htmlFor="telework-regular" className="cursor-pointer">Régulier (jours fixes)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="occasional" id="telework-occasional" />
                    <Label htmlFor="telework-occasional" className="cursor-pointer">Occasionnel (selon les besoins)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mixed" id="telework-mixed" />
                    <Label htmlFor="telework-mixed" className="cursor-pointer">Mixte (jours fixes + occasionnel)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {(teleworkingType === 'regular' || teleworkingType === 'mixed') && (
                <div className="pt-2">
                  <Label className="text-sm font-medium">Jours de télétravail</Label>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`day-${day.id}`}
                          checked={teleworkingDays.includes(day.id)}
                          onCheckedChange={() => handleDayToggle(day.id)}
                        />
                        <Label 
                          htmlFor={`day-${day.id}`} 
                          className="cursor-pointer"
                        >
                          {day.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4">
                <Label className="text-sm font-medium">Équipements fournis</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="employer-provides-equipment"
                    checked={employerProvidesEquipment}
                    onCheckedChange={setEmployerProvidesEquipment}
                    disabled={isLoading}
                  />
                  <Label htmlFor="employer-provides-equipment" className="cursor-pointer text-sm">
                    L&apos;employeur fournit l&apos;équipement
                  </Label>
                </div>
              </div>
              
              {employerProvidesEquipment && (
                <div className="pt-2">
                  <Label className="text-sm font-medium">Sélectionnez les équipements fournis</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {EQUIPMENT_OPTIONS.map((equipment) => (
                      <div key={equipment.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`equipment-${equipment.id}`}
                          checked={teleworkingEquipment.includes(equipment.id)}
                          onCheckedChange={() => handleEquipmentToggle(equipment.id)}
                        />
                        <Label 
                          htmlFor={`equipment-${equipment.id}`} 
                          className="cursor-pointer text-sm"
                        >
                          {equipment.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium">Personnaliser le texte</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="has-custom-text"
                  checked={hasCustomText}
                  onCheckedChange={setHasCustomText}
                  disabled={isLoading}
                />
                <Label htmlFor="has-custom-text" className="cursor-pointer">
                  Utiliser un texte personnalisé
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Activez cette option pour rédiger entièrement votre clause de télétravail.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            {hasCustomText && (
              <div className="mt-2">
                <Textarea
                  value={customTeleworkingText}
                  onChange={(e) => setCustomTeleworkingText(e.target.value)}
                  placeholder="Rédigez votre clause personnalisée sur le télétravail..."
                  disabled={isLoading}
                  className="h-32"
                />
              </div>
            )}
          </>
        )}

        <div className="mt-6 mb-4">
          <p className="text-gray-600 italic text-sm mb-2">
            Aperçu du texte qui sera généré :
          </p>
          <div className="p-4 bg-gray-50 rounded-md border">
            {includeTeleworking ? (
              <>
                <p className="text-sm font-medium">Article 13 – Télétravail</p>
                
                {hasCustomText && customTeleworkingText ? (
                  <p className="text-sm mt-2">{customTeleworkingText}</p>
                ) : (
                  <>
                    <p className="text-sm mt-2">
                      Le Salarié exercera une partie de son activité en télétravail, selon les modalités définies d&apos;un commun accord avec l&apos;Employeur.
                    </p>
                    
                    {teleworkingType === 'regular' && (
                      <p className="text-sm mt-2">
                        Le télétravail s&apos;effectuera de manière régulière, à raison de {teleworkingDays.length} {teleworkingDays.length > 1 ? 'jours fixes' : 'jour fixe'} par semaine : {formatDays()}.
                      </p>
                    )}
                    
                    {teleworkingType === 'occasional' && (
                      <p className="text-sm mt-2">
                        Le télétravail s&apos;effectuera de manière occasionnelle, en fonction des nécessités de service et sur accord préalable du responsable hiérarchique.
                      </p>
                    )}
                    
                    {teleworkingType === 'mixed' && (
                      <p className="text-sm mt-2">
                        Le télétravail s&apos;effectuera selon un mode mixte : {teleworkingDays.length} {teleworkingDays.length > 1 ? 'jours fixes' : 'jour fixe'} par semaine ({formatDays()}), et ponctuellement en fonction des nécessités de service.
                      </p>
                    )}
                    
                    {employerProvidesEquipment ? (
                      <p className="text-sm mt-2">
                        L&apos;Employeur fournira les équipements nécessaires à l&apos;exercice du télétravail 
                        {teleworkingEquipment.length > 0 && (
                          <>
                            {" : "}
                            {teleworkingEquipment.map((eq, index) => {
                              const equip = EQUIPMENT_OPTIONS.find(e => e.id === eq);
                              return equip ? (
                                <React.Fragment key={eq}>
                                  {equip.label}
                                  {index < teleworkingEquipment.length - 1 ? ', ' : ''}
                                </React.Fragment>
                              ) : null;
                            })}
                          </>
                        )}.
                      </p>
                    ) : (
                      <p className="text-sm mt-2">
                        Le Salarié utilisera ses propres équipements informatiques et de communication pour l&apos;exercice du télétravail, tout en bénéficiant d&apos;un accès sécurisé au système d&apos;information de l&apos;entreprise.
                      </p>
                    )}
                    
                    <p className="text-sm mt-2">
                      L&apos;exercice du télétravail ne modifie en rien les droits et obligations du Salarié, notamment en matière de temps de travail, de santé et de sécurité au travail.
                    </p>
                  </>
                )}
              </>
            ) : (
              <p className="text-sm italic text-gray-500">
                Cet article ne sera pas inclus dans le contrat.
              </p>
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
          disabled={isLoading || (hasCustomText && !customTeleworkingText && includeTeleworking)}
          className="flex items-center"
        >
          {isLoading ? 'Enregistrement...' : 'Continuer'}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
} 