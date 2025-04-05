import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { startOfMonth, endOfMonth, eachMonthOfInterval, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import path from 'path';
import fs from 'fs/promises';
import { generatePayslipPDF } from '@/lib/pdf/payslipPdfGenerator';
import { 
  calculateCsgCrdsBase, 
  calculateNetBeforeTax, 
  calculateNetSalary, 
  calculateEmployerCost 
} from '@/lib/payroll/utils';

// Schéma de validation pour les données d'entrée
const generatePayslipsSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD requis)"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD requis)"),
  salaryType: z.enum(['hourly', 'fixed']),
  hourlyRate: z.number().min(0).nullable().optional(),
  hoursWorked: z.number().min(0).nullable().optional(),
  fixedSalary: z.number().min(0).nullable().optional(),
  includePaidLeave: z.boolean().default(true),
}).refine(data => 
  (data.salaryType === 'hourly' && data.hourlyRate !== null && data.hoursWorked !== null) || 
  (data.salaryType === 'fixed' && data.fixedSalary !== null), {
  message: "Vous devez fournir soit le taux horaire et les heures travaillées, soit le salaire fixe",
  path: ["salaryType"],
});

// Constantes pour les taux de cotisations (simplifiées pour l'exemple)
const CONTRIBUTION_RATES = {
  HEALTH_EMPLOYEE: 0.075, // 7.5% Cotisation maladie salariale
  HEALTH_EMPLOYER: 0.130, // 13% Cotisation maladie patronale
  RETIREMENT_BASE_EMPLOYEE: 0.069, // 6.9% Retraite de base salariale
  RETIREMENT_BASE_EMPLOYER: 0.084, // 8.4% Retraite de base patronale
  UNEMPLOYMENT_EMPLOYEE: 0.024, // 2.4% Chômage salarial
  UNEMPLOYMENT_EMPLOYER: 0.041, // 4.1% Chômage patronal
  CSG_CRDS: 0.098, // 9.8% CSG/CRDS (dont 2.4% déductible)
  FAMILY_EMPLOYER: 0.035, // 3.5% Allocations familiales
  ACCIDENT_EMPLOYER: 0.012, // 1.2% Accidents du travail
};

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const employeeId = params.id;
    
    if (!employeeId) {
      return NextResponse.json(
        { error: 'ID de l\'employé manquant' },
        { status: 400 }
      );
    }
    
    // Vérifier si l'utilisateur est authentifié
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour générer des bulletins de paie' },
        { status: 401 }
      );
    }
    
    // Récupérer les données de la requête
    const requestData = await req.json();
    
    // Valider les données d'entrée
    const validation = generatePayslipsSchema.safeParse(requestData);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Données invalides', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }
    
    const data = validation.data;
    
    // Récupérer les informations sur l'employé
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        company: true,
      }
    });
    
    if (!employee) {
      return NextResponse.json(
        { error: 'Employé introuvable' },
        { status: 404 }
      );
    }
    
    // Vérifier que l'utilisateur a le droit de gérer cet employé (via son entreprise)
    const company = await prisma.company.findFirst({
      where: {
        id: employee.companyId,
        userId: session.user.id,
      }
    });
    
    if (!company) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à générer des bulletins pour cet employé' },
        { status: 403 }
      );
    }
    
    // Déterminer la plage de mois pour la génération
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    
    // Générer la liste des premiers jours de chaque mois dans l'intervalle
    const monthsToGenerate = eachMonthOfInterval({
      start: startOfMonth(start),
      end: endOfMonth(end)
    });
    
    // Vérifier qu'il n'y a pas trop de mois à générer (limiter à 24 mois max)
    if (monthsToGenerate.length > 24) {
      return NextResponse.json(
        { error: 'La période sélectionnée est trop longue (maximum 24 mois)' },
        { status: 400 }
      );
    }
    
    // Calculer le salaire brut pour chaque type de rémunération
    const determineGrossSalary = () => {
      if (data.salaryType === 'hourly' && data.hourlyRate && data.hoursWorked) {
        return data.hourlyRate * data.hoursWorked;
      } else if (data.salaryType === 'fixed' && data.fixedSalary) {
        return data.fixedSalary;
      }
      // Fallback sur le salaire enregistré pour l'employé
      return employee.baseSalary;
    };
    
    const grossSalary = determineGrossSalary();
    const hoursWorked = data.salaryType === 'hourly' && data.hoursWorked 
      ? data.hoursWorked 
      : employee.monthlyHours;
    const hourlyRate = data.salaryType === 'hourly' && data.hourlyRate 
      ? data.hourlyRate 
      : employee.hourlyRate;
    
    // Récupérer le dernier solde de congés payés
    let currentPaidLeaveBalance = employee.paidLeaveBalance;
    
    // Liste des bulletins créés
    const createdPayslips = [];
    
    // Créer un bulletin pour chaque mois
    for (const monthDate of monthsToGenerate) {
      // Vérifier si un bulletin existe déjà pour ce mois et cet employé
      const existingPayslip = await prisma.payslip.findFirst({
        where: {
          employeeId,
          periodStart: {
            gte: startOfMonth(monthDate),
            lt: endOfMonth(monthDate)
          }
        }
      });
      
      if (existingPayslip) {
        console.log(`Bulletin déjà existant pour ${format(monthDate, 'MMMM yyyy', { locale: fr })}, on le saute.`);
        continue;
      }
      
      // Calculer la période du bulletin
      const periodStart = startOfMonth(monthDate);
      const periodEnd = endOfMonth(monthDate);
      const paymentDate = new Date(periodEnd);
      paymentDate.setDate(paymentDate.getDate() + 5); // Paiement 5 jours après la fin du mois
      
      // Calculer l'année fiscale
      const fiscalYear = periodStart.getFullYear();
      
      // Calcul des congés payés pour ce mois
      const paidLeaveAcquired = data.includePaidLeave ? 2.5 : 0; // 2.5 jours par mois travaillé
      const paidLeaveTaken = 0; // Par défaut, pas de congés pris
      const paidLeaveRemaining = currentPaidLeaveBalance + paidLeaveAcquired - paidLeaveTaken;
      
      // Mettre à jour le solde pour le mois suivant
      currentPaidLeaveBalance = paidLeaveRemaining;
      
      // Calcul des contributions
      const csgCrdsBase = calculateCsgCrdsBase(grossSalary);
      
      // Créer les entrées de contributions
      const contributions = [
        // Santé
        {
          category: "Santé",
          label: "Assurance Maladie",
          baseType: "Salaire brut",
          baseAmount: grossSalary,
          employeeRate: CONTRIBUTION_RATES.HEALTH_EMPLOYEE * 100,
          employerRate: CONTRIBUTION_RATES.HEALTH_EMPLOYER * 100,
          employeeAmount: grossSalary * CONTRIBUTION_RATES.HEALTH_EMPLOYEE,
          employerAmount: grossSalary * CONTRIBUTION_RATES.HEALTH_EMPLOYER,
        },
        // Retraite
        {
          category: "Retraite",
          label: "Retraite de base",
          baseType: "Salaire brut",
          baseAmount: grossSalary,
          employeeRate: CONTRIBUTION_RATES.RETIREMENT_BASE_EMPLOYEE * 100,
          employerRate: CONTRIBUTION_RATES.RETIREMENT_BASE_EMPLOYER * 100,
          employeeAmount: grossSalary * CONTRIBUTION_RATES.RETIREMENT_BASE_EMPLOYEE,
          employerAmount: grossSalary * CONTRIBUTION_RATES.RETIREMENT_BASE_EMPLOYER,
        },
        // Chômage
        {
          category: "Chômage",
          label: "Assurance chômage",
          baseType: "Salaire brut",
          baseAmount: grossSalary,
          employeeRate: CONTRIBUTION_RATES.UNEMPLOYMENT_EMPLOYEE * 100,
          employerRate: CONTRIBUTION_RATES.UNEMPLOYMENT_EMPLOYER * 100,
          employeeAmount: grossSalary * CONTRIBUTION_RATES.UNEMPLOYMENT_EMPLOYEE,
          employerAmount: grossSalary * CONTRIBUTION_RATES.UNEMPLOYMENT_EMPLOYER,
        },
        // CSG/CRDS
        {
          category: "CSG/CRDS",
          label: "CSG/CRDS",
          baseType: "Base CSG/CRDS",
          baseAmount: csgCrdsBase,
          employeeRate: CONTRIBUTION_RATES.CSG_CRDS * 100,
          employerRate: 0,
          employeeAmount: csgCrdsBase * CONTRIBUTION_RATES.CSG_CRDS,
          employerAmount: 0,
        },
        // Allocations familiales (patronale uniquement)
        {
          category: "Famille",
          label: "Allocations familiales",
          baseType: "Salaire brut",
          baseAmount: grossSalary,
          employeeRate: 0,
          employerRate: CONTRIBUTION_RATES.FAMILY_EMPLOYER * 100,
          employeeAmount: 0,
          employerAmount: grossSalary * CONTRIBUTION_RATES.FAMILY_EMPLOYER,
        },
        // Accidents du travail (patronale uniquement)
        {
          category: "Accidents",
          label: "Accidents du travail",
          baseType: "Salaire brut",
          baseAmount: grossSalary,
          employeeRate: 0,
          employerRate: CONTRIBUTION_RATES.ACCIDENT_EMPLOYER * 100,
          employeeAmount: 0,
          employerAmount: grossSalary * CONTRIBUTION_RATES.ACCIDENT_EMPLOYER,
        },
      ];
      
      // Calculer les totaux des contributions
      const totalEmployeeContributions = contributions.reduce(
        (sum, contrib) => sum + contrib.employeeAmount,
        0
      );
      
      const totalEmployerContributions = contributions.reduce(
        (sum, contrib) => sum + contrib.employerAmount,
        0
      );
      
      // Calculer le net avant impôt
      const netBeforeTax = calculateNetBeforeTax(grossSalary, totalEmployeeContributions);
      
      // On prend un taux d'imposition fixe de 12% pour simplifier
      const taxRate = 12;
      const taxAmount = (netBeforeTax * taxRate) / 100;
      
      // Calculer le net à payer
      const netSalary = calculateNetSalary(netBeforeTax, taxAmount);
      
      // Calculer le coût employeur
      const employerCost = calculateEmployerCost(grossSalary, totalEmployerContributions);
      
      // Calculer les périodes pour les totaux cumulés
      const cumulativePeriodStart = new Date(fiscalYear, 0, 1); // 1er janvier de l'année fiscale
      const cumulativePeriodEnd = new Date(fiscalYear, 11, 31); // 31 décembre de l'année fiscale
      
      // Calculer les cumuls depuis le début de l'année fiscale
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
      
      // Détails des contributions au format JSON
      const contributionsDetails = JSON.stringify({
        salariales: contributions.reduce((acc, contrib) => {
          if (contrib.employeeAmount > 0) {
            acc[contrib.label] = contrib.employeeAmount;
          }
          return acc;
        }, {}),
        patronales: contributions.reduce((acc, contrib) => {
          if (contrib.employerAmount > 0) {
            acc[contrib.label] = contrib.employerAmount;
          }
          return acc;
        }, {})
      });
      
      // Créer le bulletin dans la base de données
      const payslip = await prisma.payslip.create({
        data: {
          userId: session.user.id,
          companyId: employee.companyId,
          employeeId: employee.id,
          
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
          hourlyRate,
          hoursWorked,
          grossSalary,
          netSalary,
          employerCost,
          
          // Cotisations
          employeeContributions: totalEmployeeContributions,
          employerContributions: totalEmployerContributions,
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
          
          // Statut initial
          status: 'draft',
        }
      });
      
      // Créer les contributions associées au bulletin
      for (const contrib of contributions) {
        await prisma.contribution.create({
          data: {
            payslipId: payslip.id,
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
      
      // Générer le PDF
      const pdfData = {
        employee: {
          firstName: employee.firstName,
          lastName: employee.lastName,
          position: employee.position,
          socialSecurityNumber: employee.socialSecurityNumber,
          isExecutive: employee.isExecutive,
        },
        company: {
          name: company.name,
          siret: company.siret,
          address: company.address,
          postalCode: company.postalCode,
          city: company.city,
        },
        calculation: {
          grossSalary: grossSalary,
          netSalary: netSalary,
          employerCost: employerCost,
          totalEmployeeContributions: totalEmployeeContributions,
          totalEmployerContributions: totalEmployerContributions,
          netBeforeTax: netBeforeTax,
          taxAmount: taxAmount,
          contributions: contributions.map(contrib => ({
            label: contrib.label,
            baseAmount: contrib.baseAmount,
            employeeRate: contrib.employeeRate,
            employeeAmount: contrib.employeeAmount,
            employerRate: contrib.employerRate,
            employerAmount: contrib.employerAmount,
          })),
        },
        period: periodStart,
      };
      
      const pdfBuffer = await generatePayslipPDF(pdfData);
      
      // Créer le répertoire de stockage si nécessaire
      const uploadDir = path.join(process.cwd(), 'public', 'payslips');
      await fs.mkdir(uploadDir, { recursive: true });
      
      // Nom de fichier unique
      const fileName = `payslip_${employeeId}_${format(periodStart, 'yyyy-MM')}_${Date.now()}.pdf`;
      const filePath = path.join(uploadDir, fileName);
      
      // Sauvegarder le PDF
      await fs.writeFile(filePath, pdfBuffer);
      
      // URL publique du PDF
      const pdfUrl = `/payslips/${fileName}`;
      
      // Mettre à jour le bulletin avec l'URL du PDF
      await prisma.payslip.update({
        where: { id: payslip.id },
        data: { pdfUrl }
      });
      
      // Ajouter le bulletin à la liste des créations réussies
      createdPayslips.push({
        id: payslip.id,
        period: format(periodStart, 'MMMM yyyy', { locale: fr }),
        grossSalary,
        netSalary,
      });
    }
    
    // Si aucun bulletin n'a été créé, c'est peut-être parce qu'ils existent déjà
    if (createdPayslips.length === 0) {
      return NextResponse.json(
        { 
          message: "Aucun bulletin n'a été créé. Ils existent peut-être déjà pour la période sélectionnée.",
          payslips: []
        },
        { status: 200 }
      );
    }
    
    // Mettre à jour le solde de congés payés de l'employé si l'option est activée
    if (data.includePaidLeave) {
      await prisma.employee.update({
        where: { id: employeeId },
        data: { paidLeaveBalance: currentPaidLeaveBalance }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `${createdPayslips.length} bulletin(s) généré(s) avec succès`,
      payslips: createdPayslips
    });
    
  } catch (error) {
    console.error('Erreur lors de la génération des bulletins:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération des bulletins' },
      { status: 500 }
    );
  }
} 