import { z } from 'zod';

/**
 * Schéma pour un bulletin de paie individuel dans une demande de génération
 */
export const payslipInputSchema = z.object({
  month: z.number().int().min(1).max(12, { message: "Le mois doit être compris entre 1 et 12" }),
  year: z.number().int().min(2000).max(2100, { message: "L'année doit être comprise entre 2000 et 2100" }),
  grossSalary: z.number().positive({ message: "Le salaire brut doit être positif" }),
  id: z.string().optional(),
});

export type PayslipInput = z.infer<typeof payslipInputSchema>;

/**
 * Schéma pour la route /api/payslips/generate
 */
export const generatePayslipsSchema = z.object({
  employeeId: z.string().min(1, { message: "L'ID de l'employé est requis" }),
  companyId: z.string().min(1, { message: "L'ID de l'entreprise est requis" }),
  payslips: z.array(payslipInputSchema).min(1, { message: "Au moins un bulletin doit être généré" }),
  isExecutive: z.boolean().optional().default(false),
});

export type GeneratePayslipsInput = z.infer<typeof generatePayslipsSchema>;

/**
 * Schéma pour la route /api/payslips/[id]/download
 * Utilisé pour valider les paramètres de l'URL
 */
export const downloadPayslipParamsSchema = z.object({
  id: z.string().min(1, { message: "L'ID du bulletin est requis" }),
});

export type DownloadPayslipParams = z.infer<typeof downloadPayslipParamsSchema>;

/**
 * Schéma pour la route /api/payslips/download-bulk
 */
export const downloadBulkPayslipsSchema = z.object({
  payslipIds: z.array(z.string()).min(1, { message: "Au moins un ID de bulletin est requis" }),
});

export type DownloadBulkPayslipsInput = z.infer<typeof downloadBulkPayslipsSchema>;

/**
 * Schéma pour la route /api/payslips/[id]/lock
 */
export const lockPayslipSchema = z.object({
  id: z.string().min(1, { message: "L'ID du bulletin est requis" }),
});

export type LockPayslipInput = z.infer<typeof lockPayslipSchema>;

/**
 * Schéma pour la route /api/payslips/[id]/unlock
 */
export const unlockPayslipSchema = z.object({
  id: z.string().min(1, { message: "L'ID du bulletin est requis" }),
});

export type UnlockPayslipInput = z.infer<typeof unlockPayslipSchema>;

/**
 * Schéma pour la route /api/payslips avec filtres de recherche
 */
export const listPayslipsQuerySchema = z.object({
  page: z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 10)),
  employeeId: z.string().optional(),
  companyId: z.string().optional(),
  startDate: z.string().optional().refine(
    val => !val || !isNaN(Date.parse(val)),
    { message: "La date de début doit être une date valide" }
  ),
  endDate: z.string().optional().refine(
    val => !val || !isNaN(Date.parse(val)),
    { message: "La date de fin doit être une date valide" }
  ),
  status: z.enum(['draft', 'validated', 'locked']).optional(),
});

export type ListPayslipsQuery = z.infer<typeof listPayslipsQuerySchema>; 