import { z } from 'zod';

/**
 * Schéma pour la création/mise à jour d'un contrat
 */
export const contractSchema = z.object({
  // Champs obligatoires
  title: z.string().min(2, "Le titre doit comporter au moins 2 caractères"),
  companyId: z.string().min(1, "L'entreprise est requise"),
  startDate: z.coerce.date(),
  contractType: z.string().min(2, "Le type de contrat doit être spécifié"),
  fileUrl: z.string().url("Le format de l'URL du fichier est invalide"),
  fileName: z.string().min(1, "Le nom du fichier est requis"),
  fileSize: z.number().int().positive("La taille du fichier doit être positive"),
  status: z.string().default("draft"),
  
  // Champs optionnels
  description: z.string().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  tags: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  counterpartyName: z.string().optional().nullable(),
  counterpartyEmail: z.string().email("Format d'email invalide").optional().nullable()
});

/**
 * Type pour un contrat
 */
export type ContractInput = z.infer<typeof contractSchema>;

/**
 * Schéma pour la mise à jour partielle d'un contrat
 */
export const contractUpdateSchema = contractSchema.partial().extend({
  id: z.string().min(1, "L'ID du contrat est requis")
});

/**
 * Type pour la mise à jour d'un contrat
 */
export type ContractUpdateInput = z.infer<typeof contractUpdateSchema>;

// Validation des données employeur
export const employeurSchema = z.object({
  raisonSociale: z.string().min(1, "La raison sociale est requise"),
  formeJuridique: z.string().min(1, "La forme juridique est requise"),
  siret: z.string().optional().nullable(),
  adresse: z.string().min(1, "L'adresse est requise"),
  codePostal: z.string().min(1, "Le code postal est requis"),
  ville: z.string().min(1, "La ville est requise"),
  representant: z.string().min(1, "Le représentant est requis"),
  fonction: z.string().min(1, "La fonction du représentant est requise"),
  conventionCollective: z.string().optional().nullable(),
  codeConvention: z.string().optional().nullable(),
  caisseRetraite: z.string().optional().nullable(),
  organismePrevoyance: z.string().optional().nullable()
});

// Validation des données du salarié
export const salarieSchema = z.object({
  civilite: z.enum(["M", "Mme", ""]),
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  dateNaissance: z.string().min(1, "La date de naissance est requise"),
  lieuNaissance: z.string().min(1, "Le lieu de naissance est requis"),
  nationalite: z.string().optional().nullable(),
  adresse: z.string().min(1, "L'adresse est requise"),
  codePostal: z.string().min(1, "Le code postal est requis"),
  ville: z.string().min(1, "La ville est requise"),
  numeroSecuriteSociale: z.string().optional().nullable()
});

// Validation des données de contrat
export const contratDetailsSchema = z.object({
  type: z.enum([
    "CDI_temps_plein", 
    "CDI_temps_partiel", 
    "CDD_temps_plein", 
    "CDD_temps_partiel"
  ]),
  intitulePoste: z.string().min(1, "L'intitulé du poste est requis"),
  qualification: z.string().min(1, "La qualification est requise"),
  motifCDD: z.string().optional().nullable(),
  personneRemplacee: z.string().optional().nullable(),
  dateDebut: z.string().min(1, "La date de début est requise"),
  dateFin: z.string().optional().nullable(),
  dureeMinimale: z.string().optional().nullable(),
  renouvelable: z.boolean().default(false),
  lieuTravail: z.string().min(1, "Le lieu de travail est requis")
});

// Validation de la période d'essai
export const periodeEssaiSchema = z.object({
  active: z.boolean().default(true),
  duree: z.number().min(0),
  unite: z.enum(["jours", "semaines", "mois"]),
  renouvelable: z.boolean().default(false),
  dureeRenouvellement: z.number().min(0).optional().nullable(),
  uniteRenouvellement: z.enum(["jours", "semaines", "mois"]).optional().nullable()
});

