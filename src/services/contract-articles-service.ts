/**
 * Service unifié pour la gestion des articles de contrat
 * 
 * Ce service regroupe toutes les fonctionnalités liées aux articles de contrat
 * qui étaient auparavant réparties dans plusieurs fichiers.
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc
} from 'firebase/firestore';
import { firestore as db } from '@/lib/firebase/config';
import { 
  Article1Data, 
  Article2Data, 
  Article3Data, 
  Article4Data, 
  Article5Data,
  Article6Data,
  Article7Data,
  Article8Data,
  Article9Data,
  Article10Data,
  Article11Data,
  Article12Data,
  Article13Data,
  Article14Data,
  CDDData
} from '@/types/contract-types';

// Chemins Firestore communs
const getArticlePath = (userId: string, contractId: string, articleNumber: number) => 
  `users/${userId}/contracts/${contractId}/articles/article${articleNumber}`;

// ============== Article 1: Nature du contrat ==============

export const saveArticle1Nature = async (
  userId: string, 
  contractId: string, 
  data: Article1Data
): Promise<void> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 1));
    await setDoc(articleRef, data, { merge: true });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'article 1:', error);
    throw new Error('Impossible de sauvegarder les données de l\'article 1');
  }
};

export const getArticle1Nature = async (
  userId: string, 
  contractId: string
): Promise<Article1Data | null> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 1));
    const articleSnap = await getDoc(articleRef);
    
    if (articleSnap.exists()) {
      return articleSnap.data() as Article1Data;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article 1:', error);
    throw new Error('Impossible de récupérer les données de l\'article 1');
  }
};

// ============== Article 2: Date d'entrée en fonction ==============

export const saveArticle2EntryDate = async (
  userId: string, 
  contractId: string, 
  data: Article2Data
): Promise<void> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 2));
    await setDoc(articleRef, data, { merge: true });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'article 2:', error);
    throw new Error('Impossible de sauvegarder les données de l\'article 2');
  }
};

export const getArticle2EntryDate = async (
  userId: string, 
  contractId: string
): Promise<Article2Data | null> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 2));
    const articleSnap = await getDoc(articleRef);
    
    if (articleSnap.exists()) {
      return articleSnap.data() as Article2Data;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article 2:', error);
    throw new Error('Impossible de récupérer les données de l\'article 2');
  }
};

export const saveArticle2CDDEntry = async (
  userId: string, 
  contractId: string, 
  data: CDDData
): Promise<void> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 2));
    await updateDoc(articleRef, { cdd: data });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données CDD:', error);
    throw new Error('Impossible de sauvegarder les données CDD');
  }
};

export const getArticle2CDDEntry = async (
  userId: string, 
  contractId: string
): Promise<CDDData | null> => {
  try {
    const article2Data = await getArticle2EntryDate(userId, contractId);
    return article2Data?.cdd || null;
  } catch (error) {
    console.error('Erreur lors de la récupération des données CDD:', error);
    throw new Error('Impossible de récupérer les données CDD');
  }
};

// ============== Article 3: Fonctions ==============

export const saveArticle3Functions = async (
  userId: string, 
  contractId: string, 
  data: Article3Data
): Promise<void> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 3));
    await setDoc(articleRef, data, { merge: true });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'article 3:', error);
    throw new Error('Impossible de sauvegarder les données de l\'article 3');
  }
};

export const getArticle3Functions = async (
  userId: string, 
  contractId: string
): Promise<Article3Data | null> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 3));
    const articleSnap = await getDoc(articleRef);
    
    if (articleSnap.exists()) {
      return articleSnap.data() as Article3Data;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article 3:', error);
    throw new Error('Impossible de récupérer les données de l\'article 3');
  }
};

// ============== Article 4: Lieu de travail ==============

export const saveArticle4Workplace = async (
  userId: string, 
  contractId: string, 
  data: Article4Data
): Promise<void> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 4));
    await setDoc(articleRef, data, { merge: true });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'article 4:', error);
    throw new Error('Impossible de sauvegarder les données de l\'article 4');
  }
};

export const getArticle4Workplace = async (
  userId: string, 
  contractId: string
): Promise<Article4Data | null> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 4));
    const articleSnap = await getDoc(articleRef);
    
    if (articleSnap.exists()) {
      return articleSnap.data() as Article4Data;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article 4:', error);
    throw new Error('Impossible de récupérer les données de l\'article 4');
  }
};

// ============== Article 5: Durée et organisation du travail ==============

export const saveArticle5WorkingSchedule = async (
  userId: string, 
  contractId: string, 
  data: Article5Data
): Promise<void> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 5));
    await setDoc(articleRef, data, { merge: true });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'article 5:', error);
    throw new Error('Impossible de sauvegarder les données de l\'article 5');
  }
};

export const getArticle5WorkingSchedule = async (
  userId: string, 
  contractId: string
): Promise<Article5Data | null> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 5));
    const articleSnap = await getDoc(articleRef);
    
    if (articleSnap.exists()) {
      return articleSnap.data() as Article5Data;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article 5:', error);
    throw new Error('Impossible de récupérer les données de l\'article 5');
  }
};

// ============== Article 6: Rémunération ==============

export const saveArticle6Remuneration = async (
  userId: string, 
  contractId: string, 
  data: Article6Data
): Promise<void> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 6));
    await setDoc(articleRef, data, { merge: true });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'article 6:', error);
    throw new Error('Impossible de sauvegarder les données de l\'article 6');
  }
};

export const getArticle6Remuneration = async (
  userId: string, 
  contractId: string
): Promise<Article6Data | null> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 6));
    const articleSnap = await getDoc(articleRef);
    
    if (articleSnap.exists()) {
      return articleSnap.data() as Article6Data;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article 6:', error);
    throw new Error('Impossible de récupérer les données de l\'article 6');
  }
};

// ============== Implémentation des articles 7 à 14 ==============

// Article 7: Avantages
export const saveArticle7Benefits = async (
  userId: string, 
  contractId: string, 
  data: Article7Data
): Promise<void> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 7));
    await setDoc(articleRef, data, { merge: true });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'article 7:', error);
    throw new Error('Impossible de sauvegarder les données de l\'article 7');
  }
};

export const getArticle7Benefits = async (
  userId: string, 
  contractId: string
): Promise<Article7Data | null> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 7));
    const articleSnap = await getDoc(articleRef);
    
    if (articleSnap.exists()) {
      return articleSnap.data() as Article7Data;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article 7:', error);
    throw new Error('Impossible de récupérer les données de l\'article 7');
  }
};

// Article 8: Congés et absences
export const saveArticle8Leaves = async (
  userId: string, 
  contractId: string, 
  data: Article8Data
): Promise<void> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 8));
    await setDoc(articleRef, data, { merge: true });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'article 8:', error);
    throw new Error('Impossible de sauvegarder les données de l\'article 8');
  }
};

export const getArticle8Leaves = async (
  userId: string, 
  contractId: string
): Promise<Article8Data | null> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 8));
    const articleSnap = await getDoc(articleRef);
    
    if (articleSnap.exists()) {
      return articleSnap.data() as Article8Data;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article 8:', error);
    throw new Error('Impossible de récupérer les données de l\'article 8');
  }
};

// Article 9: Données personnelles et droit à l'image
export const saveArticle9DataProtection = async (
  userId: string, 
  contractId: string, 
  data: Article9Data
): Promise<void> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 9));
    await setDoc(articleRef, data, { merge: true });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'article 9:', error);
    throw new Error('Impossible de sauvegarder les données de l\'article 9');
  }
};

export const getArticle9DataProtection = async (
  userId: string, 
  contractId: string
): Promise<Article9Data | null> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 9));
    const articleSnap = await getDoc(articleRef);
    
    if (articleSnap.exists()) {
      return articleSnap.data() as Article9Data;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article 9:', error);
    throw new Error('Impossible de récupérer les données de l\'article 9');
  }
};

// Article 10: Tenue et règles internes
export const saveArticle10Conduct = async (
  userId: string, 
  contractId: string, 
  data: Article10Data
): Promise<void> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 10));
    await setDoc(articleRef, data, { merge: true });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'article 10:', error);
    throw new Error('Impossible de sauvegarder les données de l\'article 10');
  }
};

export const getArticle10Conduct = async (
  userId: string, 
  contractId: string
): Promise<Article10Data | null> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 10));
    const articleSnap = await getDoc(articleRef);
    
    if (articleSnap.exists()) {
      return articleSnap.data() as Article10Data;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article 10:', error);
    throw new Error('Impossible de récupérer les données de l\'article 10');
  }
};

// Article 11: Confidentialité et propriété intellectuelle
export const saveArticle11Confidentiality = async (
  userId: string, 
  contractId: string, 
  data: Article11Data
): Promise<void> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 11));
    await setDoc(articleRef, data, { merge: true });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'article 11:', error);
    throw new Error('Impossible de sauvegarder les données de l\'article 11');
  }
};

export const getArticle11Confidentiality = async (
  userId: string, 
  contractId: string
): Promise<Article11Data | null> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 11));
    const articleSnap = await getDoc(articleRef);
    
    if (articleSnap.exists()) {
      return articleSnap.data() as Article11Data;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article 11:', error);
    throw new Error('Impossible de récupérer les données de l\'article 11');
  }
};

// Article 12: Non-concurrence (CDI uniquement)
export const saveArticle12NonCompete = async (
  userId: string, 
  contractId: string, 
  data: Article12Data
): Promise<void> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 12));
    await setDoc(articleRef, data, { merge: true });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'article 12:', error);
    throw new Error('Impossible de sauvegarder les données de l\'article 12');
  }
};

export const getArticle12NonCompete = async (
  userId: string, 
  contractId: string
): Promise<Article12Data | null> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 12));
    const articleSnap = await getDoc(articleRef);
    
    if (articleSnap.exists()) {
      return articleSnap.data() as Article12Data;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article 12:', error);
    throw new Error('Impossible de récupérer les données de l\'article 12');
  }
};

// Article 13: Télétravail
export const saveArticle13Teleworking = async (
  userId: string, 
  contractId: string, 
  data: Article13Data
): Promise<void> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 13));
    await setDoc(articleRef, data, { merge: true });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'article 13:', error);
    throw new Error('Impossible de sauvegarder les données de l\'article 13');
  }
};

export const getArticle13Teleworking = async (
  userId: string, 
  contractId: string
): Promise<Article13Data | null> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 13));
    const articleSnap = await getDoc(articleRef);
    
    if (articleSnap.exists()) {
      return articleSnap.data() as Article13Data;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article 13:', error);
    throw new Error('Impossible de récupérer les données de l\'article 13');
  }
};

// Article 14: Rupture du contrat et préavis
export const saveArticle14Termination = async (
  userId: string, 
  contractId: string, 
  data: Article14Data
): Promise<void> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 14));
    await setDoc(articleRef, data, { merge: true });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'article 14:', error);
    throw new Error('Impossible de sauvegarder les données de l\'article 14');
  }
};

export const getArticle14Termination = async (
  userId: string, 
  contractId: string
): Promise<Article14Data | null> => {
  try {
    const articleRef = doc(db, getArticlePath(userId, contractId, 14));
    const articleSnap = await getDoc(articleRef);
    
    if (articleSnap.exists()) {
      return articleSnap.data() as Article14Data;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article 14:', error);
    throw new Error('Impossible de récupérer les données de l\'article 14');
  }
};

// Fonction utilitaire pour récupérer tous les articles d'un contrat
export const getAllContractArticles = async (
  userId: string,
  contractId: string
): Promise<Record<string, any>> => {
  try {
    const articlesData: Record<string, any> = {};
    
    // Récupération de chaque article
    const article1 = await getArticle1Nature(userId, contractId);
    const article2 = await getArticle2EntryDate(userId, contractId);
    const article3 = await getArticle3Functions(userId, contractId);
    const article4 = await getArticle4Workplace(userId, contractId);
    const article5 = await getArticle5WorkingSchedule(userId, contractId);
    const article6 = await getArticle6Remuneration(userId, contractId);
    const article7 = await getArticle7Benefits(userId, contractId);
    const article8 = await getArticle8Leaves(userId, contractId);
    const article9 = await getArticle9DataProtection(userId, contractId);
    const article10 = await getArticle10Conduct(userId, contractId);
    const article11 = await getArticle11Confidentiality(userId, contractId);
    const article12 = await getArticle12NonCompete(userId, contractId);
    const article13 = await getArticle13Teleworking(userId, contractId);
    const article14 = await getArticle14Termination(userId, contractId);
    
    // Ajout des articles non nuls au résultat
    if (article1) articlesData.article1 = article1;
    if (article2) articlesData.article2 = article2;
    if (article3) articlesData.article3 = article3;
    if (article4) articlesData.article4 = article4;
    if (article5) articlesData.article5 = article5;
    if (article6) articlesData.article6 = article6;
    if (article7) articlesData.article7 = article7;
    if (article8) articlesData.article8 = article8;
    if (article9) articlesData.article9 = article9;
    if (article10) articlesData.article10 = article10;
    if (article11) articlesData.article11 = article11;
    if (article12) articlesData.article12 = article12;
    if (article13) articlesData.article13 = article13;
    if (article14) articlesData.article14 = article14;
    
    return articlesData;
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les articles:', error);
    throw new Error('Impossible de récupérer tous les articles du contrat');
  }
}; 