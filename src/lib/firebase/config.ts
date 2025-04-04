import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions, type Functions } from 'firebase/functions';

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Types pour notre interface Firebase
interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
  functions: Functions;
}

// Interface minimale pour Firestore mock
interface FirestoreMock {
  collection: (collectionPath: string) => any;
}

// Création de mock objects pour le SSR
const createMockFirebaseServices = (): FirebaseServices => {
  const mockServices = {} as unknown as FirebaseServices;
  
  // Ajouter les méthodes nécessaires à Firestore pour éviter les erreurs
  const mockFirestore = {} as unknown as FirestoreMock;
  mockServices.firestore = mockFirestore as any;
  
  mockFirestore.collection = () => ({
    doc: () => ({
      get: async () => ({
        exists: () => false,
        data: () => null
      }),
      set: async () => {}
    }),
    where: () => ({
      get: async () => ({
        empty: true,
        docs: []
      })
    })
  });
  
  return mockServices;
};

// Initialisation côté client OU utilisation de mocks côté serveur
const services = createMockFirebaseServices();
let { firebaseApp, auth, firestore, storage, functions } = services;

// Initialisation réelle uniquement côté client
if (typeof window !== 'undefined') {
  try {
    // Initialiser l'application Firebase
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

    // Initialiser les services
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
    functions = getFunctions(firebaseApp, 'europe-west1');

    console.log('Firebase initialisé en mode client');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Firebase:', error);
  }
} else {
  console.log('Firebase en mode SSR (mocks utilisés)');
}

export { firebaseApp, auth, firestore, storage, functions }; 