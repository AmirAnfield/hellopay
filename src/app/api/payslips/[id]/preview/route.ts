import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generatePayslipPDF } from '@/lib/pdf/payslipPdfGenerator';
import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

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
        { error: 'Vous devez être connecté pour prévisualiser ce bulletin' },
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
        { error: 'Vous n\'êtes pas autorisé à prévisualiser ce bulletin' },
        { status: 403 }
      );
    }
    
    // Récupérer les données de mise à jour du corps de la requête
    const updateData = await req.json();
    
    // Fusionner les données du bulletin existant avec les mises à jour
    const previewData = {
      ...existingPayslip,
      ...updateData,
    };
    
    // Préparer les données pour la génération du PDF
    const periodDate = new Date(existingPayslip.periodStart);
    
    // Préparation des données pour le PDF
    const calculationData = {
      employeeId: previewData.employeeId,
      period: format(periodDate, 'yyyy-MM-dd'),
      grossSalary: previewData.grossSalary,
      netSalary: previewData.netSalary,
      employerCost: previewData.employerCost,
      totalEmployeeContributions: previewData.employeeContributions,
      totalEmployerContributions: previewData.employerContributions,
      netBeforeTax: previewData.netSalary + (previewData.taxAmount || 0),
      taxAmount: previewData.taxAmount || 0,
      contributions: previewData.contributions || existingPayslip.contributions
    };
    
    // Générer le PDF de prévisualisation
    const pdfBuffer = await generatePayslipPDF({
      employee: existingPayslip.employee,
      company: existingPayslip.company,
      calculation: calculationData,
      period: periodDate
    });
    
    // Créer le répertoire de stockage temporaire si nécessaire
    const previewDir = path.join(process.cwd(), 'public', 'temp');
    await fs.mkdir(previewDir, { recursive: true });
    
    // Générer un nom de fichier unique avec un identifiant aléatoire
    const uniqueId = uuidv4();
    const fileName = `preview_${existingPayslip.employeeId}_${uniqueId}.pdf`;
    const filePath = path.join(previewDir, fileName);
    
    // Sauvegarder le PDF sur le disque
    await fs.writeFile(filePath, pdfBuffer);
    
    // URL publique temporaire du PDF
    const previewUrl = `/temp/${fileName}`;
    
    // Définir un délai pour supprimer le fichier après 5 minutes
    setTimeout(async () => {
      try {
        await fs.unlink(filePath);
        console.log(`Fichier temporaire supprimé: ${filePath}`);
      } catch (error) {
        console.error(`Erreur lors de la suppression du fichier temporaire: ${filePath}`, error);
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return NextResponse.json({
      success: true,
      message: 'Prévisualisation générée avec succès',
      previewUrl
    });
    
  } catch (error) {
    console.error('Erreur lors de la prévisualisation du bulletin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la prévisualisation du bulletin' },
      { status: 500 }
    );
  }
} 