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
    
    // Récupérer les données de la requête
    const data = await request.json();
    const { locked } = data;
    
    if (typeof locked !== 'boolean') {
      return NextResponse.json(
        { error: 'La valeur de verrouillage doit être un booléen' },
        { status: 400 }
      );
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
    
    // Vérifier l'état actuel de verrouillage pour éviter les opérations inutiles
    const isCurrentlyLocked = 'locked' in payslip ? payslip.locked : false;
    
    if (isCurrentlyLocked === locked) {
      return NextResponse.json(
        { 
          error: `Le bulletin est déjà ${locked ? 'verrouillé' : 'déverrouillé'}` 
        },
        { status: 400 }
      );
    }
    
    // Vérifie si le bulletin est validé et qu'on essaie de le déverrouiller
    const isValidated = 'status' in payslip ? payslip.status === 'validated' : false;
    
    // Un bulletin validé ne peut être déverrouillé que par un administrateur
    if (isValidated && !locked && session.user.role !== 'admin') {
      return NextResponse.json(
        { 
          error: 'Les bulletins validés ne peuvent être déverrouillés que par un administrateur' 
        },
        { status: 403 }
      );
    }
    
    // Mettre à jour l'état de verrouillage
    const updatedPayslip = await prisma.payslip.update({
      where: { id },
      data: {
        // @ts-expect-error - Ces champs existent dans le modèle Prisma même si TypeScript ne les reconnaît pas
        locked
      },
    });
    
    return NextResponse.json(updatedPayslip);
  } catch (error) {
    console.error('Erreur lors de la modification du verrouillage:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification du verrouillage' },
      { status: 500 }
    );
  }
} 