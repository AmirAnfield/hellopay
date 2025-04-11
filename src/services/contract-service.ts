/**
 * Service de contrat consolidé
 * 
 * Ce service regroupe toutes les fonctionnalités liées aux contrats
 * qui étaient auparavant réparties entre plusieurs fichiers.
 */

import { firestore as db, auth, storage } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { ContractData, ContractFormValues } from '@/types/contract-types';
import { PDFService } from './index';
import { generateTextFromContractData } from './contract-articles-service';

/**
 * Type pour le statut d'un contrat
 */
export type ContractStatus = 'draft' | 'active' | 'expired' | 'terminated';

/**
 * Type pour l'entrée de création/mise à jour d'un contrat
 */
export interface ContractInput {
  title: string;
  employeeId: string;
  companyId: string;
  type: 'CDI' | 'CDD';
  startDate: string;
  endDate?: string;
  status?: ContractStatus;
  formData?: any;
  pdfUrl?: string;
}

/**
 * Récupère tous les contrats d'un utilisateur
 * 
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 * @param status - Filtrer par statut (optionnel)
 * @returns Liste des contrats
 */
export async function getUserContracts(userId?: string, status?: ContractStatus): Promise<ContractData[]> {
  try {
    // Si userId n'est pas fourni, utiliser l'utilisateur authentifié
    if (!userId) {
      if (!auth.currentUser) {
        throw new Error("Utilisateur non authentifié");
      }
      userId = auth.currentUser.uid;
    }

    // Construire la requête
    const contractsRef = collection(db, `users/${userId}/contracts`);
    let queryRef = query(contractsRef, orderBy('createdAt', 'desc'));
    
    // Ajouter un filtre par statut si fourni
    if (status) {
      queryRef = query(queryRef, where('status', '==', status));
    }
    
    const snapshot = await getDocs(queryRef);
    
    const contracts: ContractData[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      contracts.push({
        id: doc.id,
        userId,
        title: data.title || 'Contrat sans titre',
        companyId: data.companyId,
        employeeId: data.employeeId,
        status: data.status || 'draft',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        articles: data.articles || {},
        ...data
      });
    });
    
    return contracts;
  } catch (error) {
    console.error("Erreur lors de la récupération des contrats:", error);
    throw new Error("Impossible de récupérer les contrats. Veuillez réessayer.");
  }
}

/**
 * Récupère un contrat spécifique par son ID
 * 
 * @param contractId - ID du contrat
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 * @returns Données du contrat ou null si non trouvé
 */
export async function getContractById(contractId: string, userId?: string): Promise<ContractData | null> {
  try {
    // Si userId n'est pas fourni, utiliser l'utilisateur authentifié
    if (!userId) {
      if (!auth.currentUser) {
        throw new Error("Utilisateur non authentifié");
      }
      userId = auth.currentUser.uid;
    }

    const contractRef = doc(db, `users/${userId}/contracts/${contractId}`);
    const docSnap = await getDoc(contractRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId,
        title: data.title || 'Contrat sans titre',
        companyId: data.companyId,
        employeeId: data.employeeId,
        status: data.status || 'draft',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        articles: data.articles || {},
        ...data
      };
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération du contrat:", error);
    throw new Error("Impossible de récupérer le contrat. Veuillez réessayer.");
  }
}

/**
 * Récupère l'URL de téléchargement du PDF d'un contrat
 * 
 * @param pdfPath - Chemin du PDF dans Storage
 * @returns URL de téléchargement
 */
export async function getContractPdfUrl(pdfPath: string): Promise<string> {
  try {
    const url = await getDownloadURL(ref(storage, pdfPath));
    return url;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'URL du PDF:", error);
    throw new Error("Impossible de récupérer le PDF du contrat. Veuillez réessayer.");
  }
}

/**
 * Crée un nouveau contrat
 * 
 * @param contractData - Données du contrat à créer
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 * @returns ID du contrat créé
 */
