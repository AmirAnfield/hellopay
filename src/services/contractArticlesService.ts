import { firestore } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { cleanObject } from "@/services/utils";

// Types pour les articles du contrat
export interface ContractArticle {
  title: string;
  content: string;
  order: number;
}

export interface Article1Function {
  title: string;
  description: string;
  responsibilities: string[];
}

export interface Article1Nature {
  // Pour CDD
  startDate?: string;
  endDate?: string;
  durationMonths?: number;
  reason?: string;
}

export interface Article2Schedule {
  workDays: string[];
  dailySchedule: string;
  variableSchedule?: boolean;
  scheduleDetails?: string;
}

export interface Article2EntryDate {
  startDate: Date | string;
  startMonth: number;
  startYear: number;
  includeTrialPeriodReference: boolean;
  trialPeriodArticleNumber?: string;
}

export interface Article2CDDEntry {
  includeTrialPeriod: boolean;
  trialPeriodDuration: string;
  trialPeriodDurationValue: string;
  trialPeriodDurationUnit: string;
}

export interface Article3Functions {
  jobTitle: string;
  classificationLevel?: string;
  classificationCoefficient?: string;
  collectiveAgreement?: string;
  supervisor: string;
  missions: string[];
  canEvolve: boolean;
  includeGenericMission: boolean;
}

export interface Article3WorkingHoursSchedule {
  workDays: string[];
  variableSchedule: boolean;
  scheduleDetails: string;
  dailySchedules: {
    day: string;
    morning: { start: string; end: string };
    afternoon: { start: string; end: string };
    totalHours: number;
  }[];
  totalWeeklyHours: number;
  breakDuration: number; // en minutes
  includeBreakClause: boolean;
}

export interface Article4Workplace {
  address: string;
  addressLine2?: string;
  zipCode?: string;
  city?: string;
  useCompanyAddress: boolean;
  includeMobilityClause: boolean;
  mobilityRadius?: number;
  mobilityDetails?: string;
}

export interface Article5WorkingSchedule {
  weeklyHours: number;
  useCollectiveSchedule: boolean;
  scheduleType: 'fixed' | 'variable';
  dailySchedules?: {
    day: string;
    startTime: string;
    endTime: string;
    breakDuration?: number;
  }[];
  scheduleDetails?: string;
  includeRestDetails: boolean;
}

export interface AdditionalClauses {
  selectedClauses: string[];
}

// Chemin pour les articles de contrat
const getArticlesPath = (userId: string, contractId?: string) => 
  contractId 
    ? `users/${userId}/contracts/${contractId}/articles` 
    : `users/${userId}/contracts/config/articles`;

/**
 * Enregistre l'article 1 - Fonction
 */
export async function saveArticle1Function(
  userId: string, 
  functionData: Article1Function,
  contractId?: string
): Promise<void> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'article1');
    const article: ContractArticle = {
      title: "Fonction",
      content: JSON.stringify(cleanObject(functionData)),
      order: 1
    };
    
    await setDoc(docRef, cleanObject(article));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'article 1:", error);
    throw error;
  }
}

/**
 * Récupère l'article 1 - Fonction
 */
export async function getArticle1Function(
  userId: string, 
  contractId?: string
): Promise<Article1Function | null> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'article1');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const article = docSnap.data() as ContractArticle;
      return JSON.parse(article.content) as Article1Function;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article 1:", error);
    return null;
  }
}

/**
 * Enregistre l'article 2 - Durée du travail et horaires
 */
export async function saveArticle2Schedule(
  userId: string, 
  scheduleData: Article2Schedule,
  contractId?: string
): Promise<void> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'article2');
    const article: ContractArticle = {
      title: "Durée du travail et horaires",
      content: JSON.stringify(cleanObject(scheduleData)),
      order: 2
    };
    
    await setDoc(docRef, cleanObject(article));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'article 2:", error);
    throw error;
  }
}

/**
 * Récupère l'article 2 - Durée du travail et horaires
 */
