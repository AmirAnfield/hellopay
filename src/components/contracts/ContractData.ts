export interface ContractData {
  id: string;
  
  // Métadonnées
  title: string;
  description?: string;
  reference?: string;
  status: 'draft' | 'pending' | 'active' | 'expired' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  
  // Entités
  company: {
    id: string;
    name: string;
    siret?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    country?: string;
    representative?: string;
    position?: string;
  };
  
  employee?: {
    id?: string;
    firstName: string;
    lastName: string;
    birthDate?: string;
    birthPlace?: string;
    nationality?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    country?: string;
    email?: string;
    phoneNumber?: string;
  };
  
  counterparty?: {
    name: string;
    email?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  
  // Paramètres du contrat
  contractType: 'CDI' | 'CDD' | 'CTT' | 'Stage' | 'Alternance' | 'Autre';
  contractSubtype?: string; // Ex: "CDD saisonnier"
  startDate: string;
  endDate?: string;
  probationPeriod: {
    enabled: boolean;
    durationMonths: number;
    renewalEnabled: boolean;
    renewalDurationMonths?: number;
    endDate?: string;
  };
  
  // Horaires de travail
  workSchedule: {
    hoursPerWeek: number;
    daysPerWeek: number;
    scheduleType: 'fixed' | 'variable' | 'shifts';
    scheduleDetails?: string;
    restDays?: string[];
  };
  
  // Rémunération
  compensation: {
    baseSalary: number;
    currency: string;
    paymentFrequency: 'monthly' | 'hourly' | 'daily';
    bonuses?: Array<{
      name: string;
      amount: number;
      frequency: string;
      conditions?: string;
    }>;
    benefits?: Array<{
      name: string;
      description?: string;
      monetaryValue?: number;
    }>;
  };
  
  // Articles du contrat
  articles: Array<{
    id: string;
    title: string;
    content: string;
    isRequired: boolean;
    isEditable: boolean;
    order: number;
  }>;
  
  // Clauses additionnelles
  additionalClauses: Array<{
    id: string;
    title: string;
    content: string;
    order: number;
  }>;
  
  // Options de document
  documentOptions: {
    templateId?: string;
    signatureDate?: string;
    signatureLocation?: string;
    includeCompanyLogo?: boolean;
    includeCompanyHeader?: boolean;
    includeFooter?: boolean;
    footerText?: string;
  };
  
  // Progression dans le wizard
  wizardProgress: {
    currentStep: string;
    completedSteps: string[];
    lastSaved: string;
  };
  
  // Fichier généré
  generatedFile?: {
    url?: string;
    name?: string;
    size?: number;
    generatedAt?: string;
    signedUrl?: string;
  };
}

// Liste des étapes du wizard
export const CONTRACT_WIZARD_STEPS = [
  { id: "entity", title: "Entités", description: "Sélection de l'entreprise et du salarié" },
  { id: "parameters", title: "Paramètres", description: "Détails du contrat" },
  { id: "articles", title: "Articles", description: "Articles standards du contrat" },
  { id: "clauses", title: "Clauses", description: "Clauses additionnelles" },
  { id: "preview", title: "Aperçu", description: "Prévisualisation du contrat" },
  { id: "finalize", title: "Finalisation", description: "Génération et téléchargement" },
];

// Modèles d'articles de contrat par type
export const CONTRACT_TEMPLATES = {
  CDI: [
    {
      id: "art-fonction",
      title: "Article 1: Fonction et classification",
      content: "Le salarié est engagé en qualité de [FONCTION] au coefficient [COEFFICIENT] de la convention collective [CONVENTION].",
      isRequired: true,
      isEditable: true,
      order: 1
    },
    {
      id: "art-duree",
      title: "Article 2: Durée du contrat",
      content: "Le présent contrat est conclu pour une durée indéterminée à compter du [DATE_DEBUT].",
      isRequired: true,
      isEditable: true,
      order: 2
    },
    {
      id: "art-essai",
      title: "Article 3: Période d'essai",
      content: "Le contrat comporte une période d'essai de [DUREE_ESSAI] mois. Durant cette période, chacune des parties pourra rompre le contrat sans indemnité ni préavis.",
      isRequired: true,
      isEditable: true,
      order: 3
    },
    {
      id: "art-remuneration",
      title: "Article 4: Rémunération",
      content: "En contrepartie de son travail, le salarié percevra une rémunération mensuelle brute de [SALAIRE_BASE] euros pour [HEURES_MENSUEL] heures de travail.",
      isRequired: true,
      isEditable: true,
      order: 4
    },
    {
      id: "art-horaires",
      title: "Article 5: Horaires de travail",
      content: "La durée du travail est de [HEURES_HEBDO] heures hebdomadaires réparties sur [JOURS_SEMAINE] jours.",
      isRequired: true,
      isEditable: true,
      order: 5
    },
    {
      id: "art-conges",
      title: "Article 6: Congés payés",
      content: "Le salarié bénéficiera des congés payés institués en faveur des salariés dans les conditions prévues par la législation en vigueur.",
      isRequired: true,
      isEditable: true,
      order: 6
    },
    {
      id: "art-preavis",
      title: "Article 7: Préavis",
      content: "Après expiration de la période d'essai, en cas de rupture du contrat de travail, la durée du préavis est fixée conformément aux dispositions légales et conventionnelles en vigueur.",
      isRequired: true,
      isEditable: true,
      order: 7
    }
  ],
  CDD: [
    {
      id: "art-fonction-cdd",
      title: "Article 1: Fonction et classification",
      content: "Le salarié est engagé en qualité de [FONCTION] au coefficient [COEFFICIENT] de la convention collective [CONVENTION].",
      isRequired: true,
      isEditable: true,
      order: 1
    },
    {
      id: "art-motif-cdd",
      title: "Article 2: Motif du recours au CDD",
      content: "Le présent contrat est conclu pour le motif suivant: [MOTIF_CDD]",
      isRequired: true,
      isEditable: true,
      order: 2
    },
    {
      id: "art-duree-cdd",
      title: "Article 3: Durée du contrat",
      content: "Le présent contrat est conclu pour une durée déterminée de [DUREE_CDD] à compter du [DATE_DEBUT] jusqu'au [DATE_FIN].",
      isRequired: true,
      isEditable: true,
      order: 3
    },
    {
      id: "art-essai-cdd",
      title: "Article 4: Période d'essai",
      content: "Le contrat comporte une période d'essai de [DUREE_ESSAI] jours. Durant cette période, chacune des parties pourra rompre le contrat sans indemnité ni préavis.",
      isRequired: true,
      isEditable: true,
      order: 4
    },
    {
      id: "art-remuneration-cdd",
      title: "Article 5: Rémunération",
      content: "En contrepartie de son travail, le salarié percevra une rémunération mensuelle brute de [SALAIRE_BASE] euros pour [HEURES_MENSUEL] heures de travail.",
      isRequired: true,
      isEditable: true,
      order: 5
    },
    {
      id: "art-horaires-cdd",
      title: "Article 6: Horaires de travail",
      content: "La durée du travail est de [HEURES_HEBDO] heures hebdomadaires réparties sur [JOURS_SEMAINE] jours.",
      isRequired: true,
      isEditable: true,
      order: 6
    },
    {
      id: "art-indemnite-cdd",
      title: "Article 7: Indemnité de fin de contrat",
      content: "A l'issue du contrat, le salarié percevra une indemnité de fin de contrat égale à 10% de la rémunération totale brute perçue pendant la durée du contrat.",
      isRequired: true,
      isEditable: true,
      order: 7
    }
  ]
}; 