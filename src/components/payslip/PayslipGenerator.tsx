'use client';

import { useState } from 'react';
import type { PayslipData } from './PayslipCalculator';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { MonthSelector } from './MonthSelector';

interface PayslipGeneratorProps {
  onPayslipGenerated: (payslips: PayslipData[]) => void;
  employeeId?: string;
  companyId?: string;
  defaultGrossSalary?: number;
  employeeStartDate?: Date;
  existingPayslips?: any[];
  onRefreshPayslips?: () => void;
}

type MonthData = {
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
};

export function PayslipGenerator({ 
  onPayslipGenerated, 
  employeeId, 
  companyId, 
  defaultGrossSalary = 1800, 
  employeeStartDate = new Date('2020-01-01'),
  existingPayslips = [],
  onRefreshPayslips
}: PayslipGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGeneratePayslips = async (selectedMonths: MonthData[]) => {
    if (!employeeId || !companyId) {
      setErrorMessage('Veuillez sélectionner un employé et une entreprise');
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un employé et une entreprise",
      });
      return;
    }

    if (selectedMonths.length === 0) {
      setErrorMessage('Aucun mois sélectionné pour la génération');
      toast({
        variant: "destructive",
        title: "Aucun mois sélectionné",
        description: "Veuillez sélectionner au moins un mois pour générer des bulletins",
      });
      return;
    }

    // Vérifier s'il y a des bulletins avec un salaire brut vide ou nul
    const invalidSalaries = selectedMonths.some(month => !month.grossSalary || month.grossSalary <= 0);
    if (invalidSalaries) {
      setErrorMessage('Certains mois ont un salaire brut invalide');
      toast({
        variant: "destructive",
        title: "Salaires invalides",
        description: "Certains mois ont un salaire brut vide ou invalide",
      });
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');

    try {
      // Préparer les données pour l'API
      const payslipsToGenerate = selectedMonths.map(month => {
        const date = month.date;
        return {
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          grossSalary: month.grossSalary
        };
      });

      // Appel à l'API pour générer les bulletins
      const response = await fetch('/api/payslips/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          companyId,
          payslips: payslipsToGenerate,
          isExecutive: false // À adapter selon vos besoins
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération des bulletins');
      }

      const generatedPayslips = await response.json();
      setHasGenerated(true);
      
      // Notifier l'utilisateur
      toast({
        title: "Bulletins générés avec succès",
        description: `${generatedPayslips.length} bulletin(s) ont été générés`,
      });

      // Rafraîchir la liste des bulletins existants
      if (onRefreshPayslips) {
        onRefreshPayslips();
      }

      // Appeler le callback avec les bulletins générés
      onPayslipGenerated(generatedPayslips);
    } catch (error) {
      console.error('Erreur lors de la génération des bulletins:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue lors de la génération');
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors de la génération des bulletins',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center p-8 bg-blue-50 border border-blue-200 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Génération des bulletins en cours...</p>
          <p className="text-sm text-gray-500 mt-2">Veuillez patienter pendant que nous traitons votre demande</p>
        </div>
      ) : (
        <>
          {!employeeId || !companyId ? (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <FileText className="h-16 w-16 text-amber-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune entreprise ou employé sélectionné</h3>
                  <p className="text-gray-600">
                    Veuillez sélectionner une entreprise et un employé pour générer des bulletins de paie.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : hasGenerated && !errorMessage ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-700">
                  <FileText className="h-5 w-5" />
                  <p>Les bulletins ont été générés avec succès !</p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <MonthSelector
            employeeStartDate={employeeStartDate}
            defaultGrossSalary={defaultGrossSalary}
            currentPayslips={existingPayslips}
            onGeneratePayslips={handleGeneratePayslips}
            hasPaid={true}
          />
        </>
      )}
    </div>
  );
} 