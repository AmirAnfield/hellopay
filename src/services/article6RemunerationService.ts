import { Article6Remuneration } from '@/components/contract/Article6RemunerationStep';
import { firestore } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { cleanObject } from "@/services/utils";

// Nom de l'article dans la base de données
const ARTICLE_NAME = 'article6_remuneration';

// Chemin pour les articles de contrat
const getArticlesPath = (userId: string, contractId?: string) => 
  contractId 
    ? `users/${userId}/contracts/${contractId}/articles` 
    : `users/${userId}/contracts/config/articles`;

/**
 * Sauvegarde les données de l'article 6 - Rémunération
 */
export const saveArticle6Remuneration = async (
  userId: string,
  remunerationData: Article6Remuneration,
  contractId?: string
): Promise<void> => {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), ARTICLE_NAME);
    const article = {
      title: "Rémunération",
      content: JSON.stringify(cleanObject(remunerationData)),
      order: 6
    };
    
    await setDoc(docRef, cleanObject(article));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'article 6:", error);
    throw error;
  }
};

/**
 * Récupère les données de l'article 6 - Rémunération
 */
export const getArticle6Remuneration = async (
  userId: string,
  contractId?: string
): Promise<Article6Remuneration | null> => {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), ARTICLE_NAME);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const article = docSnap.data();
      return JSON.parse(article.content) as Article6Remuneration;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article 6:", error);
    return null;
  }
}; 