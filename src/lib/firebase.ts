import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Configuration Firebase avec les paramètres officiels fournis
const firebaseConfig = {
  apiKey: "AIzaSyAb-L8tLHH1iiMEW7MCHHpIsupcfokINRo",
  authDomain: "hellopay-a852d.firebaseapp.com",
  projectId: "hellopay-a852d",
  storageBucket: "hellopay-a852d.firebasestorage.app",
  messagingSenderId: "1078999750007",
  appId: "1:1078999750007:web:839687e47416fde29ebd72",
  measurementId: "G-1GPDHBPSBB"
};

console.log("🔥 Firebase Config:", {
  apiKey: firebaseConfig.apiKey.substring(0, 8) + '...',
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket
});

// Initialiser Firebase uniquement si ce n'est pas déjà fait
let app;
try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log("🔥 Firebase initialisé avec succès");
  } else {
    app = getApps()[0];
    console.log("🔥 Firebase déjà initialisé");
  }
} catch (error) {
  console.error("🚫 Erreur lors de l'initialisation de Firebase:", error);
  throw new Error("Échec de l'initialisation de Firebase");
}

// Initialiser les services Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

console.log("🔥 Services Firebase initialisés");

// Initialiser AppCheck seulement côté client en production
let appCheck = null;
if (typeof window !== 'undefined') {
  try {
    // Désactiver complètement App Check en développement pour éviter les erreurs
    if (process.env.NODE_ENV === 'development') {
      console.log('App Check désactivé en environnement de développement');
    } else {
      // Initialiser App Check uniquement en production
      const recaptchaSiteKey = "6LdUnwUrAAAAAL3u-4zxXrmXOCLMBEVLjkkd2Y4_";
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true
      });
      console.log('Firebase App Check initialisé avec reCAPTCHA v3');
    }
  } catch (error) {
    console.error('Échec de l\'initialisation d\'App Check:', error);
  }
}

// Initialiser Analytics seulement côté client en production
let analytics = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  analytics = getAnalytics(app);
}

export { app, auth, db, functions, storage, analytics, appCheck }; 