import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { db as clientDb } from './firestore';

// Vérifier si l'application admin a déjà été initialisée
const apps = getApps();

let firebaseAdmin;
if (!apps.length) {
  try {
    // Initialize avec les variables d'environnement si disponibles
    if (process.env.FIREBASE_ADMIN_PROJECT_ID) {
      firebaseAdmin = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // Initialisation avec un fichier de service si les variables d'environnement ne sont pas disponibles
      // Pour le développement, on peut utiliser les informations de configuration du client
      try {
        const serviceAccount = require('../../../serviceAccountKey.json');
        firebaseAdmin = initializeApp({
          credential: cert(serviceAccount),
        });
      } catch (error) {
        console.error("Erreur lors de l'initialisation de Firebase Admin:", error);
        
        // On arrête la fonction ici pour éviter d'exporter deux fois db
        process.exit(1);
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Firebase Admin:", error);
  }
} else {
  firebaseAdmin = apps[0];
}

// Exporter Firestore
export const db = getFirestore(firebaseAdmin);

// Exporter la référence du client Firestore comme solution de secours
export const clientDb = clientDb; 