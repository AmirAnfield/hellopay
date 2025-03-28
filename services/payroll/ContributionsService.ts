import { Contributions } from '../../components/payslip/PayslipCalculator';

/**
 * Service de calcul des cotisations salariales et patronales
 */
export class ContributionsService {
  /**
   * Calcule les cotisations salariales et patronales pour un salaire brut donné
   * @param grossSalary Salaire brut
   * @param fiscalYear Année fiscale
   * @param isExecutive Statut cadre
   * @returns Cotisations calculées
   */
  public static calculateContributions(
    grossSalary: number,
    fiscalYear: number,
    isExecutive: boolean
  ): Contributions {
    // Base CSG/CRDS (98.25% du salaire brut)
    const csgBase = grossSalary * 0.9825;
    
    // Taux de cotisations en fonction du statut
    const rates = {
      // Taux pour les cotisations du salarié
      employee: {
        healthInsurance: 0.0075, // Assurance maladie
        oldAgeInsurance: 0.069, // Assurance vieillesse
        complementaryPension: isExecutive ? 0.04 : 0.035, // Retraite complémentaire
        unemployment: 0.0, // Chômage (cotisation supprimée depuis 2018)
        csgCrds: 0.098, // CSG/CRDS
        otherContributions: isExecutive ? 0.0074 : 0.0123 // Autres cotisations
      },
      // Taux pour les cotisations de l'employeur
      employer: {
        healthInsurance: 0.13, // Assurance maladie
        oldAgeInsurance: 0.085, // Assurance vieillesse
        complementaryPension: isExecutive ? 0.06 : 0.055, // Retraite complémentaire
        unemployment: 0.042, // Chômage
        otherContributions: isExecutive ? 0.1028 : 0.1078 // Autres cotisations
      }
    };
    
    // Calcul des montants pour chaque cotisation
    const details = [
      {
        name: 'Assurance maladie',
        base: grossSalary,
        employeeRate: rates.employee.healthInsurance,
        employerRate: rates.employer.healthInsurance,
        employeeAmount: grossSalary * rates.employee.healthInsurance,
        employerAmount: grossSalary * rates.employer.healthInsurance
      },
      {
        name: 'Assurance vieillesse',
        base: grossSalary,
        employeeRate: rates.employee.oldAgeInsurance,
        employerRate: rates.employer.oldAgeInsurance,
        employeeAmount: grossSalary * rates.employee.oldAgeInsurance,
        employerAmount: grossSalary * rates.employer.oldAgeInsurance
      },
      {
        name: 'Retraite complémentaire',
        base: grossSalary,
        employeeRate: rates.employee.complementaryPension,
        employerRate: rates.employer.complementaryPension,
        employeeAmount: grossSalary * rates.employee.complementaryPension,
        employerAmount: grossSalary * rates.employer.complementaryPension
      },
      {
        name: 'Chômage',
        base: grossSalary,
        employeeRate: rates.employee.unemployment,
        employerRate: rates.employer.unemployment,
        employeeAmount: grossSalary * rates.employee.unemployment,
        employerAmount: grossSalary * rates.employer.unemployment
      },
      {
        name: 'CSG/CRDS',
        base: csgBase,
        employeeRate: rates.employee.csgCrds,
        employerRate: 0,
        employeeAmount: csgBase * rates.employee.csgCrds,
        employerAmount: 0
      },
      {
        name: 'Autres cotisations',
        base: grossSalary,
        employeeRate: rates.employee.otherContributions,
        employerRate: rates.employer.otherContributions,
        employeeAmount: grossSalary * rates.employee.otherContributions,
        employerAmount: grossSalary * rates.employer.otherContributions
      }
    ];
    
    // Calcul des totaux
    const employee = details.reduce((sum, item) => sum + item.employeeAmount, 0);
    const employer = details.reduce((sum, item) => sum + item.employerAmount, 0);
    
    return {
      employee: parseFloat(employee.toFixed(2)),
      employer: parseFloat(employer.toFixed(2)),
      details
    };
  }
} 