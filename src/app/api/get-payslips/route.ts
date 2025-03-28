import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour effectuer cette action' },
        { status: 401 }
      );
    }

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

    // Récupérer les fiches de paie de l'utilisateur
    const payslips = await db.payslip.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ payslips });
  } catch (error) {
    console.error('Erreur lors de la récupération des fiches de paie:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des fiches de paie' },
      { status: 500 }
    );
  }
} 