import { firestore } from "@/lib/firebase/config";
import { doc, setDoc, updateDoc, getDoc, Timestamp } from "firebase/firestore";
import { cleanObject } from "./utils";
import {
  Article1Nature,
  Article2EntryDate,
  Article2CDDEntry,
  Article3Functions,
  Article4Workplace,
  Article5WorkingSchedule,
  Article6Remuneration,
  Article7Benefits,
  Article8Leaves,
  Article9DataProtection,
  Article10Conduct,
  Article11Confidentiality,
  Article12NonCompete,
  Article13Teleworking,
  Article14Termination
} from "@/types/contract-articles";

// Chemins de base pour les collections d'articles
const getArticleCollectionPath = (userId: string) => `users/${userId}/contractArticles`;

/**
 * Fonction générique pour sauvegarder un article 
 */
async function saveArticle<T>(userId: string, articleId: string, data: T): Promise<T> {
  try {
    // Nettoyer l'objet avant sauvegarde
    const cleanedData = cleanObject(data);
    
    const collectionPath = getArticleCollectionPath(userId);
    const docRef = doc(firestore, `${collectionPath}/${articleId}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Mise à jour d'un article existant
      await updateDoc(docRef, {
        ...cleanedData,
        updatedAt: Timestamp.now()
      });
    } else {
      // Création d'un nouvel article
      await setDoc(docRef, {
        ...cleanedData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
    
    return data;
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde de l'article ${articleId}:`, error);
    throw error;
  }
}

/**
 * Validation générique des données
 */
function validateData<T>(data: T, requiredFields: (keyof T)[]): boolean {
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      return false;
    }
  }
  return true;
}

// Services spécifiques pour chaque article

/**
 * Sauvegarde de l'Article 1 - Nature du contrat
 */
export async function saveArticle1Nature(userId: string, data: Article1Nature): Promise<Article1Nature> {
  // Validation
  const requiredFields: (keyof Article1Nature)[] = ['contractType'];
  if (!validateData(data, requiredFields)) {
    throw new Error("Le type de contrat est obligatoire");
  }
  
  // Si CDD, vérifier les champs supplémentaires
  if (data.contractType === 'CDD') {
    if (!data.endDate || !data.reason) {
      throw new Error("Pour un CDD, la date de fin et le motif sont obligatoires");
    }
  }
  
  return await saveArticle(userId, 'article1', data);
}

/**
 * Sauvegarde de l'Article 2 - Entrée en fonction (CDI)
 */
export async function saveArticle2EntryDate(userId: string, data: Article2EntryDate): Promise<Article2EntryDate> {
  // Validation
  const requiredFields: (keyof Article2EntryDate)[] = ['entryDate'];
  if (!validateData(data, requiredFields)) {
    throw new Error("La date d'entrée en fonction est obligatoire");
  }
  
  return await saveArticle(userId, 'article2', data);
}

/**
 * Sauvegarde de l'Article 2 - Entrée en fonction (CDD)
 */
export async function saveArticle2CDDEntry(userId: string, data: Article2CDDEntry): Promise<Article2CDDEntry> {
  // Validation
  const requiredFields: (keyof Article2CDDEntry)[] = ['entryDate'];
  if (!validateData(data, requiredFields)) {
    throw new Error("La date d'entrée en fonction est obligatoire");
  }
  
  return await saveArticle(userId, 'article2', data);
}

/**
 * Sauvegarde de l'Article 3 - Fonctions
 */
export async function saveArticle3Functions(userId: string, data: Article3Functions): Promise<Article3Functions> {
  // Validation
  const requiredFields: (keyof Article3Functions)[] = ['position', 'duties'];
  if (!validateData(data, requiredFields)) {
    throw new Error("Le poste et les missions sont obligatoires");
  }
  
  return await saveArticle(userId, 'article3', data);
}

/**
 * Sauvegarde de l'Article 4 - Lieu de travail
 */
