import { Decimal } from '@prisma/client/runtime/library';
import { 
  CONTRIBUTION_CATEGORIES, 
  SOCIAL_SECURITY_BASES, 
  CONTRIBUTION_RATES 
} from './constants';
import {
  toDecimal,
  calculateSocialSecurityBase,
  calculateContributionAmount,
  calculateProRataSalary,
  calculateTaxableIncome,
  calculateNetBeforeTax,
  calculateTaxAmount,
  calculateNetSalary,
  calculateEmployerCost
} from './utils';

export interface Contribution {
  category: string;
  label: string;
  baseType: string;
  baseAmount: Decimal;
  employerRate: Decimal;
  employeeRate: Decimal;
  employerAmount: Decimal;
  employeeAmount: Decimal;
}

export interface CalculationResult {
  employeeId: string;
  period: string;
  grossSalary: Decimal;
  csgCrdsBase: Decimal;
  ssBase: Decimal;
  contributions: Contribution[];
  totalEmployeeContributions: Decimal;
  totalEmployerContributions: Decimal;
  taxableIncome: Decimal;
  netBeforeTax: Decimal;
  taxAmount: Decimal;
  netSalary: Decimal;
  employerCost: Decimal;
}

export interface CalculationParams {
  employeeId: string;
  grossSalary: number | Decimal;
  period: string;
  isExecutive: boolean;
  workingHours?: number | Decimal;
  taxRate?: number | Decimal;
  socialSecurityCeiling: number | Decimal;
}

export class PayrollService {
  
