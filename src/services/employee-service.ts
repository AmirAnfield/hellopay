/**
 * Service unifié pour la gestion des employés
 * 
 * Ce service regroupe toutes les fonctionnalités liées aux employés
 * qui étaient auparavant réparties entre plusieurs fichiers.
 */

import { firestore as db } from '@/lib/firebase/config';
import { auth } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { getCompanyDetails } from './company-service';

// Type pour les employés
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  address: string;
  city: string;
  postalCode: string;
  country?: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: Date | string;
  birthPlace?: string;
  nationality?: string;
  socialSecurityNumber?: string;
  position?: string;
  department?: string;
  contractType?: string;
  isExecutive?: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
  trialPeriodEndDate?: Date | string;
  hourlyRate?: number;
  monthlyHours?: number;
  baseSalary?: number;
  bonusAmount?: number;
  bonusDescription?: string;
  iban?: string;
  bic?: string;
  paidLeaveBalance?: number;
  companyId?: string;
  createdAt?: any;
  updatedAt?: any;
  status?: 'active' | 'inactive' | 'archived';
}

// Type pour la création/mise à jour d'un employé
export interface EmployeeInput {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country?: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: Date | string;
  birthPlace?: string;
  nationality?: string;
  socialSecurityNumber?: string;
  position?: string;
  department?: string;
  contractType?: string;
  isExecutive?: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
  trialPeriodEndDate?: Date | string;
  hourlyRate?: number;
  monthlyHours?: number;
  baseSalary?: number;
  bonusAmount?: number;
  bonusDescription?: string;
  iban?: string;
  bic?: string;
  paidLeaveBalance?: number;
  companyId?: string;
}

/**
 * Récupère tous les employés d'un utilisateur
 * 
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 * @returns Liste des employés
 */
export async function getUserEmployees(userId?: string): Promise<Employee[]> {
  try {
    // Si userId n'est pas fourni, utiliser l'utilisateur authentifié
    if (!userId) {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
      userId = auth.currentUser.uid;
    }

    const employeesRef = collection(db, `users/${userId}/employees`);
    const snapshot = await getDocs(employeesRef);
    
    const employees: Employee[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const firstName = data.firstName || '';
      const lastName = data.lastName || '';
      
      employees.push({
        id: doc.id,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        birthDate: data.birthDate,
        birthPlace: data.birthPlace,
        address: data.address || '',
        postalCode: data.postalCode || '',
        city: data.city || '',
        country: data.country,
        socialSecurityNumber: data.socialSecurityNumber,
        position: data.position,
        department: data.department,
        contractType: data.contractType,
        isExecutive: data.isExecutive,
        startDate: data.startDate,
        endDate: data.endDate,
        trialPeriodEndDate: data.trialPeriodEndDate,
        hourlyRate: data.hourlyRate,
        monthlyHours: data.monthlyHours,
        baseSalary: data.baseSalary,
        bonusAmount: data.bonusAmount,
        bonusDescription: data.bonusDescription,
        iban: data.iban,
        bic: data.bic,
        paidLeaveBalance: data.paidLeaveBalance,
        companyId: data.companyId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        status: data.status
      });
    });
    
    return employees;
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error);
    throw new Error("Impossible de récupérer les employés. Veuillez réessayer.");
  }
}

/**
 * Récupère les détails d'un employé spécifique
 * 
 * @param employeeId - ID de l'employé
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 * @returns Données de l'employé ou null si non trouvé
 */
export async function getEmployeeDetails(employeeId: string, userId?: string): Promise<Employee | null> {
  try {
    // Si userId n'est pas fourni, utiliser l'utilisateur authentifié
    if (!userId) {
      if (!auth.currentUser) {
        throw new Error("Utilisateur non authentifié");
      }
      userId = auth.currentUser.uid;
    }

    const employeeRef = doc(db, `users/${userId}/employees/${employeeId}`);
    const docSnap = await getDoc(employeeRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const firstName = data.firstName || '';
      const lastName = data.lastName || '';
      
      return {
        id: docSnap.id,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        birthDate: data.birthDate,
        birthPlace: data.birthPlace,
        address: data.address || '',
        postalCode: data.postalCode || '',
        city: data.city || '',
        country: data.country,
        socialSecurityNumber: data.socialSecurityNumber,
        position: data.position,
        department: data.department,
        contractType: data.contractType,
        isExecutive: data.isExecutive,
        startDate: data.startDate,
        endDate: data.endDate,
        trialPeriodEndDate: data.trialPeriodEndDate,
        hourlyRate: data.hourlyRate,
        monthlyHours: data.monthlyHours,
        baseSalary: data.baseSalary,
        bonusAmount: data.bonusAmount,
        bonusDescription: data.bonusDescription,
        iban: data.iban,
        bic: data.bic,
        paidLeaveBalance: data.paidLeaveBalance,
        companyId: data.companyId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        status: data.status
      };
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de l'employé:", error);
    throw new Error("Impossible de récupérer les détails de l'employé. Veuillez réessayer.");
  }
}

/**
 * Récupère tous les employés d'une entreprise
 * 
 * @param companyId - ID de l'entreprise
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 * @returns Liste des employés de l'entreprise
 */
export async function getCompanyEmployees(companyId: string, userId?: string): Promise<Employee[]> {
  try {
    // Si userId n'est pas fourni, utiliser l'utilisateur authentifié
    if (!userId) {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
      }
      userId = auth.currentUser.uid;
  }
  
    // Vérifier que l'entreprise existe
    const company = await getCompanyDetails(companyId, userId);
  if (!company) {
    throw new Error("Entreprise non trouvée");
  }
  
    // Récupérer les employés de l'entreprise avec tri par nom puis prénom
    const employeesRef = collection(db, `users/${userId}/employees`);
    const employeesQuery = query(
      employeesRef,
      where('companyId', '==', companyId),
      orderBy('lastName'),
      orderBy('firstName')
    );
    
    const snapshot = await getDocs(employeesQuery);
    const employees: Employee[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const firstName = data.firstName || '';
      const lastName = data.lastName || '';
      
      employees.push({
        id: doc.id,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        address: data.address || '',
        postalCode: data.postalCode || '',
        city: data.city || '',
        country: data.country,
        email: data.email,
        phoneNumber: data.phoneNumber,
        birthDate: data.birthDate,
        birthPlace: data.birthPlace,
        nationality: data.nationality,
        socialSecurityNumber: data.socialSecurityNumber,
        position: data.position,
        department: data.department,
        contractType: data.contractType,
        isExecutive: data.isExecutive,
        startDate: data.startDate,
        endDate: data.endDate,
        trialPeriodEndDate: data.trialPeriodEndDate,
        hourlyRate: data.hourlyRate,
        monthlyHours: data.monthlyHours,
        baseSalary: data.baseSalary,
        bonusAmount: data.bonusAmount,
        bonusDescription: data.bonusDescription,
        iban: data.iban,
        bic: data.bic,
        paidLeaveBalance: data.paidLeaveBalance,
        companyId: data.companyId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        status: data.status
      });
    });
    
    return employees;
  } catch (error) {
    console.error("Erreur lors de la récupération des employés de l'entreprise:", error);
    throw new Error("Impossible de récupérer les employés de l'entreprise. Veuillez réessayer.");
  }
}

