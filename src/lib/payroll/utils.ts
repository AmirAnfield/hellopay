import { Decimal } from '@prisma/client/runtime/library';
import { SOCIAL_SECURITY_BASES, CSG_CRDS_BASE_RATE } from './constants';

export type DecimalValue = Decimal | number;

// Convertir une valeur en Decimal pour les calculs précis
export function toDecimal(value: DecimalValue): Decimal {
  if (value instanceof Decimal) {
    return value;
  }
  return new Decimal(value.toString());
}

// Calculer la base CSG/CRDS (98.25% du salaire brut)
export function calculateCsgCrdsBase(grossSalary: DecimalValue): Decimal {
  const salary = toDecimal(grossSalary);
  return salary.mul(CSG_CRDS_BASE_RATE);
}

// Calculer la base de sécurité sociale pour une tranche
export function calculateSocialSecurityBase(
  grossSalary: DecimalValue,
  ceilingValue: DecimalValue,
  baseType: string
): Decimal {
  const salary = toDecimal(grossSalary);
  const ceiling = toDecimal(ceilingValue);
  
  switch (baseType) {
    case SOCIAL_SECURITY_BASES.TOTAL:
      return salary;
      
    case SOCIAL_SECURITY_BASES.PLAFOND:
    case SOCIAL_SECURITY_BASES.TRANCHE_1:
      // Limité au plafond de sécurité sociale
      return salary.lessThanOrEqualTo(ceiling) ? salary : ceiling;
      
    case SOCIAL_SECURITY_BASES.TRANCHE_2: {
      // Entre 1 et 8 fois le plafond
      if (salary.lessThanOrEqualTo(ceiling)) {
        return new Decimal(0);
      }
      const maxT2 = ceiling.mul(8);
      const aboveCeiling = salary.greaterThan(maxT2) ? maxT2 : salary;
      return aboveCeiling.sub(ceiling);
    }
      
    case SOCIAL_SECURITY_BASES.CSG_CRDS:
      return calculateCsgCrdsBase(salary);
      
    default:
      return salary;
  }
}

// Calculer le montant d'une cotisation
export function calculateContributionAmount(
  base: DecimalValue,
  rate: DecimalValue
): Decimal {
  const baseValue = toDecimal(base);
  const rateValue = toDecimal(rate);
  
  // Le taux est en pourcentage (ex: 6.8 pour 6.8%), on le divise par 100
  return baseValue.mul(rateValue).div(100);
}

// Calculer le salaire proratisé pour le temps partiel
export function calculateProRataSalary(
  fullTimeSalary: DecimalValue,
  contractHours: DecimalValue,
  fullTimeHours: DecimalValue = 35
): Decimal {
  const salary = toDecimal(fullTimeSalary);
  const hours = toDecimal(contractHours);
  const reference = toDecimal(fullTimeHours);
  
  return salary.mul(hours).div(reference);
}

// Calculer le net imposable (brut - cotisations salariales déductibles)
export function calculateTaxableIncome(
  grossSalary: DecimalValue,
  totalEmployeeContributions: DecimalValue,
  nonDeductibleContributions: DecimalValue
): Decimal {
  const salary = toDecimal(grossSalary);
  const employeeContrib = toDecimal(totalEmployeeContributions);
  const nonDeductible = toDecimal(nonDeductibleContributions);
  
  // Net imposable = Brut - (Cotisations salariales - CSG/CRDS non déductible)
  return salary.sub(employeeContrib.sub(nonDeductible));
}

// Calculer le net avant impôt
export function calculateNetBeforeTax(
  grossSalary: DecimalValue,
  totalEmployeeContributions: DecimalValue
): Decimal {
  const salary = toDecimal(grossSalary);
  const employeeContrib = toDecimal(totalEmployeeContributions);
  
  return salary.sub(employeeContrib);
}

// Calculer le montant de l'impôt prélevé à la source
export function calculateTaxAmount(
  taxableIncome: DecimalValue,
  taxRate: DecimalValue
): Decimal {
  const income = toDecimal(taxableIncome);
  const rate = toDecimal(taxRate);
  
  return income.mul(rate).div(100);
}

// Calculer le net à payer
export function calculateNetSalary(
  netBeforeTax: DecimalValue,
  taxAmount: DecimalValue
): Decimal {
  const beforeTax = toDecimal(netBeforeTax);
  const tax = toDecimal(taxAmount);
  
  return beforeTax.sub(tax);
}

// Calculer le coût employeur total
export function calculateEmployerCost(
  grossSalary: DecimalValue,
  totalEmployerContributions: DecimalValue
): Decimal {
  const salary = toDecimal(grossSalary);
  const employerContrib = toDecimal(totalEmployerContributions);
  
  return salary.add(employerContrib);
}

// Formater un decimal pour l'affichage
export function formatDecimal(value: DecimalValue, decimals: number = 2): string {
  const decimalValue = toDecimal(value);
  return `${decimalValue.toFixed(decimals)} €`;
} 