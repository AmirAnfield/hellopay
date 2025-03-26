// Structure des cotisations légales françaises pour les fiches de paie
// Basée sur les taux en vigueur en 2023-2024

export interface Contribution {
  id: string;          // Identifiant unique de la cotisation
  name: string;        // Nom de la cotisation
  category: ContributionCategory; // Catégorie de la cotisation
  employeeRate: number; // Taux salarial (en pourcentage)
  employerRate: number; // Taux patronal (en pourcentage)
  baseType: 'total' | 'plafond' | 'trancheA' | 'trancheB'; // Type d'assiette
  isRequired: boolean;  // Cotisation obligatoire ou facultative
  description?: string; // Description optionnelle
}

export type ContributionCategory = 
  | 'securite_sociale'   // Sécurité sociale
  | 'retraite'           // Retraite (de base et complémentaire)
  | 'chomage'            // Assurance chômage
  | 'csg_crds'           // CSG et CRDS
  | 'autres';            // Autres cotisations

export const CATEGORY_LABELS: Record<ContributionCategory, string> = {
  securite_sociale: 'Sécurité Sociale',
  retraite: 'Retraite',
  chomage: 'Chômage',
  csg_crds: 'CSG / CRDS',
  autres: 'Autres cotisations'
};

// Plafond de la sécurité sociale (2024)
export const SOCIAL_SECURITY_CAP = 3864; // mensuel en euros

// Cotisations françaises par défaut
export const DEFAULT_FRENCH_CONTRIBUTIONS: Contribution[] = [
  // SÉCURITÉ SOCIALE
  {
    id: 'maladie',
    name: 'Assurance Maladie',
    category: 'securite_sociale',
    employeeRate: 0,
    employerRate: 7.3,
    baseType: 'total',
    isRequired: true,
    description: 'Financement de l\'assurance maladie'
  },
  {
    id: 'maladie_alsace_moselle',
    name: 'Assurance Maladie - Régime local Alsace-Moselle',
    category: 'securite_sociale',
    employeeRate: 1.5,
    employerRate: 0,
    baseType: 'total',
    isRequired: false,
    description: 'Supplément pour le régime local d\'Alsace-Moselle'
  },
  {
    id: 'vieillesse_plafonnee',
    name: 'Assurance Vieillesse plafonnée',
    category: 'securite_sociale',
    employeeRate: 6.9,
    employerRate: 8.55,
    baseType: 'plafond',
    isRequired: true,
    description: 'Cotisation retraite jusqu\'au plafond de la sécurité sociale'
  },
  {
    id: 'vieillesse_total',
    name: 'Assurance Vieillesse déplafonnée',
    category: 'securite_sociale',
    employeeRate: 0.4,
    employerRate: 1.9,
    baseType: 'total',
    isRequired: true,
    description: 'Cotisation retraite sur la totalité du salaire'
  },
  {
    id: 'allocations_familiales',
    name: 'Allocations Familiales',
    category: 'securite_sociale',
    employeeRate: 0,
    employerRate: 5.25,
    baseType: 'total',
    isRequired: true,
    description: 'Financement des prestations familiales'
  },
  {
    id: 'accidents_travail',
    name: 'Accidents du Travail',
    category: 'securite_sociale',
    employeeRate: 0,
    employerRate: 1.4,
    baseType: 'total',
    isRequired: true,
    description: 'Taux variable selon l\'activité et l\'entreprise (1,4% par défaut)'
  },

  // RETRAITE COMPLÉMENTAIRE
  {
    id: 'agirc_arrco_t1',
    name: 'Retraite complémentaire AGIRC-ARRCO Tranche 1',
    category: 'retraite',
    employeeRate: 3.15,
    employerRate: 4.72,
    baseType: 'plafond',
    isRequired: true,
    description: 'Cotisation de retraite complémentaire jusqu\'au plafond de la sécurité sociale'
  },
  {
    id: 'agirc_arrco_t2',
    name: 'Retraite complémentaire AGIRC-ARRCO Tranche 2',
    category: 'retraite',
    employeeRate: 8.64,
    employerRate: 12.95,
    baseType: 'trancheB',
    isRequired: true,
    description: 'Cotisation de retraite complémentaire entre 1 et 8 fois le plafond de la sécurité sociale'
  },
  {
    id: 'cev',
    name: 'Contribution d\'équilibre général (CEG) Tranche 1',
    category: 'retraite',
    employeeRate: 0.86,
    employerRate: 1.29,
    baseType: 'plafond',
    isRequired: true,
    description: 'Cotisation d\'équilibre du régime de retraite complémentaire jusqu\'au plafond'
  },
  {
    id: 'cev_t2',
    name: 'Contribution d\'équilibre général (CEG) Tranche 2',
    category: 'retraite',
    employeeRate: 1.08,
    employerRate: 1.62,
    baseType: 'trancheB',
    isRequired: true,
    description: 'Cotisation d\'équilibre du régime de retraite complémentaire entre 1 et 8 fois le plafond'
  },
  {
    id: 'apec',
    name: 'APEC',
    category: 'retraite',
    employeeRate: 0.024,
    employerRate: 0.036,
    baseType: 'plafond',
    isRequired: false,
    description: 'Pour les cadres uniquement'
  },

  // CHÔMAGE
  {
    id: 'assurance_chomage',
    name: 'Assurance Chômage',
    category: 'chomage',
    employeeRate: 0,
    employerRate: 4.05,
    baseType: 'plafond',
    isRequired: true,
    description: 'Financement de l\'assurance chômage'
  },
  {
    id: 'ags',
    name: 'AGS (Garantie des salaires)',
    category: 'chomage',
    employeeRate: 0,
    employerRate: 0.15,
    baseType: 'plafond',
    isRequired: true,
    description: 'Garantie des salaires en cas de redressement ou liquidation judiciaire'
  },

  // CSG/CRDS
  {
    id: 'csg_deductible',
    name: 'CSG déductible',
    category: 'csg_crds',
    employeeRate: 6.8,
    employerRate: 0,
    baseType: 'total',
    isRequired: true,
    description: 'Contribution sociale généralisée déductible du revenu imposable'
  },
  {
    id: 'csg_non_deductible',
    name: 'CSG non déductible',
    category: 'csg_crds',
    employeeRate: 2.4,
    employerRate: 0,
    baseType: 'total',
    isRequired: true,
    description: 'Contribution sociale généralisée non déductible du revenu imposable'
  },
  {
    id: 'crds',
    name: 'CRDS',
    category: 'csg_crds',
    employeeRate: 0.5,
    employerRate: 0,
    baseType: 'total',
    isRequired: true,
    description: 'Contribution au remboursement de la dette sociale'
  },

  // AUTRES COTISATIONS
  {
    id: 'fnal',
    name: 'FNAL',
    category: 'autres',
    employeeRate: 0,
    employerRate: 0.1,
    baseType: 'plafond',
    isRequired: true,
    description: 'Fonds national d\'aide au logement'
  },
  {
    id: 'formation_professionnelle',
    name: 'Formation professionnelle',
    category: 'autres',
    employeeRate: 0,
    employerRate: 1.0,
    baseType: 'total',
    isRequired: true,
    description: 'Contribution à la formation professionnelle'
  },
  {
    id: 'versement_transport',
    name: 'Versement mobilité',
    category: 'autres',
    employeeRate: 0,
    employerRate: 2.0,
    baseType: 'total',
    isRequired: false,
    description: 'Taux variable selon la localité (2% par défaut pour les grandes agglomérations)'
  },
  {
    id: 'forfait_social',
    name: 'Forfait social',
    category: 'autres',
    employeeRate: 0,
    employerRate: 20.0,
    baseType: 'total',
    isRequired: false,
    description: 'Applicable sur certaines contributions patronales (épargne salariale, etc.)'
  }
];

