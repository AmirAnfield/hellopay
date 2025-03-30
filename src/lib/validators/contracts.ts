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