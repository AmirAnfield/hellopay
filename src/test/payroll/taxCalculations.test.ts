import { describe, it, expect } from 'vitest';
import { 
  calculateTaxableIncome,
  calculateTaxAmount,
} from '@/lib/payroll/utils';
import { Decimal } from '@prisma/client/runtime/library';

describe('Fonctions de calcul d\'impôt', () => {
  describe('calculateTaxableIncome', () => {
    it('devrait calculer correctement le revenu imposable', () => {
      const grossSalary = new Decimal(3000);
      const totalEmployeeContributions = new Decimal(600); // 20% de cotisations
      const nonDeductibleContributions = new Decimal(100); // Dont 100€ non déductibles
      
      const result = calculateTaxableIncome(
        grossSalary,
        totalEmployeeContributions,
        nonDeductibleContributions
      );
      
      // Revenu imposable = Brut - (Cotisations - Non déductibles)
      // 3000 - (600 - 100) = 3000 - 500 = 2500
      expect(result.equals(new Decimal(2500))).toBe(true);
    });
    
    it('devrait gérer le cas sans cotisations non déductibles', () => {
      const grossSalary = new Decimal(3000);
      const totalEmployeeContributions = new Decimal(600);
      const nonDeductibleContributions = new Decimal(0);
      
      const result = calculateTaxableIncome(
        grossSalary,
        totalEmployeeContributions,
        nonDeductibleContributions
      );
      
      // 3000 - (600 - 0) = 2400
      expect(result.equals(new Decimal(2400))).toBe(true);
    });
    
    it('devrait gérer le cas où toutes les cotisations sont non déductibles', () => {
      const grossSalary = new Decimal(3000);
      const totalEmployeeContributions = new Decimal(600);
      const nonDeductibleContributions = new Decimal(600);
      
      const result = calculateTaxableIncome(
        grossSalary,
        totalEmployeeContributions,
        nonDeductibleContributions
      );
      
      // 3000 - (600 - 600) = 3000
      expect(result.equals(new Decimal(3000))).toBe(true);
    });
    
    it('devrait gérer les valeurs numériques', () => {
      const grossSalary = 3000;
      const totalEmployeeContributions = 600;
      const nonDeductibleContributions = 100;
      
      const result = calculateTaxableIncome(
        grossSalary,
        totalEmployeeContributions,
        nonDeductibleContributions
      );
      
      expect(result.equals(new Decimal(2500))).toBe(true);
    });
  });
  
  describe('calculateTaxAmount', () => {
    it('devrait calculer correctement le montant de l\'impôt', () => {
      const taxableIncome = new Decimal(2500);
      const taxRate = new Decimal(12); // 12%
      
      const result = calculateTaxAmount(taxableIncome, taxRate);
      
      // 2500 * 12% = 300
      expect(result.equals(new Decimal(300))).toBe(true);
    });
    
    it('devrait retourner zéro pour un taux d\'imposition nul', () => {
      const taxableIncome = new Decimal(2500);
      const taxRate = new Decimal(0);
      
      const result = calculateTaxAmount(taxableIncome, taxRate);
      
      expect(result.equals(new Decimal(0))).toBe(true);
    });
    
    it('devrait retourner zéro pour un revenu nul', () => {
      const taxableIncome = new Decimal(0);
      const taxRate = new Decimal(12);
      
      const result = calculateTaxAmount(taxableIncome, taxRate);
      
      expect(result.equals(new Decimal(0))).toBe(true);
    });
    
    it('devrait gérer les taux avec décimales', () => {
      const taxableIncome = new Decimal(2500);
      const taxRate = new Decimal(12.3); // 12.3%
      
      const result = calculateTaxAmount(taxableIncome, taxRate);
      
      // 2500 * 12.3% = 307.5
      expect(result.equals(new Decimal(307.5))).toBe(true);
    });
    
    it('devrait gérer les valeurs numériques', () => {
      const taxableIncome = 2500;
      const taxRate = 12;
      
      const result = calculateTaxAmount(taxableIncome, taxRate);
      
      expect(result.equals(new Decimal(300))).toBe(true);
    });
  });
}); 