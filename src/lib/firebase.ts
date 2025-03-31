import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: "AIzaSyAb-L8tLHH1iiMEW7MCHHpIsupcfokINRo",
  authDomain: "hellopay-a852d.firebaseapp.com",
  projectId: "hellopay-a852d",
  storageBucket: "hellopay-a852d.firebasestorage.app",
  messagingSenderId: "1078999750007",
  appId: "1:1078999750007:web:839687e47416fde29ebd72",
  measurementId: "G-1GPDHBPSBB"
};

// Initialiser Firebase uniquement si ce n'est pas déjà fait
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Initialiser AppCheck seulement côté client
let appCheck = null;
if (typeof window !== 'undefined') {
  // Activer le mode debug en développement
  if (process.env.NODE_ENV === 'development') {
    // @ts-ignore
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  
  // Initialiser AppCheck avec reCAPTCHA v3
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6Le6fHspAAAAAMqSO3LZOqDYz0ZDEBTivwPxI0QZ'), // Clé site web reCAPTCHA v3
    isTokenAutoRefreshEnabled: true // Renouvellement automatique des tokens
  });
}

// Initialiser Analytics seulement côté client
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, analytics, appCheck }; 