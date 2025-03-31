import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, ReCaptchaV3Provider } from 'firebase/app-check';

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
    // @ts-expect-error - Propriété Firebase App Check Debug Token
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  
  // Initialiser AppCheck avec reCAPTCHA Enterprise
  try {
    // Utiliser reCAPTCHA Enterprise pour une sécurité renforcée
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider('6LdUnwUrAAAAAL3u-4zxXrmXOCLMBEVLjkkd2Y4_'),
      isTokenAutoRefreshEnabled: true
    });
    console.log('App Check initialisé avec reCAPTCHA Enterprise');
  } catch (error) {
    // Fallback vers reCAPTCHA v3 standard si enterprise échoue
    console.warn('Erreur lors de l\'initialisation de reCAPTCHA Enterprise:', error);
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('6LdUnwUrAAAAAL3u-4zxXrmXOCLMBEVLjkkd2Y4_'),
        isTokenAutoRefreshEnabled: true
      });
      console.log('App Check initialisé avec reCAPTCHA V3 (fallback)');
    } catch (fallbackError) {
      console.error('Échec complet de l\'initialisation d\'App Check:', fallbackError);
    }
  }
}

// Initialiser Analytics seulement côté client
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, analytics, appCheck }; 