import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getEmployees } from '@/lib/db/queries';
import { listEmployeesQuerySchema } from '@/lib/validators/pagination';
import { logAPIEvent, LogLevel, SecurityEvent } from '@/lib/security/logger';
import { validateRouteBody } from '@/lib/validators/adapters';
import { employeeSchema } from '@/lib/validators/employees';

// GET /api/employees - Récupère les salariés avec pagination
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
    const validationResult = listEmployeesQuerySchema.safeParse(queryParams);
    
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
    
    // Vérifier les permissions si companyId est spécifié
    if (params.companyId) {
      const company = await prisma.company.findFirst({
        where: {
          id: params.companyId,
          userId: session.user.id,
        },
        select: { id: true }
      });

      if (!company) {
        return NextResponse.json(
          { success: false, message: 'Entreprise non trouvée ou non autorisée.' },
          { status: 404 }
        );
      }
    }
    
    // Récupérer les employés avec pagination
    const result = await getEmployees(params);
    
    // Journaliser l'événement
    logAPIEvent(
      request,
      SecurityEvent.INFO,
      `Liste des employés récupérée (${result.meta.total} résultats)`,
      LogLevel.INFO,
      { 
        userId: session.user.id,
        companyId: params.companyId,
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
    console.error('Erreur lors de la récupération des salariés:', error);
    return NextResponse.json(
      { success: false, message: 'Une erreur est survenue lors de la récupération des salariés.' },
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
        { success: false, message: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    // Valider les données avec le schéma
    const validation = await validateRouteBody(employeeSchema)(request.clone());
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, ...validation.error },
        { status: 400 }
      );
    }
    
    const data = validation.data;

    // Vérifier que l'entreprise appartient à l'utilisateur
    const company = await prisma.company.findFirst({
      where: {
        id: data.companyId,
        userId: session.user.id,
      },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Entreprise non trouvée ou non autorisée.' },
        { status: 404 }
      );
    }

    // Vérification que le numéro de sécurité sociale n'est pas déjà utilisé
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        socialSecurityNumber: data.socialSecurityNumber,
        companyId: data.companyId,
      },
      select: { id: true }
    });

    if (existingEmployee) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Un salarié avec ce numéro de sécurité sociale existe déjà dans cette entreprise.' 
        },
        { status: 400 }
      );
    }

    // Création du salarié
    const employee = await prisma.employee.create({
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        position: true,
        contractType: true,
        startDate: true,
        endDate: true
      }
    });
    
    // Journaliser l'événement
    logAPIEvent(
      request,
      SecurityEvent.INFO,
      `Nouvel employé créé: ${employee.firstName} ${employee.lastName}`,
      LogLevel.INFO,
      { 
        userId: session.user.id,
        companyId: data.companyId,
        employeeId: employee.id
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Employé créé avec succès',
      data: employee 
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du salarié:', error);
    return NextResponse.json(
      { success: false, message: 'Une erreur est survenue lors de la création du salarié.' },
      { status: 500 }
    );
  }
} 