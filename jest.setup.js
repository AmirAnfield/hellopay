// Import des utilitaires nécessaires
const { TextEncoder, TextDecoder } = require('util');

// Polyfills globaux
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock pour next/headers car il n'est pas disponible dans l'environnement de test
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
  headers: jest.fn(),
}));

// Mock pour next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => ({ get: jest.fn() })),
  redirect: jest.fn(),
}));

// Mock pour firebase-admin
jest.mock('@/lib/firebase-admin', () => ({
  admin: {},
}));

// Mock pour firebase/app
jest.mock('firebase/app', () => {
  return {
    FirebaseError: class FirebaseError extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'FirebaseError';
      }
    },
  };
});

// Suppression des avertissements pour les props non utilisées
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: React does not recognize the') &&
    args[0].includes('prop on a DOM element')
  ) {
    return;
  }
  originalConsoleError(...args);
}; 