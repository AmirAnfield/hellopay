import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, HelpCircle, Plus, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContractType } from '@/types/contract';
import { Separator } from "@/components/ui/separator";
import { Checkbox } from '@/components/ui/checkbox';
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

export interface Article3Functions {
  jobTitle: string;
  classificationLevel?: string;
  classificationCoefficient?: string;
  collectiveAgreement?: string;
  supervisor: string;
  missions: string[];
  canEvolve: boolean;
  includeGenericMission: boolean;
}

interface Article3FunctionsStepProps {
  onSaveFunctions: (data: Article3Functions) => Promise<void>;
  initialData?: Article3Functions;
  contractType: ContractType;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

// Liste des conventions collectives courantes
const COLLECTIVE_AGREEMENTS = [
  { value: 'AGRIC-ARCO', label: 'AGRIC-ARCO' },
  { value: 'SYNTEC', label: 'SYNTEC - Bureaux d\'études techniques' },
  { value: 'COMMERCE', label: 'Commerce de détail et de gros' },
  { value: 'HCR', label: 'Hôtels, Cafés, Restaurants' },
  { value: 'BTP', label: 'Bâtiment et Travaux Publics' },
  { value: 'TRANSPORTS', label: 'Transports routiers' },
  { value: 'METALLURGIE', label: 'Métallurgie' },
  { value: 'AUTRE', label: 'Autre convention collective' },
];

export function Article3FunctionsStep({
  onSaveFunctions,
  initialData,
  contractType,
  isLoading,
  onBack,
  onNext
}: Article3FunctionsStepProps) {
  const isCDI = contractType === 'CDI';
  
  // États
  const [jobTitle, setJobTitle] = useState<string>(
    initialData?.jobTitle || ''
  );
  
  const [classificationLevel, setClassificationLevel] = useState<string>(
    initialData?.classificationLevel || ''
  );
  
  const [classificationCoefficient, setClassificationCoefficient] = useState<string>(
    initialData?.classificationCoefficient || ''
  );
  
  const [collectiveAgreement, setCollectiveAgreement] = useState<string>(
    initialData?.collectiveAgreement || ''
  );
  
  const [supervisor, setSupervisor] = useState<string>(
    initialData?.supervisor || ''
  );
  
  const [missions, setMissions] = useState<string[]>(
    Array.isArray(initialData?.missions) ? initialData.missions : ['', '', '']
  );
  
  const [canEvolve, setCanEvolve] = useState<boolean>(
    initialData?.canEvolve || false
  );
  
  const [includeGenericMission, setIncludeGenericMission] = useState<boolean>(
    initialData?.includeGenericMission || false
  );

  // Ajouter une nouvelle mission
  const addMission = () => {
    setMissions([...missions, '']);
  };

  // Supprimer une mission
  const removeMission = (index: number) => {
    if (missions.length <= 1) return;
    
    const newMissions = [...missions];
    newMissions.splice(index, 1);
    setMissions(newMissions);
  };

  // Mettre à jour une mission
  const updateMission = (index: number, value: string) => {
    const newMissions = [...missions];
    newMissions[index] = value;
    setMissions(newMissions);
  };

  const handleSave = async () => {
    // Filtrer les missions vides
    const filteredMissions = Array.isArray(missions) 
      ? missions.filter(mission => mission.trim() !== '')
      : [];
    
    // Vérifier qu'il y a au moins une mission
    if (filteredMissions.length === 0 && !includeGenericMission) {
      // Ajouter une mission générique si aucune n'est spécifiée
      filteredMissions.push('Toutes missions en lien avec son poste et relevant de ses compétences');
    }
    
    const data: Article3Functions = {
      jobTitle,
      classificationLevel: isCDI ? classificationLevel : undefined,
      classificationCoefficient: isCDI ? classificationCoefficient : undefined,
      collectiveAgreement: isCDI ? collectiveAgreement : undefined,
      supervisor,
      missions: filteredMissions,
      canEvolve,
      includeGenericMission
    };
    
    await onSaveFunctions(data);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Article 3 – Fonctions</h2>
        <p className="text-gray-500">
          {isCDI ? 'Définissez les fonctions exercées par le salarié' : 'Définissez les fonctions confiées au salarié'}
        </p>
      </div>

      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <p className="text-sm text-blue-700 font-medium">
          {isCDI 
            ? 'Contrat à Durée Indéterminée (CDI)' 
            : 'Contrat à Durée Déterminée (CDD)'}
        </p>
        <p className="text-sm text-blue-600 mt-1">
          {isCDI
            ? 'Cet article définit précisément les fonctions, qualifications et responsabilités du salarié dans l\'entreprise.'
            : 'Cet article définit les fonctions temporaires confiées au salarié pendant la durée du CDD, en lien avec le motif du contrat.'}
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="job-title" className="text-base font-medium">Intitulé du poste</Label>
          <Input
            id="job-title"
            className="mt-2"
            placeholder="Ex: Développeur Web, Assistant commercial, Responsable marketing..."
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {isCDI && (
          <div className="space-y-4">
            <Separator />
            
            <div>
              <Label className="text-base font-medium">Classification conventionnelle</Label>
              <p className="text-sm text-gray-500 mb-3">
                Ces informations sont généralement définies par la convention collective applicable à votre entreprise.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="collective-agreement">Convention collective</Label>
                  <Select 
                    value={collectiveAgreement} 
                    onValueChange={setCollectiveAgreement}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="collective-agreement" className="mt-1">
                      <SelectValue placeholder="Sélectionnez une convention" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLLECTIVE_AGREEMENTS.map((agreement) => (
                        <SelectItem key={agreement.value} value={agreement.value}>
                          {agreement.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {collectiveAgreement === 'AUTRE' && (
                    <Input
                      className="mt-2"
                      placeholder="Précisez la convention collective"
                      value={collectiveAgreement === 'AUTRE' ? '' : collectiveAgreement}
                      onChange={(e) => setCollectiveAgreement(e.target.value)}
                      disabled={isLoading}
                    />
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="classification-level">Niveau</Label>
                    <Input
                      id="classification-level"
                      className="mt-1"
                      placeholder="Ex: II"
                      value={classificationLevel}
                      onChange={(e) => setClassificationLevel(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="classification-coefficient">Coefficient</Label>
                    <Input
                      id="classification-coefficient"
                      className="mt-1"
                      placeholder="Ex: 275"
                      value={classificationCoefficient}
                      onChange={(e) => setClassificationCoefficient(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
          </div>
        )}

        <div>
          <Label htmlFor="supervisor" className="text-base font-medium">Supérieur hiérarchique</Label>
          <Input
            id="supervisor"
            className="mt-2"
            placeholder={isCDI 
              ? "Ex: Directeur technique, Responsable des ventes..." 
              : "Ex: Directeur du magasin, Chef de chantier..."}
            value={supervisor}
            onChange={(e) => setSupervisor(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="flex justify-between items-center">
            <Label className="text-base font-medium">Missions</Label>
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-1 cursor-help">
                      <Checkbox
                        id="include-generic"
                        checked={includeGenericMission}
                        onCheckedChange={(checked) => setIncludeGenericMission(checked as boolean)}
                        disabled={isLoading}
                      />
                      <Label htmlFor="include-generic" className="text-sm cursor-pointer">
                        Inclure une clause générique
                      </Label>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Ajoute une mission générique du type "toutes missions en lien avec son poste et relevant de ses compétences"
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="space-y-3 mt-2">
            {missions.map((mission, index) => (
              <div key={index} className="flex items-start gap-2">
                <Textarea
                  value={mission}
                  onChange={(e) => updateMission(index, e.target.value)}
                  placeholder={`Mission ${index + 1}`}
                  disabled={isLoading}
                  className="flex-grow"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMission(index)}
                  disabled={isLoading || missions.length <= 1}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMission}
              disabled={isLoading}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une mission
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-2">
          <Switch
            id="can-evolve"
            checked={canEvolve}
            onCheckedChange={setCanEvolve}
            disabled={isLoading}
          />
          <Label htmlFor="can-evolve" className="cursor-pointer">
            Les fonctions peuvent évoluer avec accord des deux parties
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Cette clause vous donne plus de flexibilité pour adapter les missions du salarié sans avoir à modifier le contrat.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="mt-6 mb-4">
          <p className="text-gray-600 italic text-sm mb-2">
            Aperçu du texte qui sera généré :
          </p>
          <div className="p-4 bg-gray-50 rounded-md border">
            {isCDI ? (
              <>
                <p className="text-sm">
                  Le Salarié est engagé en qualité de <span className="font-medium">{jobTitle || '[intitulé précis du poste]'}</span>
                  {(classificationLevel || classificationCoefficient) && (
                    <>, relevant de la classification <span className="font-medium">
                      {classificationLevel && `Niveau ${classificationLevel}`}
                      {classificationLevel && classificationCoefficient && ', '}
                      {classificationCoefficient && `Échelon ${classificationCoefficient}`}
                    </span></>
                  )}
                  {collectiveAgreement && (
                    <>, conformément à la convention collective <span className="font-medium">{collectiveAgreement}</span></>
                  )}.
                </p>
                <p className="text-sm mt-2">
                  Il exercera ses fonctions sous l&apos;autorité de <span className="font-medium">{supervisor || '[titre du supérieur hiérarchique]'}</span> et s&apos;engage à réaliser les missions suivantes :
                </p>
              </>
            ) : (
              <>
                <p className="text-sm">
                  Le Salarié est recruté en qualité de <span className="font-medium">{jobTitle || '[intitulé du poste]'}</span>, pour exécuter les tâches suivantes dans le cadre du motif précisé à l&apos;article 1 :
                </p>
                <p className="text-sm mt-2">
                  Il exercera son activité sous la responsabilité de <span className="font-medium">{supervisor || '[nom ou fonction]'}</span>, et s&apos;engage à assurer les missions qui lui seront confiées, dans la limite de ses compétences et du cadre fixé par l&apos;employeur.
                </p>
              </>
            )}
            
            <ul className="text-sm mt-2 list-disc list-inside">
              {Array.isArray(missions) && missions.map((mission, index) => (
                mission.trim() && <li key={index}>{mission}</li>
              ))}
              {includeGenericMission && (
                <li className="italic">Toutes missions en lien avec son poste et relevant de ses compétences</li>
              )}
              {Array.isArray(missions) && missions.every(m => !m.trim()) && !includeGenericMission && (
                <li className="text-gray-400">[Aucune mission spécifiée]</li>
              )}
            </ul>
            
            <p className="text-sm mt-3">
              Le Salarié s&apos;engage à exécuter ses fonctions avec loyauté, professionnalisme et dans le respect des procédures de l&apos;entreprise.
            </p>
            
            {canEvolve && (
              <p className="text-sm mt-2 text-blue-600">
                Les fonctions du Salarié pourront évoluer dans le cadre de son poste, sous réserve de l&apos;accord des deux parties.
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
          disabled={isLoading || !jobTitle.trim() || !supervisor.trim()} 
          className="flex items-center"
        >
          {isLoading ? 'Enregistrement...' : 'Continuer'}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
} 