// Validation de la durée du travail
export const travailSchema = z.object({
  dureeHebdo: z.number().min(0),
  dureeJournaliere: z.number().min(0).optional(),
  repartitionHoraires: z.string().optional().nullable(),
  joursTravailes: z.array(z.string()),
  heuresComplementaires: z.number().min(0).max(33),
  modificationRepartition: z.string().optional().nullable(),
  modalitesCommunication: z.string().optional().nullable()
});

// Validation de la rémunération
export const remunerationSchema = z.object({
  tauxHoraire: z.number().min(0),
  salaireBrutMensuel: z.number().min(0),
  salaireNetMensuel: z.number().min(0),
  salaireBrutAnnuel: z.number().min(0),
  salaireNetAnnuel: z.number().min(0),
  primes: z.array(z.object({
    nom: z.string(),
    montant: z.number(),
    frequence: z.string(),
    conditions: z.string().optional()
  })).optional().default([]),
  avantagesNature: z.array(z.object({
    nom: z.string(),
    description: z.string().optional(),
    valeur: z.number().optional()
  })).optional().default([]),
  periodiciteVersement: z.string().default("mensuel")
});

// Validation des congés
export const congesSchema = z.object({
  droitConges: z.enum(["légal", "conventionnel", "spécifique"]),
  nbJoursCongesSpecifiques: z.number().min(0).optional(),
  dureePrevis: z.string().optional().nullable(),
  retraite: z.string().optional().nullable(),
  prevoyance: z.string().optional().nullable()
});

// Validation des clauses optionnelles
export const clausesSchema = z.object({
  confidentialite: z.boolean().default(false),
  nonConcurrence: z.object({
    active: z.boolean().default(false),
    duree: z.number().min(0).optional(),
    zone: z.string().optional().nullable(),
    indemnite: z.number().min(0).optional()
  }),
  mobilite: z.object({
    active: z.boolean().default(false),
    perimetre: z.string().optional().nullable()
  }),
  exclusivite: z.boolean().default(false),
  teletravail: z.object({
    active: z.boolean().default(false),
    modalites: z.string().optional().nullable()
  }),
  proprieteIntellectuelle: z.boolean().default(false),
  deditFormation: z.object({
    active: z.boolean().default(false),
    conditions: z.string().optional().nullable()
  })
});

// Validation des données de génération
export const generationSchema = z.object({
  dateSignature: z.string().optional().nullable(),
  lieuSignature: z.string().optional().nullable(),
  documentGenere: z.any().optional().nullable()
});

// Validation du suivi de progression
export const wizardProgressSchema = z.object({
  currentStep: z.string(),
  completedSteps: z.array(z.string()).default([])
});

// Schéma complet du contrat
export const contractSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  employeur: employeurSchema,
  salarie: salarieSchema,
  contrat: contratDetailsSchema,
  periodeEssai: periodeEssaiSchema,
  travail: travailSchema,
  remuneration: remunerationSchema,
  conges: congesSchema,
  clauses: clausesSchema,
  generation: generationSchema,
  status: z.enum(["draft", "active", "expired", "terminated", "cancelled"]).default("draft"),
  wizardProgress: wizardProgressSchema
});

export type EmployeurData = z.infer<typeof employeurSchema>;
export type SalarieData = z.infer<typeof salarieSchema>;
export type ContratDetails = z.infer<typeof contratDetailsSchema>;
export type PeriodeEssaiData = z.infer<typeof periodeEssaiSchema>;
export type TravailData = z.infer<typeof travailSchema>;
export type RemunerationData = z.infer<typeof remunerationSchema>;
export type CongesData = z.infer<typeof congesSchema>;
export type ClausesData = z.infer<typeof clausesSchema>;
export type GenerationData = z.infer<typeof generationSchema>;
export type WizardProgressData = z.infer<typeof wizardProgressSchema>;
export type ContractData = z.infer<typeof contractSchema>; 