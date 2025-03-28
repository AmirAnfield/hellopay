import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/employees - Récupère les salariés
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    let employees;

    // Si un ID d'entreprise est fourni, récupère les salariés de cette entreprise
    if (companyId) {
      // Vérifier que l'entreprise appartient à l'utilisateur
      const company = await prisma.company.findFirst({
        where: {
          id: companyId,
          userId: session.user.id,
        },
      });

      if (!company) {
        return NextResponse.json(
          { error: 'Entreprise non trouvée ou non autorisée.' },
          { status: 404 }
        );
      }

      employees = await prisma.employee.findMany({
        where: {
          companyId,
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' },
        ],
      });
    } else {
      // Sinon, récupère tous les salariés des entreprises de l'utilisateur
      employees = await prisma.employee.findMany({
        where: {
          company: {
            userId: session.user.id,
          },
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' },
        ],
      });
    }

    return NextResponse.json({ employees });
  } catch (error) {
    console.error('Erreur lors de la récupération des salariés:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des salariés.' },
      { status: 500 }
    );
  }
}

// POST /api/employees - Crée un nouveau salarié
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Validation de base
    if (!data.firstName || !data.lastName || !data.socialSecurityNumber || !data.companyId) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs obligatoires.' },
        { status: 400 }
      );
    }

    // Vérifier que l'entreprise appartient à l'utilisateur
    const company = await prisma.company.findFirst({
      where: {
        id: data.companyId,
        userId: session.user.id,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée ou non autorisée.' },
        { status: 404 }
      );
    }

    // Vérification que le numéro de sécurité sociale n'est pas déjà utilisé
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        socialSecurityNumber: data.socialSecurityNumber,
        companyId: data.companyId,
      },
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Un salarié avec ce numéro de sécurité sociale existe déjà dans cette entreprise.' },
        { status: 400 }
      );
    }

    // Création du salarié
    const employee = await prisma.employee.create({
      data,
    });

    return NextResponse.json({ employee }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du salarié:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du salarié.' },
      { status: 500 }
    );
  }
} 