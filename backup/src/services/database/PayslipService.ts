import { PrismaClient, Prisma } from '@prisma/client';
import type { PayslipData } from '../../components/payslip/PayslipCalculator';

export class PayslipService {
  private static instance: PayslipService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  public static getInstance(): PayslipService {
    if (!PayslipService.instance) {
      PayslipService.instance = new PayslipService();
    }
    return PayslipService.instance;
  }

  public async savePayslip(data: PayslipData): Promise<void> {
    // Récupérer la dernière fiche de paie pour calculer les cumuls
    const lastPayslip = await this.prisma.payslip.findFirst({
      where: {
        employeeName: data.employeeName,
        periodStart: {
          lt: data.periodStart
        }
      },
      orderBy: {
        periodStart: 'desc'
      }
    });

    // Calculer les cumuls
    const cumulativeGrossSalary = lastPayslip 
      ? lastPayslip.cumulativeGrossSalary + data.grossSalary 
      : data.grossSalary;

    const cumulativeNetSalary = lastPayslip 
      ? lastPayslip.cumulativeNetSalary + data.netSalary 
      : data.netSalary;

    // Sauvegarder la nouvelle fiche
    await this.prisma.payslip.create({
      data: {
        userId: 'default', // À remplacer par l'ID de l'utilisateur connecté
        employerName: data.employerName,
        employerAddress: data.employerAddress,
        employerSiret: data.employerSiret,
        employerUrssaf: data.employerUrssaf,
        employeeName: data.employeeName,
        employeeAddress: data.employeeAddress,
        employeePosition: data.employeePosition,
        employeeSocialSecurityNumber: data.employeeSocialSecurityNumber,
        isExecutive: data.isExecutive,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        paymentDate: data.paymentDate,
        hourlyRate: data.hourlyRate,
        hoursWorked: data.hoursWorked,
        grossSalary: data.grossSalary,
        netSalary: data.netSalary,
        employerCost: data.employerCost,
        employeeContributions: data.contributions.employee,
        employerContributions: data.contributions.employer,
        contributionsDetails: JSON.stringify(data.contributions.details),
        paidLeaveAcquired: data.paidLeaveDays.acquired,
        paidLeaveTaken: data.paidLeaveDays.taken,
        paidLeaveRemaining: data.paidLeaveDays.remaining,
        cumulativeGrossSalary,
        cumulativeNetSalary
      }
    });
  }

  public async getPayslipsByEmployee(employeeName: string): Promise<PayslipData[]> {
    const payslips = await this.prisma.payslip.findMany({
      where: {
        employeeName
      },
      orderBy: {
        periodStart: 'desc'
      }
    });

    return payslips.map(payslip => ({
      employerName: payslip.employerName,
      employerAddress: payslip.employerAddress,
      employerSiret: payslip.employerSiret,
      employerUrssaf: payslip.employerUrssaf,
      employeeName: payslip.employeeName,
      employeeAddress: payslip.employeeAddress,
      employeePosition: payslip.employeePosition,
      employeeSocialSecurityNumber: payslip.employeeSocialSecurityNumber,
      isExecutive: payslip.isExecutive,
      periodStart: payslip.periodStart,
      periodEnd: payslip.periodEnd,
      paymentDate: payslip.paymentDate,
      hourlyRate: payslip.hourlyRate,
      hoursWorked: payslip.hoursWorked,
      grossSalary: payslip.grossSalary,
      netSalary: payslip.netSalary,
      employerCost: payslip.employerCost,
      contributions: {
        employee: payslip.employeeContributions,
        employer: payslip.employerContributions,
        details: JSON.parse(payslip.contributionsDetails)
      },
      paidLeaveDays: {
        acquired: payslip.paidLeaveAcquired,
        taken: payslip.paidLeaveTaken,
        remaining: payslip.paidLeaveRemaining
      },
      cumulativeGrossSalary: payslip.cumulativeGrossSalary,
      cumulativeNetSalary: payslip.cumulativeNetSalary
    }));
  }

  public async getPayslipById(id: string): Promise<PayslipData | null> {
    const payslip = await this.prisma.payslip.findUnique({
      where: { id }
    });

    if (!payslip) return null;

    return {
      employerName: payslip.employerName,
      employerAddress: payslip.employerAddress,
      employerSiret: payslip.employerSiret,
      employerUrssaf: payslip.employerUrssaf,
      employeeName: payslip.employeeName,
      employeeAddress: payslip.employeeAddress,
      employeePosition: payslip.employeePosition,
      employeeSocialSecurityNumber: payslip.employeeSocialSecurityNumber,
      isExecutive: payslip.isExecutive,
      periodStart: payslip.periodStart,
      periodEnd: payslip.periodEnd,
      paymentDate: payslip.paymentDate,
      hourlyRate: payslip.hourlyRate,
      hoursWorked: payslip.hoursWorked,
      grossSalary: payslip.grossSalary,
      netSalary: payslip.netSalary,
      employerCost: payslip.employerCost,
      contributions: {
        employee: payslip.employeeContributions,
        employer: payslip.employerContributions,
        details: JSON.parse(payslip.contributionsDetails)
      },
      paidLeaveDays: {
        acquired: payslip.paidLeaveAcquired,
        taken: payslip.paidLeaveTaken,
        remaining: payslip.paidLeaveRemaining
      },
      cumulativeGrossSalary: payslip.cumulativeGrossSalary,
      cumulativeNetSalary: payslip.cumulativeNetSalary
    };
  }

  public async deletePayslip(id: string): Promise<void> {
    await this.prisma.payslip.delete({
      where: { id }
    });
  }

  public async close(): Promise<void> {
    await this.prisma.$disconnect();
  }

  public async resetCumulatives(employeeName: string): Promise<void> {
    const payslips = await this.prisma.payslip.findMany({
      where: { employeeName },
      orderBy: { periodStart: 'asc' }
    });

    let cumulativeGross = 0;
    let cumulativeNet = 0;

    for (const payslip of payslips) {
      cumulativeGross += payslip.grossSalary;
      cumulativeNet += payslip.netSalary;

      await this.prisma.payslip.update({
        where: { id: payslip.id },
        data: {
          cumulativeGrossSalary: cumulativeGross,
          cumulativeNetSalary: cumulativeNet
        }
      });
    }
  }
} 