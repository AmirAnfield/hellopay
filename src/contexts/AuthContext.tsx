import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  UserCredential,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';

// Types
type AuthContextType = {
  currentUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (email: string, password: string, name?: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateSession: () => Promise<boolean>; // Pour mettre à jour le cookie de session
};

// Créer le contexte
const AuthContext = createContext<AuthContextType | null>(null);

// Hook personnalisé pour utiliser le contexte d'auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}

// Props du provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider
export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Connexion
  const login = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
      .then(async (result) => {
        // Mettre à jour le cookie de session
        await updateSession();
        return result;
      });
  };

  // Inscription
  const register = async (email: string, password: string, name?: string) => {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (result) => {
        // Mettre à jour le profil avec le nom si fourni
        if (name && result.user) {
          await updateProfile(result.user, { displayName: name });
        }
        
        // Mettre à jour le cookie de session
        await updateSession();
        return result;
      });
  };

  // Déconnexion
  const logout = async () => {
    // D'abord supprimer le cookie côté serveur
    await fetch('/api/auth/logout', { method: 'POST' });
    // Puis déconnecter Firebase
    return firebaseSignOut(auth);
  };

  // Réinitialisation de mot de passe
  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Mettre à jour le cookie de session côté serveur
  const updateSession = async () => {
    try {
      const token = await auth.currentUser?.getIdToken(true);
      if (!token) {
        console.warn('Pas de token disponible - utilisateur probablement déconnecté');
        return false;
      }

      // Envoyer le token au serveur pour créer un cookie de session
      try {
        const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: token }),
        });

        if (!response.ok) {
          console.warn('Problème de mise à jour de session:', response.status, response.statusText);
          // Ne pas lever d'erreur, juste logger
          return false;
        }
        
        return true;
      } catch (fetchError) {
        console.error('Erreur de communication avec le serveur:', fetchError);
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la session:', error);
      // Ne pas afficher de toast systématiquement pour éviter de perturber l'expérience utilisateur
      // Le forcer à se reconnecter uniquement en cas d'erreur critique
      if (error instanceof Error && error.message.includes('auth/id-token-expired')) {
        toast({
          variant: 'destructive',
          title: 'Session expirée',
          description: 'Votre session a expiré. Veuillez vous reconnecter.',
        });
        
        // Déconnecter l'utilisateur si le token est expiré
        await auth.signOut();
      }
      
      return false;
    }
  };

  // Surveiller l'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // Si l'utilisateur est connecté, mettre à jour la session
      if (user) {
        await updateSession();
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Valeur du contexte
  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateSession
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
} 