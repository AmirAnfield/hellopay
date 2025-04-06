import { firestore } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { ContractConfig } from "@/types/contract";
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

// Chemin de base pour la collection de contrats
const getContractPath = (userId: string) => `users/${userId}/contracts`;
const getArticleCollectionPath = (userId: string) => `users/${userId}/contractArticles`;

/**
 * Interface pour stocker les données complètes du contrat
 */
export interface ContractData {
  config: ContractConfig;
  article1?: Article1Nature;
  article2?: Article2EntryDate | Article2CDDEntry;
  article3?: Article3Functions;
  article4?: Article4Workplace;
  article5?: Article5WorkingSchedule;
  article6?: Article6Remuneration;
  article7?: Article7Benefits;
  article8?: Article8Leaves;
  article9?: Article9DataProtection;
  article10?: Article10Conduct;
  article11?: Article11Confidentiality;
  article12?: Article12NonCompete;
  article13?: Article13Teleworking;
  article14?: Article14Termination;
}

/**
 * Charge la configuration du contrat
 */
export async function loadContractConfig(userId: string): Promise<ContractConfig | null> {
  try {
    const docRef = doc(firestore, `${getContractPath(userId)}/config`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as ContractConfig;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors du chargement de la configuration:", error);
    return null;
  }
}

/**
 * Charge un article spécifique du contrat
 */
export async function loadArticle<T>(userId: string, articleId: string): Promise<T | null> {
  try {
    const docRef = doc(firestore, `${getArticleCollectionPath(userId)}/${articleId}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as T;
    }
    
    return null;
  } catch (error) {
    console.error(`Erreur lors du chargement de l'article ${articleId}:`, error);
    return null;
  }
}

/**
 * Charge toutes les données du contrat
 */
export async function loadFullContract(userId: string): Promise<ContractData | null> {
  try {
    // Charger la configuration
    const config = await loadContractConfig(userId);
    if (!config) {
      return null;
    }
    
    // Préparer l'objet pour stocker les données
    const contractData: ContractData = { config };
    
    // Charger les articles
    const article1 = await loadArticle<Article1Nature>(userId, 'article1');
    if (article1) contractData.article1 = article1;
    
    const article2 = await loadArticle<Article2EntryDate>(userId, 'article2');
    if (article2) contractData.article2 = article2;
    
    const article3 = await loadArticle<Article3Functions>(userId, 'article3');
    if (article3) contractData.article3 = article3;
    
    const article4 = await loadArticle<Article4Workplace>(userId, 'article4');
    if (article4) contractData.article4 = article4;
    
    const article5 = await loadArticle<Article5WorkingSchedule>(userId, 'article5');
    if (article5) contractData.article5 = article5;
    
    const article6 = await loadArticle<Article6Remuneration>(userId, 'article6');
    if (article6) contractData.article6 = article6;
    
    const article7 = await loadArticle<Article7Benefits>(userId, 'article7');
    if (article7) contractData.article7 = article7;
    
    const article8 = await loadArticle<Article8Leaves>(userId, 'article8');
    if (article8) contractData.article8 = article8;
    
    const article9 = await loadArticle<Article9DataProtection>(userId, 'article9');
    if (article9) contractData.article9 = article9;
    
    const article10 = await loadArticle<Article10Conduct>(userId, 'article10');
    if (article10) contractData.article10 = article10;
    
    const article11 = await loadArticle<Article11Confidentiality>(userId, 'article11');
    if (article11) contractData.article11 = article11;
    
    const article12 = await loadArticle<Article12NonCompete>(userId, 'article12');
    if (article12) contractData.article12 = article12;
    
    const article13 = await loadArticle<Article13Teleworking>(userId, 'article13');
    if (article13) contractData.article13 = article13;
    
    const article14 = await loadArticle<Article14Termination>(userId, 'article14');
    if (article14) contractData.article14 = article14;
    
    return contractData;
  } catch (error) {
    console.error("Erreur lors du chargement du contrat complet:", error);
    return null;
  }
}

/**
 * Vérifier la cohérence des données du contrat
 */
export function validateContractData(contractData: ContractData): boolean {
  const { config } = contractData;
  
  // Vérifier les informations de base
  if (!config.contractType || !config.company || !config.employee) {
    return false;
  }
  
  // Vérifier les articles obligatoires
  if (!contractData.article1 || !contractData.article2 || !contractData.article3 ||
      !contractData.article4 || !contractData.article5 || !contractData.article6 ||
      !contractData.article8) {
    return false;
  }
  
  // Vérifications spécifiques au type de contrat
  if (config.contractType === 'CDD') {
    const article1 = contractData.article1;
    if (!article1.endDate || !article1.reason) {
      return false;
    }
  }
  
  return true;
} 