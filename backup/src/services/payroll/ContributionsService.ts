// Service pour gérer les cotisations sociales

export type Contribution = {
  id: string;
  name: string;
  employeeRate: number; // Taux salarial en pourcentage
  employerRate: number; // Taux patronal en pourcentage
  description: string;
  category: 'santé' | 'retraite' | 'chômage' | 'famille' | 'autres';
  baseType: 'totalBrut' | 'plafonné'; // Type de base de calcul
  ceiling?: number; // Plafond éventuel
  isActive: boolean;
};

// Contributions de base pour 2023
export const CONTRIBUTIONS_2023: Contribution[] = [
  {
    id: 'maladie',
    name: 'Assurance Maladie',
    employeeRate: 0, // 0% pour les salariés < 2.5 x SMIC, sinon 0.4%
    employerRate: 7, // 7% pour les employeurs < 2.5 x SMIC, sinon 13%
    description: 'Couverture des frais de santé',
    category: 'santé',
    baseType: 'totalBrut',
    isActive: true
  },
  {
    id: 'vieillesse_plafonnee',
    name: 'Retraite de base (plafonnée)',
    employeeRate: 6.90,
    employerRate: 8.55,
    description: 'Financement de la retraite de base (plafonnée)',
    category: 'retraite',
    baseType: 'plafonné',
    ceiling: 3666, // PMSS 2023
    isActive: true
  },
  {
    id: 'vieillesse_deplafonnee',
    name: 'Retraite de base (déplafonnée)',
    employeeRate: 0.40,
    employerRate: 1.90,
    description: 'Financement de la retraite de base (déplafonnée)',
    category: 'retraite',
    baseType: 'totalBrut',
    isActive: true
  },
  {
    id: 'retraite_complementaire',
    name: 'Retraite complémentaire',
    employeeRate: 3.15,
    employerRate: 4.72,
    description: 'Financement de la retraite complémentaire',
    category: 'retraite',
    baseType: 'totalBrut',
    isActive: true
  },
  {
    id: 'ceg',
    name: 'Contribution d\'équilibre général',
    employeeRate: 0.86,
    employerRate: 1.29,
    description: 'Contribution d\'équilibre général',
    category: 'retraite',
    baseType: 'totalBrut',
    isActive: true
  },
  {
    id: 'chomage',
    name: 'Assurance chômage',
    employeeRate: 0,
    employerRate: 4.05,
    description: 'Financement de l\'assurance chômage',
    category: 'chômage',
    baseType: 'totalBrut',
    isActive: true
  },
  {
    id: 'ags',
    name: 'AGS',
    employeeRate: 0,
    employerRate: 0.15,
    description: 'Assurance garantie des salaires',
    category: 'chômage',
    baseType: 'totalBrut',
    isActive: true
  },
  {
    id: 'famille',
    name: 'Allocations familiales',
    employeeRate: 0,
    employerRate: 3.45, // 3.45% pour les salaires < 3.5 x SMIC, sinon 5.25%
    description: 'Financement des allocations familiales',
    category: 'famille',
    baseType: 'totalBrut',
    isActive: true
  },
  {
    id: 'csg_deductible',
    name: 'CSG déductible',
    employeeRate: 6.80,
    employerRate: 0,
    description: 'Contribution sociale généralisée déductible',
    category: 'autres',
    baseType: 'totalBrut',
    isActive: true
  },
  {
    id: 'csg_non_deductible',
    name: 'CSG non déductible',
    employeeRate: 2.40,
    employerRate: 0,
    description: 'Contribution sociale généralisée non déductible',
    category: 'autres',
    baseType: 'totalBrut',
    isActive: true
  },
  {
    id: 'crds',
    name: 'CRDS',
    employeeRate: 0.50,
    employerRate: 0,
    description: 'Contribution au remboursement de la dette sociale',
    category: 'autres',
    baseType: 'totalBrut',
    isActive: true
  }
];

