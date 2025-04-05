import { AIContractMemory, AISuggestion } from '@/types/firebase';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/config';

/**
 * Génère une clause de contrat à l'aide de l'IA Genkit via Firebase Functions
 * @param memory La mémoire du contrat actuel
 * @param step L'étape du wizard (1-4)
 * @returns Une suggestion IA formatée
 */
export async function suggestClause(
  memory: AIContractMemory,
  step: number
): Promise<AISuggestion> {
  // Convertir le numéro d'étape en identifiant d'étape pour l'IA
  const stepId = mapStepNumberToId(step);
  
  try {
    // Logger l'appel à l'IA pour le débogage
    console.log(`Appel IA (Genkit) pour l'étape ${stepId} (${step})`, memory.id);
    
    // Appeler la fonction Firebase qui utilise Genkit
    const generateClauseFn = httpsCallable<
      { step: string; memoryId: string }, 
      AISuggestion
    >(functions, 'generateClause');
    
    // Appeler la fonction avec l'ID de mémoire et l'étape
    const result = await generateClauseFn({ 
      step: stepId,
      memoryId: memory.id
    });
    
    // Retourner le résultat
    return result.data;
    
  } catch (error) {
    console.error("Erreur lors de l'appel à l'IA Genkit:", error);
    
    // En cas d'erreur, retourner une suggestion par défaut
    return {
      suggestion: "Désolé, je n'ai pas pu générer une suggestion pour cette étape. Essayons de continuer avec les valeurs standard.",
      nextQuestion: "Souhaitez-vous continuer sans assistance IA pour cette étape ?"
    };
  }
}

/**
 * Convertit un numéro d'étape (1-4) en identifiant d'étape pour l'IA
 */
function mapStepNumberToId(step: number): string {
  const stepMap: Record<number, string> = {
    1: 'parties',
    2: 'type',
    3: 'details',
    4: 'signature'
  };
  
  return stepMap[step] || 'parties';
} 