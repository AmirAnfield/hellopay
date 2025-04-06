import { Article8Leaves } from '@/components/contract/Article8LeavesStep';
import { firestore } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { cleanObject } from "@/services/utils";

// Nom de l'article dans la base de données
const ARTICLE_NAME = 'article8_leaves';

// Chemin pour les articles de contrat
const getArticlesPath = (userId: string, contractId?: string) => 
  contractId 
    ? `users/${userId}/contracts/${contractId}/articles` 
    : `users/${userId}/contracts/config/articles`;

/**
 * Sauvegarde les données de l'article 8 - Congés et absences
 */
export const saveArticle8Leaves = async (
  userId: string,
  leavesData: Article8Leaves,
  contractId?: string
): Promise<void> => {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), ARTICLE_NAME);
    const article = {
      title: "Congés et absences",
      content: JSON.stringify(cleanObject(leavesData)),
      order: 8
    };
    
    await setDoc(docRef, cleanObject(article));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'article 8:", error);
    throw error;
  }
};

/**
 * Récupère les données de l'article 8 - Congés et absences
 */
export const getArticle8Leaves = async (
  userId: string,
  contractId?: string
): Promise<Article8Leaves | null> => {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), ARTICLE_NAME);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const article = docSnap.data();
      return JSON.parse(article.content) as Article8Leaves;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article 8:", error);
    return null;
  }
}; 