// Contributions de base pour 2024 (avec ajustements par rapport à 2023)
export const CONTRIBUTIONS_2024: Contribution[] = CONTRIBUTIONS_2023.map(c => {
  // Mise à jour des plafonds et éventuellement des taux
  if (c.id === 'vieillesse_plafonnee') {
    return { ...c, ceiling: 3867 }; // PMSS 2024
  }
  // Autres ajustements pour 2024 si nécessaire
  return c;
});

// Contributions de base pour 2025 (prévision)
export const CONTRIBUTIONS_2025: Contribution[] = CONTRIBUTIONS_2024.map(c => {
  // Mise à jour des plafonds et éventuellement des taux (prévision)
  if (c.id === 'vieillesse_plafonnee') {
    return { ...c, ceiling: 3950 }; // PMSS 2025 (estimation)
  }
  // Autres ajustements pour 2025 si nécessaire
  return c;
});

// Classe pour gérer les contributions
export class ContributionsService {
  /**
   * Obtient les contributions applicables pour une année fiscale donnée
   */
  public static getContributions(fiscalYear: number): Contribution[] {
    switch (fiscalYear) {
      case 2023:
        return CONTRIBUTIONS_2023;
      case 2024:
        return CONTRIBUTIONS_2024;
      case 2025:
        return CONTRIBUTIONS_2025;
      default:
        // Par défaut, on utilise les contributions de l'année la plus récente
        return CONTRIBUTIONS_2024;
    }
  }

  /**
   * Calcule les montants des contributions pour un salaire brut donné
   */
  public static calculateContributions(grossSalary: number, fiscalYear: number, isExecutive: boolean = false) {
    const contributions = this.getContributions(fiscalYear);
    let employeeTotal = 0;
    let employerTotal = 0;
    
    // Calcul des montants de chaque contribution
    const details = contributions.map(contribution => {
      // Détermination de la base de calcul
      let base = grossSalary;
      if (contribution.baseType === 'plafonné' && contribution.ceiling) {
        base = Math.min(grossSalary, contribution.ceiling);
      }
      
      // Ajustements spécifiques pour certaines contributions
      let employeeRate = contribution.employeeRate;
      let employerRate = contribution.employerRate;
      
      // Exemple d'ajustement pour l'assurance maladie en fonction du SMIC
      if (contribution.id === 'maladie') {
        // SMIC mensuel brut pour comparaison
        const smicMensuel = fiscalYear === 2023 ? 1747.20 : 
                          fiscalYear === 2024 ? 1766.92 : 1800; // Estimation pour 2025
        
        if (grossSalary > 2.5 * smicMensuel) {
          employeeRate = 0.4; // 0.4% au-dessus de 2.5 SMIC
          employerRate = 13.0; // 13% au-dessus de 2.5 SMIC
        }
      }
      
      // Exemple d'ajustement pour les allocations familiales en fonction du SMIC
      if (contribution.id === 'famille') {
        const smicMensuel = fiscalYear === 2023 ? 1747.20 : 
                          fiscalYear === 2024 ? 1766.92 : 1800; // Estimation pour 2025
        
        if (grossSalary > 3.5 * smicMensuel) {
          employerRate = 5.25; // 5.25% au-dessus de 3.5 SMIC
        }
      }
      
      // Calcul des montants
      const employeeAmount = (base * employeeRate) / 100;
      const employerAmount = (base * employerRate) / 100;
      
      // Cumul des totaux
      employeeTotal += employeeAmount;
      employerTotal += employerAmount;
      
      return {
        contribution,
        employeeAmount,
        employerAmount,
        base
      };
    });
    
    return {
      employee: employeeTotal,
      employer: employerTotal,
      details
    };
  }

  /**
   * Calcule le salaire net à partir du salaire brut
   */
  public static calculateNetSalary(grossSalary: number, fiscalYear: number, isExecutive: boolean = false): number {
    const contributions = this.calculateContributions(grossSalary, fiscalYear, isExecutive);
    return grossSalary - contributions.employee;
  }

  /**
   * Calcule le coût employeur à partir du salaire brut
   */
  public static calculateEmployerCost(grossSalary: number, fiscalYear: number, isExecutive: boolean = false): number {
    const contributions = this.calculateContributions(grossSalary, fiscalYear, isExecutive);
    return grossSalary + contributions.employer;
  }
} 