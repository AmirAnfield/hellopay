// Constantes utilisées pour les calculs de paie
export const SOCIAL_SECURITY_BASES = {
  TOTAL: 'TOTAL',
  PLAFOND: 'PLAFOND',
  TRANCHE_1: 'TRANCHE_1',
  TRANCHE_2: 'TRANCHE_2',
  CSG_CRDS: 'CSG_CRDS',
};

export const CONTRIBUTION_CATEGORIES = {
  CSG_CRDS: 'CSG_CRDS',
  SECURITE_SOCIALE: 'SECURITE_SOCIALE',
  RETRAITE: 'RETRAITE',
  COMPLEMENTAIRE: 'COMPLEMENTAIRE',
  CHOMAGE: 'CHOMAGE',
  AUTRES: 'AUTRES',
};

export const DEFAULT_WORKING_HOURS_PER_MONTH = 151.67; // 35h × 52 semaines / 12 mois
export const CSG_CRDS_BASE_RATE = 0.9825; // 98.25% du salaire brut

// Taux de cotisation 2023
export const CONTRIBUTION_RATES = {
  CSG_DEDUCTIBLE: 6.8, // CSG déductible (6.8%)
  CSG_CRDS_NON_DEDUCTIBLE: 2.9, // CSG non déductible + CRDS (2.9%)
  MALADIE_EMPLOYEUR: 7, // Assurance maladie (7% employeur)
  MALADIE_SALARIE: 0, // Assurance maladie (0% salarié)
  
  // Retraite de base (cotisations sécurité sociale)
  RETRAITE_PLAFONNEE_EMPLOYEUR: 8.55, // Retraite plafonnée employeur (8.55%)
  RETRAITE_PLAFONNEE_SALARIE: 6.90, // Retraite plafonnée salarié (6.90%)
  RETRAITE_DEPLAFONNEE_EMPLOYEUR: 1.90, // Retraite déplafonnée employeur (1.90%)
  RETRAITE_DEPLAFONNEE_SALARIE: 0.40, // Retraite déplafonnée salarié (0.40%)
  
  // Allocations familiales
  FAMILLE_EMPLOYEUR: 5.25, // Allocations familiales (5.25% employeur)
  
  // Assurance chômage
  CHOMAGE_EMPLOYEUR: 4.05, // Assurance chômage employeur (4.05%)
  CHOMAGE_SALARIE: 0, // Assurance chômage salarié (0% depuis 2018)
  
  // Retraite complémentaire AGIRC-ARRCO
  COMPLEMENTAIRE_T1_EMPLOYEUR: 4.72, // Retraite complémentaire employeur T1 (4.72%)
  COMPLEMENTAIRE_T1_SALARIE: 3.15, // Retraite complémentaire salarié T1 (3.15%)
  COMPLEMENTAIRE_T2_EMPLOYEUR: 12.95, // Retraite complémentaire employeur T2 (12.95%)
  COMPLEMENTAIRE_T2_SALARIE: 8.64, // Retraite complémentaire salarié T2 (8.64%)
  
  // Cotisations AGFF (Association pour la Gestion du Fonds de Financement)
  AGFF_T1_EMPLOYEUR: 1.29, // AGFF employeur T1 (1.29%)
  AGFF_T1_SALARIE: 0.86, // AGFF salarié T1 (0.86%)
  AGFF_T2_EMPLOYEUR: 1.62, // AGFF employeur T2 (1.62%)
  AGFF_T2_SALARIE: 1.08, // AGFF salarié T2 (1.08%)
  
  // APEC (cadres uniquement)
  APEC_EMPLOYEUR: 0.036, // APEC employeur (0.036%)
  APEC_SALARIE: 0.024, // APEC salarié (0.024%)
}; 