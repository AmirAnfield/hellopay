import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Vérifier si Firebase Admin est déjà initialisé
const apps = getApps();

// Initialiser Firebase Admin s'il n'est pas déjà initialisé
export const admin = apps.length
  ? apps[0]
  : initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Remplacer les caractères d'échappement dans la clé privée
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

// Exporter les instances des services Firebase Admin
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage(); 