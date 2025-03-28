import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PayslipProps } from '@/src/components/payslip/PayslipTemplate';
import { Contribution } from '@/src/components/payslip/FrenchContributions';

// Fonction pour formater les montants en devise EUR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(amount);
};

// Génère le HTML de la fiche de paie directement à partir des données
export const generatePayslipHtml = (data: PayslipProps): string => {
  const { employee, employer, salary } = data;

  // Fonctions de formatage pour les montants et pourcentages
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined) return '';
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value: number | undefined): string => {
    if (value === undefined) return '';
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Génération des lignes du tableau pour les éléments de salaire
  const salaryItemsHtml = salary.items.map((item, index) => `
    <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
      <td class="border border-gray-300 p-2 text-left">${item.label}</td>
      <td class="border border-gray-300 p-2 text-right">${formatNumber(item.base)}</td>
      <td class="border border-gray-300 p-2 text-right">${item.rate !== undefined ? formatPercent(item.rate) : ''}</td>
      <td class="border border-gray-300 p-2 text-right font-semibold">
        ${item.isAddition ? '+' : '-'} ${formatCurrency(item.amount)}
      </td>
    </tr>
  `).join('');

  // Contenu HTML complet de la fiche de paie
  return `
    <div class="max-w-[210mm] mx-auto bg-white p-6 print:p-0" style="font-family: sans-serif;">
      <!-- En-tête de la fiche de paie -->
      <div class="flex justify-between items-start border-b border-gray-300 pb-4 mb-4">
        <div>
          <h1 class="text-2xl font-bold">Bulletin de paie</h1>
          <p class="text-gray-600">Période: ${salary.period}</p>
          <p class="text-gray-600">Du ${salary.periodStart} au ${salary.periodEnd}</p>
        </div>
        <div class="text-right">
          <p class="font-bold">${employer.name}</p>
          <p>${employer.address}</p>
          <p>${employer.postalCode} ${employer.city}</p>
          <p>SIRET: ${employer.siret}</p>
          <p>Code APE: ${employer.ape}</p>
        </div>
      </div>

      <!-- Informations du salarié -->
      <div class="border-b border-gray-300 pb-4 mb-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h2 class="font-bold mb-2">Salarié</h2>
            <p class="font-bold">${employee.lastName} ${employee.firstName}</p>
            <p>${employee.address}</p>
            <p>${employee.postalCode} ${employee.city}</p>
            <p>N° SS: ${employee.socialSecurityNumber}</p>
          </div>
          <div>
            <h2 class="font-bold mb-2">Emploi</h2>
            <p>${employee.position}</p>
            <p>Date d'embauche: ${employee.employmentDate}</p>
          </div>
        </div>
      </div>

      <!-- Détails de la rémunération -->
      <div class="mb-4">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 p-2 text-left">Désignation</th>
              <th class="border border-gray-300 p-2 text-right">Base</th>
              <th class="border border-gray-300 p-2 text-right">Taux</th>
              <th class="border border-gray-300 p-2 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            ${salaryItemsHtml}
          </tbody>
        </table>
      </div>

      <!-- Résumé des totaux -->
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div class="bg-gray-100 p-3 rounded">
          <h3 class="font-bold mb-1 text-sm">Salaire brut</h3>
          <p class="text-xl font-semibold">${formatCurrency(salary.grossSalary)}</p>
        </div>
        <div class="bg-gray-100 p-3 rounded">
          <h3 class="font-bold mb-1 text-sm">Net à payer avant impôt</h3>
          <p class="text-xl font-semibold">${formatCurrency(salary.netBeforeTax)}</p>
        </div>
        <div class="bg-gray-100 p-3 rounded">
          <h3 class="font-bold mb-1 text-sm">Net à payer</h3>
          <p class="text-xl font-semibold text-green-600">${formatCurrency(salary.netToPay)}</p>
        </div>
      </div>

      <!-- Net social et détails des cotisations -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="p-3 border border-gray-300 rounded">
          <h3 class="font-bold mb-1 text-sm">Net social (pour calcul prime d'activité)</h3>
          <p class="text-lg font-semibold">${formatCurrency(salary.netSocial)}</p>
        </div>
        <div class="p-3 border border-gray-300 rounded">
          <div class="flex justify-between mb-1">
            <h3 class="font-bold text-sm">Total cotisations salariales</h3>
            <p class="font-semibold">${formatCurrency(salary.totalEmployeeContributions)}</p>
          </div>
          <div class="flex justify-between">
            <h3 class="font-bold text-sm">Total cotisations patronales</h3>
            <p class="font-semibold">${formatCurrency(salary.totalEmployerContributions)}</p>
          </div>
        </div>
      </div>

      <!-- Méthode de paiement et mentions légales -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="p-3 border border-gray-300 rounded bg-gray-50">
          <h3 class="font-bold mb-1 text-sm">Mode de paiement</h3>
          <p>${salary.paymentMethod}</p>
          <p>Date: ${salary.paymentDate}</p>
        </div>
        <div class="p-3 border border-gray-300 rounded bg-gray-50">
          <p class="text-xs text-gray-600">
            Ce bulletin de salaire est à conserver sans limitation de durée.<br />
            Pour information, l'ensemble des cotisations sont versées à l'URSSAF.
          </p>
        </div>
      </div>

      <!-- Informations supplémentaires et footer -->
      <div class="text-center text-xs text-gray-500 mt-8">
        <p>Bulletin de paie édité par HelloPay</p>
        <p>Conforme à la législation française en vigueur</p>
      </div>

      <!-- Tableau détaillé des cotisations sociales -->
      ${generateContributionsTable(salary.contributions, salary.grossSalary)}
    </div>
  `;
};

