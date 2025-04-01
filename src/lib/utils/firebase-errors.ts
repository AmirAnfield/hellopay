import { FirebaseError } from 'firebase/app';

/**
 * Traduction des erreurs Firebase Auth en messages compréhensibles pour l'utilisateur
 */
export const firebaseErrorMessages: Record<string, string> = {
  // Erreurs d'authentification
  'auth/email-already-in-use': 'Cette adresse email est déjà utilisée par un autre compte.',
  'auth/invalid-email': 'L\'adresse email est invalide.',
  'auth/user-disabled': 'Ce compte utilisateur a été désactivé.',
  'auth/user-not-found': 'Aucun utilisateur ne correspond à cet email.',
  'auth/wrong-password': 'Le mot de passe est incorrect.',
  'auth/invalid-credential': 'Les identifiants de connexion sont incorrects.',
  'auth/operation-not-allowed': 'Cette opération n\'est pas autorisée.',
  'auth/weak-password': 'Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.',
  'auth/requires-recent-login': 'Cette opération nécessite une authentification récente. Veuillez vous reconnecter.',
  'auth/account-exists-with-different-credential': 'Un compte existe déjà avec la même adresse email mais avec un méthode de connexion différente.',
  
  // Erreurs de vérification et réinitialisation
  'auth/expired-action-code': 'Ce lien a expiré ou a déjà été utilisé.',
  'auth/invalid-action-code': 'Le code de vérification est invalide. Il a peut-être expiré ou a déjà été utilisé.',
  'auth/invalid-verification-code': 'Le code de vérification est invalide.',
  'auth/missing-verification-code': 'Le code de vérification est manquant.',
  'auth/missing-verification-id': 'L\'identifiant de vérification est manquant.',
  
  // Erreurs de quotas et dispositifs
  'auth/quota-exceeded': 'Le quota d\'opérations a été dépassé. Veuillez réessayer plus tard.',
  'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard.',
  'auth/captcha-check-failed': 'La vérification du captcha a échoué. Veuillez réessayer.',
  
  // Erreurs spécifiques aux méthodes
  'auth/popup-blocked': 'La popup a été bloquée par le navigateur. Veuillez autoriser les popups pour ce site.',
  'auth/popup-closed-by-user': 'La fenêtre de connexion a été fermée avant la fin du processus d\'authentification.',
  
  // Erreurs générales
  'auth/network-request-failed': 'Une erreur réseau s\'est produite. Veuillez vérifier votre connexion internet et réessayer.',
  'auth/internal-error': 'Une erreur interne s\'est produite. Veuillez réessayer plus tard.',
  'auth/timeout': 'La connexion a expiré. Veuillez réessayer.'
};

/**
 * Analyse une erreur Firebase et retourne un message adapté à l'utilisateur
 * @param error L'erreur Firebase
 * @returns Un message d'erreur adapté pour l'utilisateur
 */
export const getFirebaseErrorMessage = (error: unknown): string => {
  // Si l'erreur est une FirebaseError
  if (error instanceof FirebaseError) {
    // Récupérer le message préenregistré ou utiliser le code d'erreur par défaut
    return firebaseErrorMessages[error.code] || `Une erreur s'est produite: ${error.message}`;
  }
  
  // Si l'erreur est une instance d'Error
  if (error instanceof Error) {
    // Extraire le code d'erreur Firebase (format "auth/error-code")
    const errorCode = error.message.match(/auth\/[a-z-]+/)?.[0];
    
    // Retourner le message traduit si disponible
    if (errorCode && firebaseErrorMessages[errorCode]) {
      return firebaseErrorMessages[errorCode];
    }
    
    // Retourner le message d'erreur brut
    return error.message;
  }
  
  // Pour les autres types d'erreurs, convertir en chaîne de caractères
  if (error) {
    return String(error);
  }
  
  // Aucune erreur identifiable
  return "Une erreur inattendue s'est produite";
}; 