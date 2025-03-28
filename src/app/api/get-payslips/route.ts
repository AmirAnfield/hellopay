import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Vérifier si l'utilisateur est authentifié
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "Vous devez être connecté pour accéder à cette ressource" },
        { status: 401 }
      );
    }

    // Récupérer les bulletins de paie de l'utilisateur
    const payslips = await prisma.payslip.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      { 
        payslips: payslips.map(payslip => ({
          id: payslip.id,
          employeeName: payslip.employeeName,
          periodStart: payslip.periodStart,
          periodEnd: payslip.periodEnd,
          grossSalary: payslip.grossSalary,
          netSalary: payslip.netSalary,
          createdAt: payslip.createdAt,
          pdfUrl: payslip.pdfUrl,
        })) 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des bulletins de paie:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la récupération des bulletins de paie' },
      { status: 500 }
    );
  }
} 