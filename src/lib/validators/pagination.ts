import { z } from 'zod';

/**
 * Schéma de base pour la pagination
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional().nullable(),
  sortBy: z.string().optional().nullable(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
});

/**
 * Type pour la pagination
 */
export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Schéma pour la liste des employés
 */
export const listEmployeesQuerySchema = paginationSchema.extend({
  companyId: z.string().optional().nullable(),
  contractType: z.string().optional().nullable(),
  isActive: z.coerce.boolean().optional(),
  department: z.string().optional().nullable(),
  startDateFrom: z.coerce.date().optional(),
  startDateTo: z.coerce.date().optional()
});

/**
 * Type pour la liste des employés
 */
export type ListEmployeesParams = z.infer<typeof listEmployeesQuerySchema>;

/**
 * Schéma pour la liste des bulletins de paie
 */
export const listPayslipsQuerySchema = paginationSchema.extend({
  companyId: z.string().optional().nullable(),
  employeeId: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  periodFrom: z.coerce.date().optional(),
  periodTo: z.coerce.date().optional(),
  fiscalYear: z.coerce.number().int().optional()
});

/**
 * Type pour la liste des bulletins de paie
 */
export type ListPayslipsParams = z.infer<typeof listPayslipsQuerySchema>;

/**
 * Schéma pour la liste des entreprises
 */
export const listCompaniesQuerySchema = paginationSchema.extend({
  country: z.string().optional().nullable(),
  legalForm: z.string().optional().nullable(),
  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional()
});

/**
 * Type pour la liste des entreprises
 */
export type ListCompaniesParams = z.infer<typeof listCompaniesQuerySchema>;

/**
 * Schéma pour la liste des contrats
 */
export const listContractsQuerySchema = paginationSchema.extend({
  companyId: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  contractType: z.string().optional().nullable(),
  startDateFrom: z.coerce.date().optional(),
  startDateTo: z.coerce.date().optional(),
  endDateFrom: z.coerce.date().optional(),
  endDateTo: z.coerce.date().optional()
});

/**
 * Type pour la liste des contrats
 */
export type ListContractsParams = z.infer<typeof listContractsQuerySchema>;

/**
 * Fonction utilitaire pour transformer les paramètres de pagination en options pour les requêtes de base de données
 */
export function getPaginationOptions<T extends PaginationParams>(params: T) {
  const { page, limit, sortBy, sortOrder } = params;
  
  // Calculer l'offset de pagination
  const skip = (page - 1) * limit;
  const take = limit;
  
  // Options de tri
  const orderBy = sortBy 
    ? { [sortBy]: sortOrder } 
    : undefined;
  
  return {
    skip,
    take,
    orderBy
  };
}

/**
 * Type pour la réponse paginée
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Fonction utilitaire pour créer une réponse paginée
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const { page, limit } = params;
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
} 