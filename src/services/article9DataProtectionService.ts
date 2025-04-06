import { Article9DataProtection } from '@/components/contract/Article9DataProtectionStep';
import { firestore } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { cleanObject } from "@/services/utils";

// Nom de l'article dans la base de données
const ARTICLE_NAME = 'article9_dataprotection';

// Chemin pour les articles de contrat
const getArticlesPath = (userId: string, contractId?: string) => 
  contractId 
    ? `users/${userId}/contracts/${contractId}/articles` 
    : `users/${userId}/contracts/config/articles`;

/**
 * Sauvegarde les données de l'article 9 - Protection des données personnelles
 */
export const saveArticle9DataProtection = async (
  userId: string,
  dataProtectionData: Article9DataProtection,
  contractId?: string
): Promise<void> => {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), ARTICLE_NAME);
    const article = {
      title: "Données personnelles et droit à l'image",
      content: JSON.stringify(cleanObject(dataProtectionData)),
      order: 9
    };
    
    await setDoc(docRef, cleanObject(article));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'article 9:", error);
    throw error;
  }
};

/**
 * Récupère les données de l'article 9 - Protection des données personnelles
 */
export const getArticle9DataProtection = async (
  userId: string,
  contractId?: string
): Promise<Article9DataProtection | null> => {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), ARTICLE_NAME);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const article = docSnap.data();
      return JSON.parse(article.content) as Article9DataProtection;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article 9:", error);
    return null;
  }
}; 