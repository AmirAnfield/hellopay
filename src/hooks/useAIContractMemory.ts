import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AIContractMemory, AIMessage } from '@/types/firebase';
import {
  initAIContractMemory,
  getAIContractMemory,
  updateAIContractMemory,
  updateAIContractMemoryField,
  addMessageToAIMemory,
  resetAIContractMemory
} from '@/lib/ai/memory';

export function useAIContractMemory() {
  const { currentUser } = useAuth();
  const [memory, setMemory] = useState<AIContractMemory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialiser ou récupérer la mémoire
  const initMemory = useCallback(async () => {
    if (!currentUser) {
      setError(new Error('Utilisateur non authentifié'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Vérifier si une mémoire existe déjà
      let existingMemory = await getAIContractMemory(currentUser.uid);
      
      // Si aucune mémoire n'existe, en créer une nouvelle
      if (!existingMemory) {
        existingMemory = await initAIContractMemory(currentUser.uid);
      }
      
      setMemory(existingMemory);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de l\'initialisation de la mémoire IA'));
      console.error('Erreur initMemory:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Charger la mémoire au montage du composant
  useEffect(() => {
    initMemory();
  }, [initMemory]);

  // Mettre à jour la mémoire
  const updateMemory = useCallback(async (data: Partial<Omit<AIContractMemory, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    if (!currentUser || !memory) {
      setError(new Error('Utilisateur non authentifié ou mémoire non initialisée'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const updatedMemory = await updateAIContractMemory(currentUser.uid, data);
      setMemory(updatedMemory);
      
      return updatedMemory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la mise à jour de la mémoire IA'));
      console.error('Erreur updateMemory:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, memory]);

  // Mettre à jour un champ spécifique
  const updateField = useCallback(async <K extends keyof AIContractMemory>(
    field: K,
    value: AIContractMemory[K]
  ) => {
    if (!currentUser || !memory) {
      setError(new Error('Utilisateur non authentifié ou mémoire non initialisée'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const updatedMemory = await updateAIContractMemoryField(currentUser.uid, field, value);
      setMemory(updatedMemory);
      
      return updatedMemory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Erreur lors de la mise à jour du champ ${String(field)}`));
      console.error('Erreur updateField:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, memory]);

  // Ajouter un message à l'historique
  const addMessage = useCallback(async (message: Omit<AIMessage, 'timestamp'>) => {
    if (!currentUser || !memory) {
      setError(new Error('Utilisateur non authentifié ou mémoire non initialisée'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const updatedMemory = await addMessageToAIMemory(currentUser.uid, message);
      setMemory(updatedMemory);
      
      return updatedMemory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de l\'ajout du message'));
      console.error('Erreur addMessage:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, memory]);

  // Réinitialiser la mémoire
  const resetMemory = useCallback(async () => {
    if (!currentUser) {
      setError(new Error('Utilisateur non authentifié'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const newMemory = await resetAIContractMemory(currentUser.uid);
      setMemory(newMemory);
      
      return newMemory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la réinitialisation de la mémoire'));
      console.error('Erreur resetMemory:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Mettre à jour l'étape actuelle
  const setStep = useCallback(async (step: number) => {
    if (!currentUser || !memory) {
      setError(new Error('Utilisateur non authentifié ou mémoire non initialisée'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const updatedMemory = await updateAIContractMemoryField(currentUser.uid, 'step', step);
      setMemory(updatedMemory);
      
      return updatedMemory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la mise à jour de l\'étape'));
      console.error('Erreur setStep:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, memory]);

  return {
    memory,
    isLoading,
    error,
    updateMemory,
    updateField,
    addMessage,
    resetMemory,
    setStep,
    initMemory,
  };
} 