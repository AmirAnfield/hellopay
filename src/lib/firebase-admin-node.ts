// firebase-admin-node.ts
// Version Node.js compatible de l'authentification Firebase Admin

import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Configuration de Firebase Admin pour l'environnement serveur
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
);

// Initialiser l'app Firebase Admin si elle n'est pas déjà initialisée
if (!getApps().length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
    console.log('Firebase Admin initialisé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Firebase Admin:', error);
  }
}

/**
 * Vérifie un cookie de session Firebase et retourne les données décodées
 * @param sessionCookie - Le cookie de session à vérifier
 * @returns Les données utilisateur décodées ou null en cas d'erreur
 */
export async function verifySessionCookie(sessionCookie: string) {
  if (!sessionCookie || sessionCookie === 'undefined' || sessionCookie === 'null') {
    console.warn('Cookie de session invalide ou manquant');
    return null;
  }

  try {
    const decodedClaims = await admin.auth().verifySessionCookie(
      sessionCookie,
      true // Vérifier si la session est révoquée
    );
    return decodedClaims;
  } catch (error: any) {
    // Gérer les différents types d'erreurs Firebase
    if (error.code === 'auth/session-cookie-expired') {
      console.warn('Cookie de session expiré');
    } else if (error.code === 'auth/session-cookie-revoked') {
      console.warn('Cookie de session révoqué');
    } else if (error.code === 'auth/argument-error' || error.code === 'auth/invalid-session-cookie') {
      console.warn('Format de cookie de session invalide');
    } else {
      console.error('Erreur inattendue lors de la vérification du cookie de session:', error);
    }
    return null;
  }
}

/**
 * Vérifie un ID token Firebase
 * @param idToken - Le token à vérifier
 * @returns Les données utilisateur décodées
 */
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Erreur lors de la vérification du token ID:', error);
    throw error;
  }
}

/**
 * Crée un cookie de session à partir d'un ID token
 * @param idToken - Le token à convertir en cookie de session
 * @param expiresIn - Durée de validité du cookie en millisecondes
 * @returns Le cookie de session
 */
export async function createSessionCookie(idToken: string, expiresIn = 60 * 60 * 24 * 5 * 1000) {
  try {
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
    return sessionCookie;
  } catch (error) {
    console.error('Erreur lors de la création du cookie de session:', error);
    throw error;
  }
}

/**
 * Vérifie un token d'authentification d'email
 * @param actionCode - Le code d'action pour la vérification
 * @returns Indique si la vérification a réussi
 */
export async function verifyEmailToken(actionCode: string) {
  try {
    // Dans Firebase Admin, nous pouvons juste vérifier le token et le considérer comme validé
    // La vérification du mot de passe se fait côté client avec Firebase Auth JS SDK
    await admin.auth().verifyIdToken(actionCode);
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return false;
  }
}

// Exportation de l'instance admin pour d'autres utilisations si nécessaire
export { admin }; 