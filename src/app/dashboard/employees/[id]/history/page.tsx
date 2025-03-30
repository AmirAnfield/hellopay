'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ChevronLeft, Download, FileText, Calendar, FileDown, FileSpreadsheet } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';

interface EmployeeHistory {
  employee: {
    id: string;
    name: string;
    position: string;
    socialSecurityNumber: string;
  };
  company: {
    id: string;
    name: string;
    siret: string;
  };
  year: number;
  monthlyData: Array<{
    id: string | null;
    month: string;
    monthIndex: number;
    periodStart: string | null;
    periodEnd: string | null;
    grossSalary: number;
    netSalary: number;
    employeeContributions: number;
    employerContributions: number;
    employerCost: number;
    paidLeaveAcquired: number;
    paidLeaveTaken: number;
    paidLeaveBalance: number;
    hoursWorked: number;
    contributionsByCategory: Record<string, { employee: number; employer: number }>;
    taxAmount: number;
  }>;
  annual: {
    grossSalary: number;
    netSalary: number;
    employeeContributions: number;
    employerContributions: number;
    employerCost: number;
    paidLeaveAcquired: number;
    paidLeaveTaken: number;
    paidLeaveBalance: number;
    hoursWorked: number;
    taxAmount: number;
  };
  annualContributionsByCategory: Record<string, { employee: number; employer: number }>;
}

