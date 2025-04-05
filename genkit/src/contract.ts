import { onCall, CallableRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as logger from "firebase-functions/logger";

// Initialiser l'API Generative AI avec la clé d'API
const genAI = new GoogleGenerativeAI(process.env.GENKIT_API_KEY || "");

// Modèle à utiliser (Gemini)
const MODEL_NAME = process.env.GENKIT_MODEL_NAME || "gemini-1.5-pro";

// Type d'étape pour aider le type checking
type WizardStep = 'parties' | 'type' | 'details' | 'signature';

// Interface pour le paramètre de la fonction
interface GenerateClauseParams {
  step: WizardStep | string;
  memoryId: string;
}

// Interface pour les messages AI
interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: admin.firestore.Timestamp;
}

// Interface simplifiée pour AIContractMemory
interface AIContractMemory {
  id: string;
  userId: string;
  step: number;
  contractType?: string;
  company?: {
    id: string;
    name: string;
    siret?: string;
    address?: string;
    postalCode?: string;
    city?: string;
  };
  employee?: {
    id: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    birthPlace?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    socialSecurityNumber?: string;
  };
  fields: {
    workingHours?: string;
    hasRemoteWork?: boolean;
    salary?: number;
    startDate?: string;
    endDate?: string;
    trialPeriod?: boolean;
    trialPeriodDuration?: string;
    position?: string;
    qualification?: string;
    workLocation?: string;
    [key: string]: unknown;
  };
  clauses: {
    introduction?: string;
    workingTime?: string;
    duties?: string;
    remuneration?: string;
    trialPeriod?: string;
    duration?: string;
    termination?: string;
    [key: string]: string | null | undefined;
  };
  history: AIMessage[];
}

// Interface pour les suggestions de l'IA
interface AISuggestion {
  suggestion: string;
  fields?: Record<string, unknown>;
  nextQuestion?: string;
  suggestedFields?: Record<string, unknown>;
  missingFieldWarning?: string;
  followUpQuestion?: string;
}

