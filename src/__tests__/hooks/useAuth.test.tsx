import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { AuthProvider } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

// Mock de Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
  })),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendEmailVerification: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

// Mock des API auth
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
}));

// Mock de fetch pour les appels API
global.fetch = jest.fn();

// Wrapper pour fournir le contexte d'authentification
const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
  });

  it('devrait initialiser avec l\'état par défaut', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.isEmailVerified).toBe(false);
    expect(typeof result.current.signIn).toBe('function');
    expect(typeof result.current.signUp).toBe('function');
    expect(typeof result.current.signOut).toBe('function');
    expect(typeof result.current.resetPassword).toBe('function');
    expect(typeof result.current.resendVerificationEmail).toBe('function');
  });

  it('devrait appeler signInWithEmailAndPassword lors de la connexion', async () => {
    const signInWithEmailAndPassword = require('firebase/auth').signInWithEmailAndPassword;
    signInWithEmailAndPassword.mockResolvedValue({
      user: {
        uid: 'user-id-123',
        email: 'test@example.com',
        getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
        emailVerified: true,
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123');
    });

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password123'
    );
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/session', expect.any(Object));
  });

  it('devrait appeler createUserWithEmailAndPassword lors de l\'inscription', async () => {
    const createUserWithEmailAndPassword = require('firebase/auth').createUserWithEmailAndPassword;
    createUserWithEmailAndPassword.mockResolvedValue({
      user: {
        uid: 'new-user-id',
        email: 'newuser@example.com',
        getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
        emailVerified: false,
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signUp('newuser@example.com', 'password123');
    });

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'newuser@example.com',
      'password123'
    );
  });

  it('devrait appeler signOut lors de la déconnexion', async () => {
    const signOut = require('firebase/auth').signOut;
    signOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signOut();
    });

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', expect.any(Object));
  });

  it('devrait appeler sendPasswordResetEmail lors de la réinitialisation du mot de passe', async () => {
    const sendPasswordResetEmail = require('firebase/auth').sendPasswordResetEmail;
    sendPasswordResetEmail.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.resetPassword('test@example.com');
    });

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com'
    );
  });

  it('devrait appeler sendEmailVerification lors du renvoi de l\'email de vérification', async () => {
    const sendEmailVerification = require('firebase/auth').sendEmailVerification;
    sendEmailVerification.mockResolvedValue(undefined);

    // Simuler un utilisateur connecté
    const getAuth = require('firebase/auth').getAuth;
    getAuth.mockReturnValue({
      currentUser: {
        email: 'test@example.com',
        emailVerified: false,
        sendEmailVerification: sendEmailVerification,
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.resendVerificationEmail();
    });

    expect(sendEmailVerification).toHaveBeenCalledTimes(1);
  });
}); 