import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  User,
  UserCredential,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, firestore } from './config';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Crée un nouvel utilisateur avec email et mot de passe
 * @param email Email de l'utilisateur
 * @param password Mot de passe
 * @param userData Données supplémentaires pour le profil utilisateur
 */
export async function registerUser(
  email: string, 
  password: string, 
  userData: { 
    firstName: string; 
    lastName: string; 
    role?: string;
  }
): Promise<UserCredential> {
  try {
    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;
    
    // Mettre à jour le profil avec le nom complet
    await updateProfile(user, {
      displayName: `${userData.firstName} ${userData.lastName}`,
    });

    // Créer un document utilisateur dans Firestore
    await setDoc(doc(firestore, 'users', user.uid), {
      email: user.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return userCredential;
  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    throw error;
  }
}

/**
 * Connecte un utilisateur avec email et mot de passe
 * @param email Email de l'utilisateur
 * @param password Mot de passe
 */
export async function loginUser(email: string, password: string): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
}

/**
 * Déconnecte l'utilisateur actuel
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    throw error;
  }
}

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param email Email de l'utilisateur
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
    throw error;
  }
}

/**
 * Met à jour le mot de passe de l'utilisateur actuel
 * @param newPassword Nouveau mot de passe
 */
export async function changePassword(newPassword: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Aucun utilisateur connecté');
    
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error);
    throw error;
  }
}

/**
 * Met à jour le profil de l'utilisateur actuel
 * @param profileData Données du profil à mettre à jour
 */
export async function updateUserProfile(profileData: {
  displayName?: string;
  photoURL?: string;
}): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Aucun utilisateur connecté');
    
    await updateProfile(user, profileData);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    throw error;
  }
}

/**
 * Surveille les changements d'état d'authentification
 * @param callback Fonction à appeler lorsque l'état d'authentification change
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Récupère l'utilisateur actuellement connecté
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
} 