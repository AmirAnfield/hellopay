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
  startAfter,
  serverTimestamp,
  DocumentSnapshot,
  QuerySnapshot,
  DocumentReference,
  DocumentData,
  WithFieldValue,
  Timestamp,
  onSnapshot,
  CollectionReference,
  QueryConstraint,
  addDoc,
  getCountFromServer
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { getFirestore } from 'firebase/firestore';
import { FirestorePaginationParams, PaginatedResult } from '@/types/pagination';

/**
 * Interface pour les options de requête
 */
export interface QueryOptions {
  where?: Array<{ field: string; operator: '==' | '!=' | '>' | '>=' | '<' | '<='; value: any }>;
  orderBy?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
  limit?: number;
}

/**
 * Fonction de debug pour tracer les erreurs Firestore
 */
const logFirestoreOperation = (operation: string, path: string, id: string | null, error?: any) => {
  const timestamp = new Date().toISOString();
  const user = auth.currentUser ? `UID: ${auth.currentUser.uid}` : 'Non authentifié';
  
  if (error) {
    console.error(`🔥 [${timestamp}] Erreur Firestore (${operation}) - ${user} - Chemin: ${path}, ID: ${id || 'N/A'}`);
    console.error(`   Code: ${error.code || 'inconnu'}, Message: ${error.message || error.toString()}`);
    if (error.stack) {
      console.error(`   Stack: ${error.stack.split('\n')[0]}`);
    }
  } else {
  }
};

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
      const data = docSnap.data();
      // Convertir les timestamps Firestore en objets Date JS
      const result = { ...data, id: docId } as T;
      
      // Convertir les timestamps en dates
      const resultObj = result as unknown as Record<string, any>;
      Object.keys(resultObj).forEach(key => {
        if (resultObj[key] instanceof Timestamp) {
          resultObj[key] = resultObj[key].toDate();
        }
      });
      
      logFirestoreOperation('READ', collectionPath, docId);
      return result;
    }
    
    logFirestoreOperation('READ', collectionPath, docId, { message: 'Document n\'existe pas' });
    return null;
  } catch (error) {
    logFirestoreOperation('READ', collectionPath, docId, error);
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
    const collectionRef = collection(db, collectionPath);
    const constraints: QueryConstraint[] = [];
    
    // Ajouter les filtres where
    if (options && options.where && options.where.length > 0) {
      options.where.forEach(filter => {
        constraints.push(where(filter.field, filter.operator, filter.value));
      });
    }
    
    // Ajouter les ordres de tri
    if (options && options.orderBy && options.orderBy.length > 0) {
      options.orderBy.forEach(sort => {
        constraints.push(orderBy(sort.field, sort.direction || 'asc'));
      });
    }
    
    // Appliquer la limite
    if (options && options.limit) {
      constraints.push(limit(options.limit));
    }
    
    // Créer la requête
    const q = query(collectionRef, ...constraints);
    
    // Exécuter la requête
    const querySnapshot = await getDocs(q);
    
    // Convertir les résultats
    const results: T[] = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const result = { ...data, id: doc.id } as T;
      
      // Convertir les timestamps en dates
      const resultObj = result as unknown as Record<string, any>;
      Object.keys(resultObj).forEach(key => {
        if (resultObj[key] instanceof Timestamp) {
          resultObj[key] = resultObj[key].toDate();
        }
      });
      
      results.push(result);
    });
    
    logFirestoreOperation('QUERY', collectionPath, null, null);
    return results;
  } catch (error) {
    logFirestoreOperation('QUERY', collectionPath, null, error);
    throw error;
  }
}

/**
 * Créer ou mettre à jour un document
 * @param collectionPath Chemin de la collection
 * @param data Données à enregistrer
 * @param id Identifiant du document (optionnel, généré automatiquement si non fourni)
 * @param merge Fusionner avec les données existantes (true) ou remplacer (false)
 * @returns ID du document créé ou mis à jour
 */
