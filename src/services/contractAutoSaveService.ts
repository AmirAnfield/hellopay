import { firestore } from "@/lib/firebase/config";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  getDocs, 
  deleteDoc,
  Timestamp,
  updateDoc,
  where,
  orderBy,
  limit
} from "firebase/firestore";

interface SavedState {
  id: string;
  name: string;
  timestamp: Timestamp;
  progress: number;
  data: {
    contractConfig: any;
    articles: Record<string, any>;
  };
}

/**
 * Service de gestion des sauvegardes automatiques du contrat
 */
export const contractAutoSaveService = {
  /**
   * Sauvegarde automatique de l'état actuel du contrat
   */
  async autoSave(userId: string, contractConfig: any, articles: Record<string, any>): Promise<string> {
    try {
      const timestamp = Timestamp.now();
      const saveId = `autosave-${timestamp.toMillis()}`;
      const savePath = `users/${userId}/contract-saves`;
      const saveRef = doc(firestore, savePath, saveId);
      
      const saveData = {
        id: saveId,
        name: `Sauvegarde automatique du ${timestamp.toDate().toLocaleString()}`,
        timestamp,
        progress: contractConfig.progress || 0,
        data: {
          contractConfig,
          articles
        },
        isAuto: true
      };
      
      await setDoc(saveRef, saveData);
      
      // Limiter le nombre de sauvegardes automatiques (garder les 5 plus récentes)
      await this.cleanupAutoSaves(userId);
      
      return saveId;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde automatique:", error);
      throw error;
    }
  },
  
  /**
   * Sauvegarde manuelle avec nom personnalisé
   */
  async saveState(userId: string, name: string, contractConfig: any, articles: Record<string, any>): Promise<string> {
    try {
      const timestamp = Timestamp.now();
      const saveId = `save-${timestamp.toMillis()}`;
      const savePath = `users/${userId}/contract-saves`;
      const saveRef = doc(firestore, savePath, saveId);
      
      const saveData = {
        id: saveId,
        name: name || `Sauvegarde du ${timestamp.toDate().toLocaleString()}`,
        timestamp,
        progress: contractConfig.progress || 0,
        data: {
          contractConfig,
          articles
        },
        isAuto: false
      };
      
      await setDoc(saveRef, saveData);
      
      return saveId;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      throw error;
    }
  },
  
  /**
   * Récupérer toutes les sauvegardes d'un utilisateur
   */
  async getSavedStates(userId: string): Promise<SavedState[]> {
    try {
      const savePath = `users/${userId}/contract-saves`;
      const savesRef = collection(firestore, savePath);
      const savesQuery = query(savesRef, orderBy("timestamp", "desc"));
      const snapshot = await getDocs(savesQuery);
      
      const savedStates: SavedState[] = [];
      snapshot.forEach(doc => {
        savedStates.push(doc.data() as SavedState);
      });
      
      return savedStates;
    } catch (error) {
      console.error("Erreur lors de la récupération des sauvegardes:", error);
      return [];
    }
  },
  
  /**
   * Charger une sauvegarde spécifique
   */
  async loadSavedState(userId: string, saveId: string): Promise<{ contractConfig: any; articles: Record<string, any> } | null> {
    try {
      const savePath = `users/${userId}/contract-saves`;
      const saveRef = doc(firestore, savePath, saveId);
      const saveDoc = await getDoc(saveRef);
      
      if (!saveDoc.exists()) {
        return null;
      }
      
      const saveData = saveDoc.data() as SavedState;
      return saveData.data;
    } catch (error) {
      console.error("Erreur lors du chargement de la sauvegarde:", error);
      return null;
    }
  },
  
  /**
   * Supprimer une sauvegarde
   */
  async deleteSavedState(userId: string, saveId: string): Promise<boolean> {
    try {
      const savePath = `users/${userId}/contract-saves`;
      const saveRef = doc(firestore, savePath, saveId);
      await deleteDoc(saveRef);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression de la sauvegarde:", error);
      return false;
    }
  },
  
  /**
   * Nettoyer les sauvegardes automatiques anciennes (garder uniquement les 5 plus récentes)
   */
  async cleanupAutoSaves(userId: string): Promise<void> {
    try {
      const savePath = `users/${userId}/contract-saves`;
      const savesRef = collection(firestore, savePath);
      const autoSavesQuery = query(
        savesRef, 
        where("isAuto", "==", true),
        orderBy("timestamp", "desc")
      );
      
      const snapshot = await getDocs(autoSavesQuery);
      
      // Garder les 5 plus récentes, supprimer les autres
      const autoSaves: { id: string; timestamp: Timestamp }[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        autoSaves.push({ 
          id: doc.id, 
          timestamp: data.timestamp 
        });
      });
      
      // Supprimer les sauvegardes automatiques les plus anciennes (au-delà des 5 premières)
      const savesToDelete = autoSaves.slice(5);
      for (const save of savesToDelete) {
        await this.deleteSavedState(userId, save.id);
      }
    } catch (error) {
      console.error("Erreur lors du nettoyage des sauvegardes automatiques:", error);
    }
  },
  
  /**
   * Synchroniser les articles du contrat
   * Cette fonction garantit que tous les articles sont correctement sauvegardés
   */
  async synchronizeArticles(userId: string, articles: Record<string, any>): Promise<boolean> {
    try {
      // Chemin pour les articles du contrat
      const articlesPath = `users/${userId}/contracts/config/articles`;
      
      // Pour chaque article, créer ou mettre à jour dans Firestore
      for (const [articleKey, articleData] of Object.entries(articles)) {
        if (!articleData) continue; // Ignorer les articles sans données
        
        const articleRef = doc(firestore, articlesPath, articleKey);
        await setDoc(articleRef, articleData, { merge: true });
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la synchronisation des articles:", error);
      return false;
    }
  }
}; 