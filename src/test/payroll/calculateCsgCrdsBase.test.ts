import { describe, it, expect } from 'vitest';
import { calculateCsgCrdsBase } from '@/lib/payroll/utils';
import { Decimal } from '@prisma/client/runtime/library';
import { CSG_CRDS_BASE_RATE } from '@/lib/payroll/constants';

describe('calculateCsgCrdsBase', () => {
  it('devrait calculer correctement la base CSG/CRDS (98.25% du brut)', () => {
    const grossSalary = new Decimal(3000);
    
    const result = calculateCsgCrdsBase(grossSalary);
    
    // Base CSG = 98.25% du salaire brut
    expect(result.equals(grossSalary.mul(CSG_CRDS_BASE_RATE))).toBe(true);
    expect(result.equals(grossSalary.mul(0.9825))).toBe(true);
    expect(result.toString()).toBe('2947.5');
  });
  
  it('devrait gérer un salaire brut nul', () => {
    const grossSalary = new Decimal(0);
    
    const result = calculateCsgCrdsBase(grossSalary);
    
    expect(result.equals(new Decimal(0))).toBe(true);
  });
  
  it('devrait calculer correctement avec des valeurs décimales', () => {
    const grossSalary = new Decimal(3456.78);
    
    const result = calculateCsgCrdsBase(grossSalary);
    
    // Vérifier le résultat en utilisant toBeCloseTo plutôt qu'une égalité stricte
    // car il peut y avoir des différences minimes de précision
    expect(result.toNumber()).toBeCloseTo(3396.29, 2);
  });
  
  it('devrait gérer les valeurs numériques (pas seulement Decimal)', () => {
    const grossSalary = 3000;
    
    const result = calculateCsgCrdsBase(grossSalary);
    
    expect(result.equals(new Decimal(3000 * 0.9825))).toBe(true);
    expect(result.toString()).toBe('2947.5');
  });
  
  it('devrait utiliser le taux de la constante CSG_CRDS_BASE_RATE', () => {
    const grossSalary = new Decimal(4000);
    
    const result = calculateCsgCrdsBase(grossSalary);
    
    const expectedResult = grossSalary.mul(CSG_CRDS_BASE_RATE);
    expect(result.equals(expectedResult)).toBe(true);
  });
}); 