import { describe, it, expect } from 'vitest';
import { calculateContributionAmount } from '@/lib/payroll/utils';
import { Decimal } from '@prisma/client/runtime/library';

describe('calculateContributionAmount', () => {
  it('devrait calculer correctement le montant pour un taux en pourcentage', () => {
    const base = new Decimal(3000);
    const rate = new Decimal(10); // 10%
    
    const result = calculateContributionAmount(base, rate);
    
    // 3000 * 10% = 300
    expect(result.equals(new Decimal(300))).toBe(true);
  });
  
  it('devrait gérer les valeurs décimales', () => {
    const base = new Decimal(3000);
    const rate = new Decimal(5.5); // 5.5%
    
    const result = calculateContributionAmount(base, rate);
    
    // 3000 * 5.5% = 165
    expect(result.equals(new Decimal(165))).toBe(true);
  });
  
  it('devrait gérer les bases avec décimales', () => {
    const base = new Decimal(3567.89);
    const rate = new Decimal(7);
    
    const result = calculateContributionAmount(base, rate);
    
    // 3567.89 * 7% = 249.7523
    expect(result.toNumber()).toBeCloseTo(249.75, 2);
  });
  
  it('devrait retourner zéro pour un taux nul', () => {
    const base = new Decimal(3000);
    const rate = new Decimal(0);
    
    const result = calculateContributionAmount(base, rate);
    
    expect(result.equals(new Decimal(0))).toBe(true);
  });
  
  it('devrait retourner zéro pour une base nulle', () => {
    const base = new Decimal(0);
    const rate = new Decimal(10);
    
    const result = calculateContributionAmount(base, rate);
    
    expect(result.equals(new Decimal(0))).toBe(true);
  });
  
  it('devrait gérer les valeurs numériques (pas seulement Decimal)', () => {
    const base = 3000;
    const rate = 10;
    
    const result = calculateContributionAmount(base, rate);
    
    expect(result.equals(new Decimal(300))).toBe(true);
  });
  
  it('devrait produire le bon résultat avec un mélange de types (Decimal et number)', () => {
    const base = new Decimal(3000);
    const rate = 10;
    
    const result = calculateContributionAmount(base, rate);
    
    expect(result.equals(new Decimal(300))).toBe(true);
  });
}); 