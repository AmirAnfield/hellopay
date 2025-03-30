import { describe, it, expect } from 'vitest';
import { calculateSocialSecurityBase } from '@/lib/payroll/utils';
import { SOCIAL_SECURITY_BASES } from '@/lib/payroll/constants';
import { Decimal } from '@prisma/client/runtime/library';

describe('calculateSocialSecurityBase', () => {
  it('devrait retourner le salaire brut complet pour la base totale', () => {
    const grossSalary = new Decimal(3000);
    const ceiling = new Decimal(3500);
    
    const result = calculateSocialSecurityBase(
      grossSalary,
      ceiling,
      SOCIAL_SECURITY_BASES.TOTAL
    );
    
    expect(result.equals(grossSalary)).toBe(true);
  });
  
  it('devrait retourner le salaire brut lorsqu\'il est inférieur au plafond (Tranche 1)', () => {
    const grossSalary = new Decimal(3000);
    const ceiling = new Decimal(3500);
    
    const result = calculateSocialSecurityBase(
      grossSalary,
      ceiling,
      SOCIAL_SECURITY_BASES.TRANCHE_1
    );
    
    expect(result.equals(grossSalary)).toBe(true);
  });
  
  it('devrait retourner le plafond lorsque le salaire brut est supérieur (Tranche 1)', () => {
    const grossSalary = new Decimal(4000);
    const ceiling = new Decimal(3500);
    
    const result = calculateSocialSecurityBase(
      grossSalary,
      ceiling,
      SOCIAL_SECURITY_BASES.TRANCHE_1
    );
    
    expect(result.equals(ceiling)).toBe(true);
  });
  
  it('devrait retourner zéro pour la tranche 2 lorsque le salaire est inférieur au plafond', () => {
    const grossSalary = new Decimal(3000);
    const ceiling = new Decimal(3500);
    
    const result = calculateSocialSecurityBase(
      grossSalary,
      ceiling,
      SOCIAL_SECURITY_BASES.TRANCHE_2
    );
    
    expect(result.equals(new Decimal(0))).toBe(true);
  });
  
  it('devrait retourner la différence entre le salaire et le plafond pour la tranche 2', () => {
    const grossSalary = new Decimal(4000);
    const ceiling = new Decimal(3500);
    
    const result = calculateSocialSecurityBase(
      grossSalary,
      ceiling,
      SOCIAL_SECURITY_BASES.TRANCHE_2
    );
    
    expect(result.equals(new Decimal(500))).toBe(true); // 4000 - 3500 = 500
  });
  
  it('devrait limiter la tranche 2 à 8 fois le plafond', () => {
    const grossSalary = new Decimal(40000); // Très élevé
    const ceiling = new Decimal(3500);
    // 8 fois le plafond = 28000, donc la tranche 2 sera 28000 - 3500 = 24500
    
    const result = calculateSocialSecurityBase(
      grossSalary,
      ceiling,
      SOCIAL_SECURITY_BASES.TRANCHE_2
    );
    
    expect(result.equals(new Decimal(28000 - 3500))).toBe(true); // 24500
  });
  
  it('devrait calculer correctement la base CSG/CRDS (98.25% du brut)', () => {
    const grossSalary = new Decimal(3000);
    const ceiling = new Decimal(3500);
    
    const result = calculateSocialSecurityBase(
      grossSalary,
      ceiling,
      SOCIAL_SECURITY_BASES.CSG_CRDS
    );
    
    expect(result.equals(grossSalary.mul(0.9825))).toBe(true);
  });
  
  it('devrait gérer les valeurs numériques (pas seulement Decimal)', () => {
    const grossSalary = 3000;
    const ceiling = 3500;
    
    const result = calculateSocialSecurityBase(
      grossSalary,
      ceiling,
      SOCIAL_SECURITY_BASES.TOTAL
    );
    
    expect(result.equals(new Decimal(3000))).toBe(true);
  });
}); 