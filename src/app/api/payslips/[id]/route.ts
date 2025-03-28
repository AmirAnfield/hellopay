import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Vérifier si l'utilisateur est authentifié
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "Vous devez être connecté pour accéder à cette ressource" },
        { status: 401 }
      );
    }

    // Récupérer le bulletin de paie
    const payslip = await prisma.payslip.findUnique({
      where: {
        id,
      },
    });

    if (!payslip) {
      return NextResponse.json(
        { message: "Bulletin de paie non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le bulletin appartient bien à l'utilisateur connecté
    if (payslip.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Vous n'êtes pas autorisé à accéder à ce bulletin" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { payslip },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération du bulletin de paie:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la récupération du bulletin de paie' },
      { status: 500 }
    );
  }
} 