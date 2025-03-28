import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/companies - Récupère les entreprises de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const companies = await prisma.company.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Erreur lors de la récupération des entreprises:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des entreprises.' },
      { status: 500 }
    );
  }
}

// POST /api/companies - Crée une nouvelle entreprise
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
    if (!data.name || !data.siret || !data.address || !data.city || !data.postalCode) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs obligatoires.' },
        { status: 400 }
      );
    }

    // Vérification que le SIRET n'est pas déjà utilisé
    const existingCompany = await prisma.company.findFirst({
      where: {
        siret: data.siret,
      },
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Une entreprise avec ce numéro SIRET existe déjà.' },
        { status: 400 }
      );
    }

    // Création de l'entreprise
    const company = await prisma.company.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'entreprise:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de l\'entreprise.' },
      { status: 500 }
    );
  }
} 