export async function createContract(contractData: ContractInput, userId?: string): Promise<string> {
  try {
    // Si userId n'est pas fourni, utiliser l'utilisateur authentifié
    if (!userId) {
      if (!auth.currentUser) {
        throw new Error("Utilisateur non authentifié");
      }
      userId = auth.currentUser.uid;
    }
    
    // Générer un ID unique pour le contrat
    const contractId = uuidv4();
    
    // Préparer les données du contrat
    const data = {
      ...contractData,
      status: contractData.status || 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Créer le document dans Firestore
    const contractRef = doc(db, `users/${userId}/contracts/${contractId}`);
    await setDoc(contractRef, data);
    
    return contractId;
  } catch (error) {
    console.error("Erreur lors de la création du contrat:", error);
    throw new Error("Impossible de créer le contrat. Veuillez réessayer.");
  }
}

/**
 * Met à jour un contrat existant
 * 
 * @param contractId - ID du contrat à mettre à jour
 * @param contractData - Données à mettre à jour
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 */
export async function updateContract(contractId: string, contractData: Partial<ContractInput>, userId?: string): Promise<void> {
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
      ...contractData,
      updatedAt: serverTimestamp()
    };
    
    // Mettre à jour le document
    const contractRef = doc(db, `users/${userId}/contracts/${contractId}`);
    await updateDoc(contractRef, data);
    
  } catch (error) {
    console.error("Erreur lors de la mise à jour du contrat:", error);
    throw new Error("Impossible de mettre à jour le contrat. Veuillez réessayer.");
  }
}

/**
 * Supprime un contrat et ses ressources associées
 * 
 * @param contractId - ID du contrat à supprimer
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 */
export async function deleteContract(contractId: string, userId?: string): Promise<void> {
  try {
    // Si userId n'est pas fourni, utiliser l'utilisateur authentifié
    if (!userId) {
      if (!auth.currentUser) {
        throw new Error("Utilisateur non authentifié");
      }
      userId = auth.currentUser.uid;
    }
    
    // Récupérer le contrat pour obtenir le chemin du PDF
    const contract = await getContractById(contractId, userId);
    
    // Si le contrat a un PDF associé, le supprimer
    if (contract?.pdfUrl) {
      try {
        const pdfRef = ref(storage, contract.pdfUrl);
        await deleteObject(pdfRef);
      } catch (error) {
        console.warn("Impossible de supprimer le PDF du contrat:", error);
        // Continuer malgré l'erreur
      }
    }
    
    // Supprimer le document Firestore
    const contractRef = doc(db, `users/${userId}/contracts/${contractId}`);
    await deleteDoc(contractRef);
    
  } catch (error) {
    console.error("Erreur lors de la suppression du contrat:", error);
    throw new Error("Impossible de supprimer le contrat. Veuillez réessayer.");
  }
}

/**
 * Génère et sauvegarde un PDF pour un contrat
 * 
 * @param contractId - ID du contrat
 * @param contractElement - Élément HTML du contrat à convertir en PDF
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 * @returns URL du PDF généré
 */
export async function generateAndSaveContractPDF(contractId: string, contractElement: HTMLElement, userId?: string): Promise<string> {
  try {
    // Si userId n'est pas fourni, utiliser l'utilisateur authentifié
    if (!userId) {
      if (!auth.currentUser) {
        throw new Error("Utilisateur non authentifié");
      }
      userId = auth.currentUser.uid;
    }
    
    // Générer le PDF
    const pdf = await PDFService.generateOptimizedPDF(contractElement);
    
    if (!pdf) {
      throw new Error("Échec de la génération du PDF");
    }
    
    // Chemin du PDF dans Storage
    const pdfPath = `users/${userId}/contracts/${contractId}.pdf`;
    const pdfRef = ref(storage, pdfPath);
    
    // Obtenir le PDF au format data URI
    const pdfDataUri = await pdf.output('datauristring') as string;
    
    // Uploader le PDF
    await uploadString(pdfRef, pdfDataUri, 'data_url');
    
    // Mettre à jour le contrat avec l'URL du PDF
    await updateContract(contractId, { pdfUrl: pdfPath }, userId);
    
    return pdfPath;
  } catch (error) {
    console.error("Erreur lors de la génération et de la sauvegarde du PDF:", error);
    throw new Error("Impossible de générer le PDF du contrat. Veuillez réessayer.");
  }
}

/**
 * Sauvegarde les données du formulaire et génère un PDF
 * 
 * @param formData - Données du formulaire de contrat
 * @param contractElement - Élément HTML du contrat à convertir en PDF
 * @param contractId - ID du contrat existant (optionnel, si null un nouveau contrat sera créé)
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 * @returns ID du contrat
 */
