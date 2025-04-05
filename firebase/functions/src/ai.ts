import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';
import { AIContractMemory, AISuggestion } from './types/firebase';
import { genkit } from '@genkit/firebase';

// Initialiser Genkit avec le modèle par défaut (Gemini)
const ai = genkit.getAI();
const defaultModel = ai.getGenerativeModel();

// Type d'étape pour aider le type checking
type WizardStep = 'parties' | 'type' | 'details' | 'signature';

// Fonction pour générer une clause de contrat en fonction de l'étape
export const generateClause = onCall({
  region: 'europe-west1',
  // Limiter l'utilisation mémoire pour optimiser les coûts
  memory: '256MiB',
}, async (request) => {
  // Vérifier l'authentification
  if (!request.auth) {
    throw new Error('Utilisateur non authentifié');
  }

  // Récupérer les paramètres
  const { step, memoryId } = request.data;
  if (!step || !memoryId) {
    throw new Error('Paramètres manquants: step et memoryId sont requis');
  }

  try {
    // Récupérer la mémoire du contrat depuis Firestore
    const memoryDoc = await admin.firestore()
      .collection('ai_contract_memories')
      .doc(memoryId)
      .get();

    if (!memoryDoc.exists) {
      throw new Error(`Mémoire contractuelle non trouvée: ${memoryId}`);
    }

    const memory = memoryDoc.data() as AIContractMemory;

    // Vérifier que l'utilisateur a accès à cette mémoire
    if (memory.userId !== request.auth.uid) {
      throw new Error('Accès non autorisé à cette mémoire contractuelle');
    }

    // Générer le prompt en fonction de l'étape
    const prompt = generatePromptForStep(step as WizardStep, memory);

    // Appeler l'IA via Genkit
    const result = await defaultModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const responseText = result.response.text();
    console.log('Réponse IA:', responseText);

    // Analyser la réponse pour extraire la suggestion structurée
    const parsedSuggestion = parseAIResponse(responseText, step as WizardStep, memory);

    // Enregistrer cet échange dans l'historique de la mémoire
    await updateMemoryHistory(memoryId, prompt, responseText);

    return parsedSuggestion;

  } catch (error) {
    console.error('Erreur lors de la génération de clause:', error);
    throw new Error(`Échec de la génération IA: ${error.message}`);
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

  // Prompts spécifiques à chaque étape
  switch (step) {
    case 'parties':
      return `${baseContext}
Tu dois rédiger une introduction pour un contrat de travail qui présente clairement les parties concernées.
Utilise les informations sur l'entreprise et l'employé présentées ci-dessus.

Ta réponse doit contenir:
1. Une clause d'introduction qui présente les parties de façon formelle
2. Une question de suivi pertinente pour aider l'utilisateur à avancer dans la création du contrat

Formate ta réponse avec:
CLAUSE: [ta clause d'introduction]
QUESTION: [ta question de suivi]`;

    case 'type':
      return `${baseContext}
Tu dois rédiger une clause qui définit clairement le type de contrat et ses conditions générales.
Utilise le type de contrat spécifié (CDI, CDD, stage, freelance) et adapte ta réponse en conséquence.

Ta réponse doit contenir:
1. Une clause qui définit le type de contrat, sa nature juridique et sa durée
2. Des suggestions de valeurs par défaut pour les champs manquants
3. Une question de suivi pertinente pour aider l'utilisateur à compléter le contrat

Formate ta réponse avec:
CLAUSE: [ta clause sur le type de contrat]
CHAMPS: [suggestions au format JSON pour: position, salary, workingHours, startDate si manquants]
QUESTION: [ta question de suivi]`;

    case 'details':
      return `${baseContext}
Tu dois rédiger une clause détaillant les conditions de travail, notamment les horaires, le lieu, et les modalités pratiques.
Utilise toutes les informations disponibles dans le contexte ci-dessus.

Ta réponse doit contenir:
1. Une clause sur les conditions de travail adaptée au type de contrat
2. Des suggestions de valeurs pour tout champ manquant concernant les conditions de travail
3. Une question de suivi pour aider l'utilisateur à finaliser cette partie du contrat

Formate ta réponse avec:
CLAUSE: [ta clause sur les conditions de travail]
CHAMPS: [suggestions au format JSON pour les champs manquants concernant le travail]
QUESTION: [ta question de suivi]`;

    case 'signature':
      return `${baseContext}
Tu dois rédiger une clause de conclusion pour le contrat, mentionnant les signatures et formalités.
Assure-toi de mentionner le nombre d'exemplaires et la valeur juridique du document.

Ta réponse doit contenir:
1. Une clause de conclusion formelle qui mentionne la signature des parties
2. Une liste récapitulative des éléments clés du contrat
3. Une question finale pour confirmer la génération du contrat

Formate ta réponse avec:
CLAUSE: [ta clause de conclusion/signature]
RECAPITULATIF: [résumé des points importants du contrat]
QUESTION: [question finale avant génération]`;

    default:
      return `${baseContext}
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
    const clauseMatch = response.match(/CLAUSE:(.*?)(?=CHAMPS:|QUESTION:|RECAPITULATIF:|$)/s);
    if (clauseMatch && clauseMatch[1]) {
      suggestion.suggestion = clauseMatch[1].trim();
    } else {
      // Si format non respecté, utiliser toute la réponse
      suggestion.suggestion = response.trim();
    }

    // Extraire la question de suivi
    const questionMatch = response.match(/QUESTION:(.*?)(?=$)/s);
    if (questionMatch && questionMatch[1]) {
      suggestion.nextQuestion = questionMatch[1].trim();
    }

    // Extraire les suggestions de champs (si présentes)
    const fieldsMatch = response.match(/CHAMPS:(.*?)(?=QUESTION:|$)/s);
    if (fieldsMatch && fieldsMatch[1]) {
      try {
        // Nettoyer la chaîne JSON avant de la parser
        const cleanJson = fieldsMatch[1].trim().replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
        suggestion.fields = JSON.parse(`{${cleanJson}}`);
      } catch (e) {
        console.warn('Erreur lors du parsing des champs suggérés:', e);
      }
    }

    // Traitement spécial pour l'étape signature (récapitulatif)
    if (step === 'signature') {
      const recapMatch = response.match(/RECAPITULATIF:(.*?)(?=QUESTION:|$)/s);
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
    console.error('Erreur lors du parsing de la réponse IA:', error);
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
    console.error('Erreur lors de la mise à jour de l\'historique:', error);
  }
}

// Exporter les types Firebase pour les utiliser dans ce fichier
interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: admin.firestore.Timestamp;
}

// Interfaces de base pour le typage
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

interface AISuggestion {
  suggestion: string;
  fields?: Record<string, unknown>;
  nextQuestion?: string;
} 