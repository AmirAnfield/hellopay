import { auth } from '@/lib/firebase';
import { getDocument, getDocuments, setDocument, deleteDocument } from './firestore-service';
import { getCompany } from './company-service';

// Type pour les employés
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: Date;
  birthPlace?: string;
  nationality?: string;
  socialSecurityNumber: string;
  position: string;
  department?: string;
  contractType: string;
  isExecutive: boolean;
  startDate: Date;
  endDate?: Date;
  trialPeriodEndDate?: Date;
  hourlyRate: number;
  monthlyHours: number;
  baseSalary: number;
  bonusAmount?: number;
  bonusDescription?: string;
  iban?: string;
  bic?: string;
  paidLeaveBalance: number;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Type pour la création/mise à jour d'un employé
export interface EmployeeInput {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: Date | string;
  birthPlace?: string;
  nationality?: string;
  socialSecurityNumber: string;
  position: string;
  department?: string;
  contractType: string;
  isExecutive: boolean;
  startDate: Date | string;
  endDate?: Date | string;
  trialPeriodEndDate?: Date | string;
  hourlyRate: number;
  monthlyHours: number;
  baseSalary: number;
  bonusAmount?: number;
  bonusDescription?: string;
  iban?: string;
  bic?: string;
  paidLeaveBalance?: number;
  companyId: string;
}

/**
 * Obtenir tous les employés d'une entreprise
 */
export async function getCompanyEmployees(companyId: string): Promise<Employee[]> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Vérifier que l'entreprise existe et appartient à l'utilisateur
  const company = await getCompany(companyId);
  if (!company) {
    throw new Error("Entreprise non trouvée");
  }
  
  return getDocuments<Employee>(`users/${auth.currentUser.uid}/companies/${companyId}/employees`, {
    orderBy: [{ field: 'lastName' }, { field: 'firstName' }]
  });
}

/**
 * Obtenir un employé par son ID
 */
export async function getEmployee(companyId: string, employeeId: string): Promise<Employee | null> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Vérifier que l'entreprise existe et appartient à l'utilisateur
  const company = await getCompany(companyId);
  if (!company) {
    throw new Error("Entreprise non trouvée");
  }
  
  return getDocument<Employee>(`users/${auth.currentUser.uid}/companies/${companyId}/employees`, employeeId);
}

/**
 * Créer un nouvel employé
 */
export async function createEmployee(employeeData: EmployeeInput): Promise<string> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Vérifier que l'entreprise existe et appartient à l'utilisateur
  const company = await getCompany(employeeData.companyId);
  if (!company) {
    throw new Error("Entreprise non trouvée");
  }
  
  // Validation du numéro de sécurité sociale (15 chiffres)
  if (!/^\d{15}$/.test(employeeData.socialSecurityNumber)) {
    throw new Error("Le numéro de sécurité sociale doit comporter exactement 15 chiffres");
  }
  
  // Vérifier si un employé avec ce numéro de sécurité sociale existe déjà
  const existingEmployees = await getDocuments<Employee>(
    `users/${auth.currentUser.uid}/companies/${employeeData.companyId}/employees`, 
    {
      where: [{ field: 'socialSecurityNumber', operator: '==', value: employeeData.socialSecurityNumber }]
    }
  );
  
  if (existingEmployees.length > 0) {
    throw new Error(`Un employé avec le numéro de sécurité sociale ${employeeData.socialSecurityNumber} existe déjà`);
  }
  
  // Créer un ID unique pour le nouvel employé
  const employeeId = `employee_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // Formater les dates si nécessaire
  const formattedData = {
    ...employeeData,
    birthDate: employeeData.birthDate ? new Date(employeeData.birthDate) : undefined,
    startDate: new Date(employeeData.startDate),
    endDate: employeeData.endDate ? new Date(employeeData.endDate) : undefined,
    trialPeriodEndDate: employeeData.trialPeriodEndDate ? new Date(employeeData.trialPeriodEndDate) : undefined,
    paidLeaveBalance: employeeData.paidLeaveBalance || 0
  };
  
  // Créer l'employé dans Firestore
  await setDocument(
    `users/${auth.currentUser.uid}/companies/${employeeData.companyId}/employees`, 
    employeeId, 
    formattedData,
    false
  );
  
  return employeeId;
}

/**
 * Mettre à jour un employé existant
 */
export async function updateEmployee(companyId: string, employeeId: string, employeeData: Partial<EmployeeInput>): Promise<void> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Vérifier que l'entreprise existe et appartient à l'utilisateur
  const company = await getCompany(companyId);
  if (!company) {
    throw new Error("Entreprise non trouvée");
  }
  
  // Vérifier que l'employé existe
  const employee = await getEmployee(companyId, employeeId);
  if (!employee) {
    throw new Error("Employé non trouvé");
  }
  
  // Si le numéro de sécurité sociale est modifié, vérifier qu'il n'existe pas déjà
  if (employeeData.socialSecurityNumber) {
    if (!/^\d{15}$/.test(employeeData.socialSecurityNumber)) {
      throw new Error("Le numéro de sécurité sociale doit comporter exactement 15 chiffres");
    }
    
    const existingEmployees = await getDocuments<Employee>(
      `users/${auth.currentUser.uid}/companies/${companyId}/employees`, 
      {
        where: [
          { field: 'socialSecurityNumber', operator: '==', value: employeeData.socialSecurityNumber },
          { field: 'id', operator: '!=', value: employeeId }
        ]
      }
    );
    
    if (existingEmployees.length > 0) {
      throw new Error(`Un employé avec le numéro de sécurité sociale ${employeeData.socialSecurityNumber} existe déjà`);
    }
  }
  
  // Formater les dates si nécessaire
  const formattedData = {
    ...employeeData,
    ...(employeeData.birthDate && { birthDate: new Date(employeeData.birthDate) }),
    ...(employeeData.startDate && { startDate: new Date(employeeData.startDate) }),
    ...(employeeData.endDate && { endDate: new Date(employeeData.endDate) }),
    ...(employeeData.trialPeriodEndDate && { trialPeriodEndDate: new Date(employeeData.trialPeriodEndDate) })
  };
  
  // Mettre à jour l'employé dans Firestore
  await setDocument(
    `users/${auth.currentUser.uid}/companies/${companyId}/employees`, 
    employeeId, 
    formattedData,
    true
  );
}

/**
 * Supprimer un employé
 */
export async function deleteEmployee(companyId: string, employeeId: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Vérifier que l'entreprise existe et appartient à l'utilisateur
  const company = await getCompany(companyId);
  if (!company) {
    throw new Error("Entreprise non trouvée");
  }
  
  // Récupérer les bulletins de paie liés à cet employé
  const payslips = await getDocuments(
    `users/${auth.currentUser.uid}/companies/${companyId}/employees/${employeeId}/payslips`, 
    {}
  );
  
  // Si des bulletins sont liés, ne pas supprimer l'employé
  if (payslips.length > 0) {
    throw new Error(`Impossible de supprimer cet employé: ${payslips.length} bulletin(s) de paie y sont rattachés`);
  }
  
  // Supprimer l'employé
  await deleteDocument(`users/${auth.currentUser.uid}/companies/${companyId}/employees`, employeeId);
} 