// Nouvelle fonction pour générer le tableau des cotisations
const generateContributionsTable = (contributions: Contribution[] | undefined, grossSalary: number) => {
  if (!contributions || contributions.length === 0) {
    return '';
  }

  // Filtrer les cotisations actives
  const activeContributions = contributions.filter(c => c.isRequired);
  
  if (activeContributions.length === 0) {
    return '';
  }

  // Regrouper par catégorie
  const categorizedContributions: Record<string, Contribution[]> = {};
  
  activeContributions.forEach(contribution => {
    if (!categorizedContributions[contribution.category]) {
      categorizedContributions[contribution.category] = [];
    }
    categorizedContributions[contribution.category].push(contribution);
  });

  // Fonction pour calculer le montant des cotisations
  const calculateAmount = (rate: number, baseType: string) => {
    if (baseType === 'total') {
      return (grossSalary * rate) / 100;
    } else if (baseType === 'plafond' || baseType === 'trancheA') {
      const cap = 3864; // Plafond mensuel de la sécurité sociale 2024
      return (Math.min(grossSalary, cap) * rate) / 100;
    } else if (baseType === 'trancheB') {
      const cap = 3864;
      const excess = Math.max(0, Math.min(grossSalary, cap * 8) - cap);
      return (excess * rate) / 100;
    }
    return 0;
  };

  // Totaux des cotisations
  let totalEmployeeAmount = 0;
  let totalEmployerAmount = 0;

  let tableHtml = `
    <div>
      <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem;">Détail des cotisations sociales</h3>
      <table class="contributions-table">
        <thead>
          <tr>
            <th>Cotisation</th>
            <th>Base</th>
            <th>Taux salarial</th>
            <th>Montant salarial</th>
            <th>Taux patronal</th>
            <th>Montant patronal</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Générer les lignes du tableau pour chaque catégorie
  Object.entries(categorizedContributions).forEach(([category, contribs]) => {
    let categoryEmployeeTotal = 0;
    let categoryEmployerTotal = 0;
    
    // Calculer les totaux par catégorie
    contribs.forEach(contrib => {
      categoryEmployeeTotal += calculateAmount(contrib.employeeRate, contrib.baseType);
      categoryEmployerTotal += calculateAmount(contrib.employerRate, contrib.baseType);
    });
    
    totalEmployeeAmount += categoryEmployeeTotal;
    totalEmployerAmount += categoryEmployerTotal;
    
    // Ligne de titre de catégorie
    const categoryLabel = 
      category === 'securite_sociale' ? 'Sécurité Sociale' :
      category === 'retraite' ? 'Retraite' :
      category === 'chomage' ? 'Chômage' :
      category === 'csg_crds' ? 'CSG / CRDS' :
      'Autres cotisations';
    
    tableHtml += `
      <tr class="contributions-category">
        <td colspan="6">${categoryLabel}</td>
      </tr>
    `;
    
    // Lignes de cotisations
    contribs.forEach((contrib, index) => {
      const employeeAmount = calculateAmount(contrib.employeeRate, contrib.baseType);
      const employerAmount = calculateAmount(contrib.employerRate, contrib.baseType);
      
      let baseDisplay = '';
      if (contrib.baseType === 'total') {
        baseDisplay = formatCurrency(grossSalary);
      } else if (contrib.baseType === 'plafond') {
        baseDisplay = `${formatCurrency(Math.min(grossSalary, 3864))} (P.SS)`;
      } else if (contrib.baseType === 'trancheA') {
        baseDisplay = `${formatCurrency(Math.min(grossSalary, 3864))} (T.A)`;
      } else if (contrib.baseType === 'trancheB') {
        baseDisplay = `${formatCurrency(Math.max(0, Math.min(grossSalary, 3864 * 8) - 3864))} (T.B)`;
      }
      
      const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
      
      tableHtml += `
        <tr class="${rowClass}">
          <td>${contrib.name}</td>
          <td class="rate-cell">${baseDisplay}</td>
          <td class="rate-cell">${contrib.employeeRate > 0 ? `${contrib.employeeRate.toFixed(2)}%` : '-'}</td>
          <td class="amount-cell">${employeeAmount > 0 ? formatCurrency(employeeAmount) : '-'}</td>
          <td class="rate-cell">${contrib.employerRate > 0 ? `${contrib.employerRate.toFixed(2)}%` : '-'}</td>
          <td class="amount-cell">${employerAmount > 0 ? formatCurrency(employerAmount) : '-'}</td>
        </tr>
      `;
    });
    
    // Ligne total de la catégorie
    tableHtml += `
      <tr class="contributions-category">
        <td>Total ${categoryLabel}</td>
        <td></td>
        <td></td>
        <td class="amount-cell">${formatCurrency(categoryEmployeeTotal)}</td>
        <td></td>
        <td class="amount-cell">${formatCurrency(categoryEmployerTotal)}</td>
      </tr>
    `;
  });
  
  // Ligne Total général
  tableHtml += `
      <tr class="contributions-total">
        <td>Total des cotisations</td>
        <td></td>
        <td></td>
        <td class="amount-cell">${formatCurrency(totalEmployeeAmount)}</td>
        <td></td>
        <td class="amount-cell">${formatCurrency(totalEmployerAmount)}</td>
      </tr>
    </tbody>
    </table>
  </div>
  `;
  
  return tableHtml;
};

export async function POST(req: NextRequest) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Récupération des données de la requête
    const data = await req.json();
    if (!data) {
      return NextResponse.json(
        { error: 'Données de fiche de paie manquantes' },
        { status: 400 }
      );
    }

    // Validation des données (version simplifiée)
    const payslipData = data as PayslipProps;
    if (!payslipData.employee || !payslipData.employer || !payslipData.salary) {
      return NextResponse.json(
        { error: 'Données de fiche de paie incomplètes' },
        { status: 400 }
      );
    }

    // Génération du HTML de la fiche de paie sans utiliser ReactDOMServer
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
          /* Styles additionnels pour les tableaux de cotisations */
          .contributions-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1.5rem;
          }
          .contributions-table th, .contributions-table td {
            border: 1px solid #ddd;
            padding: 0.5rem;
          }
          .contributions-table th {
            background-color: #f5f5f5;
            text-align: left;
          }
          .contributions-category {
            background-color: #f9f9f9;
            font-weight: 500;
          }
          .contributions-total {
            background-color: #eee;
            font-weight: 700;
          }
          .amount-cell {
            text-align: right;
          }
          .rate-cell {
            text-align: center;
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
    const fileName = `fiche_paie_${payslipData.employee.lastName}_${payslipData.employee.firstName}_${payslipData.salary.period.replace(/\s/g, '_')}.pdf`;
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
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

// Pour supporter la prévisualisation de l'API dans Swagger ou des outils similaires
export async function GET() {
  return NextResponse.json(
    { message: 'Cette API nécessite une requête POST avec les données de fiche de paie' },
    { status: 405 }
  );
} 