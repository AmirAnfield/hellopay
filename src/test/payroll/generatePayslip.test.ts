import { describe, it, expect, vi } from 'vitest';
import { PayrollService } from '@/lib/payroll/payrollService';

// Mock de Decimal pour éviter les erreurs "Invalid argument: undefined"
vi.mock('@prisma/client/runtime/library', () => {
  return {
    Decimal: class MockDecimal {
      value: number;
      
      constructor(value: number | string) {
        this.value = typeof value === 'string' ? parseFloat(value) : value;
      }
      
      mul(other: MockDecimal | number): MockDecimal {
        const otherValue = other instanceof MockDecimal ? other.value : other;
        return new MockDecimal(this.value * otherValue);
      }
      
      div(other: MockDecimal | number): MockDecimal {
        const otherValue = other instanceof MockDecimal ? other.value : other;
        return new MockDecimal(this.value / otherValue);
      }
      
      add(other: MockDecimal | number): MockDecimal {
        const otherValue = other instanceof MockDecimal ? other.value : other;
        return new MockDecimal(this.value + otherValue);
      }
      
      sub(other: MockDecimal | number): MockDecimal {
        const otherValue = other instanceof MockDecimal ? other.value : other;
        return new MockDecimal(this.value - otherValue);
      }
      
      lessThan(other: MockDecimal | number): boolean {
        const otherValue = other instanceof MockDecimal ? other.value : other;
        return this.value < otherValue;
      }
      
      lessThanOrEqualTo(other: MockDecimal | number): boolean {
        const otherValue = other instanceof MockDecimal ? other.value : other;
        return this.value <= otherValue;
      }
      
      greaterThan(other: MockDecimal | number): boolean {
        const otherValue = other instanceof MockDecimal ? other.value : other;
        return this.value > otherValue;
      }
      
      equals(other: MockDecimal | number): boolean {
        const otherValue = other instanceof MockDecimal ? other.value : other;
        return this.value === otherValue;
      }
      
      toString(): string {
        return this.value.toString();
      }
      
      toNumber(): number {
        return this.value;
      }
    }
  };
});

describe('PayrollService.calculatePayslip', () => {
  it('devrait calculer un bulletin de paie basique correctement', () => {
    const result = PayrollService.calculatePayslip({
      employeeId: '123',
      grossSalary: 3000,
      period: '2023-05',
      isExecutive: false,
      socialSecurityCeiling: 3500
    });
    
    expect(result).toBeDefined();
    expect(result.employeeId).toBe('123');
    expect(result.period).toBe('2023-05');
    expect(result.grossSalary.toNumber()).toBe(3000);

    // Vérifier que les contributions sont calculées
    expect(result.contributions.length).toBeGreaterThan(0);
    
    // Vérifier que les totaux sont calculés
    expect(result.totalEmployeeContributions.toNumber()).toBeGreaterThan(0);
    expect(result.totalEmployerContributions.toNumber()).toBeGreaterThan(0);
    expect(result.netBeforeTax.toNumber()).toBeLessThan(3000);
  });
  
  it('devrait calculer correctement les cotisations pour un cadre', () => {
    const resultExecutive = PayrollService.calculatePayslip({
      employeeId: '123',
      grossSalary: 3000,
      period: '2023-05',
      isExecutive: true,
      socialSecurityCeiling: 3500
    });
    
    const resultNonExecutive = PayrollService.calculatePayslip({
      employeeId: '123',
      grossSalary: 3000,
      period: '2023-05',
      isExecutive: false,
      socialSecurityCeiling: 3500
    });
    
    // Les cadres ont généralement des cotisations de retraite complémentaire plus élevées
    const executiveContributions = resultExecutive.totalEmployeeContributions.toNumber();
    const nonExecutiveContributions = resultNonExecutive.totalEmployeeContributions.toNumber();
    
    // Vérifie que les cotisations d'un cadre sont différentes (en principe plus élevées)
    expect(executiveContributions).not.toBe(nonExecutiveContributions);
  });
  
  it('devrait calculer correctement un salaire au prorata pour temps partiel', () => {
    const resultFullTime = PayrollService.calculatePayslip({
      employeeId: '123',
      grossSalary: 3000,
      period: '2023-05',
      isExecutive: false,
      workingHours: 35, // Temps plein
      socialSecurityCeiling: 3500
    });
    
    const resultPartTime = PayrollService.calculatePayslip({
      employeeId: '123',
      grossSalary: 3000,
      period: '2023-05',
      isExecutive: false,
      workingHours: 20, // Temps partiel
      socialSecurityCeiling: 3500
    });
    
    // Pour temps partiel, le salaire brut effectif est proratisé
    // 20h/35h = 0.571... donc environ 57% du salaire plein temps
    expect(resultPartTime.grossSalary.toNumber()).toBeLessThan(resultFullTime.grossSalary.toNumber());
    
    // Toutes les cotisations devraient également être inférieures
    expect(resultPartTime.totalEmployeeContributions.toNumber())
      .toBeLessThan(resultFullTime.totalEmployeeContributions.toNumber());
  });
  
  it('devrait appliquer correctement les tranches de cotisations sociales', () => {
    // Un salaire inférieur au plafond (tout devrait être en tranche 1)
    const resultBelowCeiling = PayrollService.calculatePayslip({
      employeeId: '123',
      grossSalary: 3000,
      period: '2023-05',
      isExecutive: false,
      socialSecurityCeiling: 3500
    });
    
    // Un salaire supérieur au plafond (une partie devrait être en tranche 2)
    const resultAboveCeiling = PayrollService.calculatePayslip({
      employeeId: '123',
      grossSalary: 4000,
      period: '2023-05',
      isExecutive: false,
      socialSecurityCeiling: 3500
    });
    
    // Les cotisations de celui qui dépasse le plafond devraient être plus élevées
    expect(resultAboveCeiling.totalEmployeeContributions.toNumber())
      .toBeGreaterThan(resultBelowCeiling.totalEmployeeContributions.toNumber());
  });
  
  it('devrait calculer correctement l\'impôt sur le revenu', () => {
    const result = PayrollService.calculatePayslip({
      employeeId: '123',
      grossSalary: 3000,
      period: '2023-05',
      isExecutive: false,
      taxRate: 10, // 10% d'impôt
      socialSecurityCeiling: 3500
    });
    
    expect(result.taxAmount.toNumber()).toBeGreaterThan(0);
    
    // Le net après impôt devrait être inférieur au net avant impôt
    expect(result.netSalary.toNumber()).toBeLessThan(result.netBeforeTax.toNumber());
    
    // Vérifie que le calcul de l'impôt est cohérent avec le taux donné
    const taxableAmount = result.taxableIncome.toNumber();
    const expectedTax = taxableAmount * 0.1; // 10%
    expect(result.taxAmount.toNumber()).toBeCloseTo(expectedTax, 1);
  });
}); 