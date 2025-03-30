import { PDFDocument, rgb, StandardFonts, PDFPage, RGB } from 'pdf-lib';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatDecimal } from '../payroll/utils';

interface PayslipData {
  employee: {
    firstName: string;
    lastName: string;
    position?: string;
    socialSecurityNumber?: string;
    isExecutive: boolean;
  };
  company: {
    name: string;
    siret?: string;
    address?: string;
    postalCode?: string;
    city?: string;
  };
  calculation: {
    grossSalary: any;
    contributions: Array<{
      label: string;
      baseAmount: any;
      employeeRate: any;
      employeeAmount: any;
      employerRate: any;
      employerAmount: any;
    }>;
    totalEmployeeContributions: any;
    totalEmployerContributions: any;
    netBeforeTax: any;
    taxAmount: any;
    netSalary: any;
    employerCost: any;
  };
  period: Date;
}

export async function generatePayslipPDF(data: PayslipData): Promise<Uint8Array> {
  const { employee, company, calculation, period } = data;
  
  // Créer un nouveau document PDF
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  
  // Polices
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  
  // Couleurs
  const primaryColor = rgb(0.25, 0.39, 0.71); // #4063B5
  const lightGray = rgb(0.95, 0.95, 0.95);
  const mediumGray = rgb(0.5, 0.5, 0.5);
  const highlightColor = rgb(0.8, 0.8, 0.95);
  
  // Marges
  const marginLeft = 50;
  const marginRight = 50;
  const marginTop = 50;
  const contentWidth = width - marginLeft - marginRight;
  
  // En-tête du bulletin
  let yPosition = height - marginTop;
  
  // Titre du bulletin
  page.drawText('BULLETIN DE PAIE', {
    x: width / 2 - 70,
    y: yPosition,
    size: 18,
    font: helveticaBold,
    color: primaryColor,
  });
  
  yPosition -= 25;
  
  // Période
  page.drawText(`Période : ${format(period, 'MMMM yyyy', { locale: fr })}`, {
    x: width / 2 - 70,
    y: yPosition,
    size: 12,
    font: helvetica,
  });
  
  yPosition -= 30;
  
  // Ligne séparatrice
  page.drawLine({
    start: { x: marginLeft, y: yPosition },
    end: { x: width - marginRight, y: yPosition },
    thickness: 1,
    color: mediumGray,
  });
  
  yPosition -= 20;
  
  // Informations entreprise et employé
  // Rectangle gris clair pour les informations
  page.drawRectangle({
    x: marginLeft,
    y: yPosition - 100,
    width: contentWidth,
    height: 100,
    color: lightGray,
    opacity: 0.7,
  });
  
  // Informations entreprise (côté gauche)
  let yInfo = yPosition - 15;
  page.drawText('EMPLOYEUR', {
    x: marginLeft + 10,
    y: yInfo,
    size: 12,
    font: helveticaBold,
    color: primaryColor,
  });
  
  yInfo -= 20;
  page.drawText(`${company.name}`, {
    x: marginLeft + 10,
    y: yInfo,
    size: 11,
    font: helveticaBold,
  });
  
  yInfo -= 15;
  page.drawText(`SIRET: ${company.siret || ''}`, {
    x: marginLeft + 10,
    y: yInfo,
    size: 10,
    font: helvetica,
  });
  
  yInfo -= 15;
  if (company.address) {
    page.drawText(`${company.address}`, {
      x: marginLeft + 10,
      y: yInfo,
      size: 10,
      font: helvetica,
    });
  }
  
  yInfo -= 15;
  if (company.postalCode && company.city) {
    page.drawText(`${company.postalCode} ${company.city}`, {
      x: marginLeft + 10,
      y: yInfo,
      size: 10,
      font: helvetica,
    });
  }
  
  // Informations employé (côté droit)
  yInfo = yPosition - 15;
  page.drawText('SALARIÉ', {
    x: width / 2 + 10,
    y: yInfo,
    size: 12,
    font: helveticaBold,
    color: primaryColor,
  });
  
  yInfo -= 20;
  page.drawText(`${employee.firstName} ${employee.lastName}`, {
    x: width / 2 + 10,
    y: yInfo,
    size: 11,
    font: helveticaBold,
  });
  
  yInfo -= 15;
  if (employee.position) {
    page.drawText(`Emploi: ${employee.position}`, {
      x: width / 2 + 10,
      y: yInfo,
      size: 10,
      font: helvetica,
    });
  }
  
  yInfo -= 15;
  if (employee.socialSecurityNumber) {
    page.drawText(`N° SS: ${employee.socialSecurityNumber}`, {
      x: width / 2 + 10,
      y: yInfo,
      size: 10,
      font: helvetica,
    });
  }
  
  yInfo -= 15;
  page.drawText(`Statut: ${employee.isExecutive ? 'Cadre' : 'Non cadre'}`, {
    x: width / 2 + 10,
    y: yInfo,
    size: 10,
    font: helvetica,
  });
  
  yPosition -= 120;
  
  // Tableau des cotisations
  // En-têtes du tableau
  const colWidths = [200, 70, 60, 70, 60, 85];
  const startX = marginLeft;
  let currentX = startX;
  
  // Rectangle d'en-tête
  page.drawRectangle({
    x: marginLeft,
    y: yPosition - 20,
    width: contentWidth,
    height: 20,
    color: primaryColor,
  });
  
  // Textes d'en-tête
  const headers = ['Rubrique', 'Base', 'Taux sal.', 'Montant sal.', 'Taux patr.', 'Montant patr.'];
  for (let i = 0; i < headers.length; i++) {
    page.drawText(headers[i], {
      x: currentX + 5,
      y: yPosition - 15,
      size: 9,
      font: helveticaBold,
      color: rgb(1, 1, 1), // blanc
    });
    currentX += colWidths[i];
  }
  
  // Corps du tableau
  yPosition -= 20;
  let evenRow = false;
  
  // Salaire brut
  drawTableRow(
    page, 
    ['Salaire brut', formatDecimal(calculation.grossSalary), '', '', '', ''],
    marginLeft, 
    yPosition, 
    colWidths, 
    helvetica, 
    helveticaBold, 
    lightGray, 
    evenRow
  );
  
  yPosition -= 20;
  evenRow = !evenRow;
  
  // Cotisations
  for (const contrib of calculation.contributions) {
    drawTableRow(
      page,
      [
        contrib.label,
        formatDecimal(contrib.baseAmount),
        formatDecimal(contrib.employeeRate) + ' %',
        formatDecimal(contrib.employeeAmount),
        formatDecimal(contrib.employerRate) + ' %',
        formatDecimal(contrib.employerAmount)
      ],
      marginLeft,
      yPosition,
      colWidths,
      helvetica,
      helvetica,
      evenRow ? lightGray : null,
      false
    );
    
    yPosition -= 20;
    evenRow = !evenRow;
    
    // Nouvelle page si nécessaire
    if (yPosition < 100) {
      const newPage = pdfDoc.addPage([595.28, 841.89]);
      page = newPage;
      yPosition = height - marginTop;
      evenRow = false;
    }
  }
  
  // Total des cotisations
  drawTableRow(
    page,
    [
      'Total des cotisations',
      '',
      '',
      formatDecimal(calculation.totalEmployeeContributions),
      '',
      formatDecimal(calculation.totalEmployerContributions)
    ],
    marginLeft,
    yPosition,
    colWidths,
    helvetica,
    helveticaBold,
    highlightColor,
    true
  );
  
  yPosition -= 40;
  
  // Net à payer
  const boxWidth = contentWidth / 3;
  
  // Net avant impôt
  page.drawRectangle({
    x: marginLeft,
    y: yPosition - 50,
    width: boxWidth,
    height: 50,
    borderColor: mediumGray,
    borderWidth: 1,
  });
  
  page.drawText('NET AVANT IMPÔT', {
    x: marginLeft + 10,
    y: yPosition - 20,
    size: 10,
    font: helveticaBold,
  });
  
  page.drawText(formatDecimal(calculation.netBeforeTax), {
    x: marginLeft + boxWidth - 80,
    y: yPosition - 40,
    size: 14,
    font: helveticaBold,
  });
  
  // Impôt sur le revenu
  page.drawRectangle({
    x: marginLeft + boxWidth + 10,
    y: yPosition - 50,
    width: boxWidth - 20,
    height: 50,
    borderColor: mediumGray,
    borderWidth: 1,
  });
  
  page.drawText('IMPÔT SUR LE REVENU', {
    x: marginLeft + boxWidth + 20,
    y: yPosition - 20,
    size: 10,
    font: helveticaBold,
  });
  
  page.drawText(formatDecimal(calculation.taxAmount), {
    x: marginLeft + 2 * boxWidth - 70,
    y: yPosition - 40,
    size: 14,
    font: helveticaBold,
  });
  
  // Net à payer
  const primaryColorWithAlpha = rgb(
    primaryColor.r,
    primaryColor.g,
    primaryColor.b
  );
  
  page.drawRectangle({
    x: marginLeft + 2 * boxWidth,
    y: yPosition - 50,
    width: boxWidth,
    height: 50,
    color: rgb(0.9, 0.9, 1), // Bleu très clair
    borderColor: primaryColor,
    borderWidth: 1,
  });
  
  page.drawText('NET À PAYER', {
    x: marginLeft + 2 * boxWidth + 10,
    y: yPosition - 20,
    size: 10,
    font: helveticaBold,
    color: primaryColor,
  });
  
  page.drawText(formatDecimal(calculation.netSalary), {
    x: marginLeft + 3 * boxWidth - 80,
    y: yPosition - 40,
    size: 16,
    font: helveticaBold,
    color: primaryColor,
  });
  
  yPosition -= 70;
  
  // Coût employeur
  page.drawText('Coût total employeur :', {
    x: marginLeft,
    y: yPosition,
    size: 10,
    font: helveticaBold,
  });
  
  page.drawText(formatDecimal(calculation.employerCost), {
    x: marginLeft + 130,
    y: yPosition,
    size: 10,
    font: helveticaBold,
  });
  
  // Pied de page
  const pageBottom = 50;
  
  // Ligne séparatrice
  page.drawLine({
    start: { x: marginLeft, y: pageBottom + 30 },
    end: { x: width - marginRight, y: pageBottom + 30 },
    thickness: 1,
    color: mediumGray,
  });
  
  // Mentions légales
  page.drawText('Bulletin de paie établi conformément aux dispositions des articles R.3243-1 à R.3243-5 du Code du travail.', {
    x: marginLeft,
    y: pageBottom + 15,
    size: 7,
    font: helveticaOblique,
    color: mediumGray,
  });
  
  page.drawText('Conservation à durée illimitée - Ce bulletin doit être conservé sans limitation de durée.', {
    x: marginLeft,
    y: pageBottom + 5,
    size: 7,
    font: helveticaOblique,
    color: mediumGray,
  });
  
  // Numéro de page
  page.drawText(`HelloPay - ${format(new Date(), 'dd/MM/yyyy')}`, {
    x: width - marginRight - 100,
    y: pageBottom + 10,
    size: 8,
    font: helvetica,
    color: mediumGray,
  });
  
  // Générer le buffer PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// Fonction helper pour dessiner une ligne du tableau
function drawTableRow(
  page: PDFPage,
  texts: string[],
  startX: number,
  y: number,
  colWidths: number[],
  regularFont: any,
  boldFont: any,
  bgColor: RGB | null,
  isBold: boolean
) {
  // Fond de ligne
  if (bgColor) {
    page.drawRectangle({
      x: startX,
      y: y - 20,
      width: colWidths.reduce((a, b) => a + b, 0),
      height: 20,
      color: bgColor,
    });
  }
  
  // Textes
  let currentX = startX;
  for (let i = 0; i < texts.length; i++) {
    page.drawText(texts[i], {
      x: currentX + 5,
      y: y - 13,
      size: 9,
      font: isBold ? boldFont : regularFont,
    });
    currentX += colWidths[i];
  }
} 