import puppeteer from 'puppeteer';
import { PayslipData } from '@/components/payslip/PayslipCalculator';

export class PayslipPdfService {
  private static instance: PayslipPdfService;
  private browser: puppeteer.Browser | null = null;

  private constructor() {}

  public static getInstance(): PayslipPdfService {
    if (!PayslipPdfService.instance) {
      PayslipPdfService.instance = new PayslipPdfService();
    }
    return PayslipPdfService.instance;
  }

  public async generatePDF(payslipData: PayslipData): Promise<Buffer> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    const page = await this.browser.newPage();
    await page.setViewport({ width: 210 * 3.78, height: 297 * 3.78 }); // A4 en pixels

    // Générer le HTML de la fiche de paie
    const html = this.generatePayslipHTML(payslipData);
    await page.setContent(html);

    // Générer le PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });

    await page.close();
    return pdf;
  }

  private generatePayslipHTML(data: PayslipData): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date(date));
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 8pt;
              line-height: 1.2;
              margin: 0;
              padding: 0;
            }
            .payslip-container {
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              background-color: white;
            }
            .header {
              margin-bottom: 20px;
              border-bottom: 1px solid #000;
              padding-bottom: 10px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 10pt;
              font-weight: bold;
              margin-bottom: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              padding: 5px;
              border: 1px solid #ddd;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
            .text-right {
              text-align: right;
            }
            .bold {
              font-weight: bold;
            }
            .bg-gray {
              background-color: #f5f5f5;
            }
            .legal-mentions {
              font-size: 7pt;
              color: #666;
              margin-top: 20px;
              border-top: 1px solid #000;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="payslip-container">
            <!-- En-tête -->
            <div class="header">
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <h2 style="margin: 0 0 5px 0; font-size: 12pt;">${data.employerName}</h2>
                  <p style="margin: 0;">${data.employerAddress}</p>
                  <p style="margin: 0;">SIRET : ${data.employerSiret}</p>
                  <p style="margin: 0;">N° URSSAF : ${data.employerUrssaf}</p>
                </div>
                <div style="text-align: right;">
                  <h2 style="margin: 0 0 5px 0; font-size: 12pt;">Fiche de paie</h2>
                  <p style="margin: 0;">Période : ${formatDate(data.periodStart)} au ${formatDate(data.periodEnd)}</p>
                  <p style="margin: 0;">Date de paiement : ${formatDate(data.paymentDate)}</p>
                </div>
              </div>
            </div>

            <!-- Informations salarié -->
            <div class="section">
              <div class="section-title">Salarié</div>
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <p style="margin: 0;">${data.employeeName}</p>
                  <p style="margin: 0;">${data.employeeAddress}</p>
                  <p style="margin: 0;">Poste : ${data.employeePosition}</p>
                  <p style="margin: 0;">N° Sécurité sociale : ${data.employeeSocialSecurityNumber}</p>
                </div>
                <div style="text-align: right;">
                  <p style="margin: 0;">Statut : ${data.isExecutive ? 'Cadre' : 'Non-cadre'}</p>
                  <p style="margin: 0;">Taux horaire : ${formatCurrency(data.hourlyRate)}</p>
                  <p style="margin: 0;">Heures travaillées : ${data.hoursWorked}</p>
                </div>
              </div>
            </div>

            <!-- Rémunération et cotisations -->
            <div class="section">
              <div class="section-title">Rémunération et cotisations</div>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th class="text-right">Base</th>
                    <th class="text-right">Taux</th>
                    <th class="text-right">Salarié</th>
                    <th class="text-right">Employeur</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Salaire brut</td>
                    <td class="text-right">${formatCurrency(data.grossSalary)}</td>
                    <td class="text-right">-</td>
                    <td class="text-right">${formatCurrency(data.grossSalary)}</td>
                    <td class="text-right">-</td>
                  </tr>
                  ${data.contributions.details.map(detail => `
                    <tr>
                      <td>${detail.contribution.name}</td>
                      <td class="text-right">${formatCurrency(data.grossSalary)}</td>
                      <td class="text-right">${detail.contribution.employeeRate}% / ${detail.contribution.employerRate}%</td>
                      <td class="text-right">${formatCurrency(detail.employeeAmount)}</td>
                      <td class="text-right">${formatCurrency(detail.employerAmount)}</td>
                    </tr>
                  `).join('')}
                  <tr class="bg-gray">
                    <td class="bold">Total</td>
                    <td class="text-right">-</td>
                    <td class="text-right">-</td>
                    <td class="text-right bold">${formatCurrency(data.contributions.employee)}</td>
                    <td class="text-right bold">${formatCurrency(data.contributions.employer)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Congés payés -->
            <div class="section">
              <div class="section-title">Congés payés</div>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th class="text-right">Acquis</th>
                    <th class="text-right">Pris</th>
                    <th class="text-right">Restant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Congés payés</td>
                    <td class="text-right">${data.paidLeaveDays.acquired}</td>
                    <td class="text-right">${data.paidLeaveDays.taken}</td>
                    <td class="text-right">${data.paidLeaveDays.remaining}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Récapitulatif -->
            <div class="section">
              <div class="section-title">Récapitulatif</div>
              <table>
                <tbody>
                  <tr>
                    <td>Salaire brut</td>
                    <td class="text-right">${formatCurrency(data.grossSalary)}</td>
                  </tr>
                  <tr>
                    <td>Cotisations salariales</td>
                    <td class="text-right">${formatCurrency(data.contributions.employee)}</td>
                  </tr>
                  <tr class="bg-gray">
                    <td class="bold">Salaire net</td>
                    <td class="text-right bold">${formatCurrency(data.netSalary)}</td>
                  </tr>
                  <tr>
                    <td>Cotisations patronales</td>
                    <td class="text-right">${formatCurrency(data.contributions.employer)}</td>
                  </tr>
                  <tr class="bg-gray">
                    <td class="bold">Coût employeur</td>
                    <td class="text-right bold">${formatCurrency(data.employerCost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Cumuls -->
            <div class="section">
              <div class="section-title">Cumuls annuels</div>
              <table>
                <tbody>
                  <tr>
                    <td>Salaire brut cumulé</td>
                    <td class="text-right">${formatCurrency(data.cumulativeGrossSalary)}</td>
                  </tr>
                  <tr class="bg-gray">
                    <td class="bold">Salaire net cumulé</td>
                    <td class="text-right bold">${formatCurrency(data.cumulativeNetSalary)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mentions légales -->
            <div class="legal-mentions">
              <p style="margin: 0 0 5px 0;">
                Cette fiche de paie est établie conformément aux dispositions légales et conventionnelles en vigueur.
                Elle doit être conservée pendant une durée minimale de 5 ans.
              </p>
              <p style="margin: 0;">
                En cas de contestation, le salarié dispose d'un délai de 3 ans pour saisir le conseil de prud'hommes.
                Le salarié est tenu de vérifier les informations portées sur cette fiche de paie et de signaler toute erreur à l'employeur.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  public async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
} 