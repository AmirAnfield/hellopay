import { describe, it, expect } from 'vitest';
import { formatDecimal } from '@/lib/payroll/utils';
import { Decimal } from '@prisma/client/runtime/library';

describe('formatDecimal', () => {
  it('devrait formater correctement un nombre entier en euros', () => {
    const amount = new Decimal(1000);
    
    const result = formatDecimal(amount);
    
    expect(result).toBe('1000.00 €');
  });
  
  it('devrait formater correctement un nombre avec décimales en euros', () => {
    const amount = new Decimal(1234.56);
    
    const result = formatDecimal(amount);
    
    expect(result).toBe('1234.56 €');
  });
  
  it('devrait arrondir correctement à 2 décimales par défaut', () => {
    const amount = new Decimal(1234.567);
    
    const result = formatDecimal(amount);
    
    expect(result).toBe('1234.57 €'); // Arrondi à 1234.57
  });
  
  it('devrait permettre de spécifier un nombre différent de décimales', () => {
    const amount = new Decimal(1234.567);
    
    const result = formatDecimal(amount, 3);
    
    expect(result).toBe('1234.567 €');
  });
  
  it('devrait formater correctement zéro', () => {
    const amount = new Decimal(0);
    
    const result = formatDecimal(amount);
    
    expect(result).toBe('0.00 €');
  });
  
  it('devrait formater correctement un nombre négatif', () => {
    const amount = new Decimal(-1234.56);
    
    const result = formatDecimal(amount);
    
    expect(result).toBe('-1234.56 €');
  });
  
  it('devrait gérer les valeurs numériques (pas seulement Decimal)', () => {
    const amount = 1234.56;
    
    const result = formatDecimal(amount);
    
    expect(result).toBe('1234.56 €');
  });
}); 