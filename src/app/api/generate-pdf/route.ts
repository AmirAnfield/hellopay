import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

// Fonction utilitaire pour formater les dates
function formatDate(dateString: string | null): string {
  if (!dateString) return "Non spécifiée";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  } catch (e) {
    return dateString;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de la requête
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || 'unknown';
    const type = searchParams.get('type') || 'document';
    
    // Paramètres communs
    const employeeName = searchParams.get('employeeName') || '[Nom de l\'employé]';
    const companyName = searchParams.get('companyName') || 'HelloPay';
    const position = searchParams.get('position') || '[Poste]';
    const startDate = searchParams.get('startDate');
    
    // Paramètres pour les attestations
    const showSalary = searchParams.get('showSalary') === 'true';
    const salaryType = searchParams.get('salaryType') as 'monthly' | 'annual' || 'monthly';
    const salaryAmount = Number(searchParams.get('salaryAmount')) || 0;
    const contractType = searchParams.get('contractType') || 'CDI';
    const noEndDate = searchParams.get('noEndDate') === 'true';
    
    // Paramètres supplémentaires pour les contrats
    const endDate = searchParams.get('endDate');
    const isFullTime = searchParams.get('isFullTime') === 'true';
    const monthlyHours = searchParams.get('monthlyHours') ? 
      Number(searchParams.get('monthlyHours')) : 151.67;
    const trialPeriodEndDate = searchParams.get('trialPeriodEndDate');
    
    console.log(`Génération de PDF pour ${type} - ID: ${id}`);
    
    // Créer un nouveau document PDF
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('fr-FR');
    
    // Définir le contenu du PDF en fonction du type de document
    if (type === 'attestation') {
      // Titre
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('ATTESTATION DE TRAVAIL', 105, 20, { align: 'center' });
      
      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fait le ${currentDate}`, 200, 30, { align: 'right' });
      
      // Logo et en-tête entreprise
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(companyName, 20, 30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('123 Avenue de la République', 20, 35);
      doc.text('75011 Paris', 20, 40);
      doc.text('SIRET: 123 456 789 00012', 20, 45);
      
      // Texte de l'attestation
      doc.setFontSize(12);
      doc.text("Je soussigné, Jean Dupont, agissant en qualité de Directeur des Ressources Humaines,", 20, 70);
      doc.text(`certifie que ${employeeName}, demeurant à Paris,`, 20, 80);
      doc.text(`est employé(e) au sein de notre entreprise depuis le ${formatDate(startDate)}`, 20, 90);
      doc.text(`en qualité de ${position}, dans le cadre d'un contrat à durée ${contractType === 'CDI' ? 'indéterminée' : 'déterminée'}.`, 20, 100);
      
      // Option salaire
      if (showSalary) {
        const salaryText = salaryType === 'monthly' 
          ? `Son salaire mensuel brut s'élève à ${salaryAmount.toLocaleString()} euros.` 
          : `Son salaire annuel brut s'élève à ${salaryAmount.toLocaleString()} euros.`;
        doc.text(salaryText, 20, 120);
      }
      
      // Durée du contrat
      if (contractType !== 'CDI' && !noEndDate) {
        doc.text("Ce contrat prendra fin à la date convenue entre les parties.", 20, 130);
      }
      
      // Signature
      doc.text("La présente attestation est délivrée à la demande de l'intéressé(e) pour faire valoir ce que de droit.", 20, 150);
      doc.text("Signature et cachet de l'employeur", 150, 180);
    } 
    else if (type === 'contrat') {
      // Titre
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(`CONTRAT DE TRAVAIL - ${contractType}`, 105, 20, { align: 'center' });
      
      // En-tête 
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Établi le ${currentDate}`, 200, 30, { align: 'right' });
      
      // Informations entreprise
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("ENTRE LES SOUSSIGNÉS", 20, 40);
      doc.setFont('helvetica', 'normal');
      doc.text(`${companyName}`, 20, 50);
      doc.text("123 Avenue de la République, 75011 Paris", 20, 55);
      doc.text("SIRET: 123 456 789 00012", 20, 60);
      doc.text("Représentée par Jean Dupont, en qualité de Directeur", 20, 65);
      doc.text("Ci-après dénommée \"l'employeur\"", 20, 70);
      
      doc.text("ET", 105, 80, { align: 'center' });
      
      // Informations employé
      doc.text(`${employeeName}`, 20, 90);
      doc.text("Demeurant à [Adresse de l'employé]", 20, 95);
      doc.text("Ci-après dénommé(e) \"le salarié\"", 20, 100);
      
      // Clauses du contrat
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("IL A ÉTÉ CONVENU CE QUI SUIT :", 20, 115);
      
      // Article 1: Engagement
      doc.setFont('helvetica', 'bold');
      doc.text("Article 1 - Engagement", 20, 125);
      doc.setFont('helvetica', 'normal');
      doc.text(`Le salarié est engagé en qualité de ${position} à compter du ${formatDate(startDate)}, `, 20, 130);
      doc.text(`sous réserve des résultats de la visite médicale d'embauche.`, 20, 135);
      
      // Article 2: Durée du contrat
      doc.setFont('helvetica', 'bold');
      doc.text("Article 2 - Durée du contrat", 20, 145);
      doc.setFont('helvetica', 'normal');
      if (contractType === 'CDI') {
        doc.text("Le présent contrat est conclu pour une durée indéterminée.", 20, 150);
      } else {
        doc.text(`Le présent contrat est conclu pour une durée déterminée ${endDate ? `jusqu'au ${formatDate(endDate)}` : 'selon accord'}.`, 20, 150);
        doc.text("Il prendra fin à cette date sans qu'il soit nécessaire de donner un préavis.", 20, 155);
      }
      
      // Article 3: Période d'essai
      doc.setFont('helvetica', 'bold');
      doc.text("Article 3 - Période d'essai", 20, 165);
      doc.setFont('helvetica', 'normal');
      if (trialPeriodEndDate) {
        doc.text(`Le présent contrat est soumis à une période d'essai qui prendra fin le ${formatDate(trialPeriodEndDate)}.`, 20, 170);
      } else {
        doc.text("Le présent contrat est soumis à une période d'essai conformément à la convention collective.", 20, 170);
      }
      doc.text("Durant cette période, chacune des parties pourra rompre le contrat sans indemnité.", 20, 175);
      
      // Article 4: Durée du travail
      doc.setFont('helvetica', 'bold');
      doc.text("Article 4 - Durée du travail", 20, 185);
      doc.setFont('helvetica', 'normal');
      if (isFullTime) {
        doc.text(`Le salarié est engagé à temps plein pour une durée mensuelle de ${monthlyHours} heures.`, 20, 190);
      } else {
        doc.text(`Le salarié est engagé à temps partiel pour une durée mensuelle de ${monthlyHours} heures.`, 20, 190);
      }
      
      // Article 5: Rémunération
      doc.setFont('helvetica', 'bold');
      doc.text("Article 5 - Rémunération", 20, 200);
      doc.setFont('helvetica', 'normal');
      doc.text(`La rémunération mensuelle brute du salarié est fixée à ${salaryAmount.toLocaleString()} euros.`, 20, 205);
      
      // Signature
      doc.text("Fait en deux exemplaires à Paris, le " + currentDate, 20, 235);
      doc.text("Signature du salarié", 20, 250);
      doc.text("Signature de l'employeur", 120, 250);
    }
    else {
      // Document générique
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('DOCUMENT', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Document relatif à ${employeeName}`, 20, 40);
      doc.text(`Entreprise: ${companyName}`, 20, 60);
      doc.text(`Date: ${currentDate}`, 20, 80);
    }
    
    // Pied de page
    doc.setFontSize(8);
    doc.text(`Document généré automatiquement par HelloPay - Réf: ${id}`, 105, 290, { align: 'center' });
    
    // Générer le PDF
    const pdfOutput = doc.output('arraybuffer');
    
    // Créer une réponse avec le fichier PDF
    return new Response(pdfOutput, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${type}_${id}.pdf"`
      },
    });
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
} 