export async function getArticle2Schedule(
  userId: string, 
  contractId?: string
): Promise<Article2Schedule | null> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'article2');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const article = docSnap.data() as ContractArticle;
      return JSON.parse(article.content) as Article2Schedule;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article 2:", error);
    return null;
  }
}

/**
 * Enregistre l'article 1 - Nature du contrat
 */
export async function saveArticle1Nature(
  userId: string, 
  natureData: Article1Nature,
  contractId?: string
): Promise<void> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'article1_nature');
    const article: ContractArticle = {
      title: "Nature du contrat",
      content: JSON.stringify(cleanObject(natureData)),
      order: 1
    };
    
    await setDoc(docRef, cleanObject(article));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'article 1 (Nature):", error);
    throw error;
  }
}

/**
 * Récupère l'article 1 - Nature du contrat
 */
export async function getArticle1Nature(
  userId: string, 
  contractId?: string
): Promise<Article1Nature | null> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'article1_nature');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const article = docSnap.data() as ContractArticle;
      return JSON.parse(article.content) as Article1Nature;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article 1 (Nature):", error);
    return null;
  }
}

/**
 * Enregistre l'article 2 - Date d'entrée en fonction (pour CDI)
 */
export async function saveArticle2EntryDate(
  userId: string, 
  entryDateData: Article2EntryDate,
  contractId?: string
): Promise<void> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'article2_entry_date');
    const article: ContractArticle = {
      title: "Date d'entrée en fonction",
      content: JSON.stringify(cleanObject(entryDateData)),
      order: 2
    };
    
    await setDoc(docRef, cleanObject(article));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'article 2 (Date d'entrée):", error);
    throw error;
  }
}

/**
 * Récupère l'article 2 - Date d'entrée en fonction (pour CDI)
 */
export async function getArticle2EntryDate(
  userId: string, 
  contractId?: string
): Promise<Article2EntryDate | null> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'article2_entry_date');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const article = docSnap.data() as ContractArticle;
      const data = JSON.parse(article.content) as Article2EntryDate;
      
      // Convertir la date string en objet Date si nécessaire
      if (typeof data.startDate === 'string') {
        data.startDate = new Date(data.startDate);
      }
      
      return data;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article 2 (Date d'entrée):", error);
    return null;
  }
}

/**
 * Enregistre l'article 2 - Entrée en fonction et période d'essai (pour CDD)
 */
export async function saveArticle2CDDEntry(
  userId: string, 
  entryData: Article2CDDEntry,
  contractId?: string
): Promise<void> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'article2_cdd_entry');
    const article: ContractArticle = {
      title: "Entrée en fonction et période d'essai",
      content: JSON.stringify(cleanObject(entryData)),
      order: 2
    };
    
    await setDoc(docRef, cleanObject(article));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'article 2 (Entrée CDD):", error);
    throw error;
  }
}

/**
 * Récupère l'article 2 - Entrée en fonction et période d'essai (pour CDD)
 */
export async function getArticle2CDDEntry(
  userId: string, 
  contractId?: string
): Promise<Article2CDDEntry | null> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'article2_cdd_entry');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const article = docSnap.data() as ContractArticle;
      return JSON.parse(article.content) as Article2CDDEntry;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article 2 (Entrée CDD):", error);
    return null;
  }
}

/**
 * Enregistre l'article 3 - Fonctions
 */
export async function saveArticle3Functions(
  userId: string, 
  functionsData: Article3Functions,
  contractId?: string
): Promise<void> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'article3_functions');
    const article: ContractArticle = {
      title: "Fonctions",
      content: JSON.stringify(cleanObject(functionsData)),
      order: 3
    };
    
    await setDoc(docRef, cleanObject(article));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'article 3 (Fonctions):", error);
    throw error;
  }
}

/**
 * Récupère l'article 3 - Fonctions
 */
