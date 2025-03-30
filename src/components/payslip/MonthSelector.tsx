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

  // Calcul des statistiques
  const selectedMonths = availableMonths.filter(month => month.selected);
  const selectedMonthsCount = selectedMonths.length;
  const totalGrossSalary = selectedMonths.reduce((total, month) => total + month.grossSalary, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-medium mb-1">Résumé de la sélection</h3>
            <p className="text-gray-600 text-sm">
              {selectedMonthsCount === 0 
                ? "Aucun mois sélectionné" 
                : `${selectedMonthsCount} mois sélectionné${selectedMonthsCount > 1 ? 's' : ''}`}
            </p>
            {selectedMonthsCount > 0 && (
              <p className="text-sm text-primary font-medium mt-1">
                Montant total brut : {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalGrossSalary)}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
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
        </div>
      </div>
      
      {Object.entries(monthsByYear).map(([year, months]) => (
        <Card key={year} className={`${hasPaid ? '' : 'relative blur-sm'} overflow-hidden`}>
          {!hasPaid && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-white/90 p-4 rounded-md shadow-lg">
                <p className="text-red-600 font-bold">Accès limité - Abonnement requis</p>
              </div>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50/30 opacity-40"></div>
          
          <CardHeader className="relative z-1 bg-gradient-to-r from-transparent to-blue-50/50">
            <CardTitle>{year}</CardTitle>
          </CardHeader>
          
          <CardContent className="relative z-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {months.map(month => (
                <div 
                  key={month.key} 
                  className={`p-4 border rounded-md transition-all duration-200 ${
                    month.selected ? 'border-blue-300 bg-blue-50/50' : ''
                  } ${
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
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800">
                            Verrouillé
                          </span>
                        )}
                        {month.validated && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
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
                        Débloquer
                      </Button>
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`salary-${month.key}`} className="text-xs text-gray-500">
                        Salaire brut
                      </Label>
                      <span className="text-xs text-gray-500">
                        Net: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(month.netSalary)}
                      </span>
                    </div>
                    <Input
                      id={`salary-${month.key}`}
                      type="number"
                      value={month.grossSalary || ''}
                      onChange={(e) => handleGrossSalaryChange(month.key, e.target.value)}
                      disabled={month.locked}
                      className="mt-1"
                    />
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