// Récupère toutes les cotisations d'une catégorie
export const getContributionsByCategory = (category: ContributionCategory): Contribution[] => {
  return DEFAULT_FRENCH_CONTRIBUTIONS.filter(contribution => contribution.category === category);
};

// Calcule le montant d'une cotisation
export const calculateContributionAmount = (
  contribution: Contribution, 
  grossSalary: number
): {employeeAmount: number; employerAmount: number} => {
  let base = grossSalary;
  
  // Déterminer l'assiette de cotisation
  if (contribution.baseType === 'plafond') {
    base = Math.min(grossSalary, SOCIAL_SECURITY_CAP);
  } else if (contribution.baseType === 'trancheA') {
    base = Math.min(grossSalary, SOCIAL_SECURITY_CAP);
  } else if (contribution.baseType === 'trancheB') {
    base = Math.max(0, Math.min(grossSalary, SOCIAL_SECURITY_CAP * 8) - SOCIAL_SECURITY_CAP);
  }
  
  // Calculer les montants
  const employeeAmount = base * (contribution.employeeRate / 100);
  const employerAmount = base * (contribution.employerRate / 100);
  
  return {
    employeeAmount,
    employerAmount
  };
};

// Calculer le total des cotisations (salariales et patronales)
export const calculateTotalContributions = (
  contributions: Contribution[],
  grossSalary: number
): {
  totalEmployeeContributions: number;
  totalEmployerContributions: number;
  detailedContributions: Array<{
    contribution: Contribution;
    employeeAmount: number;
    employerAmount: number;
  }>
} => {
  let totalEmployeeContributions = 0;
  let totalEmployerContributions = 0;
  const detailedContributions = [];
  
  for (const contribution of contributions) {
    const { employeeAmount, employerAmount } = calculateContributionAmount(contribution, grossSalary);
    
    totalEmployeeContributions += employeeAmount;
    totalEmployerContributions += employerAmount;
    
    detailedContributions.push({
      contribution,
      employeeAmount,
      employerAmount
    });
  }
  
  return {
    totalEmployeeContributions,
    totalEmployerContributions,
    detailedContributions
  };
}; 