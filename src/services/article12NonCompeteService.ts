import { Article12NonCompete } from '@/components/contract/Article12NonCompeteStep';
import { firestore } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { cleanObject } from "@/services/utils";

// Nom de l'article dans la base de données
const ARTICLE_NAME = 'article12_noncompete';

// Chemin pour les articles de contrat
const getArticlesPath = (userId: string, contractId?: string) => 
  contractId 
    ? `users/${userId}/contracts/${contractId}/articles` 
    : `users/${userId}/contracts/config/articles`;

/**
 * Sauvegarde les données de l'article 12 - Non-concurrence et non-sollicitation
 */
export const saveArticle12NonCompete = async (
  userId: string,
  nonCompeteData: Article12NonCompete,
  contractId?: string
): Promise<void> => {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), ARTICLE_NAME);
    const article = {
      title: "Non-concurrence et non-sollicitation",
      content: JSON.stringify(cleanObject(nonCompeteData)),
      order: 12
    };
    
    await setDoc(docRef, cleanObject(article));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'article 12:", error);
    throw error;
  }
};

/**
 * Récupère les données de l'article 12 - Non-concurrence et non-sollicitation
 */
export const getArticle12NonCompete = async (
  userId: string,
  contractId?: string
): Promise<Article12NonCompete | null> => {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), ARTICLE_NAME);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const article = docSnap.data();
      return JSON.parse(article.content) as Article12NonCompete;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article 12:", error);
    return null;
  }
}; 