/**
 * Crée un nouvel employé
 * 
 * @param employeeData - Données de l'employé à créer
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 * @returns ID de l'employé créé
 */
export async function createEmployee(employeeData: EmployeeInput, userId?: string): Promise<string> {
  try {
    // Si userId n'est pas fourni, utiliser l'utilisateur authentifié
    if (!userId) {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
      }
      userId = auth.currentUser.uid;
  }

    // Préparation des données de l'employé
    const data = {
      ...employeeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active'
    };
    
    // Si un companyId est fourni, vérifier que l'entreprise existe
    if (employeeData.companyId) {
      const company = await getCompanyDetails(employeeData.companyId, userId);
      if (!company) {
        throw new Error("Entreprise non trouvée");
      }
    }
    
    // Créer l'employé dans Firestore
    const employeesRef = collection(db, `users/${userId}/employees`);
    const docRef = await addDoc(employeesRef, data);
    
    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création de l'employé:", error);
    throw new Error("Impossible de créer l'employé. Veuillez vérifier les informations et réessayer.");
  }
}

/**
 * Met à jour un employé existant
 * 
 * @param employeeId - ID de l'employé à mettre à jour
 * @param employeeData - Données à mettre à jour
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 */
export async function updateEmployee(employeeId: string, employeeData: Partial<EmployeeInput>, userId?: string): Promise<void> {
  try {
    // Si userId n'est pas fourni, utiliser l'utilisateur authentifié
    if (!userId) {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
      userId = auth.currentUser.uid;
  }
  
  // Vérifier que l'employé existe
    const existingEmployee = await getEmployeeDetails(employeeId, userId);
    if (!existingEmployee) {
    throw new Error("Employé non trouvé");
  }
  
    // Si le numéro de sécurité sociale est modifié, vérifier qu'il est valide et unique
  if (employeeData.socialSecurityNumber) {
    if (!/^\d{15}$/.test(employeeData.socialSecurityNumber)) {
      throw new Error("Le numéro de sécurité sociale doit comporter exactement 15 chiffres");
    }
    
      // Vérifier que ce numéro n'est pas utilisé par un autre employé
      const employeesRef = collection(db, `users/${userId}/employees`);
      const duplicateQuery = query(
        employeesRef,
        where('socialSecurityNumber', '==', employeeData.socialSecurityNumber),
        where('id', '!=', employeeId)
      );
      
      const snapshot = await getDocs(duplicateQuery);
      if (!snapshot.empty) {
      throw new Error(`Un employé avec le numéro de sécurité sociale ${employeeData.socialSecurityNumber} existe déjà`);
    }
  }
  
    // Préparer les données à mettre à jour
    const data = {
    ...employeeData,
      updatedAt: serverTimestamp()
    };
    
    // Mettre à jour l'employé
    const employeeRef = doc(db, `users/${userId}/employees/${employeeId}`);
    await updateDoc(employeeRef, data);
    
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'employé:", error);
    throw new Error("Impossible de mettre à jour l'employé. Veuillez réessayer.");
  }
}

/**
 * Supprime un employé
 * 
 * @param employeeId - ID de l'employé à supprimer
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 */
export async function deleteEmployee(employeeId: string, userId?: string): Promise<void> {
  try {
    // Si userId n'est pas fourni, utiliser l'utilisateur authentifié
    if (!userId) {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
      }
      userId = auth.currentUser.uid;
    }
    
    // Vérifier que l'employé existe
    const existingEmployee = await getEmployeeDetails(employeeId, userId);
    if (!existingEmployee) {
      throw new Error("Employé non trouvé");
    }
    
    // Supprimer l'employé
    const employeeRef = doc(db, `users/${userId}/employees/${employeeId}`);
    await deleteDoc(employeeRef);
    
  } catch (error) {
    console.error("Erreur lors de la suppression de l'employé:", error);
    throw new Error("Impossible de supprimer l'employé. Veuillez réessayer.");
  }
} 