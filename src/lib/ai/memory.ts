import { doc, getDoc, setDoc, updateDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/config';
import { AIContractMemory, AIMessage } from '@/types/firebase';

/**
 * Chemin Firestore pour la mémoire IA d'un contrat en cours
 */
const getMemoryPath = (userId: string) => `users/${userId}/ai_memory/current_contract`;

/**
 * Initialise une nouvelle mémoire IA pour un contrat
 * @param userId ID de l'utilisateur
 */
export async function initAIContractMemory(userId: string): Promise<AIContractMemory> {
  const memoryPath = getMemoryPath(userId);
  const docRef = doc(firestore, memoryPath);
  
  // Vérifier si une mémoire existe déjà
  const existingDoc = await getDoc(docRef);
  if (existingDoc.exists()) {
    return { 
      id: existingDoc.id, 
      ...existingDoc.data() 
    } as AIContractMemory;
  }
  
  // Créer une nouvelle mémoire
  const now = Timestamp.now();
  const initialMemory: Omit<AIContractMemory, 'id'> = {
    userId,
    step: 1,
    fields: {},
    clauses: {},
    history: [],
    createdAt: now,
    updatedAt: now
  };
  
  await setDoc(docRef, initialMemory);
  
  return {
    id: docRef.id,
    ...initialMemory
  } as AIContractMemory;
}

/**
 * Récupère la mémoire IA actuelle pour un contrat
 * @param userId ID de l'utilisateur
 */
export async function getAIContractMemory(userId: string): Promise<AIContractMemory | null> {
  const memoryPath = getMemoryPath(userId);
  const docRef = doc(firestore, memoryPath);
  
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return null;
  }
  
  return {
    id: docSnap.id,
    ...docSnap.data()
  } as AIContractMemory;
}

/**
 * Met à jour la mémoire IA d'un contrat
 * @param userId ID de l'utilisateur
 * @param data Données à mettre à jour
 */
export async function updateAIContractMemory(
  userId: string, 
  data: Partial<Omit<AIContractMemory, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<AIContractMemory> {
  const memoryPath = getMemoryPath(userId);
  const docRef = doc(firestore, memoryPath);
  
  // Vérifier si la mémoire existe
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error("La mémoire IA n'existe pas. Veuillez l'initialiser d'abord.");
  }
  
  // Mise à jour avec les nouvelles données
  const updateData = {
    ...data,
    updatedAt: serverTimestamp()
  };
  
  await updateDoc(docRef, updateData);
  
  // Récupérer les données mises à jour
  const updatedDoc = await getDoc(docRef);
  
  return {
    id: updatedDoc.id,
    ...updatedDoc.data()
  } as AIContractMemory;
}

/**
 * Met à jour une partie spécifique de la mémoire IA (company, employee, etc)
 * @param userId ID de l'utilisateur
 * @param field Nom du champ à mettre à jour
 * @param value Valeur à définir
 */
export async function updateAIContractMemoryField<K extends keyof AIContractMemory>(
  userId: string,
  field: K,
  value: AIContractMemory[K]
): Promise<AIContractMemory> {
  const memoryPath = getMemoryPath(userId);
  const docRef = doc(firestore, memoryPath);
  
  // Vérifier si la mémoire existe
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error("La mémoire IA n'existe pas. Veuillez l'initialiser d'abord.");
  }
  
  // Préparer la mise à jour
  const updateData = {
    [field]: value,
    updatedAt: serverTimestamp()
  };
  
  await updateDoc(docRef, updateData);
  
  // Récupérer les données mises à jour
  const updatedDoc = await getDoc(docRef);
  
  return {
    id: updatedDoc.id,
    ...updatedDoc.data()
  } as AIContractMemory;
}

/**
 * Ajoute un message à l'historique de la mémoire IA
 * @param userId ID de l'utilisateur
 * @param message Message à ajouter
 * @param maxHistoryLength Nombre maximum de messages à conserver (par défaut: 5)
 */
export async function addMessageToAIMemory(
  userId: string,
  message: Omit<AIMessage, 'timestamp'>,
  maxHistoryLength: number = 5
): Promise<AIContractMemory> {
  const memoryPath = getMemoryPath(userId);
  const docRef = doc(firestore, memoryPath);
  
  // Vérifier si la mémoire existe
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error("La mémoire IA n'existe pas. Veuillez l'initialiser d'abord.");
  }
  
  // Récupérer l'historique actuel
  const currentMemory = docSnap.data() as AIContractMemory;
  const currentHistory = currentMemory.history || [];
  
  // Ajouter le nouveau message avec timestamp
  const newMessage = {
    ...message,
    timestamp: Timestamp.now()
  };
  
  // Limiter la taille de l'historique
  const updatedHistory = [...currentHistory, newMessage].slice(-maxHistoryLength);
  
  // Mettre à jour l'historique
  await updateDoc(docRef, {
    history: updatedHistory,
    updatedAt: serverTimestamp()
  });
  
  // Récupérer les données mises à jour
  const updatedDoc = await getDoc(docRef);
  
  return {
    id: updatedDoc.id,
    ...updatedDoc.data()
  } as AIContractMemory;
}

/**
 * Efface la mémoire IA actuelle et réinitialise
 * @param userId ID de l'utilisateur
 */
export async function resetAIContractMemory(userId: string): Promise<AIContractMemory> {
  const memoryPath = getMemoryPath(userId);
  const docRef = doc(firestore, memoryPath);
  
  // Créer une nouvelle mémoire vide
  const now = Timestamp.now();
  const initialMemory: Omit<AIContractMemory, 'id'> = {
    userId,
    step: 1,
    fields: {},
    clauses: {},
    history: [],
    createdAt: now,
    updatedAt: now
  };
  
  await setDoc(docRef, initialMemory);
  
  return {
    id: docRef.id,
    ...initialMemory
  } as AIContractMemory;
} 