import { 
  ValidationSchema, 
  Company, 
  Employee, 
  Payslip,
  Department,
  User
} from "@/types/firebase";

// Schéma de validation pour une entreprise
export const companyValidationSchema: ValidationSchema<Company> = {
  name: {
    required: true,
    type: "string",
    minLength: 2,
  },
  siret: {
    required: true,
    type: "string",
    pattern: /^\d{14}$/,
  },
  address: {
    required: true,
    type: "string",
    minLength: 5,
  },
  postalCode: {
    required: true,
    type: "string",
    pattern: /^\d{5}$/,
  },
  city: {
    required: true,
    type: "string",
    minLength: 2,
  },
  country: {
    required: true,
    type: "string",
    minLength: 2,
  },
  email: {
    type: "string",
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  phoneNumber: {
    type: "string",
  },
  activityCode: {
    type: "string",
  },
  urssafNumber: {
    type: "string",
  },
  legalForm: {
    type: "string",
  },
  ownerId: {
    required: true,
    type: "string",
  },
};

// Schéma de validation pour un employé
export const employeeValidationSchema: ValidationSchema<Employee> = {
  firstName: {
    required: true,
    type: "string",
    minLength: 2,
  },
  lastName: {
    required: true,
    type: "string",
    minLength: 2,
  },
  email: {
    required: true,
    type: "string",
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  address: {
    required: true,
    type: "string",
    minLength: 5,
  },
  postalCode: {
    required: true,
    type: "string",
    pattern: /^\d{5}$/,
  },
  city: {
    required: true,
    type: "string",
    minLength: 2,
  },
  country: {
    required: true,
    type: "string",
    minLength: 2,
  },
  phoneNumber: {
    type: "string",
  },
  employmentDate: {
    required: true,
    custom: (value) => value !== null && value !== undefined,
  },
  companyId: {
    required: true,
    type: "string",
  },
  contractType: {
    required: true,
    type: "string",
  },
  position: {
    required: true,
    type: "string",
  },
  salaryBase: {
    required: true,
    type: "number",
    min: 0,
  },
  salaryFrequency: {
    required: true,
    custom: (value) => ['monthly', 'hourly', 'yearly'].includes(value as string),
  },
  status: {
    required: true,
    custom: (value) => ['active', 'inactive'].includes(value as string),
  },
};

// Schéma de validation pour un bulletin de paie
export const payslipValidationSchema: ValidationSchema<Payslip> = {
  employeeId: {
    required: true,
    type: "string",
  },
  companyId: {
    required: true,
    type: "string",
  },
  month: {
    required: true,
    type: "number",
    min: 1,
    max: 12,
  },
  year: {
    required: true,
    type: "number",
    min: 2000,
    max: 2100,
  },
  grossAmount: {
    required: true,
    type: "number",
    min: 0,
  },
  netAmount: {
    required: true,
    type: "number",
    min: 0,
  },
  taxAmount: {
    required: true,
    type: "number",
    min: 0,
  },
  otherDeductions: {
    required: true,
    type: "number",
    min: 0,
  },
  status: {
    required: true,
    custom: (value) => ['draft', 'generated', 'sent', 'paid'].includes(value as string),
  },
  periodStart: {
    required: true,
    custom: (value) => value !== null && value !== undefined,
  },
  periodEnd: {
    required: true,
    custom: (value) => value !== null && value !== undefined,
  },
  lineItems: {
    required: true,
    custom: (value) => Array.isArray(value) && value.length > 0,
  },
};

// Schéma de validation pour un département
export const departmentValidationSchema: ValidationSchema<Department> = {
  name: {
    required: true,
    type: "string",
    minLength: 2,
  },
  companyId: {
    required: true,
    type: "string",
  },
};

// Schéma de validation pour un utilisateur
export const userValidationSchema: ValidationSchema<User> = {
  uid: {
    required: true,
    type: "string",
  },
  email: {
    required: true,
    type: "string",
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  role: {
    required: true,
    custom: (value) => ['admin', 'user'].includes(value as string),
  },
}; 