import { Article11Confidentiality } from '@/components/contract/Article11ConfidentialityStep';
import { firestore } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { cleanObject } from "@/services/utils";

// Nom de l'article dans la base de données
const ARTICLE_NAME = 'article11_confidentiality';

// Chemin pour les articles de contrat
const getArticlesPath = (userId: string, contractId?: string) => 
  contractId 
    ? `users/${userId}/contracts/${contractId}/articles` 
    : `users/${userId}/contracts/config/articles`;

/**
 * Sauvegarde les données de l'article 11 - Confidentialité et propriété intellectuelle
 */
export const saveArticle11Confidentiality = async (
  userId: string,
  confidentialityData: Article11Confidentiality,
  contractId?: string
): Promise<void> => {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), ARTICLE_NAME);
    const article = {
      title: "Confidentialité et propriété intellectuelle",
      content: JSON.stringify(cleanObject(confidentialityData)),
      order: 11
    };
    
    await setDoc(docRef, cleanObject(article));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'article 11:", error);
    throw error;
  }
};

/**
 * Récupère les données de l'article 11 - Confidentialité et propriété intellectuelle
 */
export const getArticle11Confidentiality = async (
  userId: string,
  contractId?: string
): Promise<Article11Confidentiality | null> => {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), ARTICLE_NAME);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const article = docSnap.data();
      return JSON.parse(article.content) as Article11Confidentiality;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article 11:", error);
    return null;
  }
}; 