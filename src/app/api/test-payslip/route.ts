import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { fullTimeEmployeeData, partTimeEmployeeData, overtimeEmployeeData } from '@/components/payslip/TestPayslipData';

// Type pour les détails de cotisation
interface ContributionDetail {
  name: string;
  base: number;
  employeeRate: number;
  employerRate: number;
  employeeAmount: number;
  employerAmount: number;
}

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
    
    // HTML simplifié pour le test
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fiche de paie test</title>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .amount { text-align: right; }
          .total { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <h1>Bulletin de Paie</h1>
              <p>Période: ${new Date(payslipData.periodStart).toLocaleDateString('fr-FR')} - ${new Date(payslipData.periodEnd).toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
              <h2>${payslipData.employerName}</h2>
              <p>${payslipData.employerAddress}</p>
              <p>SIRET: ${payslipData.employerSiret}</p>
            </div>
          </div>
          
          <div class="section">
            <h2>Informations salarié</h2>
            <p><strong>Nom:</strong> ${payslipData.employeeName}</p>
            <p><strong>Adresse:</strong> ${payslipData.employeeAddress}</p>
            <p><strong>Numéro SS:</strong> ${payslipData.employeeSocialSecurityNumber}</p>
            <p><strong>Poste:</strong> ${payslipData.employeePosition}</p>
          </div>
          
          <div class="section">
            <h2>Rémunération</h2>
            <table>
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th>Base</th>
                  <th>Taux</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Salaire de base</td>
                  <td>${payslipData.hoursWorked} h</td>
                  <td>${payslipData.hourlyRate} €/h</td>
                  <td class="amount">${payslipData.grossSalary.toFixed(2)} €</td>
                </tr>
                ${payslipData.contributions.details.map((contribution: ContributionDetail) => `
                  <tr>
                    <td>${contribution.name}</td>
                    <td>${contribution.base.toFixed(2)} €</td>
                    <td>${(contribution.employeeRate * 100).toFixed(2)} %</td>
                    <td class="amount">-${contribution.employeeAmount.toFixed(2)} €</td>
                  </tr>
                `).join('')}
                <tr class="total">
                  <td colspan="3">Net à payer</td>
                  <td class="amount">${payslipData.netSalary.toFixed(2)} €</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h2>Cotisations patronales</h2>
            <p>Total des cotisations patronales: <strong>${payslipData.contributions.employer.toFixed(2)} €</strong></p>
            <p>Coût total employeur: <strong>${payslipData.employerCost.toFixed(2)} €</strong></p>
          </div>
          
          <div class="section">
            <h2>Congés payés</h2>
            <p>Acquis ce mois: ${payslipData.paidLeaveDays.acquired} jours</p>
            <p>Pris ce mois: ${payslipData.paidLeaveDays.taken} jours</p>
            <p>Solde: ${payslipData.paidLeaveDays.remaining} jours</p>
          </div>
          
          <div class="section">
            <p style="text-align: center; font-size: 12px; color: #666;">
              Document généré à titre d'exemple par HelloPay
            </p>
          </div>
        </div>
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
    
    // Génération du PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
    });
    
    // Fermeture du navigateur
    await browser.close();

    // Configuration des en-têtes pour le téléchargement du PDF
    const fileName = `fiche_paie_test_${payslipData.employeeName.replace(/\s/g, '_')}.pdf`;
    
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