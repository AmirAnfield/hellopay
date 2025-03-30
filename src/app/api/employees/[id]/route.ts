import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { validateRouteBody } from '@/lib/validators/adapters';
import { employeeUpdateSchema } from '@/lib/validators/employees';
import { logAPIEvent, LogLevel, SecurityEvent } from '@/lib/security/logger';

// GET /api/employees/[id] - Récupère un employé spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé. Veuillez vous connecter.' },
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
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        address: true,
        city: true,
        postalCode: true,
        country: true,
        birthDate: true,
        birthPlace: true,
        nationality: true,
        socialSecurityNumber: true,
        position: true,
        department: true,
        contractType: true,
        isExecutive: true,
        startDate: true,
        endDate: true,
        trialPeriodEndDate: true,
        hourlyRate: true,
        monthlyHours: true,
        baseSalary: true,
        bonusAmount: true,
        bonusDescription: true,
        iban: true,
        bic: true,
        paidLeaveBalance: true,
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
            siret: true,
          },
        },
        // Au lieu d'inclure tous les bulletins, récupérons seulement un comptage et les 5 derniers
        _count: {
          select: {
            payslips: true
          }
        },
        payslips: {
          orderBy: {
            periodEnd: 'desc',
          },
          take: 5,
          select: {
            id: true,
            periodStart: true,
            periodEnd: true,
            grossSalary: true,
            netSalary: true,
            status: true,
            pdfUrl: true
          }
        },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Employé non trouvé ou accès non autorisé.' },
        { status: 404 }
      );
    }
    
    // Journaliser l'événement
    logAPIEvent(
      request,
      SecurityEvent.INFO,
      `Détails de l'employé récupérés: ${employee.firstName} ${employee.lastName}`,
      LogLevel.INFO,
      { 
        userId: session.user.id,
        companyId: employee.companyId,
        employeeId
      }
    );

    return NextResponse.json({ 
      success: true,
      data: employee 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'employé:', error);
    return NextResponse.json(
      { success: false, message: 'Une erreur est survenue lors de la récupération de l\'employé.' },
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
        { success: false, message: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const employeeId = params.id;
    
    // Valider les données avec le schéma
    const validation = await validateRouteBody(employeeUpdateSchema)(request.clone());
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, ...validation.error },
        { status: 400 }
      );
    }
    
    const data = validation.data;

    // Vérifier que l'employé existe et appartient à une entreprise de l'utilisateur
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        company: {
          userId: session.user.id,
        },
      },
      select: {
        id: true,
        socialSecurityNumber: true,
        companyId: true,
        firstName: true,
        lastName: true
      }
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { success: false, message: 'Employé non trouvé ou accès non autorisé.' },
        { status: 404 }
      );
    }

    // Vérifier que l'entreprise appartient à l'utilisateur si on change d'entreprise
    if (data.companyId && data.companyId !== existingEmployee.companyId) {
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
    }

    // Vérifier si le numéro de sécurité sociale est déjà utilisé par un autre employé
    if (data.socialSecurityNumber && 
        data.socialSecurityNumber !== existingEmployee.socialSecurityNumber) {
      const duplicateSsn = await prisma.employee.findFirst({
        where: {
          socialSecurityNumber: data.socialSecurityNumber,
          companyId: data.companyId || existingEmployee.companyId,
          id: { not: employeeId }, // Exclure l'employé actuel
        },
        select: { id: true }
      });

      if (duplicateSsn) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Un autre employé avec ce numéro de sécurité sociale existe déjà dans cette entreprise.' 
          },
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
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        position: true,
        contractType: true,
        startDate: true,
        endDate: true,
        baseSalary: true,
        companyId: true
      }
    });
    
    // Journaliser l'événement
    logAPIEvent(
      request,
      SecurityEvent.INFO,
      `Employé mis à jour: ${updatedEmployee.firstName} ${updatedEmployee.lastName}`,
      LogLevel.INFO,
      { 
        userId: session.user.id,
        companyId: updatedEmployee.companyId,
        employeeId
      }
    );

    return NextResponse.json({ 
      success: true,
      message: 'Employé mis à jour avec succès', 
      data: updatedEmployee 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'employé:', error);
    return NextResponse.json(
      { success: false, message: 'Une erreur est survenue lors de la mise à jour de l\'employé.' },
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
        { success: false, message: 'Non autorisé. Veuillez vous connecter.' },
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
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyId: true,
        _count: {
          select: {
            payslips: true
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Employé non trouvé ou accès non autorisé.' },
        { status: 404 }
      );
    }
    
    // Vérifier si l'employé a des bulletins de paie
    if (employee._count.payslips > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Impossible de supprimer cet employé car il possède des bulletins de paie. Supprimez d\'abord les bulletins ou désactivez l\'employé.' 
        },
        { status: 400 }
      );
    }

    // Supprimer l'employé
    await prisma.employee.delete({
      where: {
        id: employeeId,
      },
    });
    
    // Journaliser l'événement
    logAPIEvent(
      request,
      SecurityEvent.INFO,
      `Employé supprimé: ${employee.firstName} ${employee.lastName}`,
      LogLevel.WARN,
      { 
        userId: session.user.id,
        companyId: employee.companyId,
        employeeId
      }
    );

    return NextResponse.json({ 
      success: true,
      message: 'Employé supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'employé:', error);
    return NextResponse.json(
      { success: false, message: 'Une erreur est survenue lors de la suppression de l\'employé.' },
      { status: 500 }
    );
  }
} 