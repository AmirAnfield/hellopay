import { firestore } from "@/lib/firebase/config";
import { doc, getDoc, collection, query, getDocs, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { ContractConfig } from '@/types/contract';
import { v4 as uuidv4 } from 'uuid';

// Chemin pour les contrats finalisés
const getContractsPath = (userId: string) => `users/${userId}/contracts`;

// Chemin pour les articles de contrat (configuration)
const getArticlesPath = (userId: string, contractId?: string) => 
  contractId 
    ? `users/${userId}/contracts/${contractId}/articles` 
    : `users/${userId}/contracts/config/articles`;

/**
 * Finalise un contrat en créant une version finalisée à partir de la configuration
 */
export const finalizeContract = async (userId: string): Promise<string> => {
  try {
    // 1. Récupérer la configuration actuelle
    const configDocRef = doc(firestore, `users/${userId}/contracts/config`);
    const configDoc = await getDoc(configDocRef);
    
    if (!configDoc.exists()) {
      throw new Error("La configuration du contrat n'existe pas");
    }
    
    const configData = configDoc.data() as ContractConfig;
    
    // 2. Récupérer tous les articles de la configuration
    const articlesRef = collection(firestore, getArticlesPath(userId));
    const articlesQuery = query(articlesRef);
    const articlesSnapshot = await getDocs(articlesQuery);
    
    const articles: Record<string, any> = {};
    articlesSnapshot.forEach((doc) => {
      articles[doc.id] = {
        ...doc.data(),
        content: typeof doc.data().content === 'string' ? JSON.parse(doc.data().content) : doc.data().content
      };
    });
    
    // 3. Créer un nouveau contrat finalisé
    const contractId = uuidv4();
    const contractRef = doc(firestore, getContractsPath(userId), contractId);
    
    // Date actuelle
    const now = new Date();
    
    // Créer le document principal du contrat
    await setDoc(contractRef, {
      ...configData,
      id: contractId,
      status: 'validated',
      completedAt: Timestamp.fromDate(now),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
    
    // 4. Copier tous les articles dans le nouveau contrat
    for (const [articleId, articleData] of Object.entries(articles)) {
      const articleRef = doc(firestore, getArticlesPath(userId, contractId), articleId);
      await setDoc(articleRef, articleData);
    }
    
    // 5. Mettre à jour la configuration pour indiquer qu'elle a été finalisée
    await updateDoc(configDocRef, {
      status: 'completed',
      completedAt: Timestamp.fromDate(now),
      finalContractId: contractId,
      updatedAt: Timestamp.fromDate(now),
    });
    
    return contractId;
  } catch (error) {
    console.error("Erreur lors de la finalisation du contrat:", error);
    throw error;
  }
};

/**
 * Récupère tous les articles d'un contrat
 */
export const getContractArticles = async (userId: string, contractId?: string): Promise<Record<string, any>> => {
  try {
    const articlesRef = collection(firestore, getArticlesPath(userId, contractId));
    const articlesQuery = query(articlesRef);
    const articlesSnapshot = await getDocs(articlesQuery);
    
    const articles: Record<string, any> = {};
    articlesSnapshot.forEach((doc) => {
      // Extraire le contenu JSON des articles si présent
      const data = doc.data();
      if (data.content && typeof data.content === 'string') {
        try {
          articles[doc.id] = {
            ...data,
            content: JSON.parse(data.content)
          };
        } catch (e) {
          articles[doc.id] = data;
        }
      } else {
        articles[doc.id] = data;
      }
    });
    
    return articles;
  } catch (error) {
    console.error("Erreur lors de la récupération des articles:", error);
    return {};
  }
};

/**
 * Génère et télécharge le contrat au format PDF
 */
export const downloadContractPDF = async (userId: string, contractId: string): Promise<boolean> => {
  try {
    // Cette fonction devrait faire appel à une API pour générer un PDF
    // Pour l'instant, c'est un placeholder
    
    // Simuler un téléchargement réussi
    return true;
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    return false;
  }
}; 