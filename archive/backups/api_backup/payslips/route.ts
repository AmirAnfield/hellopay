import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { listPayslipsQuerySchema } from '@/lib/validators/pagination';
import { getPayslips } from '@/lib/db/queries';
import { logAPIEvent, LogLevel, SecurityEvent } from '@/lib/security/logger';

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
        { success: false, message: "Vous devez être connecté pour effectuer cette action" },
        { status: 401 }
      );
    }
    
    const data = await req.json();
    const { employeeId, companyId, periodDate } = data;
    
    if (!employeeId || !companyId || !periodDate) {
      return NextResponse.json(
        { success: false, message: "Informations manquantes pour générer la fiche de paie" },
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
        { success: false, message: "Employé ou entreprise non trouvé" },
        { status: 404 }
      );
    }
    
    // Vérifier que l'employé appartient à l'entreprise
    if (employee.companyId !== companyId) {
      return NextResponse.json(
        { success: false, message: "L'employé n'appartient pas à cette entreprise" },
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
        { success: false, message: "Une fiche de paie existe déjà pour cette période" },
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
    
    // Journaliser l'événement
    logAPIEvent(
      req,
      SecurityEvent.INFO,
      `Bulletin de paie généré pour ${employee.firstName} ${employee.lastName}`,
      LogLevel.INFO,
      {
        userId: session.user.id,
        employeeId,
        companyId,
        payslipId: payslip.id,
        period: `${periodStart.getMonth() + 1}/${periodStart.getFullYear()}`
      }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: "Fiche de paie générée avec succès",
      payslip
    });
  } catch (error) {
    console.error("Erreur lors de la génération de la fiche de paie:", error);
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue lors de la génération de la fiche de paie" },
      { status: 500 }
    );
  }
}

// GET /api/payslips - Récupérer les fiches de paie avec pagination
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Vous devez être connecté pour effectuer cette action" },
        { status: 401 }
      );
    }
    
    // Récupérer les paramètres de requête
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Valider les paramètres de requête
    const validationResult = listPayslipsQuerySchema.safeParse(queryParams);
    
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
    
    // Vérifier les permissions si employeeId est spécifié
    if (params.employeeId) {
      const employee = await prisma.employee.findFirst({
        where: {
          id: params.employeeId,
          company: {
            userId: session.user.id
          }
        },
        select: { id: true }
      });

      if (!employee) {
        return NextResponse.json(
          { success: false, message: 'Employé non trouvé ou non autorisé.' },
          { status: 404 }
        );
      }
    }
    
    // Récupérer les bulletins de paie avec pagination
    const result = await getPayslips(params);
    
    // Journaliser l'événement
    logAPIEvent(
      req,
      SecurityEvent.INFO,
      `Liste des bulletins de paie récupérée (${result.meta.total} résultats)`,
      LogLevel.INFO,
      { 
        userId: session.user.id,
        companyId: params.companyId,
        employeeId: params.employeeId,
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
    console.error("Erreur lors de la récupération des fiches de paie:", error);
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue lors de la récupération des fiches de paie" },
      { status: 500 }
    );
  }
} 