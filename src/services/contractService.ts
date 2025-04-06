import { ContractConfig, ContractType, WorkingHours, Company, Employee } from "@/types/contract";
import { firestore } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { cleanObject } from "./utils";

// Chemin pour les configurations de contrats
const getConfigPath = (userId: string) => `users/${userId}/contracts/config`;

/**
 * Récupère la configuration d'un contrat en cours
 */
export async function getContractConfig(userId: string): Promise<ContractConfig | null> {
  try {
    const docRef = doc(firestore, getConfigPath(userId));
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      } as ContractConfig;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de la configuration du contrat:", error);
    return null;
  }
}

/**
 * Crée ou met à jour la configuration d'un contrat
 */
export async function saveContractConfig(
  userId: string, 
  config: Partial<ContractConfig>
): Promise<ContractConfig> {
  try {
    // Nettoyer les données avant sauvegarde
    const cleanedConfig = cleanObject(config);
    
    const docRef = doc(firestore, getConfigPath(userId));
    const docSnap = await getDoc(docRef);
    
    const now = new Date();
    
    if (docSnap.exists()) {
      // Mise à jour de la configuration existante
      const existingConfig = docSnap.data() as ContractConfig;
      const updatedConfig = {
        ...existingConfig,
        ...cleanedConfig,
        updatedAt: Timestamp.fromDate(now),
      };
      
      await updateDoc(docRef, updatedConfig);
      
      return {
        ...updatedConfig,
        createdAt: existingConfig.createdAt instanceof Timestamp 
          ? existingConfig.createdAt.toDate() 
          : new Date(existingConfig.createdAt),
        updatedAt: now,
      } as ContractConfig;
    } else {
      // Création d'une nouvelle configuration
      const newConfig: ContractConfig = {
        userId,
        status: 'draft',
        progress: 0,
        createdAt: now,
        updatedAt: now,
        ...cleanedConfig,
      };
      
      await setDoc(docRef, {
        ...cleanObject(newConfig),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });
      
      return newConfig;
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la configuration du contrat:", error);
    throw error;
  }
}

/**
 * Met à jour le type de contrat
 */
export async function updateContractType(userId: string, contractType: ContractType): Promise<ContractConfig> {
  return await saveContractConfig(userId, { contractType, progress: 1 });
}

/**
 * Met à jour les heures de travail hebdomadaires
 */
export async function updateWorkingHours(userId: string, workingHours: WorkingHours): Promise<ContractConfig> {
  const isPartTime = workingHours < 35;
  return await saveContractConfig(userId, { workingHours, isPartTime, progress: 2 });
}

/**
 * Met à jour l'entreprise sélectionnée
 */
export async function updateCompany(userId: string, company: Company): Promise<ContractConfig> {
  // Nettoyer l'objet company avant de l'enregistrer
  const cleanedCompany = cleanObject(company);
  return await saveContractConfig(userId, { company: cleanedCompany, progress: 3 });
}

/**
 * Met à jour l'employé sélectionné
 */
export async function updateEmployee(userId: string, employee: Employee): Promise<ContractConfig> {
  // Nettoyer l'objet employee avant de l'enregistrer
  const cleanedEmployee = cleanObject(employee);
  return await saveContractConfig(userId, { employee: cleanedEmployee, progress: 4 });
}

/**
 * Met à jour l'option du préambule
 */
export async function updatePreambule(userId: string, hasPreambule: boolean): Promise<ContractConfig> {
  return await saveContractConfig(userId, { hasPreambule, progress: 5 });
}

/**
 * Met à jour l'étape Article 1 - Nature du contrat
 */
export async function updateContractNature(userId: string): Promise<ContractConfig> {
  return await saveContractConfig(userId, { progress: 6 });
}

/**
 * Met à jour l'étape Article 2 - Date d'entrée en fonction
 */
export async function updateContractEntryDate(userId: string): Promise<ContractConfig> {
  return await saveContractConfig(userId, { progress: 7 });
}

/**
 * Met à jour l'étape Article 3 - Fonctions
 */
export async function updateContractFunctions(userId: string): Promise<ContractConfig> {
  return await saveContractConfig(userId, { progress: 7 });
}

/**
 * Met à jour l'étape Article 4 - Durée du travail et horaires
 */
export async function updateContractWorkingHours(userId: string): Promise<ContractConfig> {
  return await saveContractConfig(userId, { progress: 9 });
}

/**
 * Met à jour l'étape Article 4 - Lieu de travail
 */
export async function updateContractWorkplace(userId: string): Promise<ContractConfig> {
  return await saveContractConfig(userId, { progress: 8 });
}

/**
 * Met à jour l'étape Article 5 - Durée et organisation du travail
 */
export async function updateWorkingSchedule(userId: string): Promise<ContractConfig> {
  return await saveContractConfig(userId, { progress: 10 });
}

/**
 * Met à jour l'étape des clauses supplémentaires
 */
export async function updateAdditionalClauses(userId: string): Promise<ContractConfig> {
  return await saveContractConfig(userId, { progress: 14 });
}

/**
 * Met à jour la rémunération dans la configuration du contrat
 */
export const updateContractRemuneration = async (userId: string): Promise<ContractConfig> => {
  return await saveContractConfig(userId, { progress: 11 }); // Passer à l'étape suivante (Article 7)
};

/**
 * Met à jour les avantages et frais professionnels dans la configuration du contrat
 */
export const updateContractBenefits = async (userId: string): Promise<ContractConfig> => {
  return await saveContractConfig(userId, { progress: 12 }); // Passer à l'étape suivante (Article 8)
};

/**
 * Met à jour les congés et absences dans la configuration du contrat
 */
export const updateContractLeaves = async (userId: string): Promise<ContractConfig> => {
  return await saveContractConfig(userId, { progress: 13 }); // Passer à l'étape suivante (Article 9)
};

/**
 * Met à jour les données personnelles et droit à l'image dans la configuration du contrat
 */
export const updateContractDataProtection = async (userId: string): Promise<ContractConfig> => {
  return await saveContractConfig(userId, { progress: 14 }); // Passer à l'étape suivante (Article 10)
};

/**
 * Met à jour les règles de conduite dans la configuration du contrat
 */
export const updateContractConduct = async (userId: string): Promise<ContractConfig> => {
  return await saveContractConfig(userId, { progress: 15 }); // Passer à l'étape suivante (Article 11)
};

/**
 * Met à jour la confidentialité et la propriété intellectuelle dans la configuration du contrat
 */
export const updateContractConfidentiality = async (userId: string): Promise<ContractConfig> => {
  return await saveContractConfig(userId, { progress: 16 }); // Passer à l'étape suivante (Article 12)
};

/**
 * Met à jour les clauses de non-concurrence dans la configuration du contrat
 */
export const updateContractNonCompete = async (userId: string): Promise<ContractConfig> => {
  return await saveContractConfig(userId, { progress: 17 }); // Passer à l'étape suivante (Article 13)
};

/**
 * Met à jour les modalités de télétravail dans la configuration du contrat
 */
export const updateContractTeleworking = async (userId: string): Promise<ContractConfig> => {
  return await saveContractConfig(userId, { progress: 18 }); // Passer à l'étape suivante (Article 14)
};

/**
 * Met à jour les modalités de rupture du contrat dans la configuration du contrat
 */
export const updateContractTermination = async (userId: string): Promise<ContractConfig> => {
  return await saveContractConfig(userId, { progress: 19 }); // Passer à l'aperçu final
};

/**
 * Finalise le contrat pour validation finale
 */
export const submitFinalContract = async (userId: string): Promise<ContractConfig> => {
  return await saveContractConfig(userId, { 
    progress: 20,
    status: 'validated',
    completedAt: new Date()
  });
}; 