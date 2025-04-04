import { NextRequest, NextResponse } from 'next/server';
import { PayrollService } from '@/lib/payroll/payrollService';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { employeeId, period } = data;
    
    if (!employeeId || !period) {
      return NextResponse.json(
        { error: 'Les identifiants employeeId et period sont requis' },
        { status: 400 }
      );
    }
    
    // 1. Récupérer les données nécessaires
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { 
        company: true,
        contracts: {
          where: { 
            startDate: { lte: new Date(period) },
            OR: [
              { endDate: null },
              { endDate: { gte: new Date(period) } }
            ]
          },
          orderBy: { startDate: 'desc' },
          take: 1
        }
      }
    });
    
    if (!employee) {
      return NextResponse.json({ error: 'Employé non trouvé' }, { status: 404 });
    }
    
    // 2. Récupérer les paramètres de paie en vigueur
    const payrollParams = await prisma.payrollParameters.findFirst({
      where: {
        effectiveDate: { lte: new Date(period) },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date(period) } }
        ],
        isActive: true
      },
      orderBy: { effectiveDate: 'desc' }
    });
    
    if (!payrollParams) {
      return NextResponse.json(
        { error: 'Paramètres de paie non trouvés pour cette période' },
        { status: 404 }
      );
    }
    
    // 3. Déterminer le salaire brut (depuis le contrat ou l'employé)
    let grossSalary = employee.grossMonthlySalary;
    let workingHours = employee.workingHours;
    
    // Si un contrat actif existe, utiliser ses valeurs
    if (employee.contracts && employee.contracts.length > 0) {
      const latestContract = employee.contracts[0];
      grossSalary = latestContract.monthlyGrossSalary;
      
      if (latestContract.partTime && latestContract.partTimeHours) {
        workingHours = latestContract.partTimeHours;
      }
    }
    
    // 4. Effectuer le calcul de paie
    const calculationResult = PayrollService.calculatePayslip({
      employeeId: employee.id,
      grossSalary,
      period,
      isExecutive: employee.isExecutive,
      workingHours,
      taxRate: employee.taxRate || 0,
      socialSecurityCeiling: payrollParams.socialSecurityCeiling
    });
    
    // 5. Retourner le résultat
    return NextResponse.json(calculationResult);
    
  } catch (error) {
    console.error('Erreur de calcul de paie:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul de la paie' },
      { status: 500 }
    );
  }
} 