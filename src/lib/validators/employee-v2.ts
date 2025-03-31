/**
 * Schémas de validation pour les employés (v2)
 * Utilisant les types partagés
 */
import { z } from 'zod';
import type { 
  EmployeeCreateRequestDTO, 
  EmployeeUpdateRequestDTO,
  EmployeeFormData,
  ContractType
} from '../types/employees/employee';

/**
 * Schéma pour valider les types de contrat
 */
export const contractTypeSchema = z.enum([
  'CDI', 
  'CDD', 
  'Alternance', 
  'Stage', 
  'Intérim', 
  'Autre'
]) satisfies z.ZodType<ContractType>;

/**
 * Schéma pour la création/mise à jour d'un employé
 */
export const employeeCreateSchema = z.object({
  // Champs obligatoires
  firstName: z.string().min(2, "Le prénom doit comporter au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  address: z.string().min(5, "L'adresse doit comporter au moins 5 caractères"),
  city: z.string().min(2, "La ville doit comporter au moins 2 caractères"),
  postalCode: z.string().min(2, "Le code postal doit comporter au moins 2 caractères"),
  country: z.string().default("France"),
  socialSecurityNumber: z.string().regex(/^\d{15}$/, "Le numéro de sécurité sociale doit comporter 15 chiffres"),
  position: z.string().min(2, "Le poste doit comporter au moins 2 caractères"),
  contractType: contractTypeSchema,
  startDate: z.string(), // Format ISO
  hourlyRate: z.number().positive("Le taux horaire doit être positif"),
  monthlyHours: z.number().positive("Le nombre d'heures mensuelles doit être positif").default(151.67),
  baseSalary: z.number().positive("Le salaire de base doit être positif"),
  companyId: z.string().min(1, "L'entreprise est requise"),
  isExecutive: z.boolean().default(false),
  
  // Champs optionnels
  email: z.string().email("Format d'email invalide").optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(), // Format ISO
  birthPlace: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(), // Format ISO
  trialPeriodEndDate: z.string().optional().nullable(), // Format ISO
  bonusAmount: z.number().optional().nullable(),
  bonusDescription: z.string().optional().nullable(),
  iban: z.string().optional().nullable(),
  bic: z.string().optional().nullable(),
  paidLeaveBalance: z.number().default(0)
}) satisfies z.ZodType<Omit<EmployeeCreateRequestDTO, 'id'>>;

/**
 * Type pour la création d'un employé
 */
export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;

/**
 * Schéma pour la mise à jour d'un employé
 */
export const employeeUpdateSchema = employeeCreateSchema.partial().extend({
  id: z.string().min(1, "L'ID de l'employé est requis")
}) satisfies z.ZodType<EmployeeUpdateRequestDTO>;

/**
 * Type pour la mise à jour d'un employé
 */
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;

/**
 * Schéma pour la récupération d'un employé par ID
 */
export const getEmployeeParamsSchema = z.object({
  id: z.string().min(1, "L'ID de l'employé est requis"),
});

export type GetEmployeeParams = z.infer<typeof getEmployeeParamsSchema>;

/**
 * Schéma pour la liste des employés avec filtres
 */
export const listEmployeesQuerySchema = z.object({
  page: z.string().optional().nullable().transform(val => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().nullable().transform(val => (val ? parseInt(val, 10) : 10)),
  companyId: z.string().optional().nullable(),
  search: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  contractType: contractTypeSchema.optional(),
  isExecutive: z.string().optional().nullable().transform(val => val === 'true'),
  sortBy: z.enum(['lastName', 'firstName', 'position', 'startDate', 'baseSalary']).optional().default('lastName'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;

/**
 * Schéma pour le formulaire d'employé côté frontend
 * Basé sur les types partagés
 */
export const employeeFormSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit comporter au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  address: z.string().min(5, "L'adresse doit comporter au moins 5 caractères"),
  city: z.string().min(2, "La ville doit comporter au moins 2 caractères"),
  postalCode: z.string().min(2, "Le code postal doit comporter au moins 2 caractères"),
  country: z.string().default("France"),
  email: z.string().email("Format d'email invalide"),
  phoneNumber: z.string(),
  birthDate: z.string(), // Format yyyy-MM-dd
  birthPlace: z.string(),
  nationality: z.string(),
  socialSecurityNumber: z.string().regex(/^\d{15}$/, "Le numéro de sécurité sociale doit comporter 15 chiffres"),
  position: z.string().min(2, "Le poste doit comporter au moins 2 caractères"),
  department: z.string(),
  contractType: contractTypeSchema,
  isExecutive: z.boolean().default(false),
  startDate: z.string(), // Format yyyy-MM-dd
  endDate: z.string(), // Format yyyy-MM-dd
  trialPeriodEndDate: z.string(), // Format yyyy-MM-dd
  hourlyRate: z.number().positive("Le taux horaire doit être positif"),
  monthlyHours: z.number().positive("Le nombre d'heures mensuelles doit être positif").default(151.67),
  baseSalary: z.number().positive("Le salaire de base doit être positif"),
  bonusAmount: z.number(),
  bonusDescription: z.string(),
  iban: z.string(),
  bic: z.string(),
  companyId: z.string().min(1, "L'entreprise est requise"),
}) satisfies z.ZodType<EmployeeFormData>;

export type EmployeeFormInput = z.infer<typeof employeeFormSchema>; 