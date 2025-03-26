import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { StorageService } from '@/libs/supabase';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const formData = await request.formData();
    
    // Récupérer les données
    const file = formData.get('file') as File;
    const payslipId = formData.get('payslipId') as string;
    
    if (!file || !payslipId) {
      return NextResponse.json(
        { error: 'Fichier ou ID de fiche de paie manquant' },
        { status: 400 }
      );
    }

    // Vérifier que la fiche de paie appartient à l'utilisateur
    const payslip = await prisma.payslip.findUnique({
      where: { id: payslipId }
    });

    if (!payslip || payslip.userId !== userId) {
      return NextResponse.json(
        { error: 'Fiche de paie non trouvée ou non autorisée' },
        { status: 403 }
      );
    }

    // Générer un nom de fichier unique
    const fileName = `payslip_${payslipId}_${Date.now()}.pdf`;
    
    // Uploader le fichier vers Supabase
    const pdfUrl = await StorageService.uploadPayslipPdf(
      userId,
      fileName,
      file
    );

    // Mettre à jour la fiche de paie avec l'URL du PDF
    await prisma.payslip.update({
      where: { id: payslipId },
      data: { pdfUrl }
    });

    return NextResponse.json(
      { success: true, pdfUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de l\'upload du PDF :', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'upload' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 