import { Article10Conduct } from '@/components/contract/Article10ConductStep';
import { firestore } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { cleanObject } from "@/services/utils";

// Nom de l'article dans la base de données
const ARTICLE_NAME = 'article10_conduct';

// Chemin pour les articles de contrat
const getArticlesPath = (userId: string, contractId?: string) => 
  contractId 
    ? `users/${userId}/contracts/${contractId}/articles` 
    : `users/${userId}/contracts/config/articles`;

/**
 * Sauvegarde les données de l'article 10 - Engagement professionnel et tenue
 */
export const saveArticle10Conduct = async (
  userId: string,
  conductData: Article10Conduct,
  contractId?: string
): Promise<void> => {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), ARTICLE_NAME);
    const article = {
      title: "Tenue et règles internes",
      content: JSON.stringify(cleanObject(conductData)),
      order: 10
    };
    
    await setDoc(docRef, cleanObject(article));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'article 10:", error);
    throw error;
  }
};

/**
 * Récupère les données de l'article 10 - Engagement professionnel et tenue
 */
export const getArticle10Conduct = async (
  userId: string,
  contractId?: string
): Promise<Article10Conduct | null> => {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), ARTICLE_NAME);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const article = docSnap.data();
      return JSON.parse(article.content) as Article10Conduct;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article 10:", error);
    return null;
  }
}; 