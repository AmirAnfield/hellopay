import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  sendEmailVerification,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence
} from 'firebase/auth';

/**
 * Connecte un utilisateur avec son email et mot de passe
 * @param email - L'email de l'utilisateur
 * @param password - Le mot de passe de l'utilisateur
 * @param rememberMe - Définit si la session doit persister après fermeture du navigateur
 * @returns Les informations de l'utilisateur connecté
 */
export async function signIn(email: string, password: string, rememberMe: boolean = false) {
  try {
    // Définir le type de persistance selon le choix de l'utilisateur
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    
    // Connexion à Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Erreur de connexion:', error);
    
    // Traduire les codes d'erreur Firebase en messages plus conviviaux
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Identifiants incorrects');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Trop de tentatives échouées. Veuillez réessayer plus tard.');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('Ce compte a été désactivé');
    } else {
      throw new Error('Erreur de connexion. Veuillez réessayer.');
    }
  }
}

/**
 * Déconnecte l'utilisateur actuel
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    throw error;
  }
}

/**
 * Inscription d'un nouvel utilisateur
 * @param email - L'email du nouvel utilisateur
 * @param password - Le mot de passe du nouvel utilisateur
 * @param displayName - Le nom à afficher (optionnel)
 * @returns Les informations de l'utilisateur créé
 */
export async function signUp(email: string, password: string, displayName?: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Mettre à jour le profil si un nom d'affichage est fourni
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    // Envoyer un email de vérification
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
    }
    
    return userCredential.user;
  } catch (error: any) {
    console.error('Erreur d\'inscription:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Cet email est déjà utilisé');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Email invalide');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Le mot de passe est trop faible');
    } else {
      throw new Error('Erreur lors de l\'inscription');
    }
  }
}

/**
 * Envoi d'un email de réinitialisation de mot de passe
 * @param email - L'email de l'utilisateur
 */
export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
    
    if (error.code === 'auth/user-not-found') {
      throw new Error('Aucun compte associé à cet email');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Email invalide');
    } else {
      throw new Error('Erreur lors de l\'envoi de l\'email');
    }
  }
}

/**
 * Confirme la réinitialisation du mot de passe avec le code reçu par email
 * @param code - Le code de réinitialisation
 * @param newPassword - Le nouveau mot de passe
 */
export async function confirmResetPassword(code: string, newPassword: string) {
  try {
    await verifyPasswordResetCode(auth, code);
    await confirmPasswordReset(auth, code, newPassword);
  } catch (error: any) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    
    if (error.code === 'auth/invalid-action-code') {
      throw new Error('Le code de réinitialisation est invalide ou a expiré');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Le mot de passe est trop faible');
    } else {
      throw new Error('Erreur lors de la réinitialisation du mot de passe');
    }
  }
}

/**
 * Modifie le mot de passe de l'utilisateur connecté
 * @param currentPassword - Mot de passe actuel
 * @param newPassword - Nouveau mot de passe
 */
export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    const user = auth.currentUser;
    
    if (!user || !user.email) {
      throw new Error('Utilisateur non connecté');
    }
    
    // Réauthentifier l'utilisateur avant de changer le mot de passe
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Mettre à jour le mot de passe
    await updatePassword(user, newPassword);
  } catch (error: any) {
    console.error('Erreur lors du changement de mot de passe:', error);
    
    if (error.code === 'auth/wrong-password') {
      throw new Error('Mot de passe actuel incorrect');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Le nouveau mot de passe est trop faible');
    } else {
      throw new Error('Erreur lors du changement de mot de passe');
    }
  }
}

/**
 * Obtient l'utilisateur actuellement connecté
 * @returns L'utilisateur connecté ou null
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Vérifie si un utilisateur est connecté
 * @returns true si un utilisateur est connecté, false sinon
 */
export function isAuthenticated() {
  return !!auth.currentUser;
}

/**
 * Vérifie si l'email de l'utilisateur est vérifié
 * @returns true si l'email est vérifié, false sinon
 */
export function isEmailVerified() {
  const user = auth.currentUser;
  return !!user?.emailVerified;
}

// Export de l'instance auth pour utilisation directe si nécessaire
export { auth };
