import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generatePayslipPDF } from '@/lib/pdf/payslipPdfGenerator';
import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du bulletin manquant' },
        { status: 400 }
      );
    }
    
    // Vérifier si l'utilisateur est authentifié
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour valider ce bulletin' },
        { status: 401 }
      );
    }
    
    // Récupérer le bulletin existant
    const existingPayslip = await prisma.payslip.findUnique({
      where: { id },
      include: {
        employee: true,
        company: true,
        contributions: true
      }
    });
    
    if (!existingPayslip) {
      return NextResponse.json(
        { error: 'Bulletin non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier que le bulletin appartient bien à l'utilisateur connecté
    if (existingPayslip.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à valider ce bulletin' },
        { status: 403 }
      );
    }
    
    // Vérifier que le bulletin est au statut "draft"
    if (existingPayslip.status !== 'draft') {
      return NextResponse.json(
        { error: 'Ce bulletin a déjà été validé' },
        { status: 400 }
      );
    }
    
    // Préparer les données pour la génération du PDF
    const periodDate = new Date(existingPayslip.periodStart);
    
    // Préparation des données pour le PDF
    const calculationData = {
      employeeId: existingPayslip.employeeId,
      period: format(periodDate, 'yyyy-MM-dd'),
      grossSalary: existingPayslip.grossSalary,
      netSalary: existingPayslip.netSalary,
      employerCost: existingPayslip.employerCost,
      totalEmployeeContributions: existingPayslip.employeeContributions,
      totalEmployerContributions: existingPayslip.employerContributions,
      netBeforeTax: existingPayslip.netSalary + (existingPayslip.taxAmount || 0),
      taxAmount: existingPayslip.taxAmount || 0,
      contributions: existingPayslip.contributions.map(contribution => ({
        label: contribution.label,
        baseAmount: contribution.baseAmount,
        employeeRate: contribution.employeeRate,
        employeeAmount: contribution.employeeAmount,
        employerRate: contribution.employerRate,
        employerAmount: contribution.employerAmount,
      }))
    };
    
    // Générer le PDF final
    const pdfBuffer = await generatePayslipPDF({
      employee: existingPayslip.employee,
      company: existingPayslip.company,
      calculation: calculationData,
      period: periodDate
    });
    
    // Créer le répertoire de stockage si nécessaire
    const uploadDir = path.join(process.cwd(), 'public', 'payslips');
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Générer un nom de fichier unique
    const fileName = `payslip_${existingPayslip.employeeId}_${format(periodDate, 'yyyy-MM')}_final_${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);
    
    // Sauvegarder le PDF sur le disque
    await fs.writeFile(filePath, pdfBuffer);
    
    // URL publique du PDF
    const pdfUrl = `/payslips/${fileName}`;
    
    // Mettre à jour le bulletin dans la base de données
    const updatedPayslip = await prisma.payslip.update({
      where: { id },
      data: {
        status: 'final',
        locked: true,
        validatedAt: new Date(),
        validatedBy: session.user.id,
        pdfUrl: pdfUrl
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Bulletin validé avec succès',
      payslip: updatedPayslip
    });
    
  } catch (error) {
    console.error('Erreur lors de la validation du bulletin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation du bulletin' },
      { status: 500 }
    );
  }
} 