// firebase-admin-node.ts
// Version Node.js compatible de l'authentification Firebase Admin

import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Configuration de Firebase Admin pour l'environnement serveur
let serviceAccount;
try {
  // Utiliser un compte de service minimal pour le développement si aucun n'est fourni
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountEnv) {
    serviceAccount = JSON.parse(serviceAccountEnv);
  } else {
    // Compte de service minimal pour le développement
    serviceAccount = {
      type: 'service_account',
      project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'hellopay-a852d',
      private_key_id: 'development',
      private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCqzNt1NKt+VQoo\nzrDj4PGMFB3OT4nc1xqYLvGvEIh7JXIQvEmqc64NCa3KKTCNsCX2mTGRnvHYoMAx\ncxY0mnLoFE4hDdJSGLFXrG8GxWy+SL1/EIX7xDD8KB8rduJgYykZsaJHpWeYE2vz\nR7WmI27kZUU2qjJ5CL+QmBWOvZvepCVJCrDk/NkdJg1BHk8+m10VJf9MG2U47c8V\nLgDklDdtWZKy4yORnm8X0wUwz3fDP8UiMALZZreFNdh3Sgr1qUskNsrA6WHXLZrl\nqwu6v6W5x7e4oDXzInQUeZksQYmwyNA3RKq8U2AJwBF5yZM2a1dwWcQCxDmzXNwk\n8e/H4FzxAgMBAAECggEAFzPNPnNZMUj3jPkf31XhZ+euDMzLFkaClg6rBPFMNUUH\nWWIQtJj/aXZMt4zxvQgWAraV9mFhtBQUqDFYWp/7yWYRRu05hfXUnOZ8CbYQEuDa\nR7dK/e9KqYnKsXPv38J+XKeETZpZT1sZ7DxR/gyNxCJJmS8TW6+GOhqI+nvVGC/Y\nlUm+ZQjcCp7qbP72dgfmYl0WUY+m79RPxVB5uGFWjuR3UC8CZCZb2yjKE9NwuJQM\nvYQct3cXc8L9D/Qzx0K5vPnfV0BNXJaYkzNO58XkPOZnXULWJzEOk/XuKKEeA8+S\n63UXl7yqNjUzLRaEd5FADybYaMADH9ljNQBL+P9lAQKBgQDnHbcTgcFfkSYu+xFA\n1IlNQxa7LKXfifOiJ46D+Jh3hZdXl00zfCK6DmqfskVQdaiXGRpwRs7l4J15jhnv\nCLjwTpEufs8Y2vfA3Hx91gctcK5zLOBgYBK4KsUQBLbpJqYKwabPQzQLZRZVyU5w\n8Mz1NHSu1XdkTu7/0KCY9xrN4QKBgQC9PB4iP7jVTQ3Cxv+ODrIRyJ++G4Wrpzjm\njvTY/1bH4TZi8QQgVGtxdrCxfbXdwUfAQR7MZzrxgYjgMpM1fTuBw4/7fFN++6uX\nx0Rne4m1hNRiKEn5/bLJwAQKGUtDu0zNhJDnrJOvO6ffN+Hf+l3O4Y4tqA3RZ8a8\nINqrD9eMsQKBgERYzrlz9jHTI3YSRoTnJRrTt/TwLvKIKgc0jxcACQJ8F8bwbXWF\nNLpuEbYTjnCZB/XE5nPFUXmyzT2R0Lz4UijmI8+1YJlCQOzk8qCZhfKI59IUzwOh\n2XvJGdlRGcyTfHMPLcPwW8SLLE63tJzXf029YBbdgSUNSVDAVx8UzXlhAoGAYSoK\nSrUpXJEjBgKBKWBnM/h3fKQk9aaKMwQVQXnOv2doyRAsI7k4PSJArPRbTpYT5Ioi\nYMjQSwDKM0gWbcWQWPvSHOPs5NU4/o8cw1G+vBXaX4OhtGkxV4SrSJkS+jDcrRsF\nKD3Hr8FuXbgj7w9e5wmrHVNBM1/lS92tRcHgIrECgYAq0DNRQAe8EH/MLCrymJki\nRVeHzfztRmrAvhPnz9RpEinNYIrblkBRzQvMfgMV2/iIa3aOh33mUABQ4xFnrxLY\ne7nOyZn3Aj8oM0eKpCRgC9NMJb/KzH9VW7hRDmjgVBhEjAjxg5SVbtTbf+S/AVZa\nIw+AFFzKKpMpOZyDDe+ftA==\n-----END PRIVATE KEY-----\n',
      client_email: 'firebase-adminsdk-dev@hellopay-a852d.iam.gserviceaccount.com',
      client_id: 'development',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dev%40hellopay-a852d.iam.gserviceaccount.com',
      universe_domain: 'googleapis.com'
    };
  }
} catch (e) {
  console.error('Erreur de parsing du service account:', e);
  // Compte de service minimal
  serviceAccount = {
    type: 'service_account',
    project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'hellopay-a852d'
  };
}

// Vérification minimum des propriétés requises dans serviceAccount
const projectId = serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Initialiser l'app Firebase Admin si elle n'est pas déjà initialisée
if (!getApps().length) {
  try {
    // En développement, utilisez une configuration minimale
    if (process.env.NODE_ENV === 'development') {
      admin.initializeApp({
        projectId: projectId
      });
      console.log('Firebase Admin initialisé en mode développement avec une configuration minimale');
    } else {
      // En production, utilisez le compte de service complet
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });
      console.log('Firebase Admin initialisé avec succès en mode production');
    }
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