import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Exporter les fonctions requises pour la gestion des cookies de session
export async function createSessionCookie(idToken: string, expiresIn: number) {
  try {
    const app = getOrInitializeApp();
    const auth = getAuth(app);
    return await auth.createSessionCookie(idToken, { expiresIn });
  } catch (error) {
    console.error('Erreur lors de la création du cookie de session:', error);
    throw new Error('Échec de la création du cookie de session');
  }
}

export async function verifyIdToken(token: string) {
  try {
    const app = getOrInitializeApp();
    const auth = getAuth(app);
    return await auth.verifyIdToken(token);
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    throw new Error('Token invalide ou expiré');
  }
}

export function getOrInitializeApp() {
  // Si l'app est déjà initialisée, ne pas la réinitialiser
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Variables d'environnement pour l'authentification
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  // Vérifier si nous sommes en développement
  const isDev = process.env.NODE_ENV === 'development';
  
  // Vérifier si les émulateurs doivent être utilisés
  const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';
  
  // En développement, initialiser sans credentials pour les émulateurs
  if (isDev) {
    try {
      // Initialiser l'application Firebase Admin avec une configuration minimale
      const app = initializeApp({
        projectId
      }, 'admin-app');
      
      // Si les émulateurs sont activés, configurer les connexions
      if (useEmulators) {
        const firestorePort = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT || '8080';
        const firestore = getFirestore(app);
        firestore.settings({
          host: `localhost:${firestorePort}`,
          ssl: false
        });
      }
      
      return app;
    } catch (error: unknown) {
      console.error('Erreur lors de l\'initialisation en mode développement:', error);
      throw new Error(`Impossible d'initialiser Firebase Admin: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // En production, essayer différentes méthodes d'authentification
  
  // Méthode 1: Utiliser des variables d'environnement individuelles
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    try {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
    } catch (error: unknown) {
      console.error('Erreur lors de l\'initialisation avec les variables individuelles:', error);
    }
  } 
  
  // Méthode 2: Utiliser le JSON stringifié du compte de service
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      return initializeApp({
        credential: cert(serviceAccount)
      });
    } catch (error: unknown) {
      console.error('Erreur lors du parsing du JSON du compte de service:', error);
    }
  }
  
  // Si on arrive ici, c'est qu'aucune méthode n'a fonctionné
  throw new Error('Impossible d\'initialiser Firebase Admin: configuration manquante ou invalide');
} 