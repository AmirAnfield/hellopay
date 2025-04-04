import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { firestore } from './config';

/**
 * Crée ou met à jour un document dans Firestore
 * @param collectionPath Chemin de la collection
 * @param docId ID du document (optionnel, généré automatiquement si non fourni)
 * @param data Données à sauvegarder
 */
export async function setDocument(
  collectionPath: string,
  data: any,
  docId?: string
) {
  try {
    const timestamp = new Date();
    const dataWithTimestamps = {
      ...data,
      updatedAt: timestamp,
      createdAt: data.createdAt || timestamp,
    };

    if (docId) {
      const docRef = doc(firestore, collectionPath, docId);
      await setDoc(docRef, dataWithTimestamps, { merge: true });
      return { id: docId, ...dataWithTimestamps };
    } else {
      const collectionRef = collection(firestore, collectionPath);
      const newDocRef = doc(collectionRef);
      await setDoc(newDocRef, dataWithTimestamps);
      return { id: newDocRef.id, ...dataWithTimestamps };
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du document:', error);
    throw error;
  }
}

/**
 * Récupère un document depuis Firestore
 * @param collectionPath Chemin de la collection
 * @param docId ID du document
 */
export async function getDocument(collectionPath: string, docId: string) {
  try {
    const docRef = doc(firestore, collectionPath, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    throw error;
  }
}

/**
 * Met à jour un document dans Firestore
 * @param collectionPath Chemin de la collection
 * @param docId ID du document
 * @param data Données à mettre à jour
 */
export async function updateDocument(
  collectionPath: string,
  docId: string,
  data: any
) {
  try {
    const docRef = doc(firestore, collectionPath, docId);
    const updatedData = {
      ...data,
      updatedAt: new Date(),
    };
    await updateDoc(docRef, updatedData);
    return { id: docId, ...updatedData };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du document:', error);
    throw error;
  }
}

/**
 * Supprime un document dans Firestore
 * @param collectionPath Chemin de la collection
 * @param docId ID du document
 */
export async function deleteDocument(collectionPath: string, docId: string) {
  try {
    const docRef = doc(firestore, collectionPath, docId);
    await deleteDoc(docRef);
    return { success: true, id: docId };
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    throw error;
  }
}

/**
 * Récupère tous les documents d'une collection
 * @param collectionPath Chemin de la collection
 * @param queryOptions Options de requête (where, orderBy, limit)
 */
export async function getCollection(
  collectionPath: string,
  queryOptions: {
    whereConditions?: { field: string; operator: string; value: any }[];
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    limitCount?: number;
  } = {}
) {
  try {
    const { whereConditions, orderByField, orderDirection, limitCount } = queryOptions;
    
    let q = collection(firestore, collectionPath);
    let queryConstraints: any[] = [];

    // Ajouter les conditions where
    if (whereConditions && whereConditions.length > 0) {
      whereConditions.forEach((condition) => {
        queryConstraints.push(where(condition.field, condition.operator as any, condition.value));
      });
    }

    // Ajouter l'ordre
    if (orderByField) {
      queryConstraints.push(orderBy(orderByField, orderDirection || 'asc'));
    }

    // Ajouter la limite
    if (limitCount) {
      queryConstraints.push(limit(limitCount));
    }

    // Exécuter la requête
    const querySnapshot = await getDocs(query(q, ...queryConstraints));
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération de la collection:', error);
    throw error;
  }
}

/**
 * Convertit les timestamps Firestore en dates JavaScript
 * @param data Les données contenant des timestamps à convertir
 */
export function convertTimestamps(data: DocumentData): any {
  if (!data) return data;
  
  const result: any = {};
  
  Object.keys(data).forEach((key) => {
    const value = data[key];
    
    // Si c'est un Timestamp, le convertir en Date
    if (value && typeof value.toDate === 'function') {
      result[key] = value.toDate();
    } 
    // Si c'est un objet, récursivement convertir ses timestamps
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = convertTimestamps(value);
    } 
    // Si c'est un tableau, vérifier chaque élément
    else if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (item && typeof item === 'object') {
          return convertTimestamps(item);
        }
        return item;
      });
    } 
    // Sinon, garder la valeur telle quelle
    else {
      result[key] = value;
    }
  });
  
  return result;
} 