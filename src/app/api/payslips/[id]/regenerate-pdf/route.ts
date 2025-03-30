import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePayslipPDF } from '@/lib/pdf/payslipPdfGenerator';
import { format } from 'date-fns';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du bulletin manquant' },
        { status: 400 }
      );
    }
    
    // 1. Récupérer le bulletin avec toutes ses relations nécessaires
    const payslip = await prisma.payslip.findUnique({
      where: { id },
      include: {
        employee: true,
        company: true,
        contributions: true
      }
    });
    
    if (!payslip) {
      return NextResponse.json(
        { error: 'Bulletin non trouvé' },
        { status: 404 }
      );
    }
    
    // 2. Créer les données de calcul à partir des informations du bulletin
    const calculationResult = {
      employeeId: payslip.employeeId,
      period: format(new Date(payslip.periodStart), 'yyyy-MM-dd'),
      grossSalary: payslip.grossSalary,
      netSalary: payslip.netSalary,
      employerCost: payslip.employerCost,
      totalEmployeeContributions: payslip.employeeContributions,
      totalEmployerContributions: payslip.employerContributions,
      taxAmount: payslip.taxAmount,
      contributions: payslip.contributions.map(contribution => ({
        category: contribution.category,
        label: contribution.label,
        baseType: contribution.baseType,
        baseAmount: contribution.baseAmount,
        employeeRate: contribution.employeeRate,
        employerRate: contribution.employerRate,
        employeeAmount: contribution.employeeAmount,
        employerAmount: contribution.employerAmount,
      }))
    };
    
    // 3. Préparer les paramètres pour la génération du PDF
    const periodDate = new Date(payslip.periodStart);
    
    // 4. Générer le PDF
    const pdfBuffer = await generatePayslipPDF({
      employee: payslip.employee,
      company: payslip.company,
      calculation: calculationResult,
      period: periodDate
    });
    
    // 5. Assurer que le dossier de stockage existe
    const uploadDir = path.join(process.cwd(), 'public', 'payslips');
    await fs.mkdir(uploadDir, { recursive: true });
    
    // 6. Nom de fichier unique
    const fileName = `payslip_${payslip.employeeId}_${format(periodDate, 'yyyy-MM')}_${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);
    
    // 7. Écrire le PDF sur le disque
    await fs.writeFile(filePath, pdfBuffer);
    
    // 8. URL publique
    const pdfUrl = `/payslips/${fileName}`;
    
    // 9. Mettre à jour l'URL du PDF dans la base de données
    const updatedPayslip = await prisma.payslip.update({
      where: { id },
      data: { pdfUrl }
    });
    
    return NextResponse.json({
      success: true,
      payslipId: id,
      pdfUrl
    });
    
  } catch (error) {
    console.error('Erreur lors de la régénération du PDF:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la régénération du PDF' },
      { status: 500 }
    );
  }
} 