'use client'

import React, { useEffect } from 'react'
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer'

// Enregistrement des polices
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontStyle: 'italic' }
  ]
})

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Roboto',
    lineHeight: 1.5
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  subheader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 6,
    textDecoration: 'underline'
  },
  paragraph: {
    marginBottom: 8
  },
  bold: {
    fontWeight: 'bold'
  },
  section: {
    marginBottom: 15
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #ccc',
    paddingVertical: 4
  },
  tableHeader: {
    fontWeight: 'bold',
    borderBottom: '1pt solid #000'
  },
  tableCol1: {
    width: '60%'
  },
  tableCol2: {
    width: '40%'
  },
  italic: {
    fontStyle: 'italic'
  },
  signatureBlock: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  signatureItem: {
    width: '45%'
  }
})

// Interface pour les données du contrat
interface ContractProps {
  contractData: {
    // Infos de l'employeur
    employerName: string;
    employerAddress: string;
    employerSiren: string;
    
    // Infos de l'employé
    employeeName: string;
    employeeAddress: string;
    employeeSSN: string;
    employeeBirthDate: string;
    employeeNationality: string;
    
    // Infos du contrat
    position: string;
    contractType: string;
    contractStartDate: string;
    baseSalary: string;
    weeklyHours: string;
    workplace: string;
    
    // Détails supplémentaires
    probationPeriod: string;
    noticePeriod: string;
    vacationDays: string;
    specificClauses: string;
  };
  onPdfGenerated?: (blob: Blob) => void;
}

// Composant principal du template de contrat
const ContractTemplate: React.FC<ContractProps> = ({ contractData, onPdfGenerated }) => {
  // Générer le PDF quand le composant est monté
  useEffect(() => {
    if (onPdfGenerated) {
      const generatePdf = async () => {
        const blob = await pdf(
          <ContractDocument contractData={contractData} />
        ).toBlob();
        onPdfGenerated(blob);
      };
      
      generatePdf();
    }
  }, [contractData, onPdfGenerated]);
  
  return <ContractDocument contractData={contractData} />;
};

