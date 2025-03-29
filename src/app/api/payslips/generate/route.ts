import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateContributions } from '@/lib/payroll-rates';

export interface PayslipInput {
  month: number;
  year: number;
  grossSalary: number;
  id?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les données de la requête
    const data = await request.json();
    const { employeeId, companyId, payslips, isExecutive } = data;

    if (!employeeId || !companyId || !Array.isArray(payslips) || payslips.length === 0) {
      return NextResponse.json(
        { error: 'Données incomplètes pour la génération des bulletins' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a accès à cette entreprise
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        userId: session.user.id,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée ou accès non autorisé' },
        { status: 403 }
      );
    }

    // Vérifier que l'employé appartient à cette entreprise
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        companyId,
      },
      include: {
        company: true,
      }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employé non trouvé ou n\'appartient pas à cette entreprise' },
        { status: 404 }
      );
    }

    // Générer ou mettre à jour les bulletins
    const generatedPayslips = await Promise.all(
      payslips.map(async (payslipInput: PayslipInput) => {
        const { month, year, grossSalary, id } = payslipInput;
        
        // Calculer les cotisations
        const contributions = calculateContributions(
          grossSalary,
          year,
          isExecutive || false
        );

        // Déterminer les dates de période
        const periodStart = new Date(year, month - 1, 1);
        const periodEnd = new Date(year, month, 0);
        const paymentDate = new Date(year, month, 5);
        
        // Pour les périodes cumulatives (du 1er janvier à la fin de l'année)
        const cumulativePeriodStart = new Date(year, 0, 1);
        const cumulativePeriodEnd = new Date(year, 11, 31);

        const payslipData = {
          userId: session.user.id,
          employeeId,
          companyId,
          
          // Informations employeur
          employerName: company.name,
          employerAddress: company.address,
          employerSiret: company.siret,
          employerUrssaf: company.siret.substring(0, 9), // Les 9 premiers chiffres du SIRET
          
          // Informations salarié
          employeeName: `${employee.firstName} ${employee.lastName}`,
          employeeAddress: employee.address || '',
          employeePosition: employee.position,
          employeeSocialSecurityNumber: employee.socialSecurityNumber || '000000000000000',
          isExecutive: isExecutive || false,
          
          // Période
          periodStart,
          periodEnd,
          paymentDate,
          fiscalYear: year,
          
          // Rémunération
          hourlyRate: employee.hourlyRate || 0,
          hoursWorked: 151.67, // Heures mensuelles standard (35h/semaine)
          grossSalary,
          netSalary: contributions.netSalary,
          employerCost: contributions.employerCost,
          
          // Cotisations
          employeeContributions: contributions.employeeContributions.total,
          employerContributions: contributions.employerContributions.total,
          contributionsDetails: JSON.stringify({
            employee: contributions.employeeContributions,
            employer: contributions.employerContributions
          }),
          
          // Congés payés (valeurs par défaut)
          paidLeaveAcquired: 2.5, // 2.5 jours par mois
          paidLeaveTaken: 0,
          paidLeaveRemaining: employee.paidLeaveBalance || 0,
          
          // Cumuls (à implémenter plus tard avec des données réelles)
          cumulativeGrossSalary: grossSalary, // Pour l'instant, juste le salaire brut du mois
          cumulativeNetSalary: contributions.netSalary, // Pour l'instant, juste le salaire net du mois
          cumulativePeriodStart,
          cumulativePeriodEnd,
          
          // État du bulletin
          status: 'draft',
          locked: false,
        };

        // Mettre à jour le bulletin existant ou en créer un nouveau
        if (id) {
          // Vérifier si le bulletin peut être modifié (non verrouillé)
          const existingPayslip = await prisma.payslip.findUnique({
            where: { id },
          });

          if (!existingPayslip) {
            return NextResponse.json(
              { error: `Le bulletin avec l'ID ${id} n'existe pas` },
              { status: 404 }
            );
          }

          // Vérifier si le bulletin est verrouillé (compatibilité avec anciens bulletins)
          const isLocked = 'locked' in existingPayslip ? existingPayslip.locked : false;
          
          if (isLocked) {
            return NextResponse.json(
              { error: `Le bulletin avec l'ID ${id} est verrouillé et ne peut pas être modifié` },
              { status: 400 }
            );
          }

          // Mettre à jour le bulletin existant
          return await prisma.payslip.update({
            where: { id },
            data: payslipData,
          });
        } else {
          // Vérifier si un bulletin existe déjà pour ce mois/année/employé
          const existingPayslip = await prisma.payslip.findFirst({
            where: {
              employeeId,
              periodStart: {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1),
              },
            },
          });

          if (existingPayslip) {
            // Vérifier si le bulletin est verrouillé (compatibilité avec anciens bulletins)
            const isLocked = 'locked' in existingPayslip ? existingPayslip.locked : false;
            
            // Si verrouillé, ne pas modifier
            if (isLocked) {
              return existingPayslip;
            }

            // Mettre à jour le bulletin existant
            return await prisma.payslip.update({
              where: { id: existingPayslip.id },
              data: payslipData,
            });
          }

          // Créer un nouveau bulletin
          return await prisma.payslip.create({
            data: payslipData,
          });
        }
      })
    );

    // Renvoyer les bulletins générés
    return NextResponse.json(generatedPayslips);
  } catch (error) {
    console.error('Erreur lors de la génération des bulletins:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération des bulletins' },
      { status: 500 }
    );
  }
} 