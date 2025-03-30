import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du bulletin manquant' },
        { status: 400 }
      );
    }
    
    // Vérifier si l'utilisateur est authentifié
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour accéder à cette ressource' },
        { status: 401 }
      );
    }
    
    // Récupérer le bulletin avec toutes ses relations
    const payslip = await prisma.payslip.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            isExecutive: true,
            socialSecurityNumber: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            siret: true,
            address: true,
            postalCode: true,
            city: true
          }
        },
        contributions: true
      }
    });
    
    if (!payslip) {
      return NextResponse.json(
        { error: 'Bulletin non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier que le bulletin appartient bien à l'utilisateur connecté
    if (payslip.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à accéder à ce bulletin' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(payslip);
    
  } catch (error) {
    console.error('Erreur lors de la récupération du bulletin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du bulletin' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour un bulletin de paie (uniquement si statut "draft")
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du bulletin manquant' },
        { status: 400 }
      );
    }
    
    // Vérifier si l'utilisateur est authentifié
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour modifier cette ressource' },
        { status: 401 }
      );
    }
    
    // Récupérer le bulletin existant
    const existingPayslip = await prisma.payslip.findUnique({
      where: { id },
      include: {
        contributions: true
      }
    });
    
    if (!existingPayslip) {
      return NextResponse.json(
        { error: 'Bulletin non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier que le bulletin appartient bien à l'utilisateur connecté
    if (existingPayslip.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à modifier ce bulletin' },
        { status: 403 }
      );
    }
    
    // Vérifier que le bulletin est au statut "draft"
    if (existingPayslip.status !== 'draft') {
      return NextResponse.json(
        { error: 'Ce bulletin ne peut plus être modifié car il est déjà validé' },
        { status: 400 }
      );
    }
    
    // Récupérer les données de la requête
    const data = await req.json();
    
    // Créer l'entrée du journal de modification
    const modificationEntry = {
      timestamp: new Date().toISOString(),
      userId: session.user.id,
      userName: session.user.name || 'Utilisateur',
      changes: []
    };
    
    // Comparer les valeurs et enregistrer les modifications
    const fieldsToTrack = ['grossSalary', 'netSalary', 'hourlyRate', 'hoursWorked', 'employeeContributions', 'employerContributions', 'employerCost', 'taxAmount'];
    
    fieldsToTrack.forEach(field => {
      if (data[field] !== undefined && data[field] !== existingPayslip[field]) {
        modificationEntry.changes.push({
          field,
          oldValue: existingPayslip[field],
          newValue: data[field]
        });
      }
    });
    
    // Récupérer les modifications dans modificationLog existant
    let modificationLog = [];
    try {
      if (existingPayslip.modificationLog) {
        modificationLog = JSON.parse(existingPayslip.modificationLog);
      }
    } catch (error) {
      console.error('Erreur lors du parsing du journal de modifications:', error);
      modificationLog = [];
    }
    
    // Ajouter la nouvelle entrée au journal
    if (modificationEntry.changes.length > 0) {
      modificationLog.push(modificationEntry);
    }
    
    // Mise à jour du bulletin dans la base de données
    const updatedPayslip = await prisma.payslip.update({
      where: { id },
      data: {
        grossSalary: data.grossSalary,
        netSalary: data.netSalary,
        hourlyRate: data.hourlyRate,
        hoursWorked: data.hoursWorked,
        employeeContributions: data.employeeContributions,
        employerContributions: data.employerContributions,
        employerCost: data.employerCost,
        taxAmount: data.taxAmount || 0,
        modificationLog: JSON.stringify(modificationLog),
        updatedAt: new Date(),
      }
    });
    
    // Mettre à jour les contributions si elles ont été fournies
    if (data.contributions && Array.isArray(data.contributions)) {
      // 1. Supprimer toutes les contributions existantes
      await prisma.contribution.deleteMany({
        where: { payslipId: id }
      });
      
      // 2. Créer les nouvelles contributions
      for (const contrib of data.contributions) {
        await prisma.contribution.create({
          data: {
            payslipId: id,
            category: contrib.category,
            label: contrib.label,
            baseType: contrib.baseType,
            baseAmount: contrib.baseAmount,
            employeeRate: contrib.employeeRate,
            employerRate: contrib.employerRate,
            employeeAmount: contrib.employeeAmount,
            employerAmount: contrib.employerAmount,
          }
        });
      }
    }
    
    // Générer un nouveau PDF si des modifications ont été effectuées
    if (modificationEntry.changes.length > 0) {
      // Récupérer les données nécessaires pour générer le PDF
      const payslip = await prisma.payslip.findUnique({
        where: { id },
        include: {
          employee: true,
          company: true,
          contributions: true
        }
      });
      
      // Générer le PDF si toutes les données sont disponibles
      if (payslip && payslip.employee && payslip.company) {
        // Note: Cette partie sera implémentée avec la fonction generatePayslipPDF
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Bulletin mis à jour avec succès',
      payslip: updatedPayslip
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du bulletin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du bulletin' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un bulletin de paie
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du bulletin manquant' },
        { status: 400 }
      );
    }
    
    // Vérifier si l'utilisateur est authentifié
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour supprimer cette ressource' },
        { status: 401 }
      );
    }
    
    // Récupérer le bulletin existant
    const existingPayslip = await prisma.payslip.findUnique({
      where: { id }
    });
    
    if (!existingPayslip) {
      return NextResponse.json(
        { error: 'Bulletin non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier que le bulletin appartient bien à l'utilisateur connecté
    if (existingPayslip.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à supprimer ce bulletin' },
        { status: 403 }
      );
    }
    
    // Supprimer d'abord les contributions associées
    await prisma.contribution.deleteMany({
      where: { payslipId: id }
    });
    
    // Supprimer le bulletin
    await prisma.payslip.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Bulletin supprimé avec succès'
    });
    
  } catch (error) {
    console.error('Erreur lors de la suppression du bulletin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du bulletin' },
      { status: 500 }
    );
  }
} 