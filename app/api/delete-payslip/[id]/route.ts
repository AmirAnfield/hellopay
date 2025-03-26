import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour effectuer cette action' },
        { status: 401 }
      );
    }

    // Récupérer l'identifiant de la fiche de paie
    const payslipId = params.id;
    
    // Récupérer l'utilisateur
    const user = await db.user.findUnique({
      where: { email: session.user.email || '' },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer la fiche de paie
    const payslip = await db.payslip.findUnique({
      where: { id: payslipId },
    });

    if (!payslip) {
      return NextResponse.json(
        { error: 'Fiche de paie non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est autorisé à supprimer cette fiche de paie
    if (payslip.userId !== user.id) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à supprimer cette fiche de paie' },
        { status: 403 }
      );
    }

    // Supprimer le fichier physique
    const filePath = path.join(process.cwd(), payslip.filePath);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Supprimer l'entrée dans la base de données
    await db.payslip.delete({
      where: { id: payslipId },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Fiche de paie supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la fiche de paie:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de la fiche de paie' },
      { status: 500 }
    );
  }
} 