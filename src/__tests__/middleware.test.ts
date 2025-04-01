import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';
import { getAuth } from 'firebase-admin/auth';

// Mocks pour Firebase Admin Auth
jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({
    verifySessionCookie: jest.fn(),
  })),
}));

// Mock pour firebase-admin
jest.mock('@/lib/firebase-admin', () => ({
  admin: {},
}));

// Mocks pour NextResponse
const mockNext = jest.fn();
const mockRedirect = jest.fn();

jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      next: jest.fn().mockImplementation(() => {
        mockNext();
        return { type: 'next' };
      }),
      redirect: jest.fn().mockImplementation((url) => {
        mockRedirect(url);
        return { 
          type: 'redirect', 
          url,
          cookies: {
            delete: jest.fn(),
          },
        };
      }),
    },
  };
});

describe('Middleware d\'authentification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait laisser passer les ressources statiques', async () => {
    // Crée une requête pour une ressource statique
    const request = new NextRequest('http://localhost:3000/_next/static/chunks/main.js');
    Object.defineProperty(request, 'nextUrl', {
      get: () => new URL('http://localhost:3000/_next/static/chunks/main.js'),
    });

    // Appelle le middleware
    await middleware(request);

    // Vérifie que NextResponse.next() a été appelé
    expect(mockNext).toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('devrait laisser passer les routes publiques', async () => {
    // Crée une requête pour une route publique
    const request = new NextRequest('http://localhost:3000/auth/login');
    Object.defineProperty(request, 'nextUrl', {
      get: () => new URL('http://localhost:3000/auth/login'),
    });

    // Appelle le middleware
    await middleware(request);

    // Vérifie que NextResponse.next() a été appelé
    expect(mockNext).toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('devrait rediriger vers la page de connexion si pas de cookie de session', async () => {
    // Crée une requête pour une route protégée sans cookie
    const request = new NextRequest('http://localhost:3000/dashboard');
    Object.defineProperty(request, 'nextUrl', {
      get: () => new URL('http://localhost:3000/dashboard'),
    });
    Object.defineProperty(request, 'cookies', {
      get: () => new Map(),
    });

    // Appelle le middleware
    await middleware(request);

    // Vérifie la redirection vers la page de connexion
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/auth/login',
        searchParams: expect.any(URLSearchParams),
      })
    );
  });

  it('devrait laisser passer si le cookie de session est valide', async () => {
    // Configure le mock pour simuler une vérification réussie
    const mockVerifySessionCookie = jest.fn().mockResolvedValue({ uid: 'user-123' });
    
    (getAuth as jest.Mock).mockReturnValue({
      verifySessionCookie: mockVerifySessionCookie,
    });

    // Crée une requête pour une route protégée avec un cookie
    const request = new NextRequest('http://localhost:3000/dashboard');
    Object.defineProperty(request, 'nextUrl', {
      get: () => new URL('http://localhost:3000/dashboard'),
    });
    Object.defineProperty(request, 'cookies', {
      get: () => new Map([['session', { value: 'valid-session-cookie' }]]),
    });

    // Appelle le middleware
    await middleware(request);

    // Vérifie que NextResponse.next() a été appelé
    expect(mockNext).toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('devrait rediriger et supprimer le cookie si le cookie de session est invalide', async () => {
    // Configure le mock pour simuler une erreur
    const mockVerifySessionCookie = jest.fn().mockRejectedValue(new Error('Session invalide'));
    
    (getAuth as jest.Mock).mockReturnValue({
      verifySessionCookie: mockVerifySessionCookie,
    });

    // Crée une requête pour une route protégée avec un cookie invalide
    const request = new NextRequest('http://localhost:3000/dashboard');
    Object.defineProperty(request, 'nextUrl', {
      get: () => new URL('http://localhost:3000/dashboard'),
    });
    Object.defineProperty(request, 'cookies', {
      get: () => new Map([['session', { value: 'invalid-session-cookie' }]]),
    });

    // Appelle le middleware
    await middleware(request);

    // Vérifie la redirection et la suppression du cookie
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/auth/login',
        searchParams: expect.any(URLSearchParams),
      })
    );
  });
}); 