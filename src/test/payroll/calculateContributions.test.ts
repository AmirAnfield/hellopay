import { calculateContributions } from '@/lib/payroll-rates';
import { describe, it, expect } from 'vitest';

describe('calculateContributions', () => {
  it('devrait calculer correctement les cotisations pour un salarié non-cadre', () => {
    const grossSalary = 2500; // 2500€ brut
    const year = 2023;
    const isExecutive = false;

    const result = calculateContributions(grossSalary, year, isExecutive);

    // Vérifier que les cotisations salariales sont calculées
    expect(result.employeeContributions.total).toBeGreaterThan(0);
    expect(result.employeeContributions.sante).toBeGreaterThan(0);
    expect(result.employeeContributions.retraiteBase).toBeGreaterThan(0);
    expect(result.employeeContributions.retraiteComplementaire).toBeGreaterThan(0);
    expect(result.employeeContributions.csg).toBeGreaterThan(0);
    expect(result.employeeContributions.crds).toBeGreaterThan(0);
    
    // Le total des cotisations doit correspondre à la somme des cotisations
    expect(result.employeeContributions.total).toBeCloseTo(
      result.employeeContributions.sante +
      result.employeeContributions.retraiteBase +
      result.employeeContributions.retraiteComplementaire +
      result.employeeContributions.chomage +
      result.employeeContributions.csg +
      result.employeeContributions.crds,
      2
    );
    
    // Vérifier que les cotisations patronales sont calculées
    expect(result.employerContributions.total).toBeGreaterThan(0);
    expect(result.employerContributions.sante).toBeGreaterThan(0);
    expect(result.employerContributions.retraiteBase).toBeGreaterThan(0);
    expect(result.employerContributions.retraiteComplementaire).toBeGreaterThan(0);
    expect(result.employerContributions.familiales).toBeGreaterThan(0);
    expect(result.employerContributions.accidents).toBeGreaterThan(0);
    
    // Le total des cotisations patronales doit correspondre à la somme des cotisations
    expect(result.employerContributions.total).toBeCloseTo(
      result.employerContributions.sante +
      result.employerContributions.retraiteBase +
      result.employerContributions.retraiteComplementaire +
      result.employerContributions.chomage +
      result.employerContributions.familiales +
      result.employerContributions.accidents +
      result.employerContributions.divers,
      2
    );
  });

  it('devrait calculer correctement les cotisations pour un cadre (taux différents)', () => {
    const grossSalary = 4000; // 4000€ brut
    const year = 2023;
    const isExecutive = true;

    const result = calculateContributions(grossSalary, year, isExecutive);
    
    // Pour un cadre, la cotisation retraite complémentaire est majorée
    const resultNonCadre = calculateContributions(grossSalary, year, false);
    
    // Vérifier que le taux est bien majoré pour les cadres
    expect(result.employeeContributions.retraiteComplementaire)
      .toBeGreaterThan(resultNonCadre.employeeContributions.retraiteComplementaire);
    expect(result.employerContributions.retraiteComplementaire)
      .toBeGreaterThan(resultNonCadre.employerContributions.retraiteComplementaire);
  });

  it('devrait arrondir correctement les montants à deux décimales', () => {
    const grossSalary = 3333.33; // Montant avec décimales pour tester l'arrondi
    const year = 2023;
    const isExecutive = false;

    const result = calculateContributions(grossSalary, year, isExecutive);
    
    // Vérifier que tous les montants sont arrondis à 2 décimales
    const checkRounding = (value: number) => {
      const valueAsString = value.toString();
      const decimalPart = valueAsString.split('.')[1] || '';
      expect(decimalPart.length).toBeLessThanOrEqual(2);
    };
    
    checkRounding(result.netSalary);
    checkRounding(result.employerCost);
    checkRounding(result.employeeContributions.total);
    checkRounding(result.employerContributions.total);
    
    // Vérifier quelques valeurs spécifiques
    checkRounding(result.employeeContributions.sante);
    checkRounding(result.employeeContributions.csg);
    checkRounding(result.employerContributions.sante);
    checkRounding(result.employerContributions.familiales);
  });

  it('devrait gérer correctement différentes années fiscales', () => {
    const grossSalary = 3000;
    
    // Tester différentes années
    const result2023 = calculateContributions(grossSalary, 2023, false);
    const result2022 = calculateContributions(grossSalary, 2022, false);
    
    // Vérifier que nous obtenons des résultats pour différentes années
    // (les taux peuvent varier selon les années)
    expect(result2023).toBeDefined();
    expect(result2022).toBeDefined();
  });

  it('devrait gérer un salaire brut nul', () => {
    const grossSalary = 0;
    const year = 2023;
    const isExecutive = false;

    const result = calculateContributions(grossSalary, year, isExecutive);
    
    // Avec un salaire nul, toutes les cotisations doivent être nulles
    expect(result.employeeContributions.total).toBe(0);
    expect(result.employerContributions.total).toBe(0);
    expect(result.netSalary).toBe(0);
    expect(result.employerCost).toBe(0);
  });
}); 