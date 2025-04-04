import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { listCompaniesQuerySchema } from '@/lib/validators/pagination';
import { getCompanies } from '@/lib/db/queries';
import { logAPIEvent, LogLevel, SecurityEvent } from '@/lib/security/logger';
import { validateRouteBody } from '@/lib/validators/adapters';
import { companySchema } from '@/lib/validators/companies';

// GET /api/companies - Récupère les entreprises de l'utilisateur connecté avec pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Valider les paramètres de requête
    const validationResult = listCompaniesQuerySchema.safeParse(queryParams);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Paramètres de requête invalides",
          errors: validationResult.error.errors
        },
        { status: 400 }
      );
    }
    
    const params = validationResult.data;
    
    // Récupérer les entreprises avec pagination
    const result = await getCompanies(params, session.user.id);
    
    // Journaliser l'événement
    logAPIEvent(
      request,
      SecurityEvent.INFO,
      `Liste des entreprises récupérée (${result.meta.total} résultats)`,
      LogLevel.INFO,
      { 
        userId: session.user.id,
        page: params.page,
        limit: params.limit
      }
    );
    
    // Retourner la réponse
    return NextResponse.json(
      { 
        success: true, 
        ...result
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des entreprises:', error);
    return NextResponse.json(
      { success: false, message: 'Une erreur est survenue lors de la récupération des entreprises.' },
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
        { success: false, message: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    // Valider les données avec le schéma
    const validation = await validateRouteBody(companySchema)(request.clone());
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, ...validation.error },
        { status: 400 }
      );
    }
    
    const data = validation.data;

    // Vérification que le SIRET n'est pas déjà utilisé
    const existingCompany = await prisma.company.findFirst({
      where: {
        siret: data.siret,
      },
      select: { id: true }
    });

    if (existingCompany) {
      return NextResponse.json(
        { success: false, message: 'Une entreprise avec ce numéro SIRET existe déjà.' },
        { status: 400 }
      );
    }

    // Création de l'entreprise
    const company = await prisma.company.create({
      data: {
        ...data,
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        siret: true,
        address: true,
        city: true,
        postalCode: true,
        country: true,
        createdAt: true
      }
    });
    
    // Journaliser l'événement
    logAPIEvent(
      request,
      SecurityEvent.INFO,
      `Nouvelle entreprise créée: ${company.name}`,
      LogLevel.INFO,
      { 
        userId: session.user.id,
        companyId: company.id
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Entreprise créée avec succès',
      data: company 
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'entreprise:', error);
    return NextResponse.json(
      { success: false, message: 'Une erreur est survenue lors de la création de l\'entreprise.' },
      { status: 500 }
    );
  }
} 