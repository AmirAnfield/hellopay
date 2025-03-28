import { ContributionsService } from '../../services/payroll/ContributionsService';

// Interface pour les contributions
export interface Contributions {
  employee: number;
  employer: number;
  details: any[];
}

// Interface pour les jours de congés payés
export interface PaidLeaveDays {
  acquired: number;
  taken: number;
  remaining: number;
}

// Interface pour les données de la fiche de paie
export interface PayslipData {
  // Informations employeur
  employerName: string;
  employerAddress: string;
  employerSiret: string;
  employerUrssaf: string;

  // Informations salarié
  employeeName: string;
  employeeAddress: string;
  employeePosition: string;
  employeeSocialSecurityNumber: string;
  isExecutive: boolean;

  // Période
  periodStart: Date;
  periodEnd: Date;
  paymentDate: Date;
  fiscalYear: number;

  // Rémunération
  hourlyRate: number;
  hoursWorked: number;
  grossSalary: number;
  netSalary: number;
  employerCost: number;

  // Cotisations
  contributions: Contributions;

  // Congés payés
  paidLeaveDays: PaidLeaveDays;

  // Cumuls
  cumulativeGrossSalary: number;
  cumulativeNetSalary: number;
  
  // Période des cumuls
  cumulativePeriodStart: Date;
  cumulativePeriodEnd: Date;
}

// Options du calculateur de fiches de paie
export interface PayslipCalculatorOptions {
  employerName: string;
  employerAddress: string;
  employerSiret: string;
  employerUrssaf: string;
  employeeName: string;
  employeeAddress: string;
  employeePosition: string;
  employeeSocialSecurityNumber: string;
  isExecutive: boolean;
  periodStart: Date;
  periodEnd: Date;
  paymentDate: Date;
  hourlyRate: number;
  hoursWorked: number;
  previousPayslip?: PayslipData; // Fiche de paie précédente
}

// Classe pour calculer les fiches de paie
export class PayslipCalculator {
  private options: PayslipCalculatorOptions;

  constructor(options: PayslipCalculatorOptions) {
    this.options = options;
  }

  public calculate(): PayslipData {
    const { hourlyRate, hoursWorked, isExecutive, periodStart } = this.options;
    
    // Détermination de l'année fiscale
    const fiscalYear = periodStart.getFullYear();
    
    // Calcul du salaire brut
    const grossSalary = hourlyRate * hoursWorked;
    
    // Calcul des contributions
    const contributions = ContributionsService.calculateContributions(grossSalary, fiscalYear, isExecutive);
    
    // Calcul du salaire net
    const netSalary = grossSalary - contributions.employee;
    
    // Calcul du coût employeur
    const employerCost = grossSalary + contributions.employer;
    
    // Initialisation des valeurs pour les cumuls
    let cumulativeGrossSalary = grossSalary;
    let cumulativeNetSalary = netSalary;
    
    // Dates pour la période des cumuls
    let cumulativePeriodStart = new Date(fiscalYear, 0, 1); // 1er janvier de l'année fiscale
    let cumulativePeriodEnd = new Date(fiscalYear, 11, 31); // 31 décembre de l'année fiscale
    
    // Si une fiche de paie précédente est fournie, récupérer les cumuls
    if (this.options.previousPayslip) {
      const prevPayslip = this.options.previousPayslip;
      
      // Déterminer si les cumuls doivent être réinitialisés (nouvelle année)
      const isPreviousYear = prevPayslip.fiscalYear !== fiscalYear;
      
      if (!isPreviousYear) {
        // Ajouter les cumuls de la fiche précédente
        cumulativeGrossSalary = prevPayslip.cumulativeGrossSalary + grossSalary;
        cumulativeNetSalary = prevPayslip.cumulativeNetSalary + netSalary;
        cumulativePeriodStart = new Date(prevPayslip.cumulativePeriodStart);
      }
    }
    
    // Calcul des congés payés
    const paidLeaveDays = this.calculatePaidLeaveDays();
    
    return {
      // Informations employeur
      employerName: this.options.employerName,
      employerAddress: this.options.employerAddress,
      employerSiret: this.options.employerSiret,
      employerUrssaf: this.options.employerUrssaf,
      
      // Informations salarié
      employeeName: this.options.employeeName,
      employeeAddress: this.options.employeeAddress,
      employeePosition: this.options.employeePosition,
      employeeSocialSecurityNumber: this.options.employeeSocialSecurityNumber,
      isExecutive: this.options.isExecutive,
      
      // Période
      periodStart: this.options.periodStart,
      periodEnd: this.options.periodEnd,
      paymentDate: this.options.paymentDate,
      fiscalYear,
      
      // Rémunération
      hourlyRate,
      hoursWorked,
      grossSalary,
      netSalary,
      employerCost,
      
      // Cotisations
      contributions,
      
      // Congés payés
      paidLeaveDays,
      
      // Cumuls
      cumulativeGrossSalary,
      cumulativeNetSalary,
      
      // Période des cumuls
      cumulativePeriodStart,
      cumulativePeriodEnd
    };
  }
  
  /**
   * Calcule les jours de congés payés
   */
  private calculatePaidLeaveDays(): PaidLeaveDays {
    const { previousPayslip, periodStart } = this.options;
    
    // Acquisition des congés payés (2.5 jours par mois travaillé)
    const acquiredThisMonth = 2.5;
    
    // Aucune fiche précédente, initialisation des congés
    if (!previousPayslip) {
      return {
        acquired: acquiredThisMonth,
        taken: 0,
        remaining: acquiredThisMonth
      };
    }
    
    // Récupération des congés payés précédents
    const { acquired, taken, remaining } = previousPayslip.paidLeaveDays;
    
    // Déterminer si les congés doivent être réinitialisés (1er juin)
    const isJune1st = periodStart.getMonth() === 5 && periodStart.getDate() === 1; // Juin est le mois 5 (0-indexé)
    
    if (isJune1st) {
      // Réinitialisation des congés payés au 1er juin
      return {
        acquired: acquiredThisMonth,
        taken: 0,
        remaining: acquiredThisMonth
      };
    }
    
    // Sinon, ajout des congés acquis ce mois-ci
    return {
      acquired: acquired + acquiredThisMonth,
      taken: taken, // Pas de congés pris ce mois par défaut
      remaining: remaining + acquiredThisMonth
    };
  }
  
  /**
   * Met à jour les jours de congés payés pris
   */
  public updatePaidLeaveTaken(daysOff: number): PayslipData {
    // Récupérer les données actuelles
    const currentData = this.calculate();
    
    // Mettre à jour les jours de congés pris
    const paidLeaveDays = {
      acquired: currentData.paidLeaveDays.acquired,
      taken: currentData.paidLeaveDays.taken + daysOff,
      remaining: Math.max(0, currentData.paidLeaveDays.remaining - daysOff)
    };
    
    // Mettre à jour et retourner les données
    return {
      ...currentData,
      paidLeaveDays
    };
  }
} 