  /**
   * Calcule un bulletin de paie complet
   */
  public static calculatePayslip(params: CalculationParams): CalculationResult {
    const { 
      employeeId, 
      grossSalary, 
      period, 
      isExecutive, 
      workingHours = 35, 
      taxRate = 0, 
      socialSecurityCeiling 
    } = params;
    
    // Convertir toutes les entrées en Decimal
    const grossSalaryDecimal = toDecimal(grossSalary);
    const workingHoursDecimal = toDecimal(workingHours);
    const taxRateDecimal = toDecimal(taxRate);
    const socialSecurityCeilingDecimal = toDecimal(socialSecurityCeiling);
    
    // Calculer le salaire au prorata si temps partiel
    const effectiveGrossSalary = workingHoursDecimal.lessThan(35)
      ? calculateProRataSalary(grossSalaryDecimal, workingHoursDecimal)
      : grossSalaryDecimal;
    
    // Calculer les bases de cotisations
    const csgCrdsBase = effectiveGrossSalary.mul(0.9825); // 98.25%
    const ssBaseTranche1 = calculateSocialSecurityBase(
      effectiveGrossSalary,
      socialSecurityCeilingDecimal,
      SOCIAL_SECURITY_BASES.TRANCHE_1
    );
    const ssBaseTranche2 = calculateSocialSecurityBase(
      effectiveGrossSalary,
      socialSecurityCeilingDecimal,
      SOCIAL_SECURITY_BASES.TRANCHE_2
    );
    
    // Calculer toutes les cotisations
    const contributions: Contribution[] = [];
    let totalEmployeeContributions = new Decimal(0);
    let totalEmployerContributions = new Decimal(0);
    let nonDeductibleContributions = new Decimal(0);
    
    // CSG déductible
    const csgDeductible: Contribution = {
      category: CONTRIBUTION_CATEGORIES.CSG_CRDS,
      label: 'CSG déductible',
      baseType: SOCIAL_SECURITY_BASES.CSG_CRDS,
      baseAmount: csgCrdsBase,
      employerRate: new Decimal(0),
      employeeRate: new Decimal(CONTRIBUTION_RATES.CSG_DEDUCTIBLE),
      employerAmount: new Decimal(0),
      employeeAmount: calculateContributionAmount(csgCrdsBase, CONTRIBUTION_RATES.CSG_DEDUCTIBLE)
    };
    contributions.push(csgDeductible);
    totalEmployeeContributions = totalEmployeeContributions.add(csgDeductible.employeeAmount);
    
    // CSG/CRDS non déductible
    const csgCrdsNonDeductible: Contribution = {
      category: CONTRIBUTION_CATEGORIES.CSG_CRDS,
      label: 'CSG/CRDS non déductible',
      baseType: SOCIAL_SECURITY_BASES.CSG_CRDS,
      baseAmount: csgCrdsBase,
      employerRate: new Decimal(0),
      employeeRate: new Decimal(CONTRIBUTION_RATES.CSG_CRDS_NON_DEDUCTIBLE),
      employerAmount: new Decimal(0),
      employeeAmount: calculateContributionAmount(csgCrdsBase, CONTRIBUTION_RATES.CSG_CRDS_NON_DEDUCTIBLE)
    };
    contributions.push(csgCrdsNonDeductible);
    totalEmployeeContributions = totalEmployeeContributions.add(csgCrdsNonDeductible.employeeAmount);
    nonDeductibleContributions = nonDeductibleContributions.add(csgCrdsNonDeductible.employeeAmount);
    
    // Maladie (part patronale seulement depuis 2018)
    const medical: Contribution = {
      category: CONTRIBUTION_CATEGORIES.SECURITE_SOCIALE,
      label: 'Assurance maladie',
      baseType: SOCIAL_SECURITY_BASES.TOTAL,
      baseAmount: effectiveGrossSalary,
      employerRate: new Decimal(CONTRIBUTION_RATES.MALADIE_EMPLOYEUR),
      employeeRate: new Decimal(CONTRIBUTION_RATES.MALADIE_SALARIE),
      employerAmount: calculateContributionAmount(effectiveGrossSalary, CONTRIBUTION_RATES.MALADIE_EMPLOYEUR),
      employeeAmount: calculateContributionAmount(effectiveGrossSalary, CONTRIBUTION_RATES.MALADIE_SALARIE)
    };
    contributions.push(medical);
    totalEmployerContributions = totalEmployerContributions.add(medical.employerAmount);
    totalEmployeeContributions = totalEmployeeContributions.add(medical.employeeAmount);
    
    // Allocations familiales (part patronale)
    const family: Contribution = {
      category: CONTRIBUTION_CATEGORIES.SECURITE_SOCIALE,
      label: 'Allocations familiales',
      baseType: SOCIAL_SECURITY_BASES.TOTAL,
      baseAmount: effectiveGrossSalary,
      employerRate: new Decimal(CONTRIBUTION_RATES.FAMILLE_EMPLOYEUR),
      employeeRate: new Decimal(0),
      employerAmount: calculateContributionAmount(effectiveGrossSalary, CONTRIBUTION_RATES.FAMILLE_EMPLOYEUR),
      employeeAmount: new Decimal(0)
    };
    contributions.push(family);
    totalEmployerContributions = totalEmployerContributions.add(family.employerAmount);
    
    // Assurance vieillesse plafonnée
    const retirementCapped: Contribution = {
      category: CONTRIBUTION_CATEGORIES.RETRAITE,
      label: 'Retraite plafonnée',
      baseType: SOCIAL_SECURITY_BASES.TRANCHE_1,
      baseAmount: ssBaseTranche1,
      employerRate: new Decimal(CONTRIBUTION_RATES.RETRAITE_PLAFONNEE_EMPLOYEUR),
      employeeRate: new Decimal(CONTRIBUTION_RATES.RETRAITE_PLAFONNEE_SALARIE),
      employerAmount: calculateContributionAmount(ssBaseTranche1, CONTRIBUTION_RATES.RETRAITE_PLAFONNEE_EMPLOYEUR),
      employeeAmount: calculateContributionAmount(ssBaseTranche1, CONTRIBUTION_RATES.RETRAITE_PLAFONNEE_SALARIE)
    };
    contributions.push(retirementCapped);
    totalEmployerContributions = totalEmployerContributions.add(retirementCapped.employerAmount);
    totalEmployeeContributions = totalEmployeeContributions.add(retirementCapped.employeeAmount);
    
    // Assurance vieillesse déplafonnée
    const retirementUncapped: Contribution = {
      category: CONTRIBUTION_CATEGORIES.RETRAITE,
      label: 'Retraite déplafonnée',
      baseType: SOCIAL_SECURITY_BASES.TOTAL,
      baseAmount: effectiveGrossSalary,
      employerRate: new Decimal(CONTRIBUTION_RATES.RETRAITE_DEPLAFONNEE_EMPLOYEUR),
      employeeRate: new Decimal(CONTRIBUTION_RATES.RETRAITE_DEPLAFONNEE_SALARIE),
      employerAmount: calculateContributionAmount(effectiveGrossSalary, CONTRIBUTION_RATES.RETRAITE_DEPLAFONNEE_EMPLOYEUR),
      employeeAmount: calculateContributionAmount(effectiveGrossSalary, CONTRIBUTION_RATES.RETRAITE_DEPLAFONNEE_SALARIE)
    };
    contributions.push(retirementUncapped);
    totalEmployerContributions = totalEmployerContributions.add(retirementUncapped.employerAmount);
    totalEmployeeContributions = totalEmployeeContributions.add(retirementUncapped.employeeAmount);
    
    // Assurance chômage
    const unemployment: Contribution = {
      category: CONTRIBUTION_CATEGORIES.CHOMAGE,
      label: 'Assurance chômage',
      baseType: SOCIAL_SECURITY_BASES.TOTAL,
      baseAmount: effectiveGrossSalary,
      employerRate: new Decimal(CONTRIBUTION_RATES.CHOMAGE_EMPLOYEUR),
      employeeRate: new Decimal(CONTRIBUTION_RATES.CHOMAGE_SALARIE),
      employerAmount: calculateContributionAmount(effectiveGrossSalary, CONTRIBUTION_RATES.CHOMAGE_EMPLOYEUR),
      employeeAmount: calculateContributionAmount(effectiveGrossSalary, CONTRIBUTION_RATES.CHOMAGE_SALARIE)
    };
    contributions.push(unemployment);
    totalEmployerContributions = totalEmployerContributions.add(unemployment.employerAmount);
    totalEmployeeContributions = totalEmployeeContributions.add(unemployment.employeeAmount);
    
    // Retraite complémentaire Tranche 1
    const complementaryT1: Contribution = {
      category: CONTRIBUTION_CATEGORIES.COMPLEMENTAIRE,
      label: 'Retraite complémentaire T1',
      baseType: SOCIAL_SECURITY_BASES.TRANCHE_1,
      baseAmount: ssBaseTranche1,
      employerRate: new Decimal(CONTRIBUTION_RATES.COMPLEMENTAIRE_T1_EMPLOYEUR),
      employeeRate: new Decimal(CONTRIBUTION_RATES.COMPLEMENTAIRE_T1_SALARIE),
      employerAmount: calculateContributionAmount(ssBaseTranche1, CONTRIBUTION_RATES.COMPLEMENTAIRE_T1_EMPLOYEUR),
      employeeAmount: calculateContributionAmount(ssBaseTranche1, CONTRIBUTION_RATES.COMPLEMENTAIRE_T1_SALARIE)
    };
    contributions.push(complementaryT1);
    totalEmployerContributions = totalEmployerContributions.add(complementaryT1.employerAmount);
    totalEmployeeContributions = totalEmployeeContributions.add(complementaryT1.employeeAmount);
    
    // Retraite complémentaire Tranche 2 (si applicable)
    if (ssBaseTranche2.greaterThan(0)) {
      const complementaryT2: Contribution = {
        category: CONTRIBUTION_CATEGORIES.COMPLEMENTAIRE,
        label: 'Retraite complémentaire T2',
        baseType: SOCIAL_SECURITY_BASES.TRANCHE_2,
        baseAmount: ssBaseTranche2,
        employerRate: new Decimal(CONTRIBUTION_RATES.COMPLEMENTAIRE_T2_EMPLOYEUR),
        employeeRate: new Decimal(CONTRIBUTION_RATES.COMPLEMENTAIRE_T2_SALARIE),
        employerAmount: calculateContributionAmount(ssBaseTranche2, CONTRIBUTION_RATES.COMPLEMENTAIRE_T2_EMPLOYEUR),
        employeeAmount: calculateContributionAmount(ssBaseTranche2, CONTRIBUTION_RATES.COMPLEMENTAIRE_T2_SALARIE)
      };
      contributions.push(complementaryT2);
      totalEmployerContributions = totalEmployerContributions.add(complementaryT2.employerAmount);
      totalEmployeeContributions = totalEmployeeContributions.add(complementaryT2.employeeAmount);
    }
    
    // AGFF Tranche 1
    const agffT1: Contribution = {
      category: CONTRIBUTION_CATEGORIES.COMPLEMENTAIRE,
      label: 'AGFF T1',
      baseType: SOCIAL_SECURITY_BASES.TRANCHE_1,
      baseAmount: ssBaseTranche1,
      employerRate: new Decimal(CONTRIBUTION_RATES.AGFF_T1_EMPLOYEUR),
      employeeRate: new Decimal(CONTRIBUTION_RATES.AGFF_T1_SALARIE),
      employerAmount: calculateContributionAmount(ssBaseTranche1, CONTRIBUTION_RATES.AGFF_T1_EMPLOYEUR),
      employeeAmount: calculateContributionAmount(ssBaseTranche1, CONTRIBUTION_RATES.AGFF_T1_SALARIE)
    };
    contributions.push(agffT1);
    totalEmployerContributions = totalEmployerContributions.add(agffT1.employerAmount);
    totalEmployeeContributions = totalEmployeeContributions.add(agffT1.employeeAmount);
    
    // AGFF Tranche 2 (si applicable)
    if (ssBaseTranche2.greaterThan(0)) {
      const agffT2: Contribution = {
        category: CONTRIBUTION_CATEGORIES.COMPLEMENTAIRE,
        label: 'AGFF T2',
        baseType: SOCIAL_SECURITY_BASES.TRANCHE_2,
        baseAmount: ssBaseTranche2,
        employerRate: new Decimal(CONTRIBUTION_RATES.AGFF_T2_EMPLOYEUR),
        employeeRate: new Decimal(CONTRIBUTION_RATES.AGFF_T2_SALARIE),
        employerAmount: calculateContributionAmount(ssBaseTranche2, CONTRIBUTION_RATES.AGFF_T2_EMPLOYEUR),
        employeeAmount: calculateContributionAmount(ssBaseTranche2, CONTRIBUTION_RATES.AGFF_T2_SALARIE)
      };
      contributions.push(agffT2);
      totalEmployerContributions = totalEmployerContributions.add(agffT2.employerAmount);
      totalEmployeeContributions = totalEmployeeContributions.add(agffT2.employeeAmount);
    }
    
    // APEC pour les cadres
    if (isExecutive) {
      const apec: Contribution = {
        category: CONTRIBUTION_CATEGORIES.AUTRES,
        label: 'APEC',
        baseType: SOCIAL_SECURITY_BASES.TRANCHE_1,
        baseAmount: ssBaseTranche1,
        employerRate: new Decimal(CONTRIBUTION_RATES.APEC_EMPLOYEUR),
        employeeRate: new Decimal(CONTRIBUTION_RATES.APEC_SALARIE),
        employerAmount: calculateContributionAmount(ssBaseTranche1, CONTRIBUTION_RATES.APEC_EMPLOYEUR),
        employeeAmount: calculateContributionAmount(ssBaseTranche1, CONTRIBUTION_RATES.APEC_SALARIE)
      };
      contributions.push(apec);
      totalEmployerContributions = totalEmployerContributions.add(apec.employerAmount);
      totalEmployeeContributions = totalEmployeeContributions.add(apec.employeeAmount);
    }
    
    // Calculer les totaux et résultats finaux
    const taxableIncome = calculateTaxableIncome(
      effectiveGrossSalary,
      totalEmployeeContributions,
      nonDeductibleContributions
    );
    
    const netBeforeTax = calculateNetBeforeTax(
      effectiveGrossSalary,
      totalEmployeeContributions
    );
    
    const taxAmount = calculateTaxAmount(taxableIncome, taxRateDecimal);
    
    const netSalary = calculateNetSalary(netBeforeTax, taxAmount);
    
    const employerCost = calculateEmployerCost(
      effectiveGrossSalary,
      totalEmployerContributions
    );
    
    // Résultat final
    return {
      employeeId,
      period,
      grossSalary: effectiveGrossSalary,
      csgCrdsBase,
      ssBase: ssBaseTranche1,
      contributions,
      totalEmployeeContributions,
      totalEmployerContributions,
      taxableIncome,
      netBeforeTax,
      taxAmount,
      netSalary,
      employerCost
    };
  }
} 