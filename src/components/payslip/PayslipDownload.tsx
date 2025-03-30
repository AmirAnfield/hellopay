'use client';

import { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import type { PayslipData } from './PayslipCalculator';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Lock, Unlock, CheckCircle, Edit } from 'lucide-react';
import { Loader2 } from 'lucide-react';

// Définition des styles pour le PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #000000',
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  headerInfo: {
    fontSize: 10,
    marginBottom: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 10,
  },
  column: {
    flex: 1,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  value: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1px solid #000000',
    paddingBottom: 3,
    marginBottom: 3,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 10,
  },
  tableCell: {
    flex: 1,
  },
  footer: {
    marginTop: 20,
    borderTop: '1px solid #000000',
    paddingTop: 10,
    fontSize: 8,
    textAlign: 'center',
  },
});

// Formatage des dates
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// Formatage des montants
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

// Composant PDF pour la fiche de paie
const PayslipDocument = ({ data }: { data: PayslipData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BULLETIN DE PAIE</Text>
        <Text style={styles.headerInfo}>Période : {formatDate(data.periodStart)} au {formatDate(data.periodEnd)}</Text>
        <Text style={styles.headerInfo}>Date de paiement : {formatDate(data.paymentDate)}</Text>
      </View>

      {/* Informations employeur */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EMPLOYEUR</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nom :</Text>
          <Text style={styles.value}>{data.employerName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Adresse :</Text>
          <Text style={styles.value}>{data.employerAddress}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>SIRET :</Text>
          <Text style={styles.value}>{data.employerSiret}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>N° URSSAF :</Text>
          <Text style={styles.value}>{data.employerUrssaf}</Text>
        </View>
      </View>

      {/* Informations salarié */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SALARIÉ</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nom :</Text>
          <Text style={styles.value}>{data.employeeName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Adresse :</Text>
          <Text style={styles.value}>{data.employeeAddress}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Poste :</Text>
          <Text style={styles.value}>{data.employeePosition}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>N° Sécurité Sociale :</Text>
          <Text style={styles.value}>{data.employeeSocialSecurityNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Statut :</Text>
          <Text style={styles.value}>{data.isExecutive ? 'Cadre' : 'Non cadre'}</Text>
        </View>
      </View>

      {/* Rémunération */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>RÉMUNÉRATION</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.tableCell}>Désignation</Text>
          <Text style={styles.tableCell}>Base</Text>
          <Text style={styles.tableCell}>Taux</Text>
          <Text style={styles.tableCell}>Montant</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Salaire de base</Text>
          <Text style={styles.tableCell}>{data.hoursWorked}h</Text>
          <Text style={styles.tableCell}>{formatAmount(data.hourlyRate)}/h</Text>
          <Text style={styles.tableCell}>{formatAmount(data.grossSalary)}</Text>
        </View>
      </View>

      {/* Cotisations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>COTISATIONS</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.tableCell}>Désignation</Text>
          <Text style={styles.tableCell}>Base</Text>
          <Text style={styles.tableCell}>Part salariale</Text>
          <Text style={styles.tableCell}>Part patronale</Text>
        </View>

        {/* Détails des cotisations */}
        {data.contributions.details.map((contribution, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{contribution.name}</Text>
            <Text style={styles.tableCell}>{formatAmount(contribution.base)}</Text>
            <Text style={styles.tableCell}>{formatAmount(contribution.employee)}</Text>
            <Text style={styles.tableCell}>{formatAmount(contribution.employer)}</Text>
          </View>
        ))}

        {/* Totaux des cotisations */}
        <View style={[styles.tableRow, { borderTop: '1px solid #000000', marginTop: 3, paddingTop: 3 }]}>
          <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>TOTAL</Text>
          <Text style={styles.tableCell}></Text>
          <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{formatAmount(data.contributions.employee)}</Text>
          <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{formatAmount(data.contributions.employer)}</Text>
        </View>
      </View>

      {/* Congés payés */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONGÉS PAYÉS</Text>
        <View style={styles.row}>
          <Text style={styles.column}>Acquis : {data.paidLeaveDays.acquired.toFixed(2)} jours</Text>
          <Text style={styles.column}>Pris : {data.paidLeaveDays.taken.toFixed(2)} jours</Text>
          <Text style={styles.column}>Restants : {data.paidLeaveDays.remaining.toFixed(2)} jours</Text>
        </View>
      </View>

      {/* Récapitulatif */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>RÉCAPITULATIF</Text>
        <View style={styles.row}>
          <Text style={styles.column}>Salaire brut : {formatAmount(data.grossSalary)}</Text>
          <Text style={styles.column}>Cotisations salariales : {formatAmount(data.contributions.employee)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.column}>Salaire net : {formatAmount(data.netSalary)}</Text>
          <Text style={styles.column}>Coût employeur : {formatAmount(data.employerCost)}</Text>
        </View>
      </View>

      {/* Cumuls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CUMULS ANNUELS</Text>
        <View style={styles.row}>
          <Text style={styles.column}>Brut cumulé : {formatAmount(data.cumulativeGrossSalary)}</Text>
          <Text style={styles.column}>Net cumulé : {formatAmount(data.cumulativeNetSalary)}</Text>
        </View>
      </View>

      {/* Pied de page */}
      <View style={styles.footer}>
        <Text>
          Ce bulletin de paie est généré automatiquement. Document non contractuel.
        </Text>
      </View>
    </Page>
  </Document>
);

interface PayslipDownloadProps {
  payslipId: string;
  isLocked?: boolean;
  status?: 'draft' | 'validated';
  onUnlock?: (payslipId: string) => Promise<void>;
  onReturn?: () => void;
}

export function PayslipDownload({ 
  payslipId, 
  isLocked = false,
  status = 'draft',
  onUnlock,
  onReturn
}: PayslipDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const response = await fetch(`/api/payslips/${payslipId}/download`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du bulletin');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulletin-de-paie-${payslipId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Téléchargement réussi',
        description: 'Le bulletin de paie a été téléchargé avec succès.'
      });
    } catch (error) {
      console.error('Erreur de téléchargement:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de téléchargement',
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors du téléchargement du bulletin'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUnlock = async () => {
    if (!onUnlock) return;
    
    setIsUnlocking(true);
    
    try {
      await onUnlock(payslipId);
      toast({
        title: 'Bulletin débloqué',
        description: 'Le bulletin de paie a été débloqué avec succès et peut être modifié.'
      });
    } catch (error) {
      console.error('Erreur de déblocage:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de déblocage',
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors du déblocage du bulletin'
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  const isValidated = status === 'validated';

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-lg border">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-xl">
            Bulletin de paie
          </CardTitle>
          <CardDescription className="text-center">
            {isLocked ? (
              <span className="flex items-center justify-center gap-1 text-amber-600">
                <Lock className="h-4 w-4" />
                Ce bulletin est verrouillé
              </span>
            ) : isValidated ? (
              <span className="flex items-center justify-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                Ce bulletin est validé
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1 text-blue-600">
                <Edit className="h-4 w-4" />
                Ce bulletin peut être modifié
              </span>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center space-y-5 pt-0">
          <div className="w-full flex justify-center mb-4">
            <div className="bg-gray-100 p-6 rounded-lg w-24 h-32 flex items-center justify-center">
              <FileText className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <div className="space-y-3 w-full">
            <Button 
              className="w-full flex items-center justify-center gap-2" 
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Téléchargement...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Télécharger le bulletin
                </>
              )}
            </Button>
            
            {isLocked && onUnlock && (
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={handleUnlock}
                disabled={isUnlocking}
              >
                {isUnlocking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Déblocage en cours...
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4" />
                    Débloquer le bulletin
                  </>
                )}
              </Button>
            )}
            
            {onReturn && (
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={onReturn}
              >
                Retour à la sélection
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 