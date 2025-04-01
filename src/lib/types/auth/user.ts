/**
 * Types pour l'authentification et les utilisateurs
 * Partie du projet d'uniformisation des types (MVP 0.24)
 */

/**
 * Rôle utilisateur dans l'application
 */
export type UserRole = 'user' | 'admin' | 'accountant';

/**
 * Types de plan tarifaire
 */
export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';

/**
 * Interface de base pour les utilisateurs
 */
export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole;
  emailVerified?: Date | null;
}

/**
 * Type pour le modèle de données de la base de données
 */
export interface UserModel extends User {
  password?: string; // Hachage du mot de passe, pas présent dans la version front-end
  createdAt: Date;
  updatedAt: Date;
  
  // Informations supplémentaires
  phoneNumber?: string | null;
  lastLogin?: Date | null;
  
  // Abonnement
  subscriptionPlan?: SubscriptionPlan | null;
  subscriptionStatus?: 'active' | 'canceled' | 'expired' | 'trial' | null;
  subscriptionExpiresAt?: Date | null;
  customerId?: string | null; // ID client système de paiement
}

/**
 * DTO pour la création d'un utilisateur (inscription)
 */
export interface RegisterRequestDTO {
  email: string;
  password: string;
  name?: string;
  acceptTerms: boolean;
}

/**
 * DTO pour la connexion
 */
export interface LoginRequestDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Informations de session utilisateur
 */
export interface UserSession {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: UserRole;
  };
  expires: string; // ISO date string
  emailVerified: boolean;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStatus?: 'active' | 'canceled' | 'expired' | 'trial';
}

/**
 * DTO pour la réponse contenant un utilisateur
 */
export interface UserResponseDTO {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string; // ISO date string
  
  // Informations d'abonnement
  subscription?: {
    plan: SubscriptionPlan;
    status: 'active' | 'canceled' | 'expired' | 'trial';
    expiresAt?: string; // ISO date string
  };
  
  // Statistiques
  companyCount?: number;
  employeeCount?: number;
  payslipCount?: number;
}

/**
 * Type pour les données de formulaire de profil utilisateur
 */
export interface UserProfileFormData {
  name: string;
  email: string;
  phoneNumber: string;
  // Le mot de passe est géré séparément
}

/**
 * Type pour les données de formulaire de changement de mot de passe
 */
export interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
} 