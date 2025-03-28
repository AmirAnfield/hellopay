import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/employees/[id] - Récupère un employé spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const employeeId = params.id;
    
    // Vérifier que l'employé existe et appartient à une entreprise de l'utilisateur
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
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
        payslips: {
          orderBy: {
            periodEnd: 'desc',
          },
          take: 5, // Limiter à 5 bulletins récents
        },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employé non trouvé ou accès non autorisé.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ employee });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'employé:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération de l\'employé.' },
      { status: 500 }
    );
  }
}

// PUT /api/employees/[id] - Met à jour un employé existant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const employeeId = params.id;
    const data = await request.json();

    // Validation de base
    if (!data.firstName || !data.lastName || !data.socialSecurityNumber || !data.companyId) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs obligatoires.' },
        { status: 400 }
      );
    }

    // Vérifier que l'employé existe et appartient à une entreprise de l'utilisateur
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        company: {
          userId: session.user.id,
        },
      },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employé non trouvé ou accès non autorisé.' },
        { status: 404 }
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

    // Vérifier si le numéro de sécurité sociale est déjà utilisé par un autre employé
    if (data.socialSecurityNumber !== existingEmployee.socialSecurityNumber) {
      const duplicateSsn = await prisma.employee.findFirst({
        where: {
          socialSecurityNumber: data.socialSecurityNumber,
          companyId: data.companyId,
          id: { not: employeeId }, // Exclure l'employé actuel
        },
      });

      if (duplicateSsn) {
        return NextResponse.json(
          { error: 'Un autre employé avec ce numéro de sécurité sociale existe déjà dans cette entreprise.' },
          { status: 400 }
        );
      }
    }

    // Mise à jour de l'employé
    const updatedEmployee = await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data,
    });

    return NextResponse.json({ employee: updatedEmployee });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'employé:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de l\'employé.' },
      { status: 500 }
    );
  }
}

// DELETE /api/employees/[id] - Supprime un employé
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const employeeId = params.id;

    // Vérifier que l'employé existe et appartient à une entreprise de l'utilisateur
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        company: {
          userId: session.user.id,
        },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employé non trouvé ou accès non autorisé.' },
        { status: 404 }
      );
    }

    // Supprimer l'employé
    await prisma.employee.delete({
      where: {
        id: employeeId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'employé:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de l\'employé.' },
      { status: 500 }
    );
  }
} 