export async function saveContractWithPDF(formData: ContractFormValues, contractElement: HTMLElement, contractId?: string, userId?: string): Promise<string> {
  try {
    // Si userId n'est pas fourni, utiliser l'utilisateur authentifié
    if (!userId) {
      if (!auth.currentUser) {
        throw new Error("Utilisateur non authentifié");
      }
      userId = auth.currentUser.uid;
    }
    
    // Préparer les données pour Firestore
    const contractInput: ContractInput = {
      title: `Contrat de travail - ${formData.employee.firstName} ${formData.employee.lastName}`,
      employeeId: formData.employee.id,
      companyId: formData.company.id,
      type: formData.contractDetails.type,
      startDate: formData.contractDetails.startDate,
      endDate: formData.contractDetails.endDate,
      formData: formData
    };
    
    // Créer ou mettre à jour le contrat
    let savedContractId: string;
    
    if (contractId) {
      // Mise à jour d'un contrat existant
      await updateContract(contractId, contractInput, userId);
      savedContractId = contractId;
    } else {
      // Création d'un nouveau contrat
      savedContractId = await createContract(contractInput, userId);
    }
    
    // Générer et sauvegarder le PDF
    try {
      await generateAndSaveContractPDF(savedContractId, contractElement, userId);
    } catch (pdfError) {
      console.error("Erreur lors de la génération du PDF:", pdfError);
      // Continuer malgré l'erreur de génération de PDF
    }
    
    return savedContractId;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du contrat:", error);
    throw new Error("Impossible de sauvegarder le contrat. Veuillez réessayer.");
  }
}

/**
 * Change le statut d'un contrat
 * 
 * @param contractId - ID du contrat
 * @param status - Nouveau statut
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 */
export async function changeContractStatus(contractId: string, status: ContractStatus, userId?: string): Promise<void> {
  try {
    await updateContract(contractId, { status }, userId);
  } catch (error) {
    console.error("Erreur lors du changement de statut du contrat:", error);
    throw new Error(`Impossible de changer le statut du contrat en "${status}". Veuillez réessayer.`);
  }
}

/**
 * Récupère les contrats récents d'un utilisateur
 * 
 * @param count - Nombre de contrats à récupérer
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 * @returns Liste des contrats récents
 */
export async function getRecentContracts(count: number = 5, userId?: string): Promise<ContractData[]> {
  try {
    // Si userId n'est pas fourni, utiliser l'utilisateur authentifié
    if (!userId) {
      if (!auth.currentUser) {
        throw new Error("Utilisateur non authentifié");
      }
      userId = auth.currentUser.uid;
    }

    const contractsRef = collection(db, `users/${userId}/contracts`);
    const queryRef = query(contractsRef, orderBy('createdAt', 'desc'), limit(count));
    
    const snapshot = await getDocs(queryRef);
    
    const contracts: ContractData[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      contracts.push({
        id: doc.id,
        userId,
        title: data.title || 'Contrat sans titre',
        companyId: data.companyId,
        employeeId: data.employeeId,
        status: data.status || 'draft',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        articles: data.articles || {},
        ...data
      });
    });
    
    return contracts;
  } catch (error) {
    console.error("Erreur lors de la récupération des contrats récents:", error);
    throw new Error("Impossible de récupérer les contrats récents. Veuillez réessayer.");
  }
}

/**
 * Duplique un contrat existant
 * 
 * @param contractId - ID du contrat à dupliquer
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 * @returns ID du contrat dupliqué
 */
export async function duplicateContract(contractId: string, userId?: string): Promise<string> {
  try {
    // Récupérer le contrat existant
    const contract = await getContractById(contractId, userId);
    
    if (!contract) {
      throw new Error("Contrat introuvable");
    }
    
    // Préparer les données pour le nouveau contrat
    const contractInput: ContractInput = {
      title: `Copie de ${contract.title}`,
      employeeId: contract.employeeId,
      companyId: contract.companyId,
      type: contract.type as 'CDI' | 'CDD',
      startDate: contract.startDate,
      endDate: contract.endDate,
      formData: contract.formData,
      status: 'draft' // Toujours créer une copie en tant que brouillon
    };
    
    // Créer le nouveau contrat
    const newContractId = await createContract(contractInput, userId);
    
    return newContractId;
  } catch (error) {
    console.error("Erreur lors de la duplication du contrat:", error);
    throw new Error("Impossible de dupliquer le contrat. Veuillez réessayer.");
  }
}

/**
 * Génère le texte du contrat à partir des données
 * 
 * @param contractData - Données du contrat
 * @returns Texte du contrat par article
 */
export function generateContractText(contractData: ContractFormValues) {
  return generateTextFromContractData(contractData);
}

// Exporter toutes les fonctions
export const ContractService = {
  getUserContracts,
  getContractById,
  getContractPdfUrl,
  createContract,
  updateContract,
  deleteContract,
  generateAndSaveContractPDF,
  saveContractWithPDF,
  changeContractStatus,
  getRecentContracts,
  duplicateContract,
  generateContractText
}; 