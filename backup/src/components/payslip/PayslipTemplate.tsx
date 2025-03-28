'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Enregistrement des polices
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
  ],
})

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Roboto',
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #CCCCCC',
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerColumn: {
    flexDirection: 'column',
    width: '48%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#2563EB',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1F2937',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
    color: '#374151',
  },
  value: {
    width: '60%',
    color: '#1F2937',
  },
  section: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    backgroundColor: '#F3F4F6',
    padding: 5,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    padding: 5,
  },
  tableCell: {
    flex: 1,
    color: '#1F2937',
  },
  tableCellRight: {
    flex: 1,
    textAlign: 'right',
    color: '#1F2937',
  },
  tableCellCenter: {
    flex: 1,
    textAlign: 'center',
    color: '#1F2937',
  },
  tableCellSmall: {
    width: '15%',
    color: '#1F2937',
  },
  tableCellMedium: {
    width: '20%',
    color: '#1F2937',
  },
  tableCellLarge: {
    width: '30%',
    color: '#1F2937',
  },
  tableCellRightSmall: {
    width: '15%',
    textAlign: 'right',
    color: '#1F2937',
  },
  tableCellRightMedium: {
    width: '20%',
    textAlign: 'right',
    color: '#1F2937',
  },
  totals: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  totalLabel: {
    width: 180,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'right',
    paddingRight: 10,
  },
  totalValue: {
    width: 80,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#2563EB',
  },
  paidLeave: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F3F4F6',
  },
  paidLeaveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  paidLeaveLabel: {
    fontWeight: 'bold',
    color: '#374151',
  },
  paidLeaveValue: {
    color: '#1F2937',
  },
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    paddingTop: 10,
    fontSize: 8,
    color: '#6B7280',
  },
  note: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F3F4F6',
    fontSize: 9,
    color: '#4B5563',
    borderRadius: 4,
  },
})

// Formater les montants en euros
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount)
}

// Formater les dates
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

interface PayslipData {
  // Informations employeur
  employerName: string
  employerAddress: string
  employerSiret: string
  employerUrssaf: string
  
  // Informations salarié
  employeeName: string
  employeeAddress: string
  employeePosition: string
  employeeSocialSecurityNumber: string
  isExecutive: boolean
  
  // Période
  periodStart: Date
  periodEnd: Date
  paymentDate: Date
  fiscalYear: number
  
  // Rémunération
  hourlyRate: number
  hoursWorked: number
  grossSalary: number
  netSalary: number
  employerCost: number
  
  // Cotisations
  employeeContributions: number
  employerContributions: number
  contributionsDetails: string
  
  // Congés payés
  paidLeaveAcquired: number
  paidLeaveTaken: number
  paidLeaveRemaining: number
  
  // Cumuls
  cumulativeGrossSalary: number
  cumulativeNetSalary: number
  cumulativePeriodStart: Date
  cumulativePeriodEnd: Date
}

interface PayslipTemplateProps {
  data: PayslipData
}

