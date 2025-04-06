import { Article7Benefits } from '@/components/contract/Article7BenefitsStep';
import { firestore } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { cleanObject } from "@/services/utils";

// Nom de l'article dans la base de données
const ARTICLE_NAME = 'article7_benefits';

// Chemin pour les articles de contrat
const getArticlesPath = (userId: string, contractId?: string) => 
  contractId 
    ? `users/${userId}/contracts/${contractId}/articles` 
    : `users/${userId}/contracts/config/articles`;

/**
 * Sauvegarde les données de l'article 7 - Avantages et frais professionnels
 */
export const saveArticle7Benefits = async (
  userId: string,
  benefitsData: Article7Benefits,
  contractId?: string
): Promise<void> => {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), ARTICLE_NAME);
    const article = {
      title: "Avantages et frais professionnels",
      content: JSON.stringify(cleanObject(benefitsData)),
      order: 7
    };
    
    await setDoc(docRef, cleanObject(article));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'article 7:", error);
    throw error;
  }
};

/**
 * Récupère les données de l'article 7 - Avantages et frais professionnels
 */
export const getArticle7Benefits = async (
  userId: string,
  contractId?: string
): Promise<Article7Benefits | null> => {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), ARTICLE_NAME);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const article = docSnap.data();
      return JSON.parse(article.content) as Article7Benefits;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article 7:", error);
    return null;
  }
}; 