export default function EmployeeHistoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [history, setHistory] = useState<EmployeeHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Charger les données de l'historique
  useEffect(() => {
    const fetchHistory = async () => {
      if (status === 'loading') return;
      if (status === 'unauthenticated') {
        router.push('/auth/login');
        return;
      }

      try {
        setIsLoading(true);
        
        // Récupérer l'année depuis les paramètres d'URL ou utiliser l'année courante
        const yearParam = searchParams.get('year');
        const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
        setSelectedYear(year);
        
        const response = await fetch(`/api/employees/${params.id}/history?year=${year}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Employé introuvable');
            router.push('/dashboard/employees');
            return;
          }
          throw new Error('Erreur lors du chargement de l\'historique');
        }

        const data = await response.json();
        setHistory(data);

        // Calculer les années disponibles (5 ans en arrière jusqu'à l'année courante)
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let y = currentYear; y >= currentYear - 5; y--) {
          years.push(y);
        }
        setAvailableYears(years);

      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement de l\'historique');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [params.id, router, searchParams, status]);

  // Gérer le changement d'année
  const handleYearChange = (year: string) => {
    const newYear = parseInt(year);
    router.push(`/dashboard/employees/${params.id}/history?year=${newYear}`);
  };

  // Exporter en PDF
  const handleExportPDF = async () => {
    if (!history) return;
    
    try {
      setIsExporting(true);
      
      const response = await fetch(`/api/employees/${params.id}/history/export-pdf?year=${history.year}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'export PDF');
      }
      
      // Récupérer le blob PDF
      const blob = await response.blob();
      
      // Créer un URL pour le téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recap_annuel_${history.employee.name.replace(/\s+/g, '_')}_${history.year}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF généré avec succès');
      
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // Exporter en CSV
  const handleExportCSV = async () => {
    if (!history) return;
    
    try {
      setIsExporting(true);
      
      const response = await fetch(`/api/employees/${params.id}/history/export-csv?year=${history.year}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'export CSV');
      }
      
      // Récupérer le blob CSV
      const blob = await response.blob();
      
      // Créer un URL pour le téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recap_annuel_${history.employee.name.replace(/\s+/g, '_')}_${history.year}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('CSV généré avec succès');
      
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      toast.error('Erreur lors de la génération du CSV');
    } finally {
      setIsExporting(false);
    }
  };

  // Si le chargement est en cours, afficher un état de chargement
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chargement...</h1>
            <p className="text-muted-foreground">Récupération des données annuelles de l'employé</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Chargement des données...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si l'historique n'a pas été trouvé
  if (!history) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Erreur</h1>
            <p className="text-muted-foreground">Impossible de charger l'historique annuel</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6 text-center p-10">
            <p className="mb-4">Aucune donnée disponible pour cet employé.</p>
            <Button onClick={() => router.back()}>Retour à la liste des employés</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Récapitulatif annuel {history.year}</h1>
          <p className="text-muted-foreground">
            Historique annuel des bulletins de paie de {history.employee.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button variant="outline" onClick={handleExportPDF} disabled={isExporting}>
            <FileDown className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleExportCSV} disabled={isExporting}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      {/* Sélection de l'année */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Sélectionner une année</h3>
              <p className="text-sm text-muted-foreground">Consultez l'historique pour une année spécifique</p>
            </div>
            <div className="w-full sm:w-auto">
              <Select
                value={selectedYear.toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Sélectionner une année" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations de l'employé */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'employé</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Nom</dt>
                <dd className="text-lg">{history.employee.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Poste</dt>
                <dd className="text-lg">{history.employee.position}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">N° Sécurité Sociale</dt>
                <dd className="text-lg">{history.employee.socialSecurityNumber}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations de l'entreprise</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Nom</dt>
                <dd className="text-lg">{history.company.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">SIRET</dt>
                <dd className="text-lg">{history.company.siret}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Récapitulatif annuel */}
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif annuel {history.year}</CardTitle>
          <CardDescription>Cumuls annuels des salaires et cotisations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Salaire brut total</h3>
              <p className="text-2xl font-bold">{formatCurrency(history.annual.grossSalary)}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Salaire net total</h3>
              <p className="text-2xl font-bold">{formatCurrency(history.annual.netSalary)}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Cotisations salariales</h3>
              <p className="text-2xl font-bold">{formatCurrency(history.annual.employeeContributions)}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Coût employeur total</h3>
              <p className="text-2xl font-bold">{formatCurrency(history.annual.employerCost)}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Heures travaillées</h3>
              <p className="text-2xl font-bold">{history.annual.hoursWorked.toFixed(1)}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Congés acquis</h3>
              <p className="text-2xl font-bold">{history.annual.paidLeaveAcquired.toFixed(1)}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Congés pris</h3>
              <p className="text-2xl font-bold">{history.annual.paidLeaveTaken.toFixed(1)}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Solde congés</h3>
              <p className="text-2xl font-bold">{history.annual.paidLeaveBalance.toFixed(1)}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <h3 className="text-lg font-semibold mb-4">Détail des cotisations par catégorie</h3>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Part salariale</TableHead>
                  <TableHead className="text-right">Part patronale</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(history.annualContributionsByCategory).map(([category, amounts]) => (
                  <TableRow key={category}>
                    <TableCell className="font-medium">{category}</TableCell>
                    <TableCell className="text-right">{formatCurrency(amounts.employee)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(amounts.employer)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(amounts.employee + amounts.employer)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(history.annual.employeeContributions)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(history.annual.employerContributions)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(history.annual.employeeContributions + history.annual.employerContributions)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Détail mensuel */}
      <Card>
        <CardHeader>
          <CardTitle>Détail mensuel {history.year}</CardTitle>
          <CardDescription>Historique par mois des bulletins de paie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mois</TableHead>
                  <TableHead className="text-right">Salaire brut</TableHead>
                  <TableHead className="text-right">Salaire net</TableHead>
                  <TableHead className="text-right">Cotisations salariales</TableHead>
                  <TableHead className="text-right">Cotisations patronales</TableHead>
                  <TableHead className="text-right">Congés acquis/pris</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.monthlyData
                  .sort((a, b) => a.monthIndex - b.monthIndex)
                  .map((month) => (
                    <TableRow key={month.month}>
                      <TableCell className="font-medium">{month.month}</TableCell>
                      <TableCell className="text-right">
                        {month.id ? formatCurrency(month.grossSalary) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {month.id ? formatCurrency(month.netSalary) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {month.id ? formatCurrency(month.employeeContributions) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {month.id ? formatCurrency(month.employerContributions) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {month.id
                          ? `${month.paidLeaveAcquired.toFixed(1)}/${month.paidLeaveTaken.toFixed(1)}`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {month.id ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/payslips/${month.id}`)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Détails
                          </Button>
                        ) : (
                          <Badge variant="outline">Non disponible</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 