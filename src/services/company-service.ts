/**
 * Service unifié pour la gestion des entreprises
 * 
 * Ce service regroupe toutes les fonctionnalités liées aux entreprises
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
  serverTimestamp 
} from 'firebase/firestore';
import { companyValidationSchema } from '@/schemas/validation-schemas';
import { validateOrThrow, sanitizeData } from '@/lib/utils/firestore-validation';

// Type pour les entreprises
export interface Company {
  id: string;
  name: string;
  siret: string;
  address: string;
  postalCode: string;
  city: string;
  country?: string;
  activityCode?: string;
  urssafNumber?: string;
  legalForm?: string;
  vatNumber?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  legalRepresentative?: string;
  legalRepresentativeRole?: string;
  createdAt?: any;
  updatedAt?: any;
  ownerId?: string;
}

// Type pour la création/mise à jour d'une entreprise
export interface CompanyInput {
  name: string;
  siret: string;
  address: string;
  city: string;
  postalCode: string;
  country?: string;
  activityCode?: string;
  urssafNumber?: string;
  legalForm?: string;
  phoneNumber?: string;
  email?: string;
  ownerId?: string;
}

/**
 * Récupère la liste des entreprises d'un utilisateur
 * 
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 * @returns Liste des entreprises
 */
export async function getUserCompanies(userId?: string): Promise<Company[]> {
  try {
    // Si userId n'est pas fourni, utiliser l'utilisateur authentifié
    if (!userId) {
      if (!auth.currentUser) {
        throw new Error("Utilisateur non authentifié");
      }
      userId = auth.currentUser.uid;
    }

    const companiesRef = collection(db, `users/${userId}/companies`);
    const snapshot = await getDocs(companiesRef);
    
    const companies: Company[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      companies.push({
        id: doc.id,
        name: data.name || '',
        siret: data.siret || '',
        address: data.address || '',
        postalCode: data.postalCode || '',
        city: data.city || '',
        country: data.country,
        activityCode: data.activityCode,
        urssafNumber: data.urssafNumber,
        legalForm: data.legalForm,
        vatNumber: data.vatNumber,
        phoneNumber: data.phoneNumber,
        email: data.email,
        website: data.website,
        legalRepresentative: data.legalRepresentative,
        legalRepresentativeRole: data.legalRepresentativeRole,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        ownerId: data.ownerId || userId
      });
    });
    
    return companies;
  } catch (error) {
    console.error("Erreur lors de la récupération des entreprises:", error);
    throw new Error("Impossible de récupérer les entreprises. Veuillez réessayer.");
  }
}

/**
 * Récupère les détails d'une entreprise spécifique
 * 
 * @param companyId - ID de l'entreprise
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 * @returns Données de l'entreprise ou null si non trouvée
 */
export async function getCompanyDetails(companyId: string, userId?: string): Promise<Company | null> {
  try {
    // Si userId n'est pas fourni, utiliser l'utilisateur authentifié
    if (!userId) {
      if (!auth.currentUser) {
        throw new Error("Utilisateur non authentifié");
      }
      userId = auth.currentUser.uid;
    }

    const companyRef = doc(db, `users/${userId}/companies/${companyId}`);
    const docSnap = await getDoc(companyRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || '',
        siret: data.siret || '',
        address: data.address || '',
        postalCode: data.postalCode || '',
        city: data.city || '',
        country: data.country,
        activityCode: data.activityCode,
        urssafNumber: data.urssafNumber,
        legalForm: data.legalForm,
        vatNumber: data.vatNumber,
        phoneNumber: data.phoneNumber,
        email: data.email,
        website: data.website,
        legalRepresentative: data.legalRepresentative,
        legalRepresentativeRole: data.legalRepresentativeRole,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        ownerId: data.ownerId || userId
      };
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de l'entreprise:", error);
    throw new Error("Impossible de récupérer les détails de l'entreprise. Veuillez réessayer.");
  }
}

/**
 * Crée une nouvelle entreprise
 * 
 * @param companyData - Données de l'entreprise à créer
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 * @returns ID de l'entreprise créée
 */
export async function createCompany(companyData: CompanyInput, userId?: string): Promise<string> {
  try {
    // Si userId n'est pas fourni, utiliser l'utilisateur authentifié
    if (!userId) {
      if (!auth.currentUser) {
        throw new Error("Utilisateur non authentifié");
      }
      userId = auth.currentUser.uid;
    }
    
    // Préparer les données de l'entreprise
    const data = {
      ...companyData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ownerId: userId
    };
    
    // Créer un document dans la collection des entreprises de l'utilisateur
    const companiesRef = collection(db, `users/${userId}/companies`);
    const docRef = await addDoc(companiesRef, data);
    
    console.log("Entreprise créée avec succès:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création de l'entreprise:", error);
    throw new Error("Impossible de créer l'entreprise. Veuillez vérifier les informations et réessayer.");
  }
}

/**
 * Met à jour une entreprise existante
 * 
 * @param companyId - ID de l'entreprise à mettre à jour
 * @param companyData - Données à mettre à jour
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 */
export async function updateCompany(companyId: string, companyData: Partial<CompanyInput>, userId?: string): Promise<void> {
  try {
    // Si userId n'est pas fourni, utiliser l'utilisateur authentifié
    if (!userId) {
      if (!auth.currentUser) {
        throw new Error("Utilisateur non authentifié");
      }
      userId = auth.currentUser.uid;
    }
    
    // Préparer les données à mettre à jour
    const data = {
      ...companyData,
      updatedAt: serverTimestamp()
    };
    
    // Mettre à jour le document
    const companyDoc = doc(db, `users/${userId}/companies/${companyId}`);
    await updateDoc(companyDoc, data);
    
    console.log("Entreprise mise à jour avec succès:", companyId);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'entreprise:", error);
    throw new Error("Impossible de mettre à jour l'entreprise. Veuillez réessayer.");
  }
}

/**
 * Supprime une entreprise
 * 
 * @param companyId - ID de l'entreprise à supprimer
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 */
export async function deleteCompany(companyId: string, userId?: string): Promise<void> {
  try {
    // Si userId n'est pas fourni, utiliser l'utilisateur authentifié
    if (!userId) {
      if (!auth.currentUser) {
        throw new Error("Utilisateur non authentifié");
      }
      userId = auth.currentUser.uid;
    }
    
    // Supprimer le document
    const companyDoc = doc(db, `users/${userId}/companies/${companyId}`);
    await deleteDoc(companyDoc);
    
    console.log("Entreprise supprimée avec succès:", companyId);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'entreprise:", error);
    throw new Error("Impossible de supprimer l'entreprise. Veuillez réessayer.");
  }
} 