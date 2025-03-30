import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePayslipPDF } from '@/lib/pdf/payslipPdfGenerator';
import { format } from 'date-fns';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { calculationResult, employeeId, period, saveToDatabase = true } = data;
    
    if (!calculationResult || !employeeId || !period) {
      return NextResponse.json(
        { error: 'Les données calculationResult, employeeId et period sont requises' },
        { status: 400 }
      );
    }
    
    // 1. Récupérer les informations de l'employé et de l'entreprise
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { company: true }
    });
    
    if (!employee) {
      return NextResponse.json({ error: 'Employé non trouvé' }, { status: 404 });
    }
    
    // 2. Préparer les paramètres pour la génération du PDF
    const periodDate = new Date(period);
    const startOfMonth = new Date(periodDate.getFullYear(), periodDate.getMonth(), 1);
    const endOfMonth = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 0);
    
    // 3. Générer le PDF
    const pdfBuffer = await generatePayslipPDF({
      employee,
      company: employee.company,
      calculation: calculationResult,
      period: periodDate
    });
    
    let pdfUrl = '';
    let payslip = null;
    
    // 4. Si demandé, enregistrer en base de données
    if (saveToDatabase) {
      // Assurer que le dossier de stockage existe
      const uploadDir = path.join(process.cwd(), 'public', 'payslips');
      await fs.mkdir(uploadDir, { recursive: true });
      
      // Nom de fichier unique
      const fileName = `payslip_${employee.id}_${format(periodDate, 'yyyy-MM')}_${Date.now()}.pdf`;
      const filePath = path.join(uploadDir, fileName);
      
      // Écrire le PDF sur le disque
      await fs.writeFile(filePath, pdfBuffer);
      
      // URL publique
      pdfUrl = `/payslips/${fileName}`;
      
      // Créer l'enregistrement en base de données
      payslip = await prisma.payslip.create({
        data: {
          employeeId: employee.id,
          companyId: employee.companyId,
          periodStart: startOfMonth,
          periodEnd: endOfMonth,
          paymentDate: new Date(),
          fiscalYear: periodDate.getFullYear(),
          grossSalary: calculationResult.grossSalary,
          netSalary: calculationResult.netSalary,
          employerCost: calculationResult.employerCost,
          employeeContributions: calculationResult.totalEmployeeContributions,
          employerContributions: calculationResult.totalEmployerContributions,
          taxAmount: calculationResult.taxAmount,
          pdfUrl,
          status: 'final'
        }
      });
      
      // Sauvegarder les cotisations
      for (const contrib of calculationResult.contributions) {
        await prisma.contribution.create({
          data: {
            payslipId: payslip.id,
            category: contrib.category,
            label: contrib.label,
            baseType: contrib.baseType,
            baseAmount: contrib.baseAmount,
            employerRate: contrib.employerRate,
            employeeRate: contrib.employeeRate,
            employerAmount: contrib.employerAmount,
            employeeAmount: contrib.employeeAmount
          }
        });
      }
      
      return NextResponse.json({
        success: true,
        payslipId: payslip.id,
        pdfUrl
      });
    } else {
      // Si on ne sauvegarde pas, retourner directement le PDF
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="bulletin_${format(periodDate, 'yyyy-MM')}.pdf"`
        }
      });
    }
    
  } catch (error) {
    console.error('Erreur lors de la génération du bulletin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du bulletin de paie' },
      { status: 500 }
    );
  }
} 