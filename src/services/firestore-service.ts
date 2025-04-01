import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  DocumentSnapshot,
  QuerySnapshot,
  DocumentReference,
  DocumentData,
  WithFieldValue,
  Timestamp,
  onSnapshot,
  CollectionReference
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

/**
 * Interface pour les options de requête
 */
export interface QueryOptions {
  where?: { field: string; operator: string; value: any }[];
  orderBy?: { field: string; direction?: 'asc' | 'desc' }[];
  limit?: number;
}

/**
 * Récupérer un document par son ID
 */
export async function getDocument<T = DocumentData>(
  collectionPath: string,
  docId: string
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionPath, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération du document ${collectionPath}/${docId}:`, error);
    throw error;
  }
}

/**
 * Récupérer plusieurs documents avec filtrage optionnel
 */
export async function getDocuments<T = DocumentData>(
  collectionPath: string,
  options?: QueryOptions
): Promise<T[]> {
  try {
    let collectionRef = collection(db, collectionPath);
    let queryRef = collectionRef;
    
    if (options) {
      // Appliquer les filtres where
      if (options.where && options.where.length > 0) {
        options.where.forEach((condition) => {
          queryRef = query(queryRef, where(condition.field, condition.operator as any, condition.value));
        });
      }
      
      // Appliquer les tris
      if (options.orderBy && options.orderBy.length > 0) {
        options.orderBy.forEach((sort) => {
          queryRef = query(queryRef, orderBy(sort.field, sort.direction || 'asc'));
        });
      }
      
      // Appliquer la limite
      if (options.limit) {
        queryRef = query(queryRef, limit(options.limit));
      }
    }
    
    const querySnapshot = await getDocs(queryRef);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);
  } catch (error) {
    console.error(`Erreur lors de la récupération des documents ${collectionPath}:`, error);
    throw error;
  }
}

/**
 * Créer ou mettre à jour un document
 */
export async function setDocument<T = DocumentData>(
  collectionPath: string,
  docId: string,
  data: WithFieldValue<T>,
  merge: boolean = true
): Promise<string> {
  try {
    const docRef = doc(db, collectionPath, docId);
    
    // Ajouter les timestamps automatiquement
    const timestampedData = {
      ...data as object,
      updatedAt: serverTimestamp(),
      ...(merge ? {} : { createdAt: serverTimestamp() })
    };
    
    await setDoc(docRef, timestampedData, { merge });
    return docId;
  } catch (error) {
    console.error(`Erreur lors de la création/mise à jour du document ${collectionPath}/${docId}:`, error);
    throw error;
  }
}

/**
 * Mettre à jour un document existant (champs spécifiques)
 */
export async function updateDocument<T = DocumentData>(
  collectionPath: string,
  docId: string,
  data: Partial<T>
): Promise<void> {
  try {
    const docRef = doc(db, collectionPath, docId);
    
    // Ajouter le timestamp de mise à jour
    const timestampedData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, timestampedData as any);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du document ${collectionPath}/${docId}:`, error);
    throw error;
  }
}

/**
 * Supprimer un document
 */
export async function deleteDocument(
  collectionPath: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionPath, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Erreur lors de la suppression du document ${collectionPath}/${docId}:`, error);
    throw error;
  }
}

/**
 * Observer les changements en temps réel sur un document
 */
export function subscribeToDocument<T = DocumentData>(
  collectionPath: string,
  docId: string,
  callback: (data: T | null) => void
): () => void {
  const docRef = doc(db, collectionPath, docId);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as T);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`Erreur lors de l'observation du document ${collectionPath}/${docId}:`, error);
    callback(null);
  });
}

/**
 * Observer les changements en temps réel sur une collection
 */
export function subscribeToCollection<T = DocumentData>(
  collectionPath: string,
  options: QueryOptions,
  callback: (data: T[]) => void
): () => void {
  let collectionRef = collection(db, collectionPath);
  let queryRef = collectionRef;
  
  if (options) {
    // Appliquer les filtres where
    if (options.where && options.where.length > 0) {
      options.where.forEach((condition) => {
        queryRef = query(queryRef, where(condition.field, condition.operator as any, condition.value));
      });
    }
    
    // Appliquer les tris
    if (options.orderBy && options.orderBy.length > 0) {
      options.orderBy.forEach((sort) => {
        queryRef = query(queryRef, orderBy(sort.field, sort.direction || 'asc'));
      });
    }
    
    // Appliquer la limite
    if (options.limit) {
      queryRef = query(queryRef, limit(options.limit));
    }
  }
  
  return onSnapshot(queryRef, (querySnapshot) => {
    const documents = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);
    callback(documents);
  }, (error) => {
    console.error(`Erreur lors de l'observation de la collection ${collectionPath}:`, error);
    callback([]);
  });
}

/**
 * Obtenir le chemin complet pour un document lié à l'utilisateur
 */
export function getUserDocPath(subPath: string = ''): string {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Utilisateur non connecté");
  }
  
  return `users/${user.uid}${subPath ? `/${subPath}` : ''}`;
} 