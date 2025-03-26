import { NextRequest, NextResponse } from 'next/server';
import { fullTimeEmployeeData, partTimeEmployeeData, overtimeEmployeeData } from '@/src/components/payslip/TestPayslipData';
import { generatePayslipHtml } from '../generate-payslip/route';
import puppeteer from 'puppeteer';

/**
 * Cette route API permet de tester rapidement la génération de fiches de paie
 * sans avoir besoin d'être authentifié ou d'utiliser le formulaire.
 */
export async function GET(req: NextRequest) {
  try {
    // Récupérer le type de données de test à utiliser depuis les paramètres de requête
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'fullTime';
    
    // Sélectionner les données de test appropriées
    let payslipData;
    switch (type) {
      case 'partTime':
        payslipData = partTimeEmployeeData;
        break;
      case 'overtime':
        payslipData = overtimeEmployeeData;
        break;
      case 'fullTime':
      default:
        payslipData = fullTimeEmployeeData;
        break;
    }
    
    // Génération du HTML de la fiche de paie
    const payslipHtml = generatePayslipHtml(payslipData);

    // HTML complet avec styles Tailwind injectés
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fiche de paie - ${payslipData.employee.lastName} ${payslipData.employee.firstName}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @page {
            margin: 15mm;
            size: A4;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div id="payslip">${payslipHtml}</div>
      </body>
      </html>
    `;

    // Lancement de Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Chargement du contenu HTML
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Attente que tous les contenus soient chargés
    await page.evaluateHandle('document.fonts.ready');
    
    // Génération du PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
    });
    
    // Fermeture du navigateur
    await browser.close();

    // Configuration des en-têtes pour le téléchargement du PDF
    const fileName = `test_fiche_paie_${payslipData.employee.lastName}_${payslipData.employee.firstName}_${payslipData.salary.period.replace(/\s/g, '_')}.pdf`;
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la génération du PDF de test:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF de test' },
      { status: 500 }
    );
  }
} 