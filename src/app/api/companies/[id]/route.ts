import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/companies/[id] - Récupère une entreprise spécifique
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const { id } = context.params;

    const company = await prisma.company.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        employees: {
          orderBy: {
            lastName: 'asc',
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ company });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'entreprise:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération de l\'entreprise.' },
      { status: 500 }
    );
  }
}

// PUT /api/companies/[id] - Met à jour une entreprise
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const { id } = context.params;
    const data = await request.json();

    // Vérifier si l'entreprise existe et appartient à l'utilisateur
    const existingCompany = await prisma.company.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée ou non autorisée.' },
        { status: 404 }
      );
    }

    // Mise à jour de l'entreprise
    const updatedCompany = await prisma.company.update({
      where: { id },
      data,
    });

    return NextResponse.json({ company: updatedCompany });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'entreprise:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de l\'entreprise.' },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[id] - Supprime une entreprise
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const { id } = context.params;

    // Vérifier si l'entreprise existe et appartient à l'utilisateur
    const existingCompany = await prisma.company.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée ou non autorisée.' },
        { status: 404 }
      );
    }

    // Supprimer l'entreprise
    // Note : Les relations en cascade vont supprimer les employés et bulletins associés
    await prisma.company.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'entreprise:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de l\'entreprise.' },
      { status: 500 }
    );
  }
} 