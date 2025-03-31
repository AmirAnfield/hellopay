import { getApps, initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Vérifie si les apps sont déjà initialisées
const apps = getApps();

// Fonction pour récupérer les informations de service account depuis les variables d'environnement
const getServiceAccount = (): ServiceAccount => {
  try {
    // Si la variable est un JSON stringifié, on la parse
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) as ServiceAccount;
    }
    
    // Si non, on crée un objet à partir des variables d'environnement individuelles
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    };
  } catch (error) {
    console.error('Erreur lors du parsing du service account:', error);
    throw new Error('Configuration Firebase Admin invalide');
  }
};

// Initialiser l'application si ce n'est pas déjà fait
if (!apps.length) {
  initializeApp({
    credential: cert(getServiceAccount()),
  });
}

// Exporter l'instance d'authentification
const auth = getAuth();

export { auth }; 