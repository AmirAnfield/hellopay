import { describe, it, expect } from 'vitest';
import { 
  calculateNetBeforeTax, 
  calculateNetSalary, 
  calculateEmployerCost, 
  calculateProRataSalary
} from '@/lib/payroll/utils';
import { Decimal } from '@prisma/client/runtime/library';

describe('Fonctions de calcul de paie de base', () => {
  describe('calculateNetBeforeTax', () => {
    it('devrait calculer correctement le net avant impôt', () => {
      const grossSalary = new Decimal(3000);
      const employeeContributions = new Decimal(600);
      
      const result = calculateNetBeforeTax(grossSalary, employeeContributions);
      
      // Net avant impôt = Brut - Cotisations
      expect(result.equals(new Decimal(2400))).toBe(true);
    });
    
    it('devrait être égal au brut si pas de cotisations', () => {
      const grossSalary = new Decimal(3000);
      const employeeContributions = new Decimal(0);
      
      const result = calculateNetBeforeTax(grossSalary, employeeContributions);
      
      expect(result.equals(grossSalary)).toBe(true);
    });
  });
  
  describe('calculateNetSalary', () => {
    it('devrait calculer correctement le net à payer', () => {
      const netBeforeTax = new Decimal(2400);
      const taxAmount = new Decimal(240); // 10% d'impôt
      
      const result = calculateNetSalary(netBeforeTax, taxAmount);
      
      // Net à payer = Net avant impôt - Impôt
      expect(result.equals(new Decimal(2160))).toBe(true);
    });
    
    it('devrait être égal au net avant impôt si pas d\'impôt', () => {
      const netBeforeTax = new Decimal(2400);
      const taxAmount = new Decimal(0);
      
      const result = calculateNetSalary(netBeforeTax, taxAmount);
      
      expect(result.equals(netBeforeTax)).toBe(true);
    });
  });
  
  describe('calculateEmployerCost', () => {
    it('devrait calculer correctement le coût employeur', () => {
      const grossSalary = new Decimal(3000);
      const employerContributions = new Decimal(900); // 30% charges patronales
      
      const result = calculateEmployerCost(grossSalary, employerContributions);
      
      // Coût employeur = Brut + Cotisations patronales
      expect(result.equals(new Decimal(3900))).toBe(true);
    });
    
    it('devrait être égal au brut si pas de charges patronales', () => {
      const grossSalary = new Decimal(3000);
      const employerContributions = new Decimal(0);
      
      const result = calculateEmployerCost(grossSalary, employerContributions);
      
      expect(result.equals(grossSalary)).toBe(true);
    });
  });
  
  describe('calculateProRataSalary', () => {
    it('devrait calculer correctement un salaire proratisé', () => {
      const fullTimeSalary = new Decimal(3000);
      const contractHours = new Decimal(20);
      const fullTimeHours = new Decimal(35);
      
      const result = calculateProRataSalary(fullTimeSalary, contractHours, fullTimeHours);
      
      // Salaire proratisé = Salaire temps plein * (Heures contractuelles / Heures temps plein)
      // 3000 * (20/35) = 3000 * 0.5714 = 1714.28...
      expect(result.toNumber()).toBeCloseTo(1714.29, 1);
    });
    
    it('devrait retourner le salaire complet si même nombre d\'heures', () => {
      const fullTimeSalary = new Decimal(3000);
      const contractHours = new Decimal(35);
      const fullTimeHours = new Decimal(35);
      
      const result = calculateProRataSalary(fullTimeSalary, contractHours, fullTimeHours);
      
      expect(result.equals(fullTimeSalary)).toBe(true);
    });
    
    it('devrait utiliser 35h comme référence par défaut', () => {
      const fullTimeSalary = new Decimal(3000);
      const contractHours = new Decimal(20);
      
      // Sans spécifier fullTimeHours, la valeur par défaut de 35 est utilisée
      const result = calculateProRataSalary(fullTimeSalary, contractHours);
      
      // 3000 * (20/35) = 1714.29
      expect(result.toNumber()).toBeCloseTo(1714.29, 1);
    });
  });
}); 