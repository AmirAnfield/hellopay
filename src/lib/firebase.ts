import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAb-L8tLHH1iiMEW7MCHHpIsupcfokINRo",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "hellopay-a852d.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "hellopay-a852d",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "hellopay-a852d.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1078999750007",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1078999750007:web:839687e47416fde29ebd72",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-1GPDHBPSBB"
};

// Clé du site reCAPTCHA v3
const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LdUnwUrAAAAAL3u-4zxXrmXOCLMBEVLjkkd2Y4_";

// Initialiser Firebase uniquement si ce n'est pas déjà fait
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

// Émulateurs pour le développement local
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
  if (typeof window !== 'undefined') {
    // Auth émulateur
    connectAuthEmulator(auth, 'http://localhost:9099');
    
    // Firestore émulateur
    connectFirestoreEmulator(db, 'localhost', 8080);
    
    // Functions émulateur
    connectFunctionsEmulator(functions, 'localhost', 5001);

    // Storage émulateur
    connectStorageEmulator(storage, 'localhost', 9199);
    
    console.log('Émulateurs Firebase connectés en mode développement');
  }
}

// Initialiser AppCheck seulement côté client
let appCheck = null;
if (typeof window !== 'undefined') {
  // Activer le mode debug en développement
  if (process.env.NODE_ENV === 'development') {
    // @ts-expect-error - Propriété pour le debug token d'AppCheck
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN === 'true';
  }
  
  try {
    // Initialiser AppCheck avec reCAPTCHA v3
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true
    });
    console.log('Firebase App Check initialisé avec reCAPTCHA v3');
  } catch (error) {
    console.error('Échec de l\'initialisation d\'App Check:', error);
  }
}

// Initialiser Analytics seulement côté client
let analytics = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  analytics = getAnalytics(app);
}

export { app, auth, db, functions, storage, analytics, appCheck }; 