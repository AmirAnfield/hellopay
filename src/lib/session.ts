import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

/**
 * Récupère l'utilisateur actuellement connecté de manière synchrone
 * @returns L'utilisateur actuellement connecté ou null
 */
export function getCurrentUserSync() {
  return auth.currentUser;
}

/**
 * Récupère l'utilisateur connecté de manière asynchrone
 * @returns Promise avec l'utilisateur ou null
 */
export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve, reject) => {
    // Obtenir l'utilisateur actuel immédiatement s'il est déjà connecté
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe(); // Se désabonner immédiatement
        resolve(user);
      },
      reject
    );
  });
}

/**
 * Vérifie si l'utilisateur est connecté de manière asynchrone
 * @returns Promise<boolean> indiquant si un utilisateur est connecté
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Obtient l'ID de l'utilisateur actuel
 * @returns ID de l'utilisateur ou null si aucun utilisateur n'est connecté
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user ? user.uid : null;
}

/**
 * Vérifie si l'email de l'utilisateur est vérifié
 * @returns true si l'email est vérifié, false sinon ou si non connecté
 */
export async function isEmailVerified(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user?.emailVerified;
}

/**
 * Vérifie si un utilisateur a le rôle admin
 * Nécessite des claims personnalisés dans Firebase Auth
 * @returns Promise<boolean> indiquant si l'utilisateur est admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) return false;
  
  try {
    // Récupérer les claims personnalisés
    const idTokenResult = await user.getIdTokenResult();
    return !!idTokenResult.claims.admin;
  } catch (error) {
    console.error('Erreur lors de la vérification des droits admin:', error);
    return false;
  }
}

/**
 * Vérifie si deux ID utilisateurs sont identiques
 * @param userId1 Premier ID
 * @param userId2 Second ID
 * @returns true si les IDs sont identiques et non vides
 */
export function isSameUser(userId1: string, userId2: string): boolean {
  if (!userId1 || !userId2) return false;
  return userId1 === userId2;
}
