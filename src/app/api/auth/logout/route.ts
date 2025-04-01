import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout - Déconnecter un utilisateur en supprimant son cookie de session
 */
export async function POST() {
  try {
    // Supprimer le cookie de session
    const cookieStore = cookies();
    cookieStore.delete('session');
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
} 