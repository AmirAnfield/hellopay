import { describe, it, expect } from 'vitest';
import { 
  calculateNetBeforeTax,
  calculateNetSalary,
  calculateEmployerCost,
  calculateProRataSalary,
  toDecimal
} from '@/lib/payroll/utils';
import { Decimal } from '@prisma/client/runtime/library';

describe('Fonctions de calcul de paie', () => {
  describe('toDecimal', () => {
    it('devrait convertir un nombre en Decimal', () => {
      const result = toDecimal(100);
      expect(result).toBeInstanceOf(Decimal);
      expect(result.toString()).toBe('100');
    });

    it('devrait renvoyer une Decimal inchangée', () => {
      const decimal = new Decimal(200);
      const result = toDecimal(decimal);
      expect(result).toBe(decimal);
    });

    it('devrait gérer les valeurs nulles', () => {
      const result = toDecimal(0);
      expect(result).toBeInstanceOf(Decimal);
      expect(result.toString()).toBe('0');
    });
  });

  describe('calculateNetBeforeTax', () => {
    it('devrait calculer correctement le net avant impôt', () => {
      const grossSalary = 3000;
      const employeeContributions = 600; // 20% de cotisations salariales
      
      const result = calculateNetBeforeTax(grossSalary, employeeContributions);
      
      // Net avant impôt = Brut - Cotisations salariales
      expect(result.toString()).toBe('2400');
    });

    it('devrait gérer les valeurs décimales', () => {
      const grossSalary = 3333.33;
      const employeeContributions = 666.67;
      
      const result = calculateNetBeforeTax(grossSalary, employeeContributions);
      
      // Vérifier que le résultat est arrondi correctement
      expect(result.toString()).toBe('2666.66');
    });
  });

  describe('calculateNetSalary', () => {
    it('devrait calculer correctement le net à payer', () => {
      const netBeforeTax = 2400;
      const taxAmount = 240; // 10% d'impôt
      
      const result = calculateNetSalary(netBeforeTax, taxAmount);
      
      // Net à payer = Net avant impôt - Impôt
      expect(result.toString()).toBe('2160');
    });

    it('devrait gérer le cas sans impôt', () => {
      const netBeforeTax = 1500;
      const taxAmount = 0;
      
      const result = calculateNetSalary(netBeforeTax, taxAmount);
      
      expect(result.toString()).toBe('1500');
    });
  });

  describe('calculateEmployerCost', () => {
    it('devrait calculer correctement le coût employeur', () => {
      const grossSalary = 3000;
      const employerContributions = 1200; // 40% de charges patronales
      
      const result = calculateEmployerCost(grossSalary, employerContributions);
      
      // Coût employeur = Brut + Charges patronales
      expect(result.toString()).toBe('4200');
    });
  });

  describe('calculateProRataSalary', () => {
    it('devrait calculer le salaire proratisé pour un temps partiel', () => {
      const fullTimeSalary = 3000; // Salaire plein temps
      const contractHours = 20; // 20h par semaine
      const fullTimeHours = 35; // Temps plein = 35h
      
      const result = calculateProRataSalary(fullTimeSalary, contractHours, fullTimeHours);
      
      // Proratisation: (Salaire plein temps * Heures contractuelles) / Heures plein temps
      const expected = new Decimal(3000).mul(20).div(35);
      expect(result.toString()).toBe(expected.toString());
    });

    it('devrait utiliser 35h par défaut comme référence temps plein', () => {
      const fullTimeSalary = 3500;
      const contractHours = 28;
      
      const result = calculateProRataSalary(fullTimeSalary, contractHours);
      
      // Test avec la valeur par défaut de 35h pour le temps plein
      const expected = new Decimal(3500).mul(28).div(35);
      expect(result.toString()).toBe(expected.toString());
    });

    it('devrait retourner le même salaire pour un temps plein', () => {
      const fullTimeSalary = 3000;
      const contractHours = 35;
      
      const result = calculateProRataSalary(fullTimeSalary, contractHours);
      
      expect(result.toString()).toBe('3000');
    });
  });
}); 