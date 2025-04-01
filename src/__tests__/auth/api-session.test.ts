import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/auth/session/route';
import { getAuth } from 'firebase-admin/auth';

// Mocks pour Firebase Admin Auth
jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
    createSessionCookie: jest.fn(),
    verifySessionCookie: jest.fn(),
  })),
}));

// Mock pour firebase-admin
jest.mock('@/lib/firebase-admin', () => ({
  admin: {},
}));

// Mock pour NextResponse.json
const mockCookiesSet = jest.fn();
const mockCookiesDelete = jest.fn();
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      ...originalModule.NextResponse,
      json: jest.fn().mockImplementation((data, options) => ({
        ...data,
        status: options?.status || 200,
        cookies: {
          set: mockCookiesSet,
          delete: mockCookiesDelete,
        },
      })),
    },
  };
});

describe('API de session', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/session', () => {
    it('devrait retourner une erreur 400 si le token ID est manquant', async () => {
      // Crée la requête
      const request = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      // Appelle la fonction
      const response = await POST(request);

      // Vérifie les résultats
      expect(response).toHaveProperty('error', 'Token manquant');
      expect(response).toHaveProperty('status', 400);
    });

    it('devrait créer un cookie de session et retourner les données utilisateur', async () => {
      // Mock des données utilisateur
      const mockUser = {
        uid: 'user-123',
        email: 'user@example.com',
        email_verified: true,
      };

      // Configure les mocks
      const mockVerifyIdToken = jest.fn().mockResolvedValue(mockUser);
      const mockCreateSessionCookie = jest.fn().mockResolvedValue('session-cookie-value');
      
      (getAuth as jest.Mock).mockReturnValue({
        verifyIdToken: mockVerifyIdToken,
        createSessionCookie: mockCreateSessionCookie,
        verifySessionCookie: jest.fn(),
      });

      // Crée la requête
      const request = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({ idToken: 'valid-id-token' }),
      });

      // Appelle la fonction
      const response = await POST(request);

      // Vérifie les résultats
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('uid', mockUser.uid);
      expect(response).toHaveProperty('email', mockUser.email);
      expect(response).toHaveProperty('emailVerified', mockUser.email_verified);
      expect(response).toHaveProperty('status', 200);
      expect(mockCookiesSet).toHaveBeenCalledWith(expect.objectContaining({
        name: 'session',
        value: 'session-cookie-value',
      }));
    });

    it('devrait retourner une erreur 401 si la vérification du token échoue', async () => {
      // Configure le mock pour simuler une erreur
      const mockVerifyIdToken = jest.fn().mockRejectedValue(new Error('Token invalide'));
      
      (getAuth as jest.Mock).mockReturnValue({
        verifyIdToken: mockVerifyIdToken,
        createSessionCookie: jest.fn(),
        verifySessionCookie: jest.fn(),
      });

      // Crée la requête
      const request = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({ idToken: 'invalid-id-token' }),
      });

      // Appelle la fonction
      const response = await POST(request);

      // Vérifie les résultats
      expect(response).toHaveProperty('error', 'Erreur lors de la création de la session');
      expect(response).toHaveProperty('status', 401);
    });
  });

  describe('GET /api/auth/session', () => {
    it('devrait retourner une erreur 401 si le cookie de session est manquant', async () => {
      // Crée une requête sans cookie
      const request = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'GET',
      });

      // Appelle la fonction
      const response = await GET(request);

      // Vérifie les résultats
      expect(response).toHaveProperty('authenticated', false);
      expect(response).toHaveProperty('status', 401);
    });

    it('devrait retourner les données utilisateur si le cookie de session est valide', async () => {
      // Mock des données utilisateur
      const mockClaims = {
        uid: 'user-123',
        email: 'user@example.com',
        email_verified: true,
        name: 'Test User',
      };

      // Configure les mocks
      const mockVerifySessionCookie = jest.fn().mockResolvedValue(mockClaims);
      
      (getAuth as jest.Mock).mockReturnValue({
        verifyIdToken: jest.fn(),
        createSessionCookie: jest.fn(),
        verifySessionCookie: mockVerifySessionCookie,
      });

      // Crée une requête avec un cookie
      const request = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'GET',
        headers: {
          cookie: 'session=valid-session-cookie',
        },
      });

      // Astuce pour ajouter la propriété cookies à la requête
      Object.defineProperty(request, 'cookies', {
        get: () => new Map([['session', { value: 'valid-session-cookie' }]]),
      });

      // Appelle la fonction
      const response = await GET(request);

      // Vérifie les résultats
      expect(response).toHaveProperty('authenticated', true);
      expect(response).toHaveProperty('user');
      // @ts-ignore - Nous savons que user existe dans la réponse
      expect(response.user).toEqual({
        uid: mockClaims.uid,
        email: mockClaims.email,
        emailVerified: mockClaims.email_verified,
        displayName: mockClaims.name,
      });
    });

    it('devrait retourner une erreur 401 et supprimer le cookie si le cookie de session est invalide', async () => {
      // Configure le mock pour simuler une erreur
      const mockVerifySessionCookie = jest.fn().mockRejectedValue(new Error('Session invalide'));
      
      (getAuth as jest.Mock).mockReturnValue({
        verifyIdToken: jest.fn(),
        createSessionCookie: jest.fn(),
        verifySessionCookie: mockVerifySessionCookie,
      });

      // Crée une requête avec un cookie
      const request = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'GET',
        headers: {
          cookie: 'session=invalid-session-cookie',
        },
      });

      // Astuce pour ajouter la propriété cookies à la requête
      Object.defineProperty(request, 'cookies', {
        get: () => new Map([['session', { value: 'invalid-session-cookie' }]]),
      });

      // Appelle la fonction
      const response = await GET(request);

      // Vérifie les résultats
      expect(response).toHaveProperty('authenticated', false);
      expect(response).toHaveProperty('error', 'Session invalide ou expirée');
      expect(response).toHaveProperty('status', 401);
      expect(mockCookiesDelete).toHaveBeenCalledWith('session');
    });
  });
}); 