// Fonction pour générer une clause de contrat en fonction de l'étape
export const generateClause = onCall<GenerateClauseParams>({
  region: "europe-west1",
  memory: "256MiB",
}, async (request: CallableRequest<GenerateClauseParams>) => {
  // Vérifier l'authentification
  if (!request.auth) {
    throw new Error("Utilisateur non authentifié");
  }

  // Récupérer les paramètres
  const { step, memoryId } = request.data;
  if (!step || !memoryId) {
    throw new Error("Paramètres manquants: step et memoryId sont requis");
  }

  try {
    // Récupérer la mémoire du contrat depuis Firestore
    const memoryDoc = await admin.firestore()
      .collection("ai_contract_memories")
      .doc(memoryId)
      .get();

    if (!memoryDoc.exists) {
      throw new Error(`Mémoire contractuelle non trouvée: ${memoryId}`);
    }

    const memory = memoryDoc.data() as AIContractMemory;

    // Vérifier que l'utilisateur a accès à cette mémoire
    if (memory.userId !== request.auth.uid) {
      throw new Error("Accès non autorisé à cette mémoire contractuelle");
    }

    // Générer le prompt en fonction de l'étape
    const prompt = generatePromptForStep(step as WizardStep, memory);

    // Journaliser pour le débogage
    logger.info("Generating AI clause for step", { step, memoryId });

    // Initialiser le modèle
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // Appeler le modèle
    const aiResponse = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // Récupérer le texte de la réponse
    const responseText = aiResponse.response.text();
    logger.info("AI response received", { length: responseText.length });

    // Analyser la réponse pour extraire la suggestion structurée
    const parsedSuggestion = parseAIResponse(responseText, step as WizardStep, memory);

    // Enregistrer cet échange dans l'historique de la mémoire
    await updateMemoryHistory(memoryId, prompt, responseText);

    return parsedSuggestion;
  } catch (error) {
    logger.error("Error generating clause:", error);
    throw new Error(`Échec de la génération IA: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
});

// Fonction pour générer un prompt adapté à chaque étape
function generatePromptForStep(step: WizardStep, memory: AIContractMemory): string {
  // Contexte de base commun à tous les prompts
  const baseContext = `
Tu es un assistant juridique spécialisé dans la rédaction de contrats de travail en France.
Utilise un ton professionnel et assure-toi que tes suggestions respectent le droit du travail français.

Voici les informations dont tu disposes sur ce contrat:
- Entreprise: ${memory.company?.name || 'Non spécifiée'} ${memory.company?.siret ? `(SIRET: ${memory.company.siret})` : ''}
- Employé: ${memory.employee?.fullName || 'Non spécifié'}
- Type de contrat: ${memory.contractType || 'Non spécifié'}
${memory.fields.position ? `- Poste: ${memory.fields.position}` : ''}
${memory.fields.salary ? `- Salaire: ${memory.fields.salary}€ brut mensuel` : ''}
${memory.fields.workingHours ? `- Temps de travail: ${memory.fields.workingHours}h/semaine` : ''}
${memory.fields.startDate ? `- Date de début: ${memory.fields.startDate}` : ''}
${memory.fields.endDate ? `- Date de fin: ${memory.fields.endDate}` : ''}
`;

  // Contexte spécifique au type de contrat
  const contractTypeContext = memory.contractType === 'CDD' ? `
Important: Ce contrat est un CDD. Assure-toi que les éléments suivants sont présents:
- Le motif de recours au CDD est obligatoire (remplacement, accroissement temporaire d'activité, etc.)
- Une date de fin précise doit être indiquée
- Une clause d'indemnité de fin de contrat (10% minimum du salaire brut total)
- Une clause indiquant les conditions de renouvellement du CDD si applicable
- Pas de période d'essai excessive (en général max 1 jour par semaine travaillée, dans la limite de 2 semaines pour contrats <6 mois)
- Les formalités de fin de contrat (remise des documents, certificat de travail)
` : memory.contractType === 'CDI' ? `
Important: Ce contrat est un CDI. Assure-toi que les éléments suivants sont présents:
- Une période d'essai adaptée au poste (généralement 2 mois pour un cadre, 1 mois pour un non-cadre)
- Une clause de rupture claire indiquant les conditions de préavis
- Une clause de mobilité si le lieu de travail est différent du siège social
- Une clause précise sur le temps de travail (horaires, jours de travail)
- Des clauses relatives aux congés payés et autres avantages
` : '';

  // Prompts spécifiques à chaque étape
  switch (step) {
    case 'parties':
      return `${baseContext}
${contractTypeContext}
Tu dois rédiger une introduction pour un contrat de travail qui présente clairement les parties concernées.
Utilise les informations sur l'entreprise et l'employé présentées ci-dessus.

Ta réponse doit contenir:
1. Une clause d'introduction qui présente les parties de façon formelle
2. Des suggestions de champs manquants concernant les parties (employé et entreprise)
3. Un avertissement si des informations essentielles sur les parties sont manquantes
4. Une question de suivi pertinente pour aider l'utilisateur à avancer dans la création du contrat

Formate ta réponse avec:
CLAUSE: [ta clause d'introduction]
SUGGESTED_FIELDS: [suggestions au format JSON pour les champs manquants]
MISSING_FIELD_WARNING: [avertissement si des champs cruciaux manquent]
FOLLOW_UP_QUESTION: [ta question de suivi spécifique au type de contrat]`;

    case 'type':
      return `${baseContext}
${contractTypeContext}
Tu dois rédiger une clause qui définit clairement le type de contrat et ses conditions générales.
${memory.contractType === 'CDD' ? 'Pour un CDD, assure-toi de mentionner le motif du recours, la durée ou date de fin, et les conditions de renouvellement.' : ''}
${memory.contractType === 'CDI' ? 'Pour un CDI, définis clairement la nature indéterminée du contrat et les conditions générales d\'emploi.' : ''}

Ta réponse doit contenir:
1. Une clause qui définit le type de contrat, sa nature juridique et sa durée
2. Des suggestions de valeurs par défaut pour les champs manquants spécifiques à ce type de contrat
3. Un avertissement si des informations essentielles sont manquantes (ex: motif du CDD, date de fin pour CDD)
4. Une question de suivi pertinente adaptée au type de contrat

Formate ta réponse avec:
CLAUSE: [ta clause sur le type de contrat]
SUGGESTED_FIELDS: [suggestions au format JSON pour: ${memory.contractType === 'CDD' ? 'motif, endDate, renewalConditions' : 'trialPeriod, trialPeriodDuration, terminationConditions'} si manquants]
MISSING_FIELD_WARNING: [avertissement si des champs obligatoires manquent]
FOLLOW_UP_QUESTION: [ta question de suivi adaptée au type de contrat]`;

    case 'details':
      return `${baseContext}
${contractTypeContext}
Tu dois rédiger une clause détaillant les conditions de travail, notamment les horaires, le lieu, et les modalités pratiques.
${memory.contractType === 'CDD' ? 'Pour un CDD, assure-toi que les conditions de travail sont bien définies pour la période spécifique du contrat.' : ''}
${memory.contractType === 'CDI' ? 'Pour un CDI, sois particulièrement attentif aux clauses de mobilité et aux conditions de travail à long terme.' : ''}

Ta réponse doit contenir:
1. Une clause sur les conditions de travail adaptée au type de contrat
2. Des suggestions de valeurs pour tout champ manquant concernant les conditions de travail
3. Un avertissement si des éléments essentiels manquent selon le type de contrat
4. Une question de suivi pour aider l'utilisateur à finaliser cette partie du contrat

Formate ta réponse avec:
CLAUSE: [ta clause sur les conditions de travail]
SUGGESTED_FIELDS: [suggestions au format JSON pour les champs manquants concernant le travail]
MISSING_FIELD_WARNING: [avertissement sur les champs obligatoires manquants]
FOLLOW_UP_QUESTION: [ta question de suivi adaptée au type de contrat]`;

    case 'signature':
      return `${baseContext}
${contractTypeContext}
Tu dois rédiger une clause de conclusion pour le contrat, mentionnant les signatures et formalités.
Assure-toi de mentionner le nombre d'exemplaires et la valeur juridique du document.

Ta réponse doit contenir:
1. Une clause de conclusion formelle qui mentionne la signature des parties
2. Une liste récapitulative des éléments clés du contrat
3. Un avertissement si des éléments obligatoires du contrat manquent encore
4. Une question finale pour confirmer la génération du contrat

Formate ta réponse avec:
CLAUSE: [ta clause de conclusion/signature]
RECAPITULATIF: [résumé des points importants du contrat]
MISSING_FIELD_WARNING: [liste de tout élément obligatoire manquant selon le type de contrat]
QUESTION: [question finale avant génération]`;

    default:
      return `${baseContext}
${contractTypeContext}
Tu es un assistant juridique. Propose une aide générale pour la création de ce contrat.
`;
  }
}

// Fonction pour analyser la réponse de l'IA et la structurer
function parseAIResponse(response: string, step: WizardStep, memory: AIContractMemory): AISuggestion {
  // Initialiser une suggestion par défaut
  const suggestion: AISuggestion = {
    suggestion: '',
    nextQuestion: 'Puis-je vous aider avec autre chose concernant ce contrat?'
  };

  try {
    // Extraire la clause
    const clauseMatch = response.match(/CLAUSE:(.*?)(?=CHAMPS:|SUGGESTED_FIELDS:|MISSING_FIELD_WARNING:|FOLLOW_UP_QUESTION:|QUESTION:|RECAPITULATIF:|$)/);
    if (clauseMatch && clauseMatch[1]) {
      suggestion.suggestion = clauseMatch[1].trim();
    } else {
      // Si format non respecté, utiliser toute la réponse
      suggestion.suggestion = response.trim();
    }

    // Extraire la question de suivi
    const questionMatch = response.match(/QUESTION:(.*?)(?=$)/);
    if (questionMatch && questionMatch[1]) {
      suggestion.nextQuestion = questionMatch[1].trim();
    }

    // Extraire les suggestions de champs (si présentes)
    const fieldsMatch = response.match(/CHAMPS:(.*?)(?=SUGGESTED_FIELDS:|MISSING_FIELD_WARNING:|FOLLOW_UP_QUESTION:|QUESTION:|$)/);
    if (fieldsMatch && fieldsMatch[1]) {
      try {
        // Nettoyer la chaîne JSON avant de la parser
        const cleanJson = fieldsMatch[1].trim().replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
        suggestion.fields = JSON.parse(`{${cleanJson}}`);
      } catch (e) {
        logger.warn('Erreur lors du parsing des champs suggérés:', e);
      }
    }

    // Extraire les champs suggérés (nouveau format)
    const suggestedFieldsMatch = response.match(/SUGGESTED_FIELDS:(.*?)(?=MISSING_FIELD_WARNING:|FOLLOW_UP_QUESTION:|QUESTION:|$)/);
    if (suggestedFieldsMatch && suggestedFieldsMatch[1]) {
      try {
        const cleanJson = suggestedFieldsMatch[1].trim().replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
        suggestion.suggestedFields = JSON.parse(`{${cleanJson}}`);
      } catch (e) {
        logger.warn('Erreur lors du parsing des champs suggérés (nouveau format):', e);
      }
    }

    // Extraire l'avertissement de champ manquant
    const missingFieldMatch = response.match(/MISSING_FIELD_WARNING:(.*?)(?=FOLLOW_UP_QUESTION:|QUESTION:|$)/);
    if (missingFieldMatch && missingFieldMatch[1]) {
      suggestion.missingFieldWarning = missingFieldMatch[1].trim();
    }

    // Extraire la question de suivi personnalisée
    const followUpMatch = response.match(/FOLLOW_UP_QUESTION:(.*?)(?=QUESTION:|$)/);
    if (followUpMatch && followUpMatch[1]) {
      suggestion.followUpQuestion = followUpMatch[1].trim();
    }

    // Traitement spécial pour l'étape signature (récapitulatif)
    if (step === 'signature') {
      const recapMatch = response.match(/RECAPITULATIF:(.*?)(?=QUESTION:|$)/);
      if (recapMatch && recapMatch[1]) {
        // Ajouter le récapitulatif comme un champ spécial
        suggestion.fields = {
          ...suggestion.fields,
          recap: recapMatch[1].trim()
        };
      }
    }

    return suggestion;
  } catch (error) {
    logger.error('Erreur lors du parsing de la réponse IA:', error);
    // Retourner une version simplifiée en cas d'erreur
    return {
      suggestion: response.substring(0, 500) + '...',
      nextQuestion: 'Y a-t-il autre chose que vous souhaitez préciser dans ce contrat?'
    };
  }
}

// Fonction pour mettre à jour l'historique de la mémoire
async function updateMemoryHistory(memoryId: string, prompt: string, response: string) {
  const db = admin.firestore();
  const memoryRef = db.collection('ai_contract_memories').doc(memoryId);
  
  try {
    // Récupérer l'historique actuel
    const memoryDoc = await memoryRef.get();
    if (!memoryDoc.exists) return;
    
    const memory = memoryDoc.data() as AIContractMemory;
    const history = memory.history || [];
    
    // Limiter l'historique aux 5 derniers échanges (en ajoutant les 2 nouveaux)
    const newHistory = [
      ...history.slice(-3), // Garder les 3 derniers des anciens messages
      {
        role: 'user',
        content: prompt,
        timestamp: admin.firestore.Timestamp.now()
      },
      {
        role: 'assistant',
        content: response,
        timestamp: admin.firestore.Timestamp.now()
      }
    ];
    
    // Mettre à jour la mémoire
    await memoryRef.update({
      history: newHistory,
      updatedAt: admin.firestore.Timestamp.now()
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de l\'historique:', error);
  }
} 