import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Interface pour les montants de contributions
interface ContributionAmounts {
  employee: number;
  employer: number;
}

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Vérifier si l'ID de l'employé est fourni
    if (!params.id) {
      return NextResponse.json({ error: 'Identifiant employé manquant' }, { status: 400 });
    }

    // Récupérer la session pour vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer l'année depuis les paramètres de requête (par défaut: année courante)
    const searchParams = request.nextUrl.searchParams;
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    if (isNaN(year)) {
      return NextResponse.json({ error: 'Année invalide' }, { status: 400 });
    }

    // Récupérer les données du récapitulatif annuel
    const response = await fetch(`${request.nextUrl.origin}/api/employees/${params.id}/history?year=${year}`, {
      headers: {
        Cookie: request.headers.get('cookie') || '',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error }, { status: response.status });
    }

    const historyData = await response.json();

    // Création du document PDF
    const pdfDoc = await PDFDocument.create();

    // Ajout d'une page
    let page = pdfDoc.addPage([595.28, 841.89]); // Format A4
    
    // Polices
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Dimensions et positions
    const { width, height } = page.getSize();
    const margin = 50;
    
    // Titre
    page.drawText('RÉCAPITULATIF ANNUEL DE PAIE', {
      x: margin,
      y: height - margin,
      size: 16,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    // Sous-titre avec l'année
    page.drawText(`Année ${historyData.year}`, {
      x: margin,
      y: height - margin - 25,
      size: 14,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    // Informations employeur
    page.drawText('EMPLOYEUR', {
      x: margin,
      y: height - margin - 70,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(`${historyData.company.name}`, {
      x: margin,
      y: height - margin - 90,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(`SIRET: ${historyData.company.siret}`, {
      x: margin,
      y: height - margin - 105,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    // Informations salarié
    page.drawText('SALARIÉ', {
      x: width / 2 + 20,
      y: height - margin - 70,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(`${historyData.employee.name}`, {
      x: width / 2 + 20,
      y: height - margin - 90,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(`Poste: ${historyData.employee.position}`, {
      x: width / 2 + 20,
      y: height - margin - 105,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(`N° SS: ${historyData.employee.socialSecurityNumber}`, {
      x: width / 2 + 20,
      y: height - margin - 120,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    // Ligne séparatrice
    page.drawLine({
      start: { x: margin, y: height - margin - 140 },
      end: { x: width - margin, y: height - margin - 140 },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    
    // Totaux annuels
    page.drawText('CUMULS ANNUELS', {
      x: margin,
      y: height - margin - 165,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    // Function pour formater les montants en euros
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
      }).format(amount);
    };
    
    // Grille des totaux
    const totalsGrid = [
      { label: 'Salaire brut annuel', value: formatCurrency(historyData.annual.grossSalary) },
      { label: 'Salaire net annuel', value: formatCurrency(historyData.annual.netSalary) },
      { label: 'Cotisations salariales', value: formatCurrency(historyData.annual.employeeContributions) },
      { label: 'Cotisations patronales', value: formatCurrency(historyData.annual.employerContributions) },
      { label: 'Coût employeur', value: formatCurrency(historyData.annual.employerCost) },
    ];
    
    let yPos = height - margin - 190;
    const colWidth = (width - 2 * margin) / 2;
    
    totalsGrid.forEach((item) => {
      page.drawText(item.label, {
        x: margin,
        y: yPos,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(item.value, {
        x: margin + colWidth - 100,
        y: yPos,
        size: 10,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
      
      yPos -= 20;
    });
    
    // Congés payés
    page.drawText('CONGÉS PAYÉS', {
      x: margin,
      y: height - margin - 320,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    const leaveGrid = [
      { label: 'Congés acquis', value: `${historyData.annual.paidLeaveAcquired.toFixed(2)} jours` },
      { label: 'Congés pris', value: `${historyData.annual.paidLeaveTaken.toFixed(2)} jours` },
      { label: 'Solde actuel', value: `${historyData.annual.paidLeaveBalance.toFixed(2)} jours` },
    ];
    
    yPos = height - margin - 345;
    
    leaveGrid.forEach((item) => {
      page.drawText(item.label, {
        x: margin,
        y: yPos,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(item.value, {
        x: margin + colWidth - 100,
        y: yPos,
        size: 10,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
      
      yPos -= 20;
    });
    
    // Répartition des cotisations
    page.drawText('RÉPARTITION DES COTISATIONS', {
      x: margin,
      y: height - margin - 420,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    // En-tête du tableau
    yPos = height - margin - 445;
    
    page.drawText('Catégorie', {
      x: margin,
      y: yPos,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('Part salariale', {
      x: margin + 150,
      y: yPos,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('Part patronale', {
      x: margin + 250,
      y: yPos,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('Total', {
      x: margin + 350,
      y: yPos,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    yPos -= 15;
    
    // Ligne sous les en-têtes
    page.drawLine({
      start: { x: margin, y: yPos + 5 },
      end: { x: width - margin, y: yPos + 5 },
      thickness: 0.5,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    yPos -= 10;
    
    // Capitaliser la première lettre d'une chaîne
    const capitalize = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };
    
    // Récupérer les données de contributions avec le bon typage
    const contributions = historyData.annualContributionsByCategory as Record<string, ContributionAmounts>;
    
    // Lignes du tableau des contributions
    Object.entries(contributions).forEach(([category, amounts]) => {
      page.drawText(capitalize(category), {
        x: margin,
        y: yPos,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(formatCurrency(amounts.employee), {
        x: margin + 150,
        y: yPos,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(formatCurrency(amounts.employer), {
        x: margin + 250,
        y: yPos,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(formatCurrency(amounts.employee + amounts.employer), {
        x: margin + 350,
        y: yPos,
        size: 10,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
      
      yPos -= 20;
      
      // Vérifier si nous devons passer à une nouvelle page
      if (yPos < margin + 50) {
        // Ajouter une nouvelle page
        page = pdfDoc.addPage([595.28, 841.89]);
        yPos = height - margin;
      }
    });
    
    // Ligne avant les totaux
    page.drawLine({
      start: { x: margin, y: yPos + 10 },
      end: { x: width - margin, y: yPos + 10 },
      thickness: 0.5,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Totaux des cotisations
    page.drawText('TOTAL', {
      x: margin,
      y: yPos - 5,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(formatCurrency(historyData.annual.employeeContributions), {
      x: margin + 150,
      y: yPos - 5,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(formatCurrency(historyData.annual.employerContributions), {
      x: margin + 250,
      y: yPos - 5,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(formatCurrency(historyData.annual.employeeContributions + historyData.annual.employerContributions), {
      x: margin + 350,
      y: yPos - 5,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    // Pied de page
    page.drawText(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, {
      x: margin,
      y: margin / 2,
      size: 8,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Sérialiser le PDF
    const pdfBytes = await pdfDoc.save();
    
    // Créer la réponse avec le PDF
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="recap_annuel_${historyData.employee.name.replace(' ', '_')}_${historyData.year}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la génération du PDF' },
      { status: 500 }
    );
  }
} 