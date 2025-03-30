import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  // Vérifier l'authentification
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const employeeId = params.id;

  if (!employeeId) {
    return NextResponse.json(
      { error: 'ID employé requis' },
      { status: 400 }
    );
  }

  try {
    // Récupérer l'employé pour vérifier l'accès
    const employee = await prisma.employee.findUnique({
      where: {
        id: employeeId
      },
      include: {
        company: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employé non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur a accès à cet employé
    if (employee.company.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cet employé' },
        { status: 403 }
      );
    }

    // Récupérer les bulletins de paie de l'employé
    const payslips = await prisma.payslip.findMany({
      where: {
        employeeId: employeeId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      payslips
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des bulletins:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 