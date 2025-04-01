import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout - Déconnecter un utilisateur en supprimant son cookie de session
 */
export async function POST() {
  try {
    // Créer la réponse
    const response = NextResponse.json({ success: true }, { status: 200 });
    
    // Supprimer le cookie de session
    response.cookies.delete('session');
    
    return response;
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
} 