// Composant du document PDF
const ContractDocument: React.FC<{ contractData: ContractProps['contractData'] }> = ({ contractData }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <Text style={styles.header}>CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE (CDI)</Text>
        
        {/* Parties du contrat */}
        <View style={styles.section}>
          <Text style={styles.paragraph}>ENTRE LES SOUSSIGNÉS:</Text>
          
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>{contractData.employerName}</Text>{'\n'}
            SIREN: {contractData.employerSiren}{'\n'}
            Adresse: {contractData.employerAddress}{'\n'}
            Représenté par: [Nom du représentant]{'\n'}
            Ci-après dénommé "l'Employeur"
          </Text>
          
          <Text style={styles.paragraph}>ET:</Text>
          
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>{contractData.employeeName}</Text>{'\n'}
            Né(e) le: {formatDate(contractData.employeeBirthDate)}{'\n'}
            Nationalité: {contractData.employeeNationality}{'\n'}
            Numéro de sécurité sociale: {contractData.employeeSSN}{'\n'}
            Demeurant: {contractData.employeeAddress}{'\n'}
            Ci-après dénommé "le Salarié"
          </Text>
          
          <Text style={styles.paragraph}>IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT:</Text>
        </View>
        
        {/* Article 1 - Engagement */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Article 1 - Engagement</Text>
          <Text style={styles.paragraph}>
            L'Employeur engage le Salarié qui accepte, à compter du {formatDate(contractData.contractStartDate)} aux 
            conditions énoncées dans le présent contrat, sous réserve des résultats de la visite médicale d'embauche.
          </Text>
          <Text style={styles.paragraph}>
            Le Salarié déclare formellement n'être lié à aucune autre entreprise par un contrat de travail et être 
            libre de tout engagement.
          </Text>
        </View>
        
        {/* Article 2 - Fonction et qualification */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Article 2 - Fonction et qualification</Text>
          <Text style={styles.paragraph}>
            Le Salarié est engagé en qualité de <Text style={styles.bold}>{contractData.position}</Text>, statut [Statut professionnel], 
            coefficient [Coefficient], niveau [Niveau].
          </Text>
          <Text style={styles.paragraph}>
            Le Salarié exercera ses fonctions sous l'autorité et selon les directives de l'Employeur.
          </Text>
        </View>
        
        {/* Article 3 - Durée du contrat et période d'essai */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Article 3 - Durée du contrat et période d'essai</Text>
          <Text style={styles.paragraph}>
            Le présent contrat est conclu pour une durée indéterminée.
          </Text>
          <Text style={styles.paragraph}>
            Le contrat ne deviendra définitif qu'à l'issue d'une période d'essai de {contractData.probationPeriod} mois, 
            durant laquelle chacune des parties pourra rompre le contrat sans indemnité ni préavis, en respectant 
            toutefois les dispositions légales concernant la rupture d'une période d'essai.
          </Text>
        </View>
        
        {/* Article 4 - Lieu de travail */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Article 4 - Lieu de travail</Text>
          <Text style={styles.paragraph}>
            Le Salarié exercera ses fonctions principalement à l'adresse suivante: {contractData.workplace}.
          </Text>
          <Text style={styles.paragraph}>
            En fonction des nécessités de service, le lieu de travail du Salarié pourra être modifié temporairement 
            ou définitivement sur décision de l'Employeur, dans le respect des dispositions légales et conventionnelles.
          </Text>
        </View>
        
        {/* Article 5 - Durée du travail */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Article 5 - Durée du travail</Text>
          <Text style={styles.paragraph}>
            Le Salarié est soumis à la durée légale du travail de 35 heures par semaine. Le Salarié travaillera 
            {contractData.weeklyHours} heures par semaine, réparties du lundi au vendredi selon l'horaire collectif 
            en vigueur dans l'entreprise.
          </Text>
          <Text style={styles.paragraph}>
            En fonction des nécessités de service, ces horaires pourront être modifiés et le Salarié pourra être 
            amené à effectuer des heures supplémentaires à la demande de l'Employeur.
          </Text>
        </View>
        
        {/* Article 6 - Rémunération */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Article 6 - Rémunération</Text>
          <Text style={styles.paragraph}>
            En contrepartie de son travail, le Salarié percevra une rémunération mensuelle brute de {contractData.baseSalary} euros, 
            pour la durée de travail prévue à l'article 5, versée mensuellement.
          </Text>
          <Text style={styles.paragraph}>
            À cette rémunération s'ajouteront, le cas échéant, les primes et accessoires prévus par la convention collective 
            ou les accords d'entreprise.
          </Text>
        </View>
        
        {/* Article 7 - Congés payés */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Article 7 - Congés payés</Text>
          <Text style={styles.paragraph}>
            Le Salarié bénéficiera des congés payés institués en faveur des salariés par les dispositions légales et 
            conventionnelles, soit {contractData.vacationDays} jours ouvrables par an.
          </Text>
          <Text style={styles.paragraph}>
            La période de prise des congés et les dates de congés seront déterminées par accord entre l'Employeur et le Salarié, 
            en fonction des nécessités du service.
          </Text>
        </View>
        
        {/* Article 8 - Obligations professionnelles */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Article 8 - Obligations professionnelles</Text>
          <Text style={styles.paragraph}>
            Le Salarié s'engage à respecter les directives et instructions qui lui seront données par la Direction et 
            à se conformer aux règles régissant le fonctionnement interne de l'entreprise.
          </Text>
          <Text style={styles.paragraph}>
            Le Salarié s'engage également à informer sans délai l'Employeur de tout changement qui interviendrait 
            dans les situations qu'il a signalées lors de son engagement (adresse, situation de famille, etc.).
          </Text>
        </View>
        
        {/* Article 9 - Protection sociale */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Article 9 - Protection sociale</Text>
          <Text style={styles.paragraph}>
            Le Salarié sera affilié, dès son entrée dans l'entreprise, aux organismes suivants:
          </Text>
          <Text style={styles.paragraph}>
            - Sécurité sociale et retraite complémentaire: [Organismes]{'\n'}
            - Prévoyance et mutuelle: [Organismes]
          </Text>
        </View>
        
        {/* Article 10 - Rupture du contrat */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Article 10 - Rupture du contrat</Text>
          <Text style={styles.paragraph}>
            À l'expiration de la période d'essai, le présent contrat ne pourra être rompu que dans les conditions 
            prévues par la loi et moyennant le respect d'un préavis de {contractData.noticePeriod} mois, 
            sauf en cas de faute grave ou lourde.
          </Text>
        </View>
        
        {/* Clauses spécifiques */}
        {contractData.specificClauses && (
          <View style={styles.section}>
            <Text style={styles.subheader}>Clauses spécifiques</Text>
            <Text style={styles.paragraph}>{contractData.specificClauses}</Text>
          </View>
        )}
        
        {/* Convention collective */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Convention collective</Text>
          <Text style={styles.paragraph}>
            Le présent contrat est régi par les dispositions de la Convention Collective [Nom de la convention collective], 
            dont un exemplaire est à la disposition du Salarié dans les locaux de l'entreprise.
          </Text>
        </View>
        
        {/* Signature */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureItem}>
            <Text style={styles.bold}>Pour l'Employeur:</Text>
            <Text style={styles.paragraph}>Nom et qualité du signataire</Text>
            <Text style={[styles.paragraph, styles.italic]}>Lu et approuvé</Text>
            <Text style={styles.paragraph}>Signature:</Text>
          </View>
          
          <View style={styles.signatureItem}>
            <Text style={styles.bold}>Le Salarié:</Text>
            <Text style={styles.paragraph}>{contractData.employeeName}</Text>
            <Text style={[styles.paragraph, styles.italic]}>Lu et approuvé</Text>
            <Text style={styles.paragraph}>Signature:</Text>
          </View>
        </View>
        
        {/* Fait à */}
        <Text style={[styles.paragraph, { marginTop: 30 }]}>
          Fait en deux exemplaires à __________________, le __________________
        </Text>
      </Page>
    </Document>
  );
};

export default ContractTemplate; 