import { Article13Teleworking } from '@/components/contract/Article13TeleworkingStep';
import { firestore } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { cleanObject } from "@/services/utils";

// Nom de l'article dans la base de données
const ARTICLE_NAME = 'article13_teleworking';

// Chemin pour les articles de contrat
const getArticlesPath = (userId: string, contractId?: string) => 
  contractId 
    ? `users/${userId}/contracts/${contractId}/articles` 
    : `users/${userId}/contracts/config/articles`;

/**
 * Sauvegarde les données de l'article 13 - Télétravail
 */
export const saveArticle13Teleworking = async (
  userId: string,
  teleworkingData: Article13Teleworking,
  contractId?: string
): Promise<void> => {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), ARTICLE_NAME);
    const article = {
      title: "Télétravail",
      content: JSON.stringify(cleanObject(teleworkingData)),
      order: 13
    };
    
    await setDoc(docRef, cleanObject(article));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'article 13:", error);
    throw error;
  }
};

/**
 * Récupère les données de l'article 13 - Télétravail
 */
export const getArticle13Teleworking = async (
  userId: string,
  contractId?: string
): Promise<Article13Teleworking | null> => {
  try {
    const docRef = doc(firestore, getArticlesPath(userId, contractId), ARTICLE_NAME);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const article = docSnap.data();
      return JSON.parse(article.content) as Article13Teleworking;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article 13:", error);
    return null;
  }
}; 