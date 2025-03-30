import { vi } from 'vitest';

// Configuration pour les tests unitaires

// Mock de fetch global pour les tests d'API
global.fetch = vi.fn();

// Réinitialiser les mocks entre les tests
beforeEach(() => {
  vi.resetAllMocks();
}); 