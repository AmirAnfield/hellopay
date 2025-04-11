/**
 * Importations optimisées pour Firebase
 * 
 * Ce fichier centralise les imports Firebase pour :
 * 1. Réduire la taille du bundle en évitant d'importer tout firebase/app
 * 2. Assurer une cohérence dans les imports à travers l'application
 * 3. Fournir une interface unifiée pour les fonctionnalités Firebase
 */

// Auth
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// Firestore
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter 
} from 'firebase/firestore';

// Storage
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  uploadString, 
  getDownloadURL, 
  deleteObject,
  listAll,
  getMetadata
} from 'firebase/storage';

// Firebase Functions
import { getFunctions, httpsCallable } from 'firebase/functions';

// App
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Réexporter les fonctions et objets Firebase
export {
  // Auth
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  
  // Firestore
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  
  // Storage
  getStorage,
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  
  // Functions
  getFunctions,
  httpsCallable,
  
  // App
  initializeApp,
  
  // Analytics
  getAnalytics,
  logEvent
};

/**
 * Configuration Firebase
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

/**
 * Initialise Firebase et retourne les services
 */
export function initFirebase() {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const storage = getStorage(app);
    const functions = getFunctions(app, 'europe-west1');
    
    // Analytics uniquement côté client
    let analytics = null;
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔥 Firebase initialisé avec le projet:', firebaseConfig.projectId);
    }
    
    return { app, auth, firestore, storage, functions, analytics };
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Firebase:', error);
    throw error;
  }
}

// Initialiser Firebase et exporter les services
export const { app, auth, firestore, storage, functions, analytics } = initFirebase(); 