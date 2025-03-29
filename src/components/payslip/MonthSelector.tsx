'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addMonths, format, isBefore, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MonthData {
  key: string;
  date: Date;
  label: string;
  selected: boolean;
  grossSalary: number;
  netSalary: number;
  contributions: number;
  employerCost: number;
  locked: boolean;
  validated: boolean;
}

interface PayslipData {
  id?: string;
  period: string;
  grossSalary: number;
  netSalary: number;
  employerCost: number;
  employeeContributions?: {
    total: number;
    [key: string]: number;
  };
  status?: string;
  locked?: boolean;
}

interface MonthSelectorProps {
  employeeStartDate: Date;
  defaultGrossSalary: number;
  currentPayslips: PayslipData[];
  onGeneratePayslips: (selectedMonths: MonthData[]) => void;
  isAdmin?: boolean;
  hasPaid?: boolean;
  onUnlockPayslip?: (payslipId: string) => Promise<void>;
  onRequestPayment?: () => void;
}

export function MonthSelector({
  employeeStartDate,
  defaultGrossSalary,
  currentPayslips = [],
  onGeneratePayslips,
  isAdmin = false,
  hasPaid = true,
  onUnlockPayslip,
  onRequestPayment
}: MonthSelectorProps) {
  const [availableMonths, setAvailableMonths] = useState<MonthData[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Générer les mois disponibles depuis la date d'entrée jusqu'à maintenant
  useEffect(() => {
    const startDate = startOfMonth(new Date(employeeStartDate));
    const today = new Date();
    const endDate = startOfMonth(addMonths(today, 12)); // Permettre de générer jusqu'à 12 mois à l'avance
    
    const months: MonthData[] = [];
    let currentDate = startDate;
    
    while (isBefore(currentDate, endDate)) {
      const monthKey = format(currentDate, 'yyyy-MM');
      const existingPayslip = currentPayslips.find(p => 
        p.period === monthKey || 
        p.period === format(currentDate, 'MMMM yyyy', { locale: fr })
      );
      
      months.push({
        key: monthKey,
        date: new Date(currentDate),
        label: format(currentDate, 'MMMM yyyy', { locale: fr }),
        selected: false,
        grossSalary: existingPayslip?.grossSalary || defaultGrossSalary,
        netSalary: existingPayslip?.netSalary || 0,
        contributions: existingPayslip?.employeeContributions?.total || 0,
        employerCost: existingPayslip?.employerCost || 0,
        locked: existingPayslip?.locked || false,
        validated: existingPayslip?.status === 'validated' || false
      });
      
      currentDate = addMonths(currentDate, 1);
    }
    
    setAvailableMonths(months);
  }, [employeeStartDate, defaultGrossSalary, currentPayslips]);

  // Gérer la sélection de tous les mois
  const handleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setAvailableMonths(availableMonths.map(month => ({
      ...month,
      selected: newValue && !month.locked
    })));
  };

  // Gérer la sélection individuelle d'un mois
  const handleSelectMonth = (monthKey: string) => {
    setAvailableMonths(availableMonths.map(month => {
      if (month.key === monthKey && !month.locked) {
        return { ...month, selected: !month.selected };
      }
      return month;
    }));
    
    // Mettre à jour l'état de sélection totale
    const updatedMonths = availableMonths.map(month => 
      month.key === monthKey && !month.locked
        ? { ...month, selected: !month.selected }
        : month
    );
    
    const allSelectableSelected = updatedMonths
      .filter(month => !month.locked)
      .every(month => month.selected);
    
    setSelectAll(allSelectableSelected);
  };

  // Mettre à jour le salaire brut d'un mois
  const handleGrossSalaryChange = (monthKey: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    
    setAvailableMonths(availableMonths.map(month => {
      if (month.key === monthKey) {
        // Calcul simplifié des valeurs en fonction du salaire brut
        const employeeContribs = numericValue * 0.22; // Estimation des cotisations salariales
        const netSalary = numericValue - employeeContribs;
        const employerCost = numericValue * 1.45; // Estimation du coût employeur
        
        return {
          ...month, 
          grossSalary: numericValue,
          netSalary,
          contributions: employeeContribs,
          employerCost
        };
      }
      return month;
    }));
  };

  // Gérer la génération des bulletins sélectionnés
  const handleGeneratePayslips = () => {
    const selectedMonths = availableMonths.filter(month => month.selected);
    if (selectedMonths.length > 0) {
      onGeneratePayslips(selectedMonths);
    }
  };

  // Affichage des mois par années
  const monthsByYear: Record<string, MonthData[]> = {};
  
  availableMonths.forEach(month => {
    const year = month.date.getFullYear().toString();
    if (!monthsByYear[year]) {
      monthsByYear[year] = [];
    }
    monthsByYear[year].push(month);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="select-all" 
            checked={selectAll}
            onCheckedChange={handleSelectAll}
          />
          <Label htmlFor="select-all">Tout sélectionner</Label>
        </div>
        
        <Button 
          onClick={handleGeneratePayslips}
          disabled={!availableMonths.some(m => m.selected)}
        >
          Générer les bulletins sélectionnés
        </Button>
      </div>
      
      {Object.entries(monthsByYear).map(([year, months]) => (
        <Card key={year} className={hasPaid ? '' : 'relative blur-sm'}>
          {!hasPaid && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-white/90 p-4 rounded-md shadow-lg">
                <p className="text-red-600 font-bold">Accès limité - Abonnement requis</p>
              </div>
            </div>
          )}
          
          <CardHeader>
            <CardTitle>{year}</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {months.map(month => (
                <div 
                  key={month.key} 
                  className={`p-4 border rounded-md ${
                    month.locked ? 'bg-gray-100' : 'hover:border-blue-300'
                  } ${
                    month.validated ? 'border-green-300' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`month-${month.key}`}
                        checked={month.selected}
                        onCheckedChange={() => handleSelectMonth(month.key)}
                        disabled={month.locked}
                      />
                      <Label htmlFor={`month-${month.key}`} className="font-medium">
                        {month.label}
                        {month.locked && (
                          <span className="text-xs ml-2 bg-gray-200 px-1 py-0.5 rounded">
                            Verrouillé
                          </span>
                        )}
                        {month.validated && (
                          <span className="text-xs ml-2 bg-green-100 px-1 py-0.5 rounded text-green-800">
                            Validé
                          </span>
                        )}
                      </Label>
                    </div>
                    
                    {isAdmin && month.locked && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => {
                          const payslip = currentPayslips.find(p => 
                            p.period === month.key || 
                            p.period === format(month.date, 'MMMM yyyy', { locale: fr })
                          );
                          if (payslip?.id && onUnlockPayslip) {
                            onUnlockPayslip(payslip.id);
                          }
                        }}
                      >
                        Déverrouiller
                      </Button>
                    )}
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div>
                      <Label htmlFor={`gross-${month.key}`} className="text-sm">
                        Salaire brut (€)
                      </Label>
                      <Input 
                        id={`gross-${month.key}`}
                        type="number" 
                        value={month.grossSalary}
                        onChange={(e) => handleGrossSalaryChange(month.key, e.target.value)}
                        className="mt-1"
                        disabled={month.locked}
                        step="0.01"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-500">Net</Label>
                        <p className="font-medium">
                          {new Intl.NumberFormat('fr-FR', { 
                            style: 'currency', 
                            currency: 'EUR' 
                          }).format(month.netSalary)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Cotisations</Label>
                        <p className="font-medium">
                          {new Intl.NumberFormat('fr-FR', { 
                            style: 'currency', 
                            currency: 'EUR' 
                          }).format(month.contributions)}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500">Coût employeur</Label>
                      <p className="font-medium">
                        {new Intl.NumberFormat('fr-FR', { 
                          style: 'currency', 
                          currency: 'EUR' 
                        }).format(month.employerCost)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {!hasPaid && (
        <div className="flex justify-center mt-6">
          <Button 
            variant="default" 
            className="bg-green-600 hover:bg-green-700"
            onClick={onRequestPayment}
          >
            Débloquer les bulletins
          </Button>
        </div>
      )}
    </div>
  );
} 