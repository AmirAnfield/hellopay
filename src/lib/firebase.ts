import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

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

// Initialiser Analytics seulement côté client
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, analytics }; 