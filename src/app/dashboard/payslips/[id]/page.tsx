"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  PageContainer, 
  PageHeader, 
  LoadingState 
} from "@/components/shared/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Download, Printer, ChevronLeft, Eye, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Types
interface Contribution {
  id: string;
  category: string;
  label: string;
  baseType: string;
  baseAmount: number;
  employeeRate: number;
  employerRate: number;
  employeeAmount: number;
  employerAmount: number;
}

interface Payslip {
  id: string;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  fiscalYear: number;
  grossSalary: number;
  netSalary: number;
  employerCost: number;
  employeeContributions: number;
  employerContributions: number;
  taxAmount: number;
  pdfUrl: string;
  status: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    isExecutive: boolean;
    socialSecurityNumber: string;
  };
  company: {
    id: string;
    name: string;
    siret: string;
    address: string;
    city: string;
    postalCode: string;
  };
  contributions: Contribution[];
}

const groupContributions = (contributions: Contribution[]) => {
  const groups: Record<string, Contribution[]> = {};
  
  contributions.forEach(contrib => {
    if (!groups[contrib.category]) {
      groups[contrib.category] = [];
    }
    groups[contrib.category].push(contrib);
  });
  
  return groups;
};

// Formatage d'un montant en euros
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR' 
  }).format(amount);
};

// Formatage d'un pourcentage
const formatPercent = (rate: number) => {
  return `${rate.toFixed(2)} %`;
};

