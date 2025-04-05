import { onCall, CallableRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as logger from "firebase-functions/logger";
import { AIContractMemory } from "./types/firebase";

// Initialiser l'API Generative AI avec la clé d'API
const genAI = new GoogleGenerativeAI(process.env.GENKIT_API_KEY || "");

// Modèle à utiliser (Gemini)
const MODEL_NAME = process.env.GENKIT_MODEL_NAME || "gemini-1.5-pro";

// Interface pour le paramètre de la fonction
interface VerifyContractParams {
  contractId?: string;
  memoryId?: string;
}

// Interface pour le résultat de la vérification du contrat
interface ContractVerificationResult {
  contractType: string;
  isValid: boolean;
  warnings: string[];
  recommendation: string;
}

// Fonction pour vérifier la cohérence d'un contrat avant finalisation
export const verifyContractConsistency = onCall<VerifyContractParams>({
  region: "europe-west1",
  memory: "256MiB",
}, async (request: CallableRequest<VerifyContractParams>) => {
  // Vérifier l'authentification
  if (!request.auth) {
    throw new Error("Utilisateur non authentifié");
  }

  // Récupérer les paramètres
  const { contractId, memoryId } = request.data;
  
  if (!contractId && !memoryId) {
    throw new Error("Paramètres manquants: contractId ou memoryId est requis");
  }

  try {
    let memory: AIContractMemory | null = null;
    let contractData: any = null;

    // Récupérer les données du contrat
    if (memoryId) {
      // Récupérer depuis la mémoire AI
      const memoryDoc = await admin.firestore()
        .collection("ai_contract_memories")
        .doc(memoryId)
        .get();

      if (!memoryDoc.exists) {
        throw new Error(`Mémoire contractuelle non trouvée: ${memoryId}`);
      }

      memory = memoryDoc.data() as AIContractMemory;

      // Vérifier que l'utilisateur a accès à cette mémoire
      if (memory.userId !== request.auth.uid) {
        throw new Error("Accès non autorisé à cette mémoire contractuelle");
      }
    } else if (contractId) {
      // Récupérer depuis Firestore
      const contractDoc = await admin.firestore()
        .collection("contracts")
        .doc(contractId)
        .get();

      if (!contractDoc.exists) {
        throw new Error(`Contrat non trouvé: ${contractId}`);
      }

      contractData = contractDoc.data();

      // Vérifier que l'utilisateur a accès à ce contrat
      if (contractData.companyId) {
        // Vérifier que l'utilisateur appartient à cette entreprise
        const userCompaniesSnapshot = await admin.firestore()
          .collection("company_users")
          .where("userId", "==", request.auth.uid)
          .where("companyId", "==", contractData.companyId)
          .limit(1)
          .get();

        if (userCompaniesSnapshot.empty) {
          throw new Error("Accès non autorisé à ce contrat");
        }
      }
    }

    // Préparer les données à vérifier
    const dataToCheck = memory || contractData;
    
    if (!dataToCheck) {
      throw new Error("Impossible de récupérer les données du contrat");
    }

    // Générer le prompt de vérification
    const prompt = generateVerificationPrompt(dataToCheck);

    // Journaliser pour le débogage
    logger.info("Verifying contract consistency", { contractId, memoryId });

    // Initialiser le modèle
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.2, // Température plus basse pour des réponses précises
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    // Appeler le modèle
    const aiResponse = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // Récupérer le texte de la réponse
    const responseText = aiResponse.response.text();
    logger.info("AI verification response received", { length: responseText.length });

    // Analyser la réponse pour extraire le résultat structuré
    const verificationResult = parseVerificationResponse(responseText, dataToCheck.contractType);

    return verificationResult;
  } catch (error) {
    logger.error("Error verifying contract consistency:", error);
    throw new Error(`Échec de la vérification: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
});

// Fonction pour générer un prompt de vérification
function generateVerificationPrompt(data: any): string {
  // Extraire le type de contrat
  const contractType = data.contractType || '';
  
  // Construire un prompt détaillé en fonction du type de contrat
  let contractSpecificChecks = '';
  
  if (contractType === 'CDD') {
    contractSpecificChecks = `
Pour un CDD, vérifie particulièrement:
1. Présence obligatoire du motif de recours (remplacement, accroissement temporaire d'activité, etc.)
2. Date de fin précise
3. Clause d'indemnité de fin de contrat (10% du salaire brut total)
4. Durée de la période d'essai conforme (max 1 jour par semaine travaillée, dans la limite de 2 semaines pour contrats <6 mois)
5. Pas de clause de rupture abusive
6. Présence des formalités de fin de contrat (remise de documents, certificat de travail)
`;
  } else if (contractType === 'CDI') {
    contractSpecificChecks = `
Pour un CDI, vérifie particulièrement:
1. Période d'essai adaptée au poste (généralement 2 mois pour un cadre, 1 mois pour un non-cadre)
2. Clause de rupture avec conditions de préavis
3. Clause de mobilité si le lieu de travail est différent du siège social
4. Clause précise sur le temps de travail (horaires, jours de travail)
5. Clauses relatives aux congés payés et autres avantages
`;
  }

  // Créer la liste des champs disponibles
  const fields = data.fields || {};
  const fieldsList = Object.entries(fields)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  // Créer la liste des clauses disponibles
  const clauses = data.clauses || {};
  const clausesList = Object.entries(clauses)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  return `
Tu es un expert juridique spécialisé dans la vérification de contrats de travail en France.
Ta mission est d'analyser ce contrat et d'identifier tout élément manquant ou problématique.

Type de contrat: ${contractType}

CHAMPS DU CONTRAT:
${fieldsList}

CLAUSES DU CONTRAT:
${clausesList}

${contractSpecificChecks}

Analyse le contrat et fournis une évaluation structurée au format suivant:
EVALUATION:
{
  "contractType": "Type de contrat (CDD, CDI)",
  "isValid": true ou false,
  "warnings": [
    "Liste des problèmes détectés",
    "..."
  ],
  "recommendation": "Une recommandation claire pour l'utilisateur"
}
`;
}

// Fonction pour analyser la réponse de vérification
function parseVerificationResponse(response: string, contractType: string): ContractVerificationResult {
  // Valeur par défaut
  const defaultResult: ContractVerificationResult = {
    contractType: contractType || 'Indéterminé',
    isValid: false,
    warnings: ['Impossible d\'analyser la réponse de vérification.'],
    recommendation: 'Veuillez vérifier manuellement le contrat avant de le finaliser.'
  };

  try {
    // Essayer d'extraire le JSON de la réponse
    const match = response.match(/EVALUATION:\s*({[\s\S]*})/);
    
    if (match && match[1]) {
      try {
        // Nettoyer et parser le JSON
        const jsonStr = match[1].replace(/[\n\r]/g, ' ').trim();
        const result = JSON.parse(jsonStr);
        
        // Vérifier que toutes les propriétés attendues sont présentes
        if (result.contractType && 
            typeof result.isValid === 'boolean' && 
            Array.isArray(result.warnings) && 
            typeof result.recommendation === 'string') {
          return result;
        }
      } catch (err) {
        logger.error('Erreur lors du parsing du JSON de vérification:', err);
      }
    }
    
    // Si aucun format JSON n'est trouvé, essayer d'extraire des informations du texte
    const isValid = !response.includes('manquant') && 
                    !response.includes('obligatoire') && 
                    !response.includes('requis') &&
                    !response.includes('invalide');
                    
    const warningsMatch = response.match(/problèmes?|manque|manquant|requis|obligatoire|invalide/gi);
    const warnings = warningsMatch ? 
      ['Le contrat présente des problèmes qui doivent être corrigés avant finalisation.'] : 
      ['Aucun problème majeur détecté, mais une vérification manuelle est recommandée.'];
      
    return {
      contractType: contractType || 'Indéterminé',
      isValid,
      warnings,
      recommendation: isValid ? 
        'Le contrat semble valide, vous pouvez procéder à sa finalisation.' : 
        'Veuillez corriger les problèmes signalés avant de finaliser le contrat.'
    };
  } catch (error) {
    logger.error('Erreur lors du parsing de la réponse de vérification:', error);
    return defaultResult;
  }
} 