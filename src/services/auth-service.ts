import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

/**
 * Interface pour les données utilisateur
 */
export interface UserData {
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phone?: string;
  photoURL?: string;
  role?: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Inscrire un nouvel utilisateur
 */
export const registerUser = async (email: string, password: string, userData: Partial<UserData>): Promise<UserCredential> => {
  // Créer l'utilisateur dans Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = userCredential;

  // Envoyer un email de vérification
  await sendEmailVerification(user);

  // Créer le document utilisateur dans Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    displayName: userData.displayName || '',
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    companyName: userData.companyName || '',
    phone: userData.phone || '',
    photoURL: userData.photoURL || '',
    role: userData.role || 'user',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return userCredential;
};

/**
 * Connecter un utilisateur existant
 */
export const loginUser = async (email: string, password: string): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email, password);
};

/**
 * Connecter avec Google
 */
export const loginWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  // Vérifier si c'est un nouvel utilisateur
  const userDoc = await getDoc(doc(db, 'users', result.user.uid));
  
  // Si l'utilisateur n'existe pas dans Firestore, le créer
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      email: result.user.email,
      emailVerified: result.user.emailVerified,
      displayName: result.user.displayName || '',
      firstName: '',
      lastName: '',
      companyName: '',
      phone: '',
      photoURL: result.user.photoURL || '',
      role: 'user',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  return result;
};

/**
 * Déconnecter l'utilisateur actuel
 */
export const logoutUser = async (): Promise<void> => {
  // Supprimer le cookie de session
  await fetch('/api/auth/logout', {
    method: 'POST'
  });
  
  // Déconnecter de Firebase
  await signOut(auth);
};

/**
 * Envoyer un email de réinitialisation de mot de passe
 */
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

/**
 * Confirmer la réinitialisation du mot de passe avec le code reçu par email
 */
export const confirmPasswordResetWithCode = async (oobCode: string, newPassword: string): Promise<void> => {
  await confirmPasswordReset(auth, oobCode, newPassword);
};

/**
 * Modifier le mot de passe de l'utilisateur connecté
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('Utilisateur non connecté');
  }

  // Réauthentifier l'utilisateur
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  
  // Changer le mot de passe
  await updatePassword(user, newPassword);
};

/**
 * Mettre à jour l'email de l'utilisateur
 */
export const updateUserEmail = async (newEmail: string, password: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('Utilisateur non connecté');
  }

  // Réauthentifier l'utilisateur
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
  
  // Mettre à jour l'email
  await updateEmail(user, newEmail);
  
  // Mettre à jour le document Firestore
  await updateDoc(doc(db, 'users', user.uid), {
    email: newEmail,
    updatedAt: serverTimestamp()
  });
  
  // Envoyer un nouvel email de vérification
  await sendEmailVerification(user);
};

/**
 * Renvoyer l'email de vérification
 */
export const resendVerificationEmail = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Utilisateur non connecté');
  }
  
  await sendEmailVerification(user);
};

/**
 * Obtenir les données utilisateur depuis Firestore
 */
export const getUserData = async (userId: string): Promise<UserData | null> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  
  if (!userDoc.exists()) {
    return null;
  }
  
  return userDoc.data() as UserData;
};

/**
 * Mettre à jour le profil utilisateur dans Firestore
 */
export const updateUserProfile = async (userId: string, userData: Partial<UserData>): Promise<void> => {
  await updateDoc(doc(db, 'users', userId), {
    ...userData,
    updatedAt: serverTimestamp()
  });
};

/**
 * Vérifier si l'utilisateur est connecté
 */
export const isUserLoggedIn = (): boolean => {
  return !!auth.currentUser;
};

/**
 * Obtenir l'utilisateur actuellement connecté
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Vérifier si l'email de l'utilisateur est vérifié
 */
export const isEmailVerified = (): boolean => {
  const user = auth.currentUser;
  return !!user && user.emailVerified;
}; 