export async function getArticle3Functions(
  userId: string, 
  contractId?: string
): Promise<Article3Functions | null> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'article3_functions');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const article = docSnap.data() as ContractArticle;
      return JSON.parse(article.content) as Article3Functions;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article 3 (Fonctions):", error);
    return null;
  }
}

/**
 * Enregistre l'article 3 - Durée du travail et horaires
 */
export async function saveArticle3WorkingHours(
  userId: string, 
  workingHoursData: Article3WorkingHoursSchedule,
  contractId?: string
): Promise<void> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'article3_working_hours');
    const article: ContractArticle = {
      title: "Durée du travail et horaires",
      content: JSON.stringify(cleanObject(workingHoursData)),
      order: 3
    };
    
    await setDoc(docRef, cleanObject(article));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'article 3 (Horaires):", error);
    throw error;
  }
}

/**
 * Récupère l'article 3 - Durée du travail et horaires
 */
export async function getArticle3WorkingHours(
  userId: string, 
  contractId?: string
): Promise<Article3WorkingHoursSchedule | null> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'article3_working_hours');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const article = docSnap.data() as ContractArticle;
      return JSON.parse(article.content) as Article3WorkingHoursSchedule;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article 3 (Horaires):", error);
    return null;
  }
}

/**
 * Enregistre les clauses supplémentaires du contrat
 */
export async function saveAdditionalClauses(
  userId: string, 
  clausesData: AdditionalClauses,
  contractId?: string
): Promise<void> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'additional_clauses');
    const article: ContractArticle = {
      title: "Clauses supplémentaires",
      content: JSON.stringify(cleanObject(clausesData)),
      order: 15
    };
    
    await setDoc(docRef, cleanObject(article));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des clauses supplémentaires:", error);
    throw error;
  }
}

/**
 * Récupère les clauses supplémentaires du contrat
 */
export async function getAdditionalClauses(
  userId: string, 
  contractId?: string
): Promise<AdditionalClauses | null> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'additional_clauses');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const article = docSnap.data() as ContractArticle;
      return JSON.parse(article.content) as AdditionalClauses;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération des clauses supplémentaires:", error);
    return null;
  }
}

/**
 * Enregistre l'article 4 - Lieu de travail
 */
export async function saveArticle4Workplace(
  userId: string, 
  workplaceData: Article4Workplace,
  contractId?: string
): Promise<void> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'article4_workplace');
    const article: ContractArticle = {
      title: "Lieu de travail",
      content: JSON.stringify(cleanObject(workplaceData)),
      order: 4
    };
    
    await setDoc(docRef, cleanObject(article));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'article 4 (Lieu de travail):", error);
    throw error;
  }
}

/**
 * Récupère l'article 4 - Lieu de travail
 */
export async function getArticle4Workplace(
  userId: string, 
  contractId?: string
): Promise<Article4Workplace | null> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'article4_workplace');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const article = docSnap.data() as ContractArticle;
      return JSON.parse(article.content) as Article4Workplace;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article 4 (Lieu de travail):", error);
    return null;
  }
}

/**
 * Enregistre l'article 5 - Durée et organisation du travail
 */
export async function saveArticle5WorkingSchedule(
  userId: string, 
  scheduleData: Article5WorkingSchedule,
  contractId?: string
): Promise<void> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'article5_working_schedule');
    const article: ContractArticle = {
      title: "Durée et organisation du travail",
      content: JSON.stringify(cleanObject(scheduleData)),
      order: 5
    };
    
    await setDoc(docRef, cleanObject(article));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'article 5 (Durée et organisation du travail):", error);
    throw error;
  }
}

/**
 * Récupère l'article 5 - Durée et organisation du travail
 */
export async function getArticle5WorkingSchedule(
  userId: string, 
  contractId?: string
): Promise<Article5WorkingSchedule | null> {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), 'article5_working_schedule');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const article = docSnap.data() as ContractArticle;
      return JSON.parse(article.content) as Article5WorkingSchedule;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article 5 (Durée et organisation du travail):", error);
    return null;
  }
}

// Plus de fonctions à ajouter pour les articles suivants... 