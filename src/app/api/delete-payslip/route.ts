import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
  try {
    // Obtenir l'ID du bulletin à supprimer depuis les paramètres de requête
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: "ID du bulletin de paie requis" },
        { status: 400 }
      );
    }
    
    // Vérifier si l'utilisateur est authentifié
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "Vous devez être connecté pour accéder à cette ressource" },
        { status: 401 }
      );
    }

    // Récupérer le bulletin de paie pour vérifier l'appartenance
    const payslip = await prisma.payslip.findUnique({
      where: { id },
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
        { message: "Vous n'êtes pas autorisé à supprimer ce bulletin" },
        { status: 403 }
      );
    }

    // Supprimer le bulletin de paie
    await prisma.payslip.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Bulletin de paie supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression du bulletin de paie:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la suppression du bulletin de paie' },
      { status: 500 }
    );
  }
} 