export async function saveArticle4Workplace(userId: string, data: Article4Workplace): Promise<Article4Workplace> {
  // Validation
  const requiredFields: (keyof Article4Workplace)[] = ['mainLocation'];
  if (!validateData(data, requiredFields)) {
    throw new Error("Le lieu de travail principal est obligatoire");
  }
  
  return await saveArticle(userId, 'article4', data);
}

/**
 * Sauvegarde de l'Article 5 - Organisation du travail
 */
export async function saveArticle5WorkingSchedule(userId: string, data: Article5WorkingSchedule): Promise<Article5WorkingSchedule> {
  // Validation
  const requiredFields: (keyof Article5WorkingSchedule)[] = ['workingHours', 'isPartTime'];
  if (!validateData(data, requiredFields)) {
    throw new Error("Les heures de travail sont obligatoires");
  }
  
  return await saveArticle(userId, 'article5', data);
}

/**
 * Sauvegarde de l'Article 6 - Rémunération
 */
export async function saveArticle6Remuneration(userId: string, data: Article6Remuneration): Promise<Article6Remuneration> {
  // Validation
  const requiredFields: (keyof Article6Remuneration)[] = ['grossMonthlySalary'];
  if (!validateData(data, requiredFields)) {
    throw new Error("Le salaire mensuel brut est obligatoire");
  }
  
  return await saveArticle(userId, 'article6', data);
}

/**
 * Sauvegarde de l'Article 7 - Avantages
 */
export async function saveArticle7Benefits(userId: string, data: Article7Benefits): Promise<Article7Benefits> {
  return await saveArticle(userId, 'article7', data);
}

/**
 * Sauvegarde de l'Article 8 - Congés
 */
export async function saveArticle8Leaves(userId: string, data: Article8Leaves): Promise<Article8Leaves> {
  return await saveArticle(userId, 'article8', data);
}

/**
 * Sauvegarde de l'Article 9 - Données personnelles
 */
export async function saveArticle9DataProtection(userId: string, data: Article9DataProtection): Promise<Article9DataProtection> {
  return await saveArticle(userId, 'article9', data);
}

/**
 * Sauvegarde de l'Article 10 - Tenue et règles
 */
export async function saveArticle10Conduct(userId: string, data: Article10Conduct): Promise<Article10Conduct> {
  return await saveArticle(userId, 'article10', data);
}

/**
 * Sauvegarde de l'Article 11 - Confidentialité
 */
export async function saveArticle11Confidentiality(userId: string, data: Article11Confidentiality): Promise<Article11Confidentiality> {
  return await saveArticle(userId, 'article11', data);
}

/**
 * Sauvegarde de l'Article 12 - Non-concurrence
 */
export async function saveArticle12NonCompete(userId: string, data: Article12NonCompete): Promise<Article12NonCompete> {
  // Validation pour CDI uniquement
  if (data.hasNonCompeteClause) {
    const requiredFields: (keyof Article12NonCompete)[] = ['nonCompeteDuration', 'nonCompeteCompensation'];
    if (!validateData(data, requiredFields)) {
      throw new Error("La durée et la compensation de non-concurrence sont obligatoires");
    }
  }
  
  return await saveArticle(userId, 'article12', data);
}

/**
 * Sauvegarde de l'Article 13 - Télétravail
 */
export async function saveArticle13Teleworking(userId: string, data: Article13Teleworking): Promise<Article13Teleworking> {
  if (data.hasTeleworking) {
    const requiredFields: (keyof Article13Teleworking)[] = ['teleworkingDaysPerWeek'];
    if (!validateData(data, requiredFields)) {
      throw new Error("Le nombre de jours de télétravail est obligatoire");
    }
  }
  
  return await saveArticle(userId, 'article13', data);
}

/**
 * Sauvegarde de l'Article 14 - Rupture du contrat
 */
export async function saveArticle14Termination(userId: string, data: Article14Termination): Promise<Article14Termination> {
  return await saveArticle(userId, 'article14', data);
} 