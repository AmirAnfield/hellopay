import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// Constantes pour les cotisations sociales (taux simplifiés pour l'exemple)
const COTISATIONS = {
  // Cotisations salariales
  salarie: {
    sante: 0.075,    // Assurance maladie, maternité, invalidité, décès
    retraiteBase: 0.069,  // Retraite de base
    retraiteComplementaire: 0.038, // Retraite complémentaire
    chomage: 0.024,  // Assurance chômage
    csg: 0.0975,      // CSG (dont 2.4% déductible)
    crds: 0.005,     // CRDS
  },
  // Cotisations patronales
  employeur: {
    sante: 0.130,    // Assurance maladie, maternité, invalidité, décès
    retraiteBase: 0.084,  // Retraite de base
    retraiteComplementaire: 0.057, // Retraite complémentaire
    chomage: 0.041,  // Assurance chômage
    familiales: 0.051, // Allocations familiales
    accidents: 0.020, // Accidents du travail
    divers: 0.045    // Diverses cotisations (transport, logement, etc.)
  }
};

// POST /api/payslips - Créer une fiche de paie
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour effectuer cette action" },
        { status: 401 }
      );
    }
    
    const data = await req.json();
    const { employeeId, companyId, periodDate } = data;
    
    if (!employeeId || !companyId || !periodDate) {
      return NextResponse.json(
        { error: "Informations manquantes pour générer la fiche de paie" },
        { status: 400 }
      );
    }
    
    // Vérifier que l'employé et l'entreprise existent
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });
    
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });
    
    if (!employee || !company) {
      return NextResponse.json(
        { error: "Employé ou entreprise non trouvé" },
        { status: 404 }
      );
    }
    
    // Vérifier que l'employé appartient à l'entreprise
    if (employee.companyId !== companyId) {
      return NextResponse.json(
        { error: "L'employé n'appartient pas à cette entreprise" },
        { status: 400 }
      );
    }
    
    // Calculer les dates de la période
    const period = new Date(periodDate);
    const periodStart = new Date(period.getFullYear(), period.getMonth(), 1);
    const periodEnd = new Date(period.getFullYear(), period.getMonth() + 1, 0);
    
    // Date de paiement (généralement fin du mois ou début du mois suivant)
    const paymentDate = new Date(period.getFullYear(), period.getMonth() + 1, 5);
    
    // Vérifier si une fiche de paie existe déjà pour cette période et cet employé
    const existingPayslip = await prisma.payslip.findFirst({
      where: {
        employeeId,
        periodStart: {
          gte: periodStart,
          lt: new Date(period.getFullYear(), period.getMonth() + 1, 1)
        }
      }
    });
    
    if (existingPayslip) {
      return NextResponse.json(
        { error: "Une fiche de paie existe déjà pour cette période" },
        { status: 400 }
      );
    }
    
    // Calculer les cotisations et le salaire net
    const grossSalary = employee.baseSalary;
    
    // Calculer les cotisations salariales
    const salarialesSante = grossSalary * COTISATIONS.salarie.sante;
    const salarialesRetraiteBase = grossSalary * COTISATIONS.salarie.retraiteBase;
    const salarialesRetraiteComplementaire = grossSalary * COTISATIONS.salarie.retraiteComplementaire;
    const salarialesChomage = grossSalary * COTISATIONS.salarie.chomage;
    const salarialesCSG = grossSalary * COTISATIONS.salarie.csg;
    const salarialesCRDS = grossSalary * COTISATIONS.salarie.crds;
    
    const totalCotisationsSalariales = salarialesSante + salarialesRetraiteBase + 
      salarialesRetraiteComplementaire + salarialesChomage + salarialesCSG + salarialesCRDS;
    
    // Calculer les cotisations patronales
    const patronalesSante = grossSalary * COTISATIONS.employeur.sante;
    const patronalesRetraiteBase = grossSalary * COTISATIONS.employeur.retraiteBase;
    const patronalesRetraiteComplementaire = grossSalary * COTISATIONS.employeur.retraiteComplementaire;
    const patronalesChomage = grossSalary * COTISATIONS.employeur.chomage;
    const patronalesFamiliales = grossSalary * COTISATIONS.employeur.familiales;
    const patronalesAccidents = grossSalary * COTISATIONS.employeur.accidents;
    const patronalesDivers = grossSalary * COTISATIONS.employeur.divers;
    
    const totalCotisationsPatronales = patronalesSante + patronalesRetraiteBase + 
      patronalesRetraiteComplementaire + patronalesChomage + patronalesFamiliales + 
      patronalesAccidents + patronalesDivers;
    
    // Calculer le salaire net
    const netSalary = grossSalary - totalCotisationsSalariales;
    
    // Calculer le coût total pour l'employeur
    const employerCost = grossSalary + totalCotisationsPatronales;
    
    // Détails des cotisations au format JSON
    const contributionsDetails = JSON.stringify({
      salariales: {
        sante: salarialesSante,
        retraiteBase: salarialesRetraiteBase,
        retraiteComplementaire: salarialesRetraiteComplementaire,
        chomage: salarialesChomage,
        csg: salarialesCSG,
        crds: salarialesCRDS,
        total: totalCotisationsSalariales
      },
      patronales: {
        sante: patronalesSante,
        retraiteBase: patronalesRetraiteBase,
        retraiteComplementaire: patronalesRetraiteComplementaire,
        chomage: patronalesChomage,
        familiales: patronalesFamiliales,
        accidents: patronalesAccidents,
        divers: patronalesDivers,
        total: totalCotisationsPatronales
      }
    });
    
    // Déterminer l'année fiscale
    const fiscalYear = periodStart.getFullYear();
    
    // Déterminer les dates de cumul (généralement du 1er janvier au 31 décembre)
    const cumulativePeriodStart = new Date(fiscalYear, 0, 1);
    const cumulativePeriodEnd = new Date(fiscalYear, 11, 31);
    
    // Calculer les congés payés (simulation simplifiée)
    const paidLeaveAcquired = 2.5; // 2.5 jours par mois
    const paidLeaveTaken = 0; // À compléter avec les vrais congés pris
    const paidLeaveRemaining = employee.paidLeaveBalance + paidLeaveAcquired - paidLeaveTaken;
    
    // Calculer les cumuls (simulation simplifiée)
    const previousPayslips = await prisma.payslip.findMany({
      where: {
        employeeId,
        fiscalYear,
        periodStart: {
          lt: periodStart
        }
      }
    });
    
    const cumulativeGrossSalary = previousPayslips.reduce(
      (sum, payslip) => sum + payslip.grossSalary, 
      grossSalary
    );
    
    const cumulativeNetSalary = previousPayslips.reduce(
      (sum, payslip) => sum + payslip.netSalary, 
      netSalary
    );
    
    // Créer la fiche de paie
    const payslip = await prisma.payslip.create({
      data: {
        userId: session.user.id,
        companyId,
        employeeId,
        
        // Informations entreprise
        employerName: company.name,
        employerAddress: `${company.address}, ${company.postalCode} ${company.city}`,
        employerSiret: company.siret,
        employerUrssaf: company.urssafNumber || "000000000",
        
        // Informations salarié
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeAddress: `${employee.address}, ${employee.postalCode} ${employee.city}`,
        employeePosition: employee.position,
        employeeSocialSecurityNumber: employee.socialSecurityNumber,
        isExecutive: employee.isExecutive,
        
        // Période
        periodStart,
        periodEnd,
        paymentDate,
        fiscalYear,
        
        // Rémunération
        hourlyRate: employee.hourlyRate,
        hoursWorked: employee.monthlyHours,
        grossSalary,
        netSalary,
        employerCost,
        
        // Cotisations
        employeeContributions: totalCotisationsSalariales,
        employerContributions: totalCotisationsPatronales,
        contributionsDetails,
        
        // Congés payés
        paidLeaveAcquired,
        paidLeaveTaken,
        paidLeaveRemaining,
        
        // Cumuls
        cumulativeGrossSalary,
        cumulativeNetSalary,
        cumulativePeriodStart,
        cumulativePeriodEnd,
      }
    });
    
    // Mettre à jour le solde de congés payés de l'employé
    await prisma.employee.update({
      where: { id: employeeId },
      data: { paidLeaveBalance: paidLeaveRemaining }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Fiche de paie générée avec succès",
      payslip
    });
  } catch (error) {
    console.error("Erreur lors de la création de la fiche de paie:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la fiche de paie" },
      { status: 500 }
    );
  }
}

// GET /api/payslips - Récupérer les fiches de paie
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour effectuer cette action" },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    const companyId = searchParams.get('companyId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    const where: Prisma.PayslipWhereInput = { userId: session.user.id };
    
    if (employeeId) where.employeeId = employeeId;
    if (companyId) where.companyId = companyId;
    
    if (month && year) {
      const periodStart = new Date(parseInt(year), parseInt(month) - 1, 1);
      const periodEnd = new Date(parseInt(year), parseInt(month), 0);
      
      where.periodStart = {
        gte: periodStart
      };
      where.periodEnd = {
        lte: periodEnd
      };
    } else if (year) {
      where.fiscalYear = parseInt(year);
    }
    
    const payslips = await prisma.payslip.findMany({
      where,
      orderBy: { periodStart: 'desc' },
      include: {
        employee: true,
        company: true
      }
    });
    
    return NextResponse.json({ payslips });
  } catch (error) {
    console.error("Erreur lors de la récupération des fiches de paie:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des fiches de paie" },
      { status: 500 }
    );
  }
} 