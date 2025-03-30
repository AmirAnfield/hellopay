import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * Récupère l'utilisateur connecté depuis la session
 * @returns L'objet utilisateur ou null s'il n'est pas connecté
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }
  
  return {
    ...session.user,
    id: session.user.id || '',
  };
}

/**
 * Vérifie si l'utilisateur est administrateur
 * @returns true si l'utilisateur est admin, false sinon
 */
export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

/**
 * Récupère l'ID de l'utilisateur connecté
 * @returns L'ID de l'utilisateur ou null s'il n'est pas connecté
 */
export async function getCurrentUserId() {
  const user = await getCurrentUser();
  return user?.id || null;
}

/**
 * Vérifie si deux utilisateurs sont identiques (même ID)
 * @param userId1 Premier ID d'utilisateur
 * @param userId2 Second ID d'utilisateur
 * @returns true si les deux IDs correspondent, false sinon
 */
export function isSameUser(userId1: string, userId2: string) {
  if (!userId1 || !userId2) return false;
  return userId1 === userId2;
} 