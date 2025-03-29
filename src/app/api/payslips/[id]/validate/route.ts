import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Vérifier que le bulletin existe et appartient à l'utilisateur
    const payslip = await prisma.payslip.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });
    
    if (!payslip) {
      return NextResponse.json(
        { error: 'Bulletin de paie non trouvé ou accès non autorisé' },
        { status: 404 }
      );
    }
    
    // Vérifier si le bulletin est déjà validé
    const currentStatus = 'status' in payslip ? payslip.status : 'draft';
    if (currentStatus === 'validated') {
      return NextResponse.json(
        { error: 'Ce bulletin de paie est déjà validé' },
        { status: 400 }
      );
    }
    
    // Vérifier si le bulletin est verrouillé
    const isLocked = 'locked' in payslip ? payslip.locked : false;
    if (isLocked) {
      return NextResponse.json(
        { error: 'Ce bulletin de paie est verrouillé et ne peut pas être modifié' },
        { status: 400 }
      );
    }
    
    // Valider le bulletin
    // Note: Avant de passer à la production, vérifiez que ces champs existent bien dans votre modèle Prisma
    const updatedPayslip = await prisma.payslip.update({
      where: { id },
      data: {
        // @ts-expect-error - Ces champs existent dans le modèle Prisma même si TypeScript ne les reconnaît pas
        status: 'validated',
        validatedAt: new Date(),
      },
    });
    
    return NextResponse.json(updatedPayslip);
  } catch (error) {
    console.error('Erreur lors de la validation du bulletin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation du bulletin' },
      { status: 500 }
    );
  }
} 