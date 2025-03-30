import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCurrentUser, getCurrentUserId, isAdmin, isSameUser } from '@/lib/session';
import { getServerSession } from 'next-auth/next';

// Mock de next-auth
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

describe('Session utilities', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('devrait retourner null si aucune session n\'existe', async () => {
      // Configure le mock pour simuler l'absence de session
      vi.mocked(getServerSession).mockResolvedValue(null);

      const user = await getCurrentUser();
      expect(user).toBeNull();
    });

    it('devrait retourner les données utilisateur d\'une session valide', async () => {
      // Configure le mock pour simuler une session valide
      vi.mocked(getServerSession).mockResolvedValue({
        user: {
          id: 'user-id-123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const user = await getCurrentUser();
      expect(user).toEqual({
        id: 'user-id-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
      });
    });
  });

  describe('getCurrentUserId', () => {
    it('devrait retourner null si aucune session n\'existe', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const userId = await getCurrentUserId();
      expect(userId).toBeNull();
    });

    it('devrait retourner l\'ID utilisateur d\'une session valide', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: {
          id: 'user-id-123',
          name: 'John Doe',
          email: 'john@example.com',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const userId = await getCurrentUserId();
      expect(userId).toBe('user-id-123');
    });
  });

  describe('isAdmin', () => {
    it('devrait retourner false si aucune session n\'existe', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const result = await isAdmin();
      expect(result).toBe(false);
    });

    it('devrait retourner false pour un utilisateur régulier', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: {
          id: 'user-id-123',
          role: 'user',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const result = await isAdmin();
      expect(result).toBe(false);
    });

    it('devrait retourner true pour un administrateur', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: {
          id: 'admin-id-123',
          role: 'admin',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const result = await isAdmin();
      expect(result).toBe(true);
    });
  });

  describe('isSameUser', () => {
    it('devrait retourner false si un ID est manquant', () => {
      expect(isSameUser('', 'user-id-123')).toBe(false);
      expect(isSameUser('user-id-123', '')).toBe(false);
      expect(isSameUser('', '')).toBe(false);
    });

    it('devrait retourner false si les IDs sont différents', () => {
      expect(isSameUser('user-id-123', 'user-id-456')).toBe(false);
    });

    it('devrait retourner true si les IDs sont identiques', () => {
      expect(isSameUser('user-id-123', 'user-id-123')).toBe(true);
    });
  });
}); 