export async function setDocument<T extends FirestoreDocument>(
  collectionPath: string,
  data: Omit<T, 'id'>,
  id?: string,
  merge: boolean = false
): Promise<string> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  try {
    const db = getFirestore();
    const collectionRef = collection(db, collectionPath);
    
    // Préparer les données avec les timestamps
    const dataWithTimestamps = {
      ...data,
      createdAt: data.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    let docRef;
    
    if (id) {
      // Mise à jour d'un document existant
      docRef = doc(db, collectionPath, id);
      await setDoc(docRef, dataWithTimestamps, { merge });
    } else {
      // Création d'un nouveau document avec ID auto-généré
      docRef = await addDoc(collectionRef, dataWithTimestamps);
    }
    
    // Retourner l'ID du document
    return docRef.id;
  } catch (error) {
    console.error(`Erreur lors de l'enregistrement du document:`, error);
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
    const enhancedData = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(docRef, enhancedData as any);
    logFirestoreOperation('UPDATE', collectionPath, docId);
  } catch (error) {
    logFirestoreOperation('UPDATE', collectionPath, docId, error);
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
    logFirestoreOperation('DELETE', collectionPath, docId);
  } catch (error) {
    logFirestoreOperation('DELETE', collectionPath, docId, error);
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

/**
 * Obtient une collection avec pagination basée sur un curseur
 * Cette méthode est plus efficace que la pagination par offset pour les grandes collections
 * 
 * @param collectionPath Chemin de la collection
 * @param paginationParams Paramètres de pagination (limit, lastVisible, whereConditions, etc.)
 * @returns Résultat paginé (données, dernier document visible, indicateur hasMore)
 */
export async function getPaginatedCollection<T extends DocumentData>(
  collectionPath: string,
  paginationParams: FirestorePaginationParams = {}
): Promise<PaginatedResult<T>> {
  try {
    const {
      limit: limitCount = 10,
      lastVisible = null,
      sortBy = 'createdAt',
      sortDirection = 'desc',
      whereConditions = []
    } = paginationParams;

    // Construire les contraintes de la requête
    const queryConstraints: QueryConstraint[] = [];

    // Ajouter les conditions where
    whereConditions.forEach(condition => {
      queryConstraints.push(where(condition.field, condition.operator, condition.value));
    });

    // Ajouter le tri
    queryConstraints.push(orderBy(sortBy, sortDirection));

    // Si nous avons un document "lastVisible", l'utiliser comme point de départ
    if (lastVisible) {
      queryConstraints.push(startAfter(lastVisible));
    }

    // Ajouter la limite
    queryConstraints.push(limit(limitCount + 1)); // +1 pour déterminer s'il y a plus de résultats

    // Créer et exécuter la requête
    const collectionRef = collection(db, collectionPath);
    const q = query(collectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    // Vérifier s'il y a plus de résultats que la limite demandée
    const hasMore = querySnapshot.docs.length > limitCount;

    // Stocker le dernier document visible pour la pagination suivante
    const newLastVisible = hasMore 
      ? querySnapshot.docs[limitCount - 1] 
      : querySnapshot.docs.length > 0 
        ? querySnapshot.docs[querySnapshot.docs.length - 1] 
        : null;

    // Convertir les documents en données avec ID
    const docs = querySnapshot.docs
      .slice(0, limitCount) // Limiter aux résultats demandés
      .map(doc => ({
        id: doc.id,
        ...(doc.data() as T)
      }));

    return {
      data: docs,
      hasMore,
      lastVisible: newLastVisible
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la collection paginée:', error);
    throw error;
  }
}

/**
 * Compte le nombre total d'éléments dans une collection avec filtres optionnels
 * 
 * @param collectionPath Chemin de la collection
 * @param whereConditions Conditions de filtrage optionnelles
 * @returns Nombre total d'éléments
 */
export async function getCollectionCount(
  collectionPath: string,
  whereConditions: Array<{
    field: string;
    operator: '==' | '!=' | '>' | '>=' | '<' | '<=';
    value: unknown;
  }> = []
): Promise<number> {
  try {
    // Construire les contraintes de la requête
    const queryConstraints: QueryConstraint[] = [];

    // Ajouter les conditions where
    whereConditions.forEach(condition => {
      queryConstraints.push(where(condition.field, condition.operator, condition.value));
    });

    // Créer et exécuter la requête de comptage
    const collectionRef = collection(db, collectionPath);
    const q = query(collectionRef, ...queryConstraints);
    const snapshot = await getCountFromServer(q);
    
    return snapshot.data().count;
  } catch (error) {
    console.error('Erreur lors du comptage des documents:', error);
    throw error;
  }
} 