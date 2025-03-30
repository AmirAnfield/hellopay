import { z } from 'zod';

/**
 * Schéma pour la création/mise à jour d'un employé
 */
export const employeeSchema = z.object({
  // Champs obligatoires
  firstName: z.string().min(2, "Le prénom doit comporter au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  address: z.string().min(5, "L'adresse doit comporter au moins 5 caractères"),
  city: z.string().min(2, "La ville doit comporter au moins 2 caractères"),
  postalCode: z.string().min(2, "Le code postal doit comporter au moins 2 caractères"),
  country: z.string().default("France"),
  socialSecurityNumber: z.string().regex(/^\d{15}$/, "Le numéro de sécurité sociale doit comporter 15 chiffres"),
  position: z.string().min(2, "Le poste doit comporter au moins 2 caractères"),
  contractType: z.string().min(2, "Le type de contrat doit être spécifié"),
  startDate: z.coerce.date(),
  hourlyRate: z.coerce.number().positive("Le taux horaire doit être positif"),
  monthlyHours: z.coerce.number().positive("Le nombre d'heures mensuelles doit être positif").default(151.67),
  baseSalary: z.coerce.number().positive("Le salaire de base doit être positif"),
  companyId: z.string().min(1, "L'entreprise est requise"),
  
  // Champs optionnels
  email: z.string().email("Format d'email invalide").optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  birthDate: z.coerce.date().optional().nullable(),
  birthPlace: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  isExecutive: z.boolean().default(false),
  endDate: z.coerce.date().optional().nullable(),
  trialPeriodEndDate: z.coerce.date().optional().nullable(),
  bonusAmount: z.coerce.number().optional().nullable(),
  bonusDescription: z.string().optional().nullable(),
  iban: z.string().optional().nullable(),
  bic: z.string().optional().nullable(),
  paidLeaveBalance: z.coerce.number().default(0)
});

/**
 * Type pour un employé
 */
export type EmployeeInput = z.infer<typeof employeeSchema>;

/**
 * Schéma pour la mise à jour partielle d'un employé
 */
export const employeeUpdateSchema = employeeSchema.partial().extend({
  id: z.string().min(1, "L'ID de l'employé est requis")
});

/**
 * Type pour la mise à jour d'un employé
 */
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;

/**
 * Schéma pour la création d'un employé (étape 1 - informations personnelles)
 */
export const createEmployeePersonalSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom est requis (minimum 2 caractères)" }),
  lastName: z.string().min(2, { message: "Le nom est requis (minimum 2 caractères)" }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide" }).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().optional().refine(
    val => !val || !isNaN(Date.parse(val)),
    { message: "La date de naissance doit être une date valide" }
  ),
  socialSecurityNumber: z.string()
    .regex(/^[0-9]{13,15}$/, { message: "Le numéro de sécurité sociale doit contenir entre 13 et 15 chiffres" })
    .optional(),
});

export type CreateEmployeePersonalInput = z.infer<typeof createEmployeePersonalSchema>;

/**
 * Schéma pour la création d'un employé (étape 2 - informations professionnelles)
 */
export const createEmployeeProfessionalSchema = z.object({
  companyId: z.string().min(1, { message: "L'ID de l'entreprise est requis" }),
  position: z.string().min(1, { message: "Le poste est requis" }),
  department: z.string().optional(),
  hireDate: z.string().refine(
    val => !isNaN(Date.parse(val)),
    { message: "La date d'embauche doit être une date valide" }
  ),
  contractType: z.enum(['CDI', 'CDD', 'Alternance', 'Stage', 'Autre'], { 
    errorMap: () => ({ message: "Type de contrat invalide" })
  }),
  isExecutive: z.boolean().optional().default(false),
});

export type CreateEmployeeProfessionalInput = z.infer<typeof createEmployeeProfessionalSchema>;

/**
 * Schéma pour la création d'un employé (étape 3 - informations de rémunération)
 */
export const createEmployeeCompensationSchema = z.object({
  grossSalary: z.number().positive({ message: "Le salaire brut doit être positif" }),
  hourlyRate: z.number().positive({ message: "Le taux horaire doit être positif" }).optional(),
  hoursPerMonth: z.number().positive({ message: "Le nombre d'heures par mois doit être positif" }).optional().default(151.67),
  bonusAmount: z.number().optional().default(0),
  benefitsAmount: z.number().optional().default(0),
  paidLeaveBalance: z.number().optional().default(0),
  notes: z.string().optional(),
});

export type CreateEmployeeCompensationInput = z.infer<typeof createEmployeeCompensationSchema>;

/**
 * Schéma complet pour la création d'un employé (toutes les étapes combinées)
 */
export const createEmployeeSchema = createEmployeePersonalSchema
  .merge(createEmployeeProfessionalSchema)
  .merge(createEmployeeCompensationSchema);

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

/**
 * Schéma pour la mise à jour d'un employé
 */
export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  id: z.string().min(1, { message: "L'ID de l'employé est requis" }),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

/**
 * Schéma pour la récupération d'un employé par ID
 */
export const getEmployeeParamsSchema = z.object({
  id: z.string().min(1, { message: "L'ID de l'employé est requis" }),
});

export type GetEmployeeParams = z.infer<typeof getEmployeeParamsSchema>;

/**
 * Schéma pour la liste des employés avec filtres
 */
export const listEmployeesQuerySchema = z.object({
  page: z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 10)),
  companyId: z.string().optional(),
  search: z.string().optional(),
  department: z.string().optional(),
  contractType: z.enum(['CDI', 'CDD', 'Alternance', 'Stage', 'Autre']).optional(),
  isExecutive: z.string().optional().transform(val => val === 'true'),
  sortBy: z.enum(['lastName', 'firstName', 'position', 'hireDate', 'grossSalary']).optional().default('lastName'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>; 