export default function PayslipDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showingPdf, setShowingPdf] = useState(false);
  
  // Charger les données du bulletin
  useEffect(() => {
    const fetchPayslip = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/payslips/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Bulletin non trouvé');
        }
        
        const data = await response.json();
        setPayslip(data);
        
        // Si le bulletin a une URL de PDF, la préparer
        if (data.pdfUrl) {
          setPdfUrl(data.pdfUrl);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du bulletin:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger le bulletin de paie"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPayslip();
  }, [params.id, toast]);
  
  // Générer une nouvelle prévisualisation du PDF
  const regeneratePdf = async () => {
    if (!payslip) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/payslips/${payslip.id}/regenerate-pdf`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Échec de la régénération');
      }
      
      const data = await response.json();
      
      // Mettre à jour l'URL du PDF
      setPdfUrl(data.pdfUrl);
      
      toast({
        title: "PDF régénéré",
        description: "Le PDF a été régénéré avec succès"
      });
      
    } catch (error) {
      console.error('Erreur lors de la régénération du PDF:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de régénérer le PDF"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Télécharger le PDF
  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };
  
  // Imprimer le PDF
  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    }
  };
  
  // Afficher/Masquer le PDF
  const togglePdfView = () => {
    setShowingPdf(!showingPdf);
  };
  
  // Revenir à la liste des bulletins
  const handleBack = () => {
    router.push('/dashboard/payslips');
  };
  
  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader 
          title="Bulletin de paie" 
          description="Détails du bulletin de paie"
        />
        <LoadingState message="Chargement du bulletin..." />
      </PageContainer>
    );
  }
  
  if (!payslip) {
    return (
      <PageContainer>
        <PageHeader 
          title="Bulletin de paie" 
          description="Détails du bulletin de paie"
        />
        <Card>
          <CardContent className="p-8 text-center">
            <p className="mb-4 text-xl">Bulletin non trouvé</p>
            <p className="text-muted-foreground mb-6">
              Le bulletin de paie que vous recherchez n&apos;existe pas ou n&apos;est pas accessible.
            </p>
            <Button onClick={handleBack}>Retour à la liste</Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }
  
  // Grouper les cotisations par catégorie
  const contributionsByCategory = groupContributions(payslip.contributions);
  
  // Période formatée
  const period = format(new Date(payslip.periodStart), 'MMMM yyyy', { locale: fr });
  
  return (
    <PageContainer>
      <PageHeader 
        title={`Bulletin de paie - ${period}`}
        description={`${payslip.employee.firstName} ${payslip.employee.lastName}`}
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger PDF
            </Button>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 gap-6">
        {/* Statut et informations principales */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={payslip.status === 'final' ? "success" : "default"}>
              {payslip.status === 'final' ? 'Finalisé' : 'Brouillon'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Période: {format(new Date(payslip.periodStart), 'dd/MM/yyyy')} - {format(new Date(payslip.periodEnd), 'dd/MM/yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={togglePdfView}>
              {showingPdf ? (
                <>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Détails
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Aperçu PDF
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={regeneratePdf}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Régénérer PDF
            </Button>
          </div>
        </div>
        
        {showingPdf && pdfUrl ? (
          <Card>
            <CardContent className="p-0">
              <iframe
                src={pdfUrl}
                className="w-full h-[80vh] border-0"
                title="Bulletin de paie PDF"
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Résumé du bulletin */}
            <Card>
              <CardHeader>
                <CardTitle>Résumé du bulletin</CardTitle>
                <CardDescription>
                  Bulletin n° {payslip.id.substring(0, 8)} - {period}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Salaire brut</p>
                    <p className="text-2xl font-bold">{formatCurrency(payslip.grossSalary)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Salaire net</p>
                    <p className="text-2xl font-bold">{formatCurrency(payslip.netSalary)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Coût employeur</p>
                    <p className="text-2xl font-bold">{formatCurrency(payslip.employerCost)}</p>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Informations salarié</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Nom</dt>
                        <dd className="text-sm font-medium">{payslip.employee.firstName} {payslip.employee.lastName}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Poste</dt>
                        <dd className="text-sm font-medium">{payslip.employee.position}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Statut</dt>
                        <dd className="text-sm font-medium">{payslip.employee.isExecutive ? 'Cadre' : 'Non cadre'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">N° Sécurité sociale</dt>
                        <dd className="text-sm font-medium">{payslip.employee.socialSecurityNumber}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Informations entreprise</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Société</dt>
                        <dd className="text-sm font-medium">{payslip.company.name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">SIRET</dt>
                        <dd className="text-sm font-medium">{payslip.company.siret}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Adresse</dt>
                        <dd className="text-sm font-medium">
                          {payslip.company.address}, {payslip.company.postalCode} {payslip.company.city}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Détail des cotisations */}
            <Card>
              <CardHeader>
                <CardTitle>Détail des cotisations</CardTitle>
                <CardDescription>
                  Ventilation des charges salariales et patronales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(contributionsByCategory).map(([category, contributions]) => (
                    <div key={category} className="space-y-2">
                      <h3 className="font-medium">
                        {category === 'CSG_CRDS' && 'CSG / CRDS'}
                        {category === 'SECURITE_SOCIALE' && 'Sécurité sociale'}
                        {category === 'RETRAITE' && 'Retraite'}
                        {category === 'COMPLEMENTAIRE' && 'Retraite complémentaire'}
                        {category === 'CHOMAGE' && 'Assurance chômage'}
                        {category === 'AUTRES' && 'Autres cotisations'}
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[250px]">Libellé</TableHead>
                            <TableHead className="text-right">Base</TableHead>
                            <TableHead className="text-right">Taux salarial</TableHead>
                            <TableHead className="text-right">Montant salarial</TableHead>
                            <TableHead className="text-right">Taux patronal</TableHead>
                            <TableHead className="text-right">Montant patronal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contributions.map((contrib) => (
                            <TableRow key={contrib.id}>
                              <TableCell>{contrib.label}</TableCell>
                              <TableCell className="text-right">{formatCurrency(contrib.baseAmount)}</TableCell>
                              <TableCell className="text-right">{formatPercent(contrib.employeeRate)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(contrib.employeeAmount)}</TableCell>
                              <TableCell className="text-right">{formatPercent(contrib.employerRate)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(contrib.employerAmount)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Totaux cotisations</h3>
                    <div className="flex justify-between">
                      <span className="font-medium">Total part salariale</span>
                      <span className="font-medium">{formatCurrency(payslip.employeeContributions)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total part patronale</span>
                      <span className="font-medium">{formatCurrency(payslip.employerContributions)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Récapitulatif</h3>
                    <div className="flex justify-between">
                      <span className="font-medium">Salaire brut</span>
                      <span className="font-medium">{formatCurrency(payslip.grossSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total cotisations salariales</span>
                      <span className="font-medium">- {formatCurrency(payslip.employeeContributions)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Impôt sur le revenu</span>
                      <span className="font-medium">- {formatCurrency(payslip.taxAmount)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between">
                      <span className="font-medium">Net à payer</span>
                      <span className="font-bold text-xl">{formatCurrency(payslip.netSalary)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageContainer>
  );
} 