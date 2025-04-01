import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de l'URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id') || 'unknown';
    const type = url.searchParams.get('type') || 'document';
    
    // Récupérer les données du document depuis localStorage côté client
    // Dans une API réelle, nous récupérerions ces données depuis une base de données
    // Pour cette démo, on reçoit les données via les paramètres d'URL
    const employeeName = url.searchParams.get('employeeName') || '[Nom de l\'employé]';
    const companyName = url.searchParams.get('companyName') || 'HelloPay';
    const position = url.searchParams.get('position') || '[Poste]';
    const startDate = url.searchParams.get('startDate') || '[Date]';
    const contractType = url.searchParams.get('contractType') || 'CDI';
    const showSalary = url.searchParams.get('showSalary') === 'true';
    const salaryType = url.searchParams.get('salaryType') as 'monthly' | 'annual' || 'monthly';
    const salaryAmount = Number(url.searchParams.get('salaryAmount')) || 0;
    const noEndDate = url.searchParams.get('noEndDate') === 'true';
    
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
      // Contenu pour un contrat
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTRAT DE TRAVAIL', 105, 20, { align: 'center' });
      
      // Ajoutez ici le contenu du contrat...
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Contrat de travail - ${contractType}`, 20, 40);
      doc.text("Entre les soussignés:", 20, 60);
      doc.text(`La société ${companyName}`, 20, 70);
      doc.text("Et", 20, 90);
      doc.text(employeeName, 20, 100);
      doc.text(`Il a été convenu un contrat de travail à durée ${contractType === 'CDI' ? 'indéterminée' : 'déterminée'} pour le poste de ${position}.`, 20, 120);
      doc.text(`Date de début: ${formatDate(startDate)}`, 20, 140);
      
      if (showSalary) {
        const salaryText = salaryType === 'monthly' 
          ? `Rémunération mensuelle brute: ${salaryAmount.toLocaleString()} euros` 
          : `Rémunération annuelle brute: ${salaryAmount.toLocaleString()} euros`;
        doc.text(salaryText, 20, 160);
      }
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
    console.error("Erreur lors de la génération du PDF:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF" },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour formater les dates
function formatDate(dateString: string): string {
  if (!dateString || dateString === '[Date]') return dateString;
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
} 