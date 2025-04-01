import { POST } from '@/app/api/auth/logout/route';
import { NextResponse } from 'next/server';

// Mock pour NextResponse.json
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
          delete: mockCookiesDelete,
        },
      })),
    },
  };
});

describe('API de déconnexion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/logout', () => {
    it('devrait supprimer le cookie de session et retourner un succès', async () => {
      // Appelle la fonction
      const response = await POST();

      // Vérifie les résultats
      expect(mockCookiesDelete).toHaveBeenCalledWith('session');
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('status', 200);
    });

    it('devrait gérer les erreurs correctement', async () => {
      // Force une erreur
      mockCookiesDelete.mockImplementationOnce(() => {
        throw new Error('Erreur simulée');
      });

      // Appelle la fonction
      const response = await POST();

      // Vérifie les résultats
      expect(response).toHaveProperty('error', 'Erreur lors de la déconnexion');
      expect(response).toHaveProperty('status', 500);
    });
  });
}); 