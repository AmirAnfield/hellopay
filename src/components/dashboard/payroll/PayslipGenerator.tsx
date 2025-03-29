import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import MonthSelector from './MonthSelector';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  CheckIcon, 
  LockClosedIcon, 
  LockOpen1Icon, 
  FileDownIcon,
  FileCheckIcon
} from '@radix-ui/react-icons';

// Types pour les payslips et les composants
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

interface GeneratedPayslip extends PayslipData {
  id: string;
  employeeId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  validatedAt?: string;
}

interface PayslipGeneratorProps {
  employeeId: string;
  companyId: string;
  isExecutive?: boolean;
  defaultGrossSalary?: number;
}

export default function PayslipGenerator({
  employeeId,
  companyId,
  isExecutive = false,
  defaultGrossSalary = 2000
}: PayslipGeneratorProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [payslips, setPayslips] = useState<GeneratedPayslip[]>([]);
  
  // Charger les bulletins existants pour l'employé
  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const response = await fetch(`/api/employees/${employeeId}/payslips`);
        if (!response.ok) throw new Error('Erreur lors du chargement des bulletins');
        
        const data = await response.json();
        setPayslips(data);
      } catch (error) {
        console.error('Erreur:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les bulletins de paie',
          variant: 'destructive',
        });
      }
    };
    
    fetchPayslips();
  }, [employeeId, toast]);
  
  // Transformer les bulletins au format attendu par MonthSelector
  const getInitialPayslips = (): PayslipData[] => {
    return payslips.map(payslip => ({
      id: payslip.id,
      month: payslip.month,
      year: payslip.year,
      grossSalary: payslip.grossSalary,
      netSalary: payslip.netSalary,
      employerCost: payslip.employerCost,
      status: payslip.status,
      locked: payslip.locked
    }));
  };
  
  // Génération des bulletins de paie
  const handleGenerate = async (selectedMonths: PayslipData[]) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/payslips/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          companyId,
          payslips: selectedMonths,
          isExecutive
        }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la génération des bulletins');
      
      const data = await response.json();
      setPayslips(prev => {
        // Remplacer les bulletins existants et ajouter les nouveaux
        const updatedPayslips = [...prev];
        
        data.forEach((newPayslip: GeneratedPayslip) => {
          const existingIndex = updatedPayslips.findIndex(
            p => p.month === newPayslip.month && p.year === newPayslip.year
          );
          
          if (existingIndex >= 0) {
            updatedPayslips[existingIndex] = newPayslip;
          } else {
            updatedPayslips.push(newPayslip);
          }
        });
        
        return updatedPayslips;
      });
      
      toast({
        title: 'Succès',
        description: `${data.length} bulletin(s) de paie généré(s)`,
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer les bulletins de paie',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Valider un bulletin de paie
  const handleValidate = async (payslipId: string) => {
    try {
      const response = await fetch(`/api/payslips/${payslipId}/validate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Erreur lors de la validation du bulletin');
      
      const updatedPayslip = await response.json();
      
      setPayslips(prev => 
        prev.map(p => p.id === payslipId ? updatedPayslip : p)
      );
      
      toast({
        title: 'Succès',
        description: 'Le bulletin de paie a été validé',
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de valider le bulletin de paie',
        variant: 'destructive',
      });
    }
  };
  
  // Verrouiller/déverrouiller un bulletin de paie
  const handleToggleLock = async (payslipId: string, currentLocked: boolean) => {
    try {
      const response = await fetch(`/api/payslips/${payslipId}/lock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: !currentLocked }),
      });
      
      if (!response.ok) throw new Error('Erreur lors du verrouillage du bulletin');
      
      const updatedPayslip = await response.json();
      
      setPayslips(prev => 
        prev.map(p => p.id === payslipId ? updatedPayslip : p)
      );
      
      toast({
        title: 'Succès',
        description: `Le bulletin de paie a été ${!currentLocked ? 'verrouillé' : 'déverrouillé'}`,
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le verrouillage du bulletin',
        variant: 'destructive',
      });
    }
  };
  
  // Exporter les bulletins de paie sélectionnés
  const handleExport = async (payslipIds: string[]) => {
    if (payslipIds.length === 0) return;
    
    setIsExporting(true);
    
    try {
      // Construire l'URL avec les IDs des bulletins
      const queryString = payslipIds.map(id => `id=${id}`).join('&');
      const exportUrl = `/api/payslips/export?${queryString}`;
      
      // Ouvrir dans une nouvelle fenêtre pour le téléchargement
      window.open(exportUrl, '_blank');
      
      toast({
        title: 'Téléchargement démarré',
        description: `${payslipIds.length} bulletin(s) de paie en cours d'export`,
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exporter les bulletins de paie',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  // Filtrer les bulletins validés pour l'exportation
  const validatedPayslips = payslips.filter(p => p.status === 'validated');
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Générateur de bulletins de paie</CardTitle>
          <CardDescription>
            Sélectionnez les mois pour lesquels vous souhaitez générer des bulletins de paie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MonthSelector
            initialPayslips={getInitialPayslips()}
            onGenerate={handleGenerate}
            defaultGrossSalary={defaultGrossSalary}
            isExecutive={isExecutive}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
      
      {payslips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bulletins de paie générés</CardTitle>
            <CardDescription>
              Vous pouvez valider, verrouiller ou exporter vos bulletins de paie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {payslips.map((payslip) => (
                  <div 
                    key={payslip.id}
                    className={`border rounded-lg p-4 ${
                      payslip.status === 'validated' ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">
                        {new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(
                          new Date(payslip.year, payslip.month - 1)
                        )}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        payslip.status === 'validated' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {payslip.status === 'validated' ? 'Validé' : 'Brouillon'}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Brut:</span>
                        <span className="font-medium">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(payslip.grossSalary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Net:</span>
                        <span className="font-medium">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(payslip.netSalary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coût employeur:</span>
                        <span className="font-medium">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(payslip.employerCost)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between space-x-2">
                      {payslip.status === 'draft' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleValidate(payslip.id)}
                          disabled={payslip.locked}
                        >
                          <CheckIcon className="mr-1 h-4 w-4" />
                          Valider
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleExport([payslip.id])}
                        >
                          <FileDownIcon className="mr-1 h-4 w-4" />
                          Exporter
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleLock(payslip.id, payslip.locked)}
                      >
                        {payslip.locked ? (
                          <LockClosedIcon className="h-4 w-4" />
                        ) : (
                          <LockOpen1Icon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {validatedPayslips.length > 0 && (
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => handleExport(validatedPayslips.map(p => p.id))}
                    disabled={isExporting}
                  >
                    <FileCheckIcon className="mr-2 h-4 w-4" />
                    Exporter tous les bulletins validés ({validatedPayslips.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 