import { describe, it, expect } from 'vitest';
import { getRatesByYear, calculateContributions } from '@/lib/payroll-rates';

describe('payroll-rates', () => {
  describe('getRatesByYear', () => {
    it('devrait retourner les taux corrects pour 2023', () => {
      const rates = getRatesByYear(2023);
      
      expect(rates).toBeDefined();
      expect(rates.salarie).toBeDefined();
      expect(rates.employeur).toBeDefined();
      
      // Vérifier quelques taux spécifiques pour 2023
      expect(rates.salarie.sante).toBe(0.075);
      expect(rates.salarie.retraiteBase).toBe(0.069);
      expect(rates.employeur.sante).toBe(0.130);
      expect(rates.employeur.familiales).toBe(0.051);
    });
    
    it('devrait retourner les taux corrects pour 2024', () => {
      const rates = getRatesByYear(2024);
      
      expect(rates).toBeDefined();
      expect(rates.salarie).toBeDefined();
      expect(rates.employeur).toBeDefined();
      
      // Vérifier quelques taux spécifiques pour 2024
      expect(rates.salarie.sante).toBe(0.076);
      expect(rates.employeur.familiales).toBe(0.052);
    });
    
    it('devrait retourner les taux par défaut pour une année non définie', () => {
      const rates = getRatesByYear(2030);
      
      expect(rates).toBeDefined();
      // Devrait retourner les taux les plus récents (2025)
      expect(rates.salarie.sante).toBe(0.077);
      expect(rates.employeur.familiales).toBe(0.053);
    });
  });
  
  describe('calculateContributions', () => {
    it('devrait calculer correctement les cotisations pour un salarié non cadre', () => {
      const grossSalary = 3000;
      const year = 2023;
      const isExecutive = false;
      
      const result = calculateContributions(grossSalary, year, isExecutive);
      
      expect(result).toBeDefined();
      expect(result.employeeContributions).toBeDefined();
      expect(result.employerContributions).toBeDefined();
      
      // Vérifier que les cotisations sont calculées
      expect(result.employeeContributions.total).toBeGreaterThan(0);
      expect(result.employerContributions.total).toBeGreaterThan(0);
      
      // Vérifier que le salaire net est calculé
      expect(result.netSalary).toBeDefined();
      expect(result.netSalary).toBeLessThan(grossSalary);
      
      // Vérifier que le coût employeur est calculé
      expect(result.employerCost).toBeDefined();
      expect(result.employerCost).toBeGreaterThan(grossSalary);
    });
    
    it('devrait appliquer des taux plus élevés pour un cadre', () => {
      const grossSalary = 3000;
      const year = 2023;
      
      const resultCadre = calculateContributions(grossSalary, year, true);
      const resultNonCadre = calculateContributions(grossSalary, year, false);
      
      // Les cotisations d'un cadre sont plus élevées
      expect(resultCadre.employeeContributions.retraiteComplementaire)
        .toBeGreaterThan(resultNonCadre.employeeContributions.retraiteComplementaire);
      
      expect(resultCadre.employerContributions.retraiteComplementaire)
        .toBeGreaterThan(resultNonCadre.employerContributions.retraiteComplementaire);
    });
    
    it('devrait calculer des cotisations nulles pour un salaire nul', () => {
      const grossSalary = 0;
      const year = 2023;
      
      const result = calculateContributions(grossSalary, year, false);
      
      expect(result.employeeContributions.total).toBe(0);
      expect(result.employerContributions.total).toBe(0);
      expect(result.netSalary).toBe(0);
      expect(result.employerCost).toBe(0);
    });
    
    it('devrait calculer les totaux correctement', () => {
      const grossSalary = 3000;
      const year = 2023;
      
      const result = calculateContributions(grossSalary, year, false);
      
      // Vérifier que le total des cotisations salariales est la somme des composantes
      const totalEmployeeExpected = 
        result.employeeContributions.sante +
        result.employeeContributions.retraiteBase +
        result.employeeContributions.retraiteComplementaire +
        result.employeeContributions.chomage +
        result.employeeContributions.csg +
        result.employeeContributions.crds;
      
      expect(result.employeeContributions.total).toBeCloseTo(totalEmployeeExpected, 2);
      
      // Vérifier que le net est bien le brut moins les cotisations salariales
      expect(result.netSalary).toBeCloseTo(grossSalary - result.employeeContributions.total, 2);
      
      // Vérifier que le coût employeur est bien le brut plus les cotisations patronales
      expect(result.employerCost).toBeCloseTo(grossSalary + result.employerContributions.total, 2);
    });
  });
}); 