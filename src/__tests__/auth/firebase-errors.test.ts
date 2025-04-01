import { FirebaseError } from 'firebase/app';
import { getFirebaseErrorMessage, firebaseErrorMessages } from '@/lib/utils/firebase-errors';

// Mock pour FirebaseError car nous ne pouvons pas instancier directement FirebaseError
jest.mock('firebase/app', () => ({
  FirebaseError: class FirebaseError extends Error {
    code: string;
    
    constructor(code: string, message?: string) {
      super(message || `Firebase Error: ${code}`);
      this.code = code;
      this.name = 'FirebaseError';
    }
  }
}));

describe('Fonctions de gestion des erreurs Firebase', () => {
  describe('getFirebaseErrorMessage', () => {
    it('devrait retourner le message correspondant pour une erreur FirebaseError connue', () => {
      const error = new FirebaseError('auth/user-not-found', 'User not found');
      const result = getFirebaseErrorMessage(error);
      expect(result).toBe(firebaseErrorMessages['auth/user-not-found']);
    });

    it('devrait retourner le message d\'erreur par défaut pour une erreur FirebaseError inconnue', () => {
      const error = new FirebaseError('auth/unknown-error', 'Message inconnu');
      const result = getFirebaseErrorMessage(error);
      expect(result).toBe('Une erreur s\'est produite: Message inconnu');
    });

    it('devrait extraire et traduire un code d\'erreur Firebase à partir d\'un message d\'erreur', () => {
      const error = new Error('Une erreur s\'est produite: auth/user-not-found');
      const result = getFirebaseErrorMessage(error);
      expect(result).toBe(firebaseErrorMessages['auth/user-not-found']);
    });

    it('devrait retourner le message d\'erreur brut pour une erreur sans code Firebase', () => {
      const error = new Error('Une erreur générique');
      const result = getFirebaseErrorMessage(error);
      expect(result).toBe('Une erreur générique');
    });

    it('devrait convertir en chaîne tout autre type d\'erreur', () => {
      const error = { message: 'Objet d\'erreur personnalisé' };
      const result = getFirebaseErrorMessage(error);
      expect(result).toBe(String(error));
    });

    it('devrait retourner un message par défaut si aucune erreur n\'est fournie', () => {
      const result = getFirebaseErrorMessage(null);
      expect(result).toBe('Une erreur inattendue s\'est produite');
    });
  });
}); 