import { auth, db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, serverTimestamp, addDoc } from 'firebase/firestore';
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
  country: string;
  activityCode?: string;
  urssafNumber?: string;
  legalForm?: string;
  vatNumber?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  legalRepresentative?: string;
  legalRepresentativeRole?: string;
  createdAt: any;
  updatedAt: any;
  ownerId: string;
}

// Type pour la création/mise à jour d'une entreprise
export interface CompanyInput {
  name: string;
  siret: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  activityCode?: string;
  urssafNumber?: string;
  legalForm?: string;
  phoneNumber?: string;
  email?: string;
  ownerId?: string;
}

/**
 * Récupérer toutes les entreprises de l'utilisateur courant
 */
export async function getCompanies(): Promise<Company[]> {
  try {
    if (!auth.currentUser) {
      throw new Error("Utilisateur non authentifié");
    }

    const userId = auth.currentUser.uid;
    const companiesRef = collection(db, `users/${userId}/companies`);
    const querySnapshot = await getDocs(companiesRef);
    
    const companies: Company[] = [];
    querySnapshot.forEach((doc) => {
      companies.push({ id: doc.id, ...doc.data() } as Company);
    });
    
    return companies;
  } catch (error) {
    console.error("Erreur lors de la récupération des entreprises:", error);
    throw new Error("Impossible de récupérer vos entreprises. Veuillez réessayer.");
  }
}

/**
 * Récupérer une entreprise par son ID
 */
export async function getCompany(companyId: string): Promise<Company | null> {
  try {
    if (!auth.currentUser) {
      throw new Error("Utilisateur non authentifié");
    }

    const userId = auth.currentUser.uid;
    const companyDoc = doc(db, `users/${userId}/companies/${companyId}`);
    const companySnapshot = await getDoc(companyDoc);
    
    if (companySnapshot.exists()) {
      return { id: companySnapshot.id, ...companySnapshot.data() } as Company;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'entreprise:", error);
    throw new Error("Impossible de récupérer l'entreprise. Veuillez réessayer.");
  }
}

/**
 * Créer une nouvelle entreprise
 */
export async function createCompany(companyData: Partial<Company>): Promise<string> {
  try {
    if (!auth.currentUser) {
      throw new Error("Utilisateur non authentifié");
    }

    const userId = auth.currentUser.uid;
    
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
 * Mettre à jour une entreprise existante
 */
export async function updateCompany(companyId: string, companyData: Partial<Company>): Promise<void> {
  try {
    if (!auth.currentUser) {
      throw new Error("Utilisateur non authentifié");
    }

    const userId = auth.currentUser.uid;
    
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
 * Supprimer une entreprise
 */
export async function deleteCompany(companyId: string): Promise<void> {
  try {
    if (!auth.currentUser) {
      throw new Error("Utilisateur non authentifié");
    }

    const userId = auth.currentUser.uid;
    
    // Supprimer le document
    const companyDoc = doc(db, `users/${userId}/companies/${companyId}`);
    await deleteDoc(companyDoc);
    
    console.log("Entreprise supprimée avec succès:", companyId);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'entreprise:", error);
    throw new Error("Impossible de supprimer l'entreprise. Veuillez réessayer.");
  }
} 