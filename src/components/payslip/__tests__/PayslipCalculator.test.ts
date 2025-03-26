import { PayslipCalculator, PayslipData } from '../PayslipCalculator';
import { HOURS_PER_MONTH, PAID_LEAVE_DAYS_PER_MONTH } from '../PayslipCalculator';

describe('PayslipCalculator', () => {
  // Données de test pour un salarié temps plein
  const testData: Partial<PayslipData> = {
    employerName: 'Test Company',
    employerAddress: '123 Test St',
    employerSiret: '12345678901234',
    employerUrssaf: '123456789',
    employeeName: 'John Doe',
    employeeAddress: '456 Employee St',
    employeePosition: 'Développeur',
    employeeSocialSecurityNumber: '1234567890123',
    isExecutive: false,
    periodStart: new Date('2024-01-01'),
    periodEnd: new Date('2024-01-31'),
    paymentDate: new Date('2024-02-05'),
    hourlyRate: 25, // 25€/h
    hoursWorked: HOURS_PER_MONTH,
    paidLeaveDays: {
      acquired: 0,
      taken: 0,
      remaining: 0
    }
  };

  describe('Calculs de base', () => {
    let calculator: PayslipCalculator;

    beforeEach(() => {
      calculator = new PayslipCalculator(testData);
    });

    test('calcule correctement le salaire brut', () => {
      const grossSalary = calculator.calculateGrossSalary();
      expect(grossSalary).toBe(25 * HOURS_PER_MONTH); // 25€/h * 151.67h
    });

    test('calcule correctement les cotisations', () => {
      // Calcul du salaire brut d'abord
      calculator.calculate();
      const contributions = calculator.getData().contributions;
      
      // Vérifie que les cotisations sont calculées
      expect(contributions.employee).toBeGreaterThan(0);
      expect(contributions.employer).toBeGreaterThan(0);
      expect(contributions.details.length).toBeGreaterThan(0);
    });

    test('calcule correctement le salaire net', () => {
      calculator.calculate();
      const netSalary = calculator.getData().netSalary;
      const grossSalary = calculator.getData().grossSalary;
      const employeeContributions = calculator.getData().contributions.employee;
      
      expect(netSalary).toBe(grossSalary - employeeContributions);
    });

    test('calcule correctement le coût employeur', () => {
      calculator.calculate();
      const employerCost = calculator.getData().employerCost;
      const grossSalary = calculator.getData().grossSalary;
      const employerContributions = calculator.getData().contributions.employer;
      
      expect(employerCost).toBe(grossSalary + employerContributions);
    });
  });

  describe('Calcul des congés payés', () => {
    let calculator: PayslipCalculator;

    beforeEach(() => {
      calculator = new PayslipCalculator(testData);
    });

    test('calcule correctement les congés payés pour un mois', () => {
      calculator.calculatePaidLeave();
      const paidLeave = calculator.getData().paidLeaveDays;
      
      expect(paidLeave.acquired).toBe(PAID_LEAVE_DAYS_PER_MONTH);
      expect(paidLeave.taken).toBe(0);
      expect(paidLeave.remaining).toBe(PAID_LEAVE_DAYS_PER_MONTH);
    });

    test('calcule correctement les congés payés avec des congés pris', () => {
      const calculatorWithLeave = new PayslipCalculator({
        ...testData,
        paidLeaveDays: {
          acquired: PAID_LEAVE_DAYS_PER_MONTH,
          taken: 1,
          remaining: PAID_LEAVE_DAYS_PER_MONTH - 1
        }
      });
      
      calculatorWithLeave.calculatePaidLeave();
      const paidLeave = calculatorWithLeave.getData().paidLeaveDays;
      
      expect(paidLeave.acquired).toBe(PAID_LEAVE_DAYS_PER_MONTH);
      expect(paidLeave.taken).toBe(1);
      expect(paidLeave.remaining).toBe(PAID_LEAVE_DAYS_PER_MONTH - 1);
    });
  });

  describe('Calcul des cumuls', () => {
    test('calcule correctement les cumuls pour une première fiche', () => {
      const calculator = new PayslipCalculator(testData);
      calculator.calculate();
      calculator.updateCumulatives();
      
      const data = calculator.getData();
      expect(data.cumulativeGrossSalary).toBe(data.grossSalary);
      expect(data.cumulativeNetSalary).toBe(data.netSalary);
    });

    test('calcule correctement les cumuls avec une fiche précédente', () => {
      const previousPayslip = new PayslipCalculator(testData);
      previousPayslip.calculate();
      previousPayslip.updateCumulatives();
      
      const currentPayslip = new PayslipCalculator(testData);
      currentPayslip.calculate();
      currentPayslip.updateCumulatives(previousPayslip.getData());
      
      const data = currentPayslip.getData();
      expect(data.cumulativeGrossSalary).toBe(previousPayslip.getData().grossSalary * 2);
      expect(data.cumulativeNetSalary).toBe(previousPayslip.getData().netSalary * 2);
    });
  });

  describe('Calcul complet', () => {
    test('effectue tous les calculs dans le bon ordre', () => {
      const calculator = new PayslipCalculator(testData);
      const result = calculator.calculate();
      
      // Vérifie que tous les champs calculés sont présents et cohérents
      expect(result.grossSalary).toBeGreaterThan(0);
      expect(result.contributions.employee).toBeGreaterThan(0);
      expect(result.contributions.employer).toBeGreaterThan(0);
      expect(result.netSalary).toBe(result.grossSalary - result.contributions.employee);
      expect(result.employerCost).toBe(result.grossSalary + result.contributions.employer);
      expect(result.paidLeaveDays.acquired).toBe(PAID_LEAVE_DAYS_PER_MONTH);
    });
  });
}); 