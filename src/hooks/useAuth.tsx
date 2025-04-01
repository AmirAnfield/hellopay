"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import * as authService from "@/services/auth-service";

// Type pour le contexte d'authentification
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isEmailVerified: boolean;
  registerUser: (email: string, password: string, userData: authService.UserData) => Promise<void>;
  loginUser: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserEmail: (newEmail: string, password: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

// Création du contexte d'authentification
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}

// Propriétés du provider d'authentification
interface AuthProviderProps {
  children: ReactNode;
}

// Provider d'authentification
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Effet pour écouter les changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Erreur d'authentification:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    // Se désabonner lorsque le composant est démonté
    return () => unsubscribe();
  }, []);

  // Inscription d'un nouvel utilisateur
  const registerUser = async (email: string, password: string, userData: authService.UserData) => {
    try {
      setLoading(true);
      await authService.registerUser(email, password, userData);
      toast.success("Compte créé avec succès! Vérifiez votre email pour activer votre compte.");
      router.push("/auth/login");
    } catch (error: any) {
      setError(error.message);
      toast.error(`Erreur d'inscription: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Connexion d'un utilisateur existant
  const loginUser = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await authService.loginUser(email, password);
      
      // Créer un cookie de session côté serveur
      const idToken = await userCredential.user.getIdToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      
      setUser(userCredential.user);
      toast.success("Connexion réussie");
    } catch (error: any) {
      setError(error.message);
      toast.error(`Erreur de connexion: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Connexion avec Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const userCredential = await authService.loginWithGoogle();
      
      // Créer un cookie de session côté serveur
      const idToken = await userCredential.user.getIdToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      
      setUser(userCredential.user);
      toast.success("Connexion avec Google réussie");
    } catch (error: any) {
      setError(error.message);
      toast.error(`Erreur de connexion avec Google: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion de l'utilisateur
  const logoutUser = async () => {
    try {
      setLoading(true);
      
      // Supprimer le cookie de session côté serveur
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Déconnecter de Firebase
      await authService.logoutUser();
      
      setUser(null);
      toast.success("Déconnexion réussie");
      router.push("/auth/login");
    } catch (error: any) {
      setError(error.message);
      toast.error(`Erreur de déconnexion: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Réinitialisation du mot de passe
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      await authService.resetPassword(email);
      toast.success("Email de réinitialisation envoyé");
    } catch (error: any) {
      setError(error.message);
      toast.error(`Erreur de réinitialisation: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Modification du mot de passe
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      await authService.changePassword(currentPassword, newPassword);
      toast.success("Mot de passe modifié avec succès");
    } catch (error: any) {
      setError(error.message);
      toast.error(`Erreur de modification du mot de passe: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour de l'email
  const updateUserEmail = async (newEmail: string, password: string) => {
    try {
      setLoading(true);
      await authService.updateUserEmail(newEmail, password);
      toast.success("Email mis à jour. Vérifiez votre nouvel email pour le confirmer.");
    } catch (error: any) {
      setError(error.message);
      toast.error(`Erreur de mise à jour de l'email: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Renvoi de l'email de vérification
  const resendVerificationEmail = async () => {
    try {
      setLoading(true);
      await authService.resendVerificationEmail();
      toast.success("Email de vérification renvoyé");
    } catch (error: any) {
      setError(error.message);
      toast.error(`Erreur d'envoi de l'email: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isEmailVerified = user ? user.emailVerified : false;

  // Valeur du contexte
  const value = {
    user,
    loading,
    error,
    isEmailVerified,
    registerUser,
    loginUser,
    loginWithGoogle,
    logoutUser,
    resetPassword,
    changePassword,
    updateUserEmail,
    resendVerificationEmail
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Exportation du Provider et du hook pour une utilisation facile
export default useAuth; 