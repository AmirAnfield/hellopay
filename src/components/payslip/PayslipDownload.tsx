'use client';

import { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import type { PayslipData } from './PayslipCalculator';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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
  payslip: PayslipData;
  onUpload?: (file: Blob) => Promise<void>;
}

export default function PayslipDownload({ payslip, onUpload }: PayslipDownloadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBlobGenerated = async (blob: Blob) => {
    if (onUpload) {
      try {
        setIsUploading(true);
        setError(null);
        await onUpload(blob);
        setUploaded(true);
      } catch (err: any) {
        setError(err.message || 'Erreur lors de l\'upload du PDF');
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const fileName = `bulletin_paie_${payslip.employeeName.replace(/\s+/g, '_')}_${payslip.periodStart.toISOString().slice(0, 7)}.pdf`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PDFDownloadLink
          document={<PayslipDocument data={payslip} />}
          fileName={fileName}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {({ loading }) => (loading ? 'Génération du PDF...' : 'Télécharger le PDF')}
        </PDFDownloadLink>

        {onUpload && (
          <button
            onClick={async () => {
              const blob = await new Promise<Blob>((resolve) => {
                const renderer = <PayslipDocument data={payslip} />;
                const doc = renderer.document;
                if (doc) {
                  doc.on('blob', resolve);
                }
              });
              await handleBlobGenerated(blob);
            }}
            disabled={isUploading || uploaded}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isUploading
              ? 'Enregistrement...'
              : uploaded
              ? 'PDF enregistré ✓'
              : 'Enregistrer dans votre espace'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 