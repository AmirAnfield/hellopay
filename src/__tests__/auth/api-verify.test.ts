import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/verify/route';
import { getAuth } from 'firebase-admin/auth';

// Mocks pour Firebase Admin Auth
jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

// Mock pour firebase-admin
jest.mock('@/lib/firebase-admin', () => ({
  admin: {},
}));

// Mock pour NextResponse.json
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      ...originalModule.NextResponse,
      json: jest.fn().mockImplementation((data, options) => ({
        ...data,
        status: options?.status || 200,
      })),
    },
  };
});

describe('API de vérification d\'email', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/verify', () => {
    it('devrait retourner une erreur 400 si le token est manquant', async () => {
      // Crée la requête sans token
      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      // Appelle la fonction
      const response = await POST(request);

      // Vérifie les résultats
      expect(response).toHaveProperty('error', 'Token manquant');
      expect(response).toHaveProperty('status', 400);
    });

    it('devrait vérifier le token et retourner un succès', async () => {
      // Configure le mock pour simuler une vérification réussie
      const mockVerifyIdToken = jest.fn().mockResolvedValue({ uid: 'user-123' });
      
      (getAuth as jest.Mock).mockReturnValue({
        verifyIdToken: mockVerifyIdToken,
      });

      // Crée la requête avec un token valide
      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token: 'valid-token' }),
      });

      // Appelle la fonction
      const response = await POST(request);

      // Vérifie les résultats
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('message', 'Email vérifié avec succès');
      expect(response).toHaveProperty('status', 200);
      expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token');
    });

    it('devrait retourner une erreur 400 si la vérification échoue', async () => {
      // Configure le mock pour simuler une erreur
      const mockVerifyIdToken = jest.fn().mockRejectedValue(new Error('Token invalide'));
      
      (getAuth as jest.Mock).mockReturnValue({
        verifyIdToken: mockVerifyIdToken,
      });

      // Crée la requête avec un token invalide
      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token: 'invalid-token' }),
      });

      // Appelle la fonction
      const response = await POST(request);

      // Vérifie les résultats
      expect(response).toHaveProperty('error', 'Échec de la vérification');
      expect(response).toHaveProperty('message', 'Token invalide');
      expect(response).toHaveProperty('status', 400);
    });
  });
}); 