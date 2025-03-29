import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  calculateContributions 
} from '@/lib/payroll-rates';

// Mois en français
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// Types pour les données des bulletins
interface PayslipData {
  month: number;
  year: number;
  grossSalary: number;
  netSalary: number;
  employerCost: number;
  status: 'draft' | 'validated';
  locked: boolean;
  id?: string;
}

interface PayslipMonth {
  month: number;
  year: number;
  grossSalary: number;
  netSalary: number;
  employerCost: number;
  status: 'draft' | 'validated';
  locked: boolean;
  selected: boolean;
  id?: string;
}

interface MonthSelectorProps {
  onGenerate: (selectedMonths: PayslipData[]) => void;
  initialPayslips?: PayslipData[];
  defaultGrossSalary?: number;
  isExecutive?: boolean;
  isLoading?: boolean;
}

export default function MonthSelector({ 
  onGenerate, 
  initialPayslips = [], 
  defaultGrossSalary = 2000,
  isExecutive = false,
  isLoading = false
}: MonthSelectorProps) {
  // État pour les mois de l'année en cours
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [months, setMonths] = useState<PayslipMonth[]>([]);
  
  // Initialisation des mois disponibles
  useEffect(() => {
    // Créer un tableau des 12 mois pour l'année sélectionnée
    const currentDate = new Date();
    const isCurrentYear = year === currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const availableMonths: PayslipMonth[] = [];
    
    // Pour l'année en cours, n'afficher que les mois jusqu'au mois courant
    const monthsToShow = isCurrentYear ? currentMonth + 1 : 12;
    
    for (let i = 0; i < monthsToShow; i++) {
      // Vérifier si un bulletin existe déjà pour ce mois
      const existingPayslip = initialPayslips.find(
        p => p.month === i + 1 && p.year === year
      );
      
      if (existingPayslip) {
        // Si un bulletin existe, utiliser ses valeurs
        availableMonths.push({
          ...existingPayslip,
          selected: false,
        });
      } else {
        // Sinon, créer un nouveau mois avec les valeurs par défaut
        const contributions = calculateContributions(defaultGrossSalary, year, isExecutive);
        
        availableMonths.push({
          month: i + 1,
          year,
          grossSalary: defaultGrossSalary,
          netSalary: contributions.netSalary,
          employerCost: contributions.employerCost,
          status: 'draft',
          locked: false,
          selected: false,
        });
      }
    }
    
    setMonths(availableMonths);
  }, [year, initialPayslips, defaultGrossSalary, isExecutive]);
  
  // Mise à jour du salaire brut pour un mois
  const updateGrossSalary = (index: number, grossSalary: number) => {
    if (months[index].locked) return;
    
    const newMonths = [...months];
    const contributions = calculateContributions(grossSalary, year, isExecutive);
    
    newMonths[index] = {
      ...newMonths[index],
      grossSalary,
      netSalary: contributions.netSalary,
      employerCost: contributions.employerCost,
    };
    
    setMonths(newMonths);
  };
  
  // Sélection/Désélection d'un mois
  const toggleMonthSelection = (index: number) => {
    const newMonths = [...months];
    newMonths[index].selected = !newMonths[index].selected;
    setMonths(newMonths);
  };
  
  // Sélectionner/Désélectionner tous les mois
  const toggleSelectAll = () => {
    const areAllSelected = months.every(month => month.selected);
    const newMonths = months.map(month => ({
      ...month,
      selected: !areAllSelected
    }));
    setMonths(newMonths);
  };
  
  // Générer les bulletins pour les mois sélectionnés
  const handleGenerate = () => {
    const selectedMonths = months
      .filter(month => month.selected)
      .map(month => ({
        month: month.month,
        year: month.year,
        grossSalary: month.grossSalary,
        netSalary: month.netSalary,
        employerCost: month.employerCost,
        status: month.status,
        locked: month.locked,
        id: month.id
      }));
    
    onGenerate(selectedMonths);
  };
  
  // Changer d'année
  const changeYear = (newYear: number) => {
    if (newYear >= 2020 && newYear <= 2030) {
      setYear(newYear);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Sélection des mois pour les bulletins de paie</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeYear(year - 1)}
          >
            ←
          </Button>
          <span className="font-medium">{year}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeYear(year + 1)}
          >
            →
          </Button>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={months.length > 0 && months.every(m => m.selected)}
                onCheckedChange={toggleSelectAll}
                aria-label="Sélectionner tous les mois"
              />
            </TableHead>
            <TableHead>Mois</TableHead>
            <TableHead>Salaire brut</TableHead>
            <TableHead>Salaire net</TableHead>
            <TableHead>Coût employeur</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {months.map((month, index) => (
            <TableRow key={`${month.year}-${month.month}`}>
              <TableCell>
                <Checkbox
                  checked={month.selected}
                  onCheckedChange={() => toggleMonthSelection(index)}
                  disabled={month.locked}
                  aria-label={`Sélectionner ${MONTHS[month.month - 1]}`}
                />
              </TableCell>
              <TableCell>{MONTHS[month.month - 1]}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={month.grossSalary}
                  onChange={(e) => updateGrossSalary(index, parseFloat(e.target.value) || 0)}
                  disabled={month.locked}
                  className="w-24"
                  min={0}
                  step={100}
                />
              </TableCell>
              <TableCell>
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(month.netSalary)}
              </TableCell>
              <TableCell>
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(month.employerCost)}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  month.status === 'validated' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {month.status === 'validated' ? 'Validé' : 'Brouillon'}
                </span>
              </TableCell>
              <TableCell>
                {month.locked ? (
                  <span className="text-xs text-muted-foreground">Verrouillé</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Modifiable</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex justify-end space-x-2">
        <Button
          variant="default"
          onClick={handleGenerate}
          disabled={!months.some(month => month.selected) || isLoading}
        >
          {isLoading ? "Génération en cours..." : "Générer les bulletins sélectionnés"}
        </Button>
      </div>
    </div>
  );
} 