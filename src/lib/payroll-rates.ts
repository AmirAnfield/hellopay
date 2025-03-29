/**
 * Gestion des taux de cotisations sociales et calculs des bulletins de paie
 */

export interface CotisationRates {
  salarie: {
    sante: number;
    retraiteBase: number;
    retraiteComplementaire: number;
    chomage: number;
    csg: number;
    crds: number;
  };
  employeur: {
    sante: number;
    retraiteBase: number;
    retraiteComplementaire: number;
    chomage: number;
    familiales: number;
    accidents: number;
    divers: number;
  };
}

// Taux pour 2023
const RATES_2023: CotisationRates = {
  salarie: {
    sante: 0.075,     // Assurance maladie, maternité, invalidité, décès
    retraiteBase: 0.069,  // Retraite de base
    retraiteComplementaire: 0.038, // Retraite complémentaire
    chomage: 0.024,  // Assurance chômage
    csg: 0.0975,      // CSG (dont 2.4% déductible)
    crds: 0.005,     // CRDS
  },
  employeur: {
    sante: 0.130,    // Assurance maladie, maternité, invalidité, décès
    retraiteBase: 0.084,  // Retraite de base
    retraiteComplementaire: 0.057, // Retraite complémentaire
    chomage: 0.041,  // Assurance chômage
    familiales: 0.051, // Allocations familiales
    accidents: 0.020, // Accidents du travail
    divers: 0.045    // Diverses cotisations (transport, logement, etc.)
  }
};

// Taux pour 2024 (avec changements fictifs pour l'exemple)
const RATES_2024: CotisationRates = {
  salarie: {
    sante: 0.076,
    retraiteBase: 0.070,
    retraiteComplementaire: 0.039,
    chomage: 0.024,
    csg: 0.0975,
    crds: 0.005,
  },
  employeur: {
    sante: 0.132,
    retraiteBase: 0.085,
    retraiteComplementaire: 0.058,
    chomage: 0.041,
    familiales: 0.052,
    accidents: 0.020,
    divers: 0.046,
  }
};

// Taux pour 2025 (avec changements fictifs pour l'exemple)
const RATES_2025: CotisationRates = {
  salarie: {
    sante: 0.077,
    retraiteBase: 0.071,
    retraiteComplementaire: 0.040,
    chomage: 0.025,
    csg: 0.0980,
    crds: 0.005,
  },
  employeur: {
    sante: 0.134,
    retraiteBase: 0.086,
    retraiteComplementaire: 0.059,
    chomage: 0.042,
    familiales: 0.053,
    accidents: 0.021,
    divers: 0.047,
  }
};

/**
 * Obtient les taux de cotisations appropriés pour une année donnée
 * @param year L'année fiscale
 * @returns Les taux de cotisations à appliquer
 */
export function getRatesByYear(year: number): CotisationRates {
  switch (year) {
    case 2023:
      return RATES_2023;
    case 2024:
      return RATES_2024;
    case 2025:
      return RATES_2025;
    default:
      // Par défaut, utiliser les taux les plus récents
      return RATES_2025;
  }
}

interface ContributionDetails {
  employeeContributions: {
    sante: number;
    retraiteBase: number;
    retraiteComplementaire: number;
    chomage: number;
    csg: number;
    crds: number;
    total: number;
  };
  employerContributions: {
    sante: number;
    retraiteBase: number;
    retraiteComplementaire: number;
    chomage: number;
    familiales: number;
    accidents: number;
    divers: number;
    total: number;
  };
  netSalary: number;
  employerCost: number;
}

/**
 * Calcule les cotisations sociales à partir d'un salaire brut pour une année donnée
 * @param grossSalary Salaire brut
 * @param year Année fiscale
 * @param isExecutive Si le salarié est cadre (modifie certains taux)
 * @returns Les détails des cotisations et montants calculés
 */
export function calculateContributions(
  grossSalary: number, 
  year: number, 
  isExecutive: boolean = false
): ContributionDetails {
  const rates = getRatesByYear(year);
  
  // Calculer les cotisations salariales
  const employeeContributions = {
    sante: roundToTwo(grossSalary * rates.salarie.sante),
    retraiteBase: roundToTwo(grossSalary * rates.salarie.retraiteBase),
    retraiteComplementaire: roundToTwo(grossSalary * (rates.salarie.retraiteComplementaire * (isExecutive ? 1.2 : 1))),
    chomage: roundToTwo(grossSalary * rates.salarie.chomage),
    csg: roundToTwo(grossSalary * rates.salarie.csg),
    crds: roundToTwo(grossSalary * rates.salarie.crds),
    total: 0 // Calculé ci-dessous
  };
  
  // Calculer les cotisations patronales
  const employerContributions = {
    sante: roundToTwo(grossSalary * rates.employeur.sante),
    retraiteBase: roundToTwo(grossSalary * rates.employeur.retraiteBase),
    retraiteComplementaire: roundToTwo(grossSalary * (rates.employeur.retraiteComplementaire * (isExecutive ? 1.2 : 1))),
    chomage: roundToTwo(grossSalary * rates.employeur.chomage),
    familiales: roundToTwo(grossSalary * rates.employeur.familiales),
    accidents: roundToTwo(grossSalary * rates.employeur.accidents),
    divers: roundToTwo(grossSalary * rates.employeur.divers),
    total: 0 // Calculé ci-dessous
  };
  
  // Calculer les totaux
  employeeContributions.total = roundToTwo(
    employeeContributions.sante +
    employeeContributions.retraiteBase +
    employeeContributions.retraiteComplementaire +
    employeeContributions.chomage +
    employeeContributions.csg +
    employeeContributions.crds
  );
  
  employerContributions.total = roundToTwo(
    employerContributions.sante +
    employerContributions.retraiteBase +
    employerContributions.retraiteComplementaire +
    employerContributions.chomage +
    employerContributions.familiales +
    employerContributions.accidents +
    employerContributions.divers
  );
  
  // Calculer le net à payer
  const netSalary = roundToTwo(grossSalary - employeeContributions.total);
  
  // Calculer le coût employeur
  const employerCost = roundToTwo(grossSalary + employerContributions.total);
  
  return {
    employeeContributions,
    employerContributions,
    netSalary,
    employerCost
  };
}

/**
 * Arrondi un nombre à 2 décimales
 * @param num Nombre à arrondir
 * @returns Nombre arrondi à 2 décimales
 */
function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
} 