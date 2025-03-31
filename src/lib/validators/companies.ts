import { z } from 'zod';

/**
 * Schéma pour la création/mise à jour d'une entreprise
 */
export const companySchema = z.object({
  // Champs obligatoires
  name: z.string().min(2, "La raison sociale doit comporter au moins 2 caractères"),
  siret: z.string().regex(/^\d{14}$/, "Le SIRET doit comporter exactement 14 chiffres"),
  address: z.string().min(5, "L'adresse doit comporter au moins 5 caractères"),
  city: z.string().min(2, "La ville doit comporter au moins 2 caractères"),
  postalCode: z.string().min(2, "Le code postal doit comporter au moins 2 caractères"),
  country: z.string().default("France"),
  
  // Champs optionnels
  activityCode: z.string().optional().nullable(),
  urssafNumber: z.string().optional().nullable(),
  legalForm: z.string().optional().nullable(),
  vatNumber: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  email: z.string().email("Format d'email invalide").optional().nullable(),
  website: z.string().url("Format d'URL invalide").optional().nullable(),
  iban: z.string().optional().nullable(),
  bic: z.string().optional().nullable(),
  legalRepresentative: z.string().optional().nullable(),
  legalRepresentativeRole: z.string().optional().nullable()
});

/**
 * Type pour une entreprise
 */
export type CompanyInput = z.infer<typeof companySchema>;

/**
 * Schéma pour la mise à jour partielle d'une entreprise
 */
export const companyUpdateSchema = companySchema.partial().extend({
  id: z.string().min(1, "L'ID de l'entreprise est requis")
});

/**
 * Type pour la mise à jour d'une entreprise
 */
export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;

/**
 * Schéma pour la récupération d'une entreprise par ID
 */
export const getCompanyParamsSchema = z.object({
  id: z.string().min(1, { message: "L'ID de l'entreprise est requis" }),
});

export type GetCompanyParams = z.infer<typeof getCompanyParamsSchema>;

/**
 * Schéma pour la suppression d'une entreprise
 */
export const deleteCompanySchema = z.object({
  id: z.string().min(1, { message: "L'ID de l'entreprise est requis" }),
  confirmDelete: z.boolean().refine(val => val === true, {
    message: "Vous devez confirmer la suppression de l'entreprise"
  }),
});

export type DeleteCompanyInput = z.infer<typeof deleteCompanySchema>;

/**
 * Schéma pour la liste des entreprises avec filtres
 */
export const listCompaniesQuerySchema = z.object({
  page: z.string().optional().nullable().transform(val => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().nullable().transform(val => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional().nullable(),
  sortBy: z.enum(['name', 'city', 'createdAt']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type ListCompaniesQuery = z.infer<typeof listCompaniesQuerySchema>;

/**
 * Schéma pour l'ajout d'un logo d'entreprise
 */
export const uploadCompanyLogoSchema = z.object({
  companyId: z.string().min(1, { message: "L'ID de l'entreprise est requis" }),
  file: z.any(), // Validation faite dans le gestionnaire de route
});

export type UploadCompanyLogoInput = z.infer<typeof uploadCompanyLogoSchema>; 