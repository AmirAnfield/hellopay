import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Payslip } from '@prisma/client';

// Interface pour les données mensuelles
interface MonthlyData {
  id: string | null;
  month: string;
  monthIndex: number;
  periodStart: string | null;
  periodEnd: string | null;
  grossSalary: number;
  netSalary: number;
  employeeContributions: number;
  employerContributions: number;
  employerCost: number;
  paidLeaveAcquired: number;
  paidLeaveTaken: number;
  paidLeaveBalance: number;
  hoursWorked: number;
  contributionsByCategory: Record<string, { employee: number; employer: number }>;
  taxAmount: number;
}

// Interface pour les montants de contribution
interface ContributionAmounts {
  employee: number;
  employer: number;
}

// Interface pour les totaux annuels
interface AnnualTotals {
  grossSalary: number;
  netSalary: number;
  employeeContributions: number;
  employerContributions: number;
  employerCost: number;
  paidLeaveAcquired: number;
  paidLeaveTaken: number;
  paidLeaveBalance: number;
  hoursWorked: number;
  taxAmount: number;
}

// Interface pour étendre le type Payslip avec des champs personnalisés
interface ExtendedPayslip extends Payslip {
  paidLeaveBalance?: number;
  taxAmount?: number;
  contributions?: Record<string, ContributionAmounts>;
}

// Type pour les contributions
interface Contribution {
  id: string;
  name: string;
  category: string;
  base: number;
  employeeRate: number;
  employerRate: number;
  employeeAmount: number;
  employerAmount: number;
}

// Fonction pour obtenir l'historique annuel des bulletins de paie d'un employé
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Vérifier si l'ID de l'employé est fourni
    if (!params.id) {
      return NextResponse.json({ error: 'Identifiant employé manquant' }, { status: 400 });
    }

    // Récupérer la session pour vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer l'année depuis les paramètres de requête (par défaut: année courante)
    const searchParams = request.nextUrl.searchParams;
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    if (isNaN(year)) {
      return NextResponse.json({ error: 'Année invalide' }, { status: 400 });
    }

    // Récupérer l'employé
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: {
        company: true,
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employé non trouvé' }, { status: 404 });
    }

    // Récupérer tous les bulletins de paie de l'employé pour l'année spécifiée
    const startDate = new Date(year, 0, 1); // 1er janvier de l'année
    const endDate = new Date(year, 11, 31); // 31 décembre de l'année

    const payslips = await prisma.payslip.findMany({
      where: {
        employeeId: params.id,
        periodStart: {
          gte: startDate,
        },
        periodEnd: {
          lte: endDate,
        },
      },
      orderBy: {
        periodStart: 'asc',
      },
    }) as ExtendedPayslip[];

    // Initialiser les totaux annuels
    const annual: AnnualTotals = {
      grossSalary: 0,
      netSalary: 0,
      employeeContributions: 0,
      employerContributions: 0,
      employerCost: 0,
      paidLeaveAcquired: 0,
      paidLeaveTaken: 0,
      paidLeaveBalance: 0,
      hoursWorked: 0,
      taxAmount: 0,
    };

    // Initialiser les contributions par catégorie
    const annualContributionsByCategory: Record<string, ContributionAmounts> = {};

    // Préparer les données mensuelles
    const monthlyData: MonthlyData[] = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(year, i, 1);
      monthlyData.push({
        id: null,
        month: date.toLocaleDateString('fr-FR', { month: 'long' }),
        monthIndex: i,
        periodStart: null,
        periodEnd: null,
        grossSalary: 0,
        netSalary: 0,
        employeeContributions: 0,
        employerContributions: 0,
        employerCost: 0,
        paidLeaveAcquired: 0,
        paidLeaveTaken: 0,
        paidLeaveBalance: 0,
        hoursWorked: 0,
        contributionsByCategory: {},
        taxAmount: 0,
      });
    }

    // Calculer les totaux et remplir les données mensuelles
    let currentLeaveBalance = 0;

    payslips.forEach(payslip => {
      // Mise à jour des totaux annuels
      annual.grossSalary += payslip.grossSalary;
      annual.netSalary += payslip.netSalary;
      annual.employeeContributions += payslip.employeeContributions;
      annual.employerContributions += payslip.employerContributions;
      annual.employerCost += payslip.employerCost;
      annual.paidLeaveAcquired += payslip.paidLeaveAcquired;
      annual.paidLeaveTaken += payslip.paidLeaveTaken;
      annual.hoursWorked += payslip.hoursWorked;
      annual.taxAmount += payslip.taxAmount || 0;

      // Mise à jour du solde des congés
      currentLeaveBalance = payslip.paidLeaveBalance || 0;

      // Calculer les contributions par catégorie
      const contributions = payslip.contributions || {};
      
      Object.entries(contributions).forEach(([category, amounts]) => {
        if (!annualContributionsByCategory[category]) {
          annualContributionsByCategory[category] = { employee: 0, employer: 0 };
        }
        annualContributionsByCategory[category].employee += amounts.employee;
        annualContributionsByCategory[category].employer += amounts.employer;
      });

      // Mise à jour des données mensuelles
      if (payslip.periodStart) {
        const month = new Date(payslip.periodStart).getMonth();
        monthlyData[month] = {
          id: payslip.id,
          month: monthlyData[month].month,
          monthIndex: month,
          periodStart: payslip.periodStart.toISOString(),
          periodEnd: payslip.periodEnd.toISOString(),
          grossSalary: payslip.grossSalary,
          netSalary: payslip.netSalary,
          employeeContributions: payslip.employeeContributions,
          employerContributions: payslip.employerContributions,
          employerCost: payslip.employerCost,
          paidLeaveAcquired: payslip.paidLeaveAcquired,
          paidLeaveTaken: payslip.paidLeaveTaken,
          paidLeaveBalance: payslip.paidLeaveBalance || 0,
          hoursWorked: payslip.hoursWorked,
          contributionsByCategory: contributions,
          taxAmount: payslip.taxAmount || 0,
        };
      }
    });

    // Mise à jour du solde final des congés
    annual.paidLeaveBalance = currentLeaveBalance;

    // Construire la réponse
    const response = {
      year,
      employee: {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        position: employee.position,
        socialSecurityNumber: employee.socialSecurityNumber,
      },
      company: {
        id: employee.company.id,
        name: employee.company.name,
        siret: employee.company.siret,
      },
      annual,
      annualContributionsByCategory,
      monthlyData,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erreur lors de la récupération du récapitulatif annuel:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération du récapitulatif annuel' },
      { status: 500 }
    );
  }
} 