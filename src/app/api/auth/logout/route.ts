import { NextResponse } from 'next/server';

/**
 * Route pour déconnecter l'utilisateur
 * @returns Réponse avec le cookie de session supprimé
 */
export async function POST() {
  try {
    // Créer une réponse avec un message de succès
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );
    
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