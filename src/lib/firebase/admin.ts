import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export function getOrInitializeApp() {
  // Si l'app est déjà initialisée, ne pas la réinitialiser
  if (getApps().length > 0) {
    console.log('Firebase Admin déjà initialisé, réutilisation de l\'instance existante');
    return getApps()[0];
  }

  // Variables d'environnement pour l'authentification
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  console.log('ProjectID trouvé:', projectId ? 'Oui' : 'Non');
  
  // Vérifier si nous sommes en développement
  const isDev = process.env.NODE_ENV === 'development';
  console.log('Environnement de développement:', isDev ? 'Oui' : 'Non');
  
  // Vérifier si les émulateurs doivent être utilisés
  const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';
  console.log('Utilisation des émulateurs Firebase:', useEmulators ? 'Oui' : 'Non');
  
  // En développement, initialiser sans credentials pour les émulateurs
  if (isDev) {
    console.log('Initialisation en mode développement');
    try {
      // Initialiser l'application Firebase Admin avec une configuration minimale
      const app = initializeApp({
        projectId
      }, 'admin-app');
      
      // Si les émulateurs sont activés, configurer les connexions
      if (useEmulators) {
        const firestorePort = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT || '8080';
        console.log(`Connexion à l'émulateur Firestore sur le port ${firestorePort}`);
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
  console.log('Initialisation en mode production');
  
  // Méthode 1: Utiliser des variables d'environnement individuelles
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  console.log('ClientEmail trouvé:', clientEmail ? 'Oui' : 'Non');
  
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  console.log('PrivateKey trouvé:', privateKey ? 'Oui' : 'Non');

  if (projectId && clientEmail && privateKey) {
    console.log('Initialisation avec les variables d\'environnement individuelles');
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
  console.log('ServiceAccountJson trouvé:', serviceAccountJson ? 'Oui' : 'Non');
  
  if (serviceAccountJson) {
    console.log('Initialisation avec le JSON du compte de service');
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