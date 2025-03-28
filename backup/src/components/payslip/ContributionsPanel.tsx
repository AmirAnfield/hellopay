'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Percent, PiggyBank, Users } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import {
  Contribution,
  ContributionCategory,
  CATEGORY_LABELS,
  DEFAULT_FRENCH_CONTRIBUTIONS,
  getContributionsByCategory,
  calculateTotalContributions
} from './FrenchContributions';

interface ContributionsPanelProps {
  grossSalary: number;
  onContributionsChange: (data: {
    contributions: Contribution[];
    totalEmployeeContributions: number;
    totalEmployerContributions: number;
  }) => void;
  initialContributions?: Contribution[];
  activeTabCategory?: ContributionCategory;
}

export default function ContributionsPanel({
  grossSalary,
  onContributionsChange,
  initialContributions = DEFAULT_FRENCH_CONTRIBUTIONS,
  activeTabCategory = 'securite_sociale',
}: ContributionsPanelProps) {
  const [activeTab, setActiveTab] = useState<ContributionCategory>(activeTabCategory);
  const [contributions, setContributions] = useState<Contribution[]>(
    initialContributions.map(c => ({ ...c }))
  );
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  // Icônes par catégorie pour une meilleure UI
  const categoryIcons: Record<ContributionCategory, React.ReactNode> = {
    securite_sociale: <Users className="w-4 h-4" />,
    retraite: <PiggyBank className="w-4 h-4" />,
    chomage: <Users className="w-4 h-4" />,
    csg_crds: <Percent className="w-4 h-4" />,
    autres: <Info className="w-4 h-4" />
  };

  const handleContributionChange = (id: string, field: keyof Contribution, value: any) => {
    const newContributions = contributions.map(c => {
      if (c.id === id) {
        return { ...c, [field]: value };
      }
      return c;
    });
    
    setContributions(newContributions);
    
    // Calculer les totaux avec les nouvelles valeurs
    const { totalEmployeeContributions, totalEmployerContributions } = 
      calculateTotalContributions(
        newContributions.filter(c => c.isRequired || field === 'isRequired'),
        grossSalary
      );
    
    // Informer le composant parent des modifications
    onContributionsChange({
      contributions: newContributions,
      totalEmployeeContributions,
      totalEmployerContributions
    });
  };

  // Filtrer les cotisations selon la catégorie active et l'option de filtrage
  const filteredContributions = contributions
    .filter(c => c.category === activeTab)
    .filter(c => !showOnlyActive || c.isRequired);

  // Calculer les totaux des cotisations
  const { 
    totalEmployeeContributions, 
    totalEmployerContributions,
    detailedContributions
  } = calculateTotalContributions(
    contributions.filter(c => c.isRequired),
    grossSalary
  );

  const totalContributions = totalEmployeeContributions + totalEmployerContributions;
  
  // Calculer le pourcentage du salaire brut que représentent les cotisations
  const employeePercentage = grossSalary > 0 
    ? (totalEmployeeContributions / grossSalary) * 100 
    : 0;
  
  const employerPercentage = grossSalary > 0 
    ? (totalEmployerContributions / grossSalary) * 100 
    : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Cotisations sociales</CardTitle>
        <CardDescription>
          Gérez les cotisations sociales applicables à la fiche de paie
        </CardDescription>
        
        {/* Résumé des cotisations */}
        <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-md">
          <div>
            <p className="text-sm text-gray-500">Cotisations salariales</p>
            <p className="text-xl font-bold">{totalEmployeeContributions.toFixed(2)} €</p>
            <p className="text-xs text-gray-400">{employeePercentage.toFixed(2)}% du brut</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Cotisations patronales</p>
            <p className="text-xl font-bold">{totalEmployerContributions.toFixed(2)} €</p>
            <p className="text-xs text-gray-400">{employerPercentage.toFixed(2)}% du brut</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total des cotisations</p>
            <p className="text-xl font-bold">{totalContributions.toFixed(2)} €</p>
            <p className="text-xs text-gray-400">
              {((employeePercentage + employerPercentage).toFixed(2))}% du brut
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-end space-x-2 mb-4">
          <Switch
            id="show-active-only"
            checked={showOnlyActive}
            onCheckedChange={setShowOnlyActive}
          />
          <Label htmlFor="show-active-only">Afficher uniquement les cotisations actives</Label>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContributionCategory)}>
          <TabsList className="grid grid-cols-5 mb-4">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                {categoryIcons[key as ContributionCategory]}
                <span className="hidden md:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.keys(CATEGORY_LABELS).map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              {filteredContributions.length === 0 ? (
                <div className="text-center p-6 border border-dashed border-gray-200 rounded-md">
                  <p className="text-gray-500">Aucune cotisation disponible dans cette catégorie.</p>
                </div>
              ) : (
                <Accordion type="multiple" className="w-full">
                  {filteredContributions.map((contribution) => {
                    // Calculer les montants pour cette cotisation
                    const contributionData = detailedContributions.find(
                      d => d.contribution.id === contribution.id
                    );
                    
                    const employeeAmount = contributionData?.employeeAmount || 0;
                    const employerAmount = contributionData?.employerAmount || 0;
                    
                    return (
                      <AccordionItem key={contribution.id} value={contribution.id}>
                        <AccordionTrigger className="hover:bg-gray-50 px-4 rounded-md">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`active-${contribution.id}`}
                                checked={contribution.isRequired}
                                onCheckedChange={(checked: boolean) => 
                                  handleContributionChange(contribution.id, 'isRequired', checked)
                                }
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              />
                              <span className={!contribution.isRequired ? "text-gray-400" : ""}>
                                {contribution.name}
                              </span>
                            </div>
                            
                            {contribution.isRequired && (
                              <div className="hidden sm:flex gap-2 items-center text-sm">
                                {contribution.employeeRate > 0 && (
                                  <span className="text-blue-600">
                                    Salarié: {employeeAmount.toFixed(2)}€
                                  </span>
                                )}
                                {contribution.employerRate > 0 && (
                                  <span className="text-green-600">
                                    Employeur: {employerAmount.toFixed(2)}€
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </AccordionTrigger>
                        
                        <AccordionContent className="px-4 py-2">
                          {contribution.description && (
                            <p className="text-sm text-gray-600 mb-4">{contribution.description}</p>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div>
                              <Label 
                                htmlFor={`employee-rate-${contribution.id}`}
                                className="flex items-center gap-1"
                              >
                                Taux salarial (%)
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-3 w-3 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Pourcentage retenu sur le salaire brut</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input
                                  id={`employee-rate-${contribution.id}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="100"
                                  disabled={!contribution.isRequired}
                                  value={contribution.employeeRate}
                                  onChange={(e) => 
                                    handleContributionChange(
                                      contribution.id, 
                                      'employeeRate',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                                <span className="text-gray-500 text-sm w-20">
                                  {contribution.isRequired && employeeAmount.toFixed(2)} €
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <Label 
                                htmlFor={`employer-rate-${contribution.id}`}
                                className="flex items-center gap-1"
                              >
                                Taux patronal (%)
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-3 w-3 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Pourcentage à la charge de l'employeur</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input
                                  id={`employer-rate-${contribution.id}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="100"
                                  disabled={!contribution.isRequired}
                                  value={contribution.employerRate}
                                  onChange={(e) => 
                                    handleContributionChange(
                                      contribution.id, 
                                      'employerRate',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                                <span className="text-gray-500 text-sm w-20">
                                  {contribution.isRequired && employerAmount.toFixed(2)} €
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <Label className="flex items-center gap-1">
                              Base de calcul
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-gray-400" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>La base sur laquelle s'applique le pourcentage</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </Label>
                            <div className="flex gap-2 mt-1">
                              <div className="text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-md">
                                {contribution.baseType === 'total' && 'Totalité du salaire'}
                                {contribution.baseType === 'plafond' && 'Plafonné à la sécurité sociale'}
                                {contribution.baseType === 'trancheA' && 'Tranche A (jusqu\'au plafond SS)'}
                                {contribution.baseType === 'trancheB' && 'Tranche B (1 à 4x le plafond SS)'}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </TabsContent>
          ))}
        </Tabs>
        
        <div className="mt-6 flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => {
              // Réinitialiser tous les taux à leurs valeurs par défaut
              setContributions(DEFAULT_FRENCH_CONTRIBUTIONS.map(c => ({ ...c })));
              
              // Recalculer les totaux
              const { totalEmployeeContributions, totalEmployerContributions } = 
                calculateTotalContributions(
                  DEFAULT_FRENCH_CONTRIBUTIONS.filter(c => c.isRequired),
                  grossSalary
                );
              
              // Informer le composant parent
              onContributionsChange({
                contributions: DEFAULT_FRENCH_CONTRIBUTIONS,
                totalEmployeeContributions,
                totalEmployerContributions
              });
            }}
          >
            Réinitialiser aux valeurs légales
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 