export const PayslipTemplate = ({ data }: PayslipTemplateProps) => {
  // Parser les détails des cotisations
  const contributions = JSON.parse(data.contributionsDetails)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>BULLETIN DE PAIE</Text>
          
          <View style={styles.headerRow}>
            <View style={styles.headerColumn}>
              <Text style={styles.subtitle}>Employeur</Text>
              <Text>{data.employerName}</Text>
              <Text>{data.employerAddress}</Text>
              <Text>SIRET : {data.employerSiret}</Text>
              <Text>N° URSSAF : {data.employerUrssaf}</Text>
            </View>
            
            <View style={styles.headerColumn}>
              <Text style={styles.subtitle}>Salarié</Text>
              <Text>{data.employeeName}</Text>
              <Text>{data.employeeAddress}</Text>
              <Text>Poste : {data.employeePosition}</Text>
              <Text>Statut : {data.isExecutive ? 'Cadre' : 'Non cadre'}</Text>
              <Text>N° S.S. : {data.employeeSocialSecurityNumber}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Période :</Text>
            <Text style={styles.value}>Du {formatDate(data.periodStart)} au {formatDate(data.periodEnd)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date de paiement :</Text>
            <Text style={styles.value}>{formatDate(data.paymentDate)}</Text>
          </View>
        </View>
        
        {/* Rémunération */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Rémunération</Text>
          
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellLarge}>Désignation</Text>
            <Text style={styles.tableCellRightSmall}>Base</Text>
            <Text style={styles.tableCellRightSmall}>Taux</Text>
            <Text style={styles.tableCellRightMedium}>Montant</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableCellLarge}>Salaire de base</Text>
            <Text style={styles.tableCellRightSmall}>{data.hoursWorked.toFixed(2)} h</Text>
            <Text style={styles.tableCellRightSmall}>{data.hourlyRate.toFixed(2)} €</Text>
            <Text style={styles.tableCellRightMedium}>{formatCurrency(data.grossSalary)}</Text>
          </View>
        </View>
        
        {/* Cotisations sociales */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Cotisations et contributions sociales</Text>
          
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellLarge}>Désignation</Text>
            <Text style={styles.tableCellRightSmall}>Base</Text>
            <Text style={styles.tableCellRightSmall}>Taux salarié</Text>
            <Text style={styles.tableCellRightSmall}>Part salarié</Text>
            <Text style={styles.tableCellRightSmall}>Taux patron</Text>
            <Text style={styles.tableCellRightSmall}>Part patron</Text>
          </View>
          
          {contributions.map((contrib: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCellLarge}>{contrib.name}</Text>
              <Text style={styles.tableCellRightSmall}>{formatCurrency(contrib.base)}</Text>
              <Text style={styles.tableCellRightSmall}>{(contrib.employeeRate * 100).toFixed(2)} %</Text>
              <Text style={styles.tableCellRightSmall}>{formatCurrency(contrib.employeeAmount)}</Text>
              <Text style={styles.tableCellRightSmall}>{(contrib.employerRate * 100).toFixed(2)} %</Text>
              <Text style={styles.tableCellRightSmall}>{formatCurrency(contrib.employerAmount)}</Text>
            </View>
          ))}
        </View>
        
        {/* Totaux */}
        <View style={styles.totals}>
          <View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total des cotisations salariales :</Text>
              <Text style={styles.totalValue}>{formatCurrency(data.employeeContributions)}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total des cotisations patronales :</Text>
              <Text style={styles.totalValue}>{formatCurrency(data.employerContributions)}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Salaire brut :</Text>
              <Text style={styles.totalValue}>{formatCurrency(data.grossSalary)}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Salaire net à payer :</Text>
              <Text style={styles.totalValue}>{formatCurrency(data.netSalary)}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Coût total employeur :</Text>
              <Text style={styles.totalValue}>{formatCurrency(data.employerCost)}</Text>
            </View>
          </View>
        </View>
        
        {/* Congés payés */}
        <View style={styles.paidLeave}>
          <Text style={styles.subtitle}>Congés payés</Text>
          
          <View style={styles.paidLeaveRow}>
            <Text style={styles.paidLeaveLabel}>Acquis sur la période :</Text>
            <Text style={styles.paidLeaveValue}>{data.paidLeaveAcquired.toFixed(2)} jours</Text>
          </View>
          
          <View style={styles.paidLeaveRow}>
            <Text style={styles.paidLeaveLabel}>Pris sur la période :</Text>
            <Text style={styles.paidLeaveValue}>{data.paidLeaveTaken.toFixed(2)} jours</Text>
          </View>
          
          <View style={styles.paidLeaveRow}>
            <Text style={styles.paidLeaveLabel}>Solde restant :</Text>
            <Text style={styles.paidLeaveValue}>{data.paidLeaveRemaining.toFixed(2)} jours</Text>
          </View>
        </View>
        
        {/* Cumuls */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Cumuls {data.fiscalYear}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Période du cumul :</Text>
            <Text style={styles.value}>Du {formatDate(data.cumulativePeriodStart)} au {formatDate(data.cumulativePeriodEnd)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Brut cumulé :</Text>
            <Text style={styles.value}>{formatCurrency(data.cumulativeGrossSalary)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Net cumulé :</Text>
            <Text style={styles.value}>{formatCurrency(data.cumulativeNetSalary)}</Text>
          </View>
        </View>
        
        {/* Note de bas de page */}
        <View style={styles.note}>
          <Text>Conservez ce bulletin de paie sans limitation de durée.</Text>
          <Text>Ce document est généré automatiquement par HelloPay et a valeur de bulletin de salaire.</Text>
        </View>
        
        {/* Pied de page */}
        <View style={styles.footer}>
          <Text>Document généré par HelloPay le {new Date().toLocaleDateString('fr-FR')}</Text>
        </View>
      </Page>
    </Document>
  )
} 