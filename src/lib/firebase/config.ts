/**
 * Configuration centralisée de Firebase
 * 
 * Ce fichier est le point d'entrée unique pour toutes les configurations Firebase.
 * Toutes les autres parties du code doivent importer les services depuis ce fichier
 * plutôt que d'initialiser leurs propres connexions.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialiser Firebase uniquement si ce n'est pas déjà fait
const apps = getApps();
export const app = apps.length ? apps[0] : initializeApp(firebaseConfig);

// Initialiser les services Firebase
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialiser Analytics et AppCheck uniquement côté client en production
let analytics = null;
let appCheck = null;

if (typeof window !== 'undefined') {
  // Analytics uniquement en production
  if (process.env.NODE_ENV === 'production') {
    analytics = getAnalytics(app);
  }
  
  // AppCheck uniquement en production
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    });
  }
}

export { analytics, appCheck };

// Log de debug pour le développement
if (process.env.NODE_ENV === 'development') {
} 