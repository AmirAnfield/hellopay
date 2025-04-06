import { Article14Termination } from '@/components/contract/Article14TerminationStep';
import { firestore } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { cleanObject } from "@/services/utils";

// Nom de l'article dans la base de données
const ARTICLE_NAME = 'article14_termination';

// Chemin pour les articles de contrat
const getArticlesPath = (userId: string, contractId?: string) => 
  contractId 
    ? `users/${userId}/contracts/${contractId}/articles` 
    : `users/${userId}/contracts/config/articles`;

/**
 * Sauvegarde les données de l'article 14 - Rupture du contrat et préavis
 */
export const saveArticle14Termination = async (
  userId: string,
  terminationData: Article14Termination,
  contractId?: string
): Promise<void> => {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), ARTICLE_NAME);
    const article = {
      title: "Rupture du contrat et préavis",
      content: JSON.stringify(cleanObject(terminationData)),
      order: 14
    };
    
    await setDoc(docRef, cleanObject(article));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'article 14:", error);
    throw error;
  }
};

/**
 * Récupère les données de l'article 14 - Rupture du contrat et préavis
 */
export const getArticle14Termination = async (
  userId: string,
  contractId?: string
): Promise<Article14Termination | null> => {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), ARTICLE_NAME);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const article = docSnap.data();
      return JSON.parse(article.content) as Article14Termination;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article 14:", error);
    return null;
  }
}; 