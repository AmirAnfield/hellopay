import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

// Types pour les paramètres de la fonction
interface PayslipCalculationParams {
  userId: string;
  employeeId: string;
  companyId: string;
  payslipData: {
    month: number;
    year: number;
    periodStart: string;
    periodEnd: string;
    paymentDate: string;
    hoursWorked: number;
    hourlyRate?: number;
    paidLeaveTaken: number;
    additionalInfo?: {
      bonusAmount?: number;
      bonusDescription?: string;
      overtimeHours?: number;
      [key: string]: unknown;
    };
  };
}

interface PayslipGenerationParams {
  userId: string;
  payslipId: string;
}

interface ContributionRate {
  code: string;
  name: string;
  base: 'gross' | 'reduced' | 'custom';
  baseValue?: number;
  employeeRate: number;
  employerRate: number;
  category: 'health' | 'retirement' | 'unemployment' | 'other';
  order: number;
}

interface Contribution {
  code: string;
  name: string;
  base: number;
  employeeAmount: number;
  employerAmount: number;
  category: string;
}

/**
 * Fonction pour calculer un bulletin de paie
 */
export const calculatePayslip = onCall({
  region: 'europe-west1'
}, async (request) => {
  const data = request.data as PayslipCalculationParams;
  
  // Vérifier l'authentification
  if (!request.auth) {
    throw new Error('Vous devez être authentifié pour effectuer cette opération.');
  }

  // Vérifier que l'utilisateur a le droit de calculer ce bulletin
  if (request.auth.uid !== data.userId) {
    throw new Error('Vous n\'avez pas les droits pour effectuer cette opération.');
  }

  try {
    // Récupérer les données de l'employé
    const employeeSnapshot = await admin.firestore()
      .collection(`users/${data.userId}/companies/${data.companyId}/employees`)
      .doc(data.employeeId)
      .get();
    
    if (!employeeSnapshot.exists) {
      throw new Error('Employé non trouvé.');
    }
    
    const employee = employeeSnapshot.data();
    
    // Récupérer les données de l'entreprise
    const companySnapshot = await admin.firestore()
      .collection(`users/${data.userId}/companies`)
      .doc(data.companyId)
      .get();
    
    if (!companySnapshot.exists) {
      throw new Error('Entreprise non trouvée.');
    }
    
    const company = companySnapshot.data();

    // Convertir les dates
    const periodStart = new Date(data.payslipData.periodStart);
    const periodEnd = new Date(data.payslipData.periodEnd);
    const paymentDate = new Date(data.payslipData.paymentDate);
    const fiscalYear = data.payslipData.year;

    // Récupérer les taux de cotisations pour l'année fiscale
    const ratesSnapshot = await admin.firestore()
      .collection('publicData/cotisations/rates')
      .where('year', '==', fiscalYear)
      .where('isActive', '==', true)
      .orderBy('effectiveFrom', 'desc')
      .limit(1)
      .get();

    if (ratesSnapshot.empty) {
      throw new Error(`Aucun taux de cotisation trouvé pour l'année ${fiscalYear}.`);
    }

    const ratesData = ratesSnapshot.docs[0].data();
    const rates: ContributionRate[] = JSON.parse(ratesData.ratesJson || '[]');

    // Calculer le salaire brut
    const hourlyRate = data.payslipData.hourlyRate || employee?.hourlyRate || 0;
    const hoursWorked = data.payslipData.hoursWorked;
    const grossSalary = hourlyRate * hoursWorked;

    // Calculer les cotisations
    const contributions = calculateContributions(grossSalary, rates);
    const employeeContributions = contributions.reduce((sum, c) => sum + c.employeeAmount, 0);
    const employerContributions = contributions.reduce((sum, c) => sum + c.employerAmount, 0);

    // Calculer le salaire net et le coût employeur
    const netSalary = grossSalary - employeeContributions;
    const employerCost = grossSalary + employerContributions;

    // Calculer les congés payés
    // Base: 2.5 jours de congés par mois travaillé à temps plein
    const daysPerMonth = 2.5;
    const paidLeaveAcquired = daysPerMonth * (hoursWorked / 151.67); // 151.67 = heures mensuelles légales à temps plein
    const paidLeaveTaken = data.payslipData.paidLeaveTaken;
    
    // Récupérer le solde précédent des congés payés
    const previousPayslipsSnapshot = await admin.firestore()
      .collection(`users/${data.userId}/companies/${data.companyId}/payslips`)
      .where('employeeId', '==', data.employeeId)
      .where('year', '==', fiscalYear)
      .where('month', '<', data.payslipData.month)
      .orderBy('month', 'desc')
      .limit(1)
      .get();
    
    let previousPaidLeaveRemaining = 0;
    
    if (!previousPayslipsSnapshot.empty) {
      const previousPayslip = previousPayslipsSnapshot.docs[0].data();
      previousPaidLeaveRemaining = previousPayslip.paidLeaveRemaining || 0;
    }
    
    const paidLeaveRemaining = previousPaidLeaveRemaining + paidLeaveAcquired - paidLeaveTaken;

    // Calculer les cumuls annuels
    const cumulativePayslipsSnapshot = await admin.firestore()
      .collection(`users/${data.userId}/companies/${data.companyId}/payslips`)
      .where('employeeId', '==', data.employeeId)
      .where('year', '==', fiscalYear)
      .where('month', '<', data.payslipData.month)
      .get();
    
    let cumulativeGrossSalary = grossSalary;
    let cumulativeNetSalary = netSalary;
    let cumulStart = periodStart;
    const cumulEnd = periodEnd;
    
    if (!cumulativePayslipsSnapshot.empty) {
      for (const doc of cumulativePayslipsSnapshot.docs) {
        const payslip = doc.data();
        cumulativeGrossSalary += payslip.grossAmount || 0;
        cumulativeNetSalary += payslip.netAmount || 0;
        
        // Mise à jour des dates du cumul
        const payslipStart = payslip.periodStart instanceof admin.firestore.Timestamp 
          ? payslip.periodStart.toDate() 
          : new Date(payslip.periodStart);
        
        if (payslipStart < cumulStart) {
          cumulStart = payslipStart;
        }
      }
    }

    // Créer l'objet bulletin de paie
    const payslip = {
      employeeId: data.employeeId,
      companyId: data.companyId,
      month: data.payslipData.month,
      year: data.payslipData.year,
      periodStart,
      periodEnd,
      paymentDate,
      hourlyRate,
      hoursWorked,
      grossAmount: grossSalary,
      netAmount: netSalary,
      taxAmount: employeeContributions,
      otherDeductions: 0, // À compléter si besoin
      employerCost,
      contributionsDetails: JSON.stringify(contributions),
      paidLeaveAcquired,
      paidLeaveTaken,
      paidLeaveRemaining,
      cumulativeGrossSalary,
      cumulativeNetSalary,
      cumulativePeriodStart: cumulStart,
      cumulativePeriodEnd: cumulEnd,
      status: 'draft',
      employerName: company?.name || '',
      employerAddress: company ? `${company.address}, ${company.postalCode} ${company.city}` : '',
      employerSiret: company?.siret || '',
      employerUrssaf: company?.urssafNumber || '',
      employeeName: employee ? `${employee.firstName} ${employee.lastName}` : '',
      employeeAddress: employee ? `${employee.address}, ${employee.postalCode} ${employee.city}` : '',
      employeePosition: employee?.position || '',
      employeeSocialSecurityNumber: employee?.socialSecurityNumber || '',
      isExecutive: employee?.isExecutive || false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lineItems: contributions.map(c => ({
        label: c.name,
        amount: c.employeeAmount + c.employerAmount,
        type: c.category === 'health' ? 'deduction' : 
              c.category === 'retirement' ? 'deduction' : 
              c.category === 'unemployment' ? 'deduction' : 'tax',
        quantity: 1,
        rate: ((c.employeeAmount + c.employerAmount) / c.base) * 100,
        baseAmount: c.base
      }))
    };

    return payslip;
  } catch (error) {
    console.error('Erreur lors du calcul du bulletin:', error);
    throw new Error(`Erreur lors du calcul du bulletin: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Fonction pour générer le PDF d'un bulletin de paie
 */
export const generatePayslipPdf = onCall({
  region: 'europe-west1',
  timeoutSeconds: 300,
  memory: '1GiB',
}, async (request) => {
  const data = request.data as PayslipGenerationParams;
  
  // Vérifier l'authentification
  if (!request.auth) {
    throw new Error('Vous devez être authentifié pour effectuer cette opération.');
  }

  // Vérifier que l'utilisateur a le droit de générer ce bulletin
  if (request.auth.uid !== data.userId) {
    throw new Error('Vous n\'avez pas les droits pour effectuer cette opération.');
  }

  try {
    // Récupérer les données du bulletin
    const payslipSnapshot = await admin.firestore()
      .collection(`users/${data.userId}/payslips`)
      .doc(data.payslipId)
      .get();

    if (!payslipSnapshot.exists) {
      throw new Error('Bulletin de paie non trouvé.');
    }

    const payslip = payslipSnapshot.data();
    if (!payslip) {
      throw new Error('Données du bulletin indisponibles.');
    }

    // Générer le contenu HTML du bulletin
    const htmlContent = generatePayslipHtml(payslip);

    // Créer un dossier temporaire pour stocker le PDF
    const tempDir = os.tmpdir();
    const pdfPath = path.join(tempDir, `${data.payslipId}.pdf`);

    // Lancer un navigateur headless avec Puppeteer
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });

    try {
      const page = await browser.newPage();

      // Configuration de la page
      await page.setViewport({ width: 1240, height: 1754 }); // Taille A4
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // Générer le PDF
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm'
        }
      });
    } finally {
      // Fermer le navigateur quoi qu'il arrive
      await browser.close();
    }

    // Lire le fichier PDF
    const pdfBuffer = fs.readFileSync(pdfPath);

    // Créer le chemin dans Storage
    const storagePath = `users/${data.userId}/payslips/${data.payslipId}.pdf`;

    // Télécharger le PDF vers Firebase Storage
    const bucket = admin.storage().bucket();
    const file = bucket.file(storagePath);

    await file.save(pdfBuffer, {
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          payslipId: data.payslipId,
          userId: data.userId,
          generatedAt: new Date().toISOString(),
        }
      }
    });

    // Générer une URL signée avec une durée de vie limitée (7 jours)
    const signedUrls = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    // Nettoyer le fichier temporaire
    fs.unlinkSync(pdfPath);

    // Mettre à jour le document avec l'URL du PDF
    await admin.firestore()
      .collection(`users/${data.userId}/payslips`)
      .doc(data.payslipId)
      .update({
        pdfUrl: signedUrls[0],
        pdfGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Renvoyer l'URL signée
    return { pdfUrl: signedUrls[0] };

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw new Error(`Erreur lors de la génération du PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
});

/**
 * Calcule les cotisations pour un salaire brut donné
 */
function calculateContributions(grossSalary: number, rates: ContributionRate[]): Contribution[] {
  const contributions: Contribution[] = [];

  // Calculer chaque contribution selon son taux
  for (const rate of rates) {
    let base = 0;

    // Déterminer la base de calcul
    switch (rate.base) {
      case 'gross':
        base = grossSalary;
        break;
      case 'reduced':
        // Par exemple, base réduite pour certaines cotisations plafonnées
        base = Math.min(grossSalary, 3428); // Plafond mensuel de la sécurité sociale 2023
        break;
      case 'custom':
        base = rate.baseValue || 0;
        break;
      default:
        base = grossSalary;
    }

    // Calculer les montants
    const employeeAmount = Math.round((base * rate.employeeRate / 100) * 100) / 100; // Arrondi à 2 décimales
    const employerAmount = Math.round((base * rate.employerRate / 100) * 100) / 100;

    // Ajouter la contribution à la liste
    contributions.push({
      code: rate.code,
      name: rate.name,
      base,
      employeeAmount,
      employerAmount,
      category: rate.category
    });
  }

  // Trier les contributions par catégorie et par nom
  return contributions.sort((a, b) => {
    if (a.category === b.category) {
      return a.name.localeCompare(b.name);
    }
    return a.category.localeCompare(b.category);
  });
}

/**
 * Génère le HTML pour le bulletin de paie
 */
function generatePayslipHtml(payslip: Record<string, unknown>): string {
  // Formater les dates
  const formatDate = (date: Date | string | admin.firestore.Timestamp): string => {
    if (date instanceof admin.firestore.Timestamp) {
      date = date.toDate();
    }
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  };

  // Formater les montants
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  };

  // Parsez les détails des cotisations
  let contributionsDetails: Contribution[] = [];
  try {
    const detailsString = typeof payslip.contributionsDetails === 'string' 
      ? payslip.contributionsDetails 
      : '[]';
    contributionsDetails = JSON.parse(detailsString);
  } catch (error) {
    console.error('Erreur de parsing des cotisations:', error);
    contributionsDetails = [];
  }

  // Extraire les valeurs avec conversion de type
  const employerName = String(payslip.employerName || '');
  const employerAddress = String(payslip.employerAddress || '');
  const employerSiret = String(payslip.employerSiret || '');
  const employerUrssaf = String(payslip.employerUrssaf || '');
  
  const employeeName = String(payslip.employeeName || '');
  const employeeAddress = String(payslip.employeeAddress || '');
  const employeeSocialSecurityNumber = String(payslip.employeeSocialSecurityNumber || '');
  const employeePosition = String(payslip.employeePosition || '');
  const isExecutive = Boolean(payslip.isExecutive);
  
  const hoursWorked = Number(payslip.hoursWorked || 0);
  const hourlyRate = Number(payslip.hourlyRate || 0);
  const grossAmount = Number(payslip.grossAmount || 0);
  const netAmount = Number(payslip.netAmount || 0);
  const taxAmount = Number(payslip.taxAmount || 0);
  const employerCost = Number(payslip.employerCost || 0);
  
  const paidLeaveAcquired = Number(payslip.paidLeaveAcquired || 0);
  const paidLeaveTaken = Number(payslip.paidLeaveTaken || 0);
  const paidLeaveRemaining = Number(payslip.paidLeaveRemaining || 0);
  
  const cumulativeGrossSalary = Number(payslip.cumulativeGrossSalary || 0);
  const cumulativeNetSalary = Number(payslip.cumulativeNetSalary || 0);
  const year = Number(payslip.year || new Date().getFullYear());

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bulletin de paie</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .subtitle {
          font-size: 16px;
          color: #666;
        }
        .infos {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .employer-info, .employee-info {
          width: 48%;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .info-row {
          margin-bottom: 5px;
        }
        .info-label {
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        .amount {
          text-align: right;
        }
        .total-row {
          font-weight: bold;
          background-color: #f2f2f2;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">BULLETIN DE PAIE</div>
          <div class="subtitle">Période du ${formatDate(payslip.periodStart as Date | string | admin.firestore.Timestamp)} au ${formatDate(payslip.periodEnd as Date | string | admin.firestore.Timestamp)}</div>
        </div>
        
        <div class="infos">
          <div class="employer-info">
            <div class="section-title">EMPLOYEUR</div>
            <div class="info-row"><span class="info-label">Raison sociale :</span> ${employerName}</div>
            <div class="info-row"><span class="info-label">Adresse :</span> ${employerAddress}</div>
            <div class="info-row"><span class="info-label">SIRET :</span> ${employerSiret}</div>
            <div class="info-row"><span class="info-label">N° URSSAF :</span> ${employerUrssaf}</div>
          </div>
          
          <div class="employee-info">
            <div class="section-title">SALARIÉ</div>
            <div class="info-row"><span class="info-label">Nom :</span> ${employeeName}</div>
            <div class="info-row"><span class="info-label">Adresse :</span> ${employeeAddress}</div>
            <div class="info-row"><span class="info-label">N° Sécurité Sociale :</span> ${employeeSocialSecurityNumber}</div>
            <div class="info-row"><span class="info-label">Emploi :</span> ${employeePosition}</div>
            <div class="info-row"><span class="info-label">Statut :</span> ${isExecutive ? 'Cadre' : 'Non cadre'}</div>
          </div>
        </div>
        
        <div class="section-title">RÉMUNÉRATION</div>
        <table>
          <thead>
            <tr>
              <th>Élément</th>
              <th>Base</th>
              <th>Taux</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Salaire de base</td>
              <td>${hoursWorked} h</td>
              <td>${formatAmount(hourlyRate)}/h</td>
              <td class="amount">${formatAmount(grossAmount)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3">SALAIRE BRUT</td>
              <td class="amount">${formatAmount(grossAmount)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="section-title">COTISATIONS ET CONTRIBUTIONS</div>
        <table>
          <thead>
            <tr>
              <th>Libellé</th>
              <th>Base</th>
              <th>Part salariale</th>
              <th>Part patronale</th>
            </tr>
          </thead>
          <tbody>
            ${contributionsDetails.map(c => `
              <tr>
                <td>${c.name}</td>
                <td>${formatAmount(c.base)}</td>
                <td class="amount">${formatAmount(c.employeeAmount)}</td>
                <td class="amount">${formatAmount(c.employerAmount)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2">TOTAL DES COTISATIONS</td>
              <td class="amount">${formatAmount(taxAmount)}</td>
              <td class="amount">${formatAmount(employerCost - grossAmount)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="section-title">TOTAUX</div>
        <table>
          <thead>
            <tr>
              <th>Salaire brut</th>
              <th>Total cotisations</th>
              <th>Net à payer</th>
              <th>Coût total employeur</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="amount">${formatAmount(grossAmount)}</td>
              <td class="amount">${formatAmount(taxAmount)}</td>
              <td class="amount">${formatAmount(netAmount)}</td>
              <td class="amount">${formatAmount(employerCost)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="section-title">CONGÉS PAYÉS</div>
        <table>
          <thead>
            <tr>
              <th>Congés acquis</th>
              <th>Congés pris</th>
              <th>Solde restant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${paidLeaveAcquired.toFixed(2)} jours</td>
              <td>${paidLeaveTaken.toFixed(2)} jours</td>
              <td>${paidLeaveRemaining.toFixed(2)} jours</td>
            </tr>
          </tbody>
        </table>
        
        <div class="section-title">CUMULS ANNUELS (${year})</div>
        <table>
          <thead>
            <tr>
              <th>Salaire brut</th>
              <th>Salaire net</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="amount">${formatAmount(cumulativeGrossSalary)}</td>
              <td class="amount">${formatAmount(cumulativeNetSalary)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>Bulletin de paie édité le ${formatDate(new Date())} - HelloPay</p>
          <p>Document à conserver sans limitation de durée</p>
        </div>
      </div>
    </body>
    </html>
  `;
} 