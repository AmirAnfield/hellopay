// Exporter tous les services Firebase depuis le fichier de configuration
export { firebaseApp, auth, firestore, storage, functions } from './config';

// Exporter les services d'authentification si nécessaire
export * from './auth';

// Exporter les services Firestore personnalisés si nécessaire
export * from './firestore';

// Exporter les services Storage si nécessaire
export * from './storage'; 