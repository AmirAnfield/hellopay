import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { admin } from '@/lib/firebase-admin';

/**
 * POST /api/auth/verify - Vérifier un token d'email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      );
    }

    // Vérifier le token et le valider
    await getAuth(admin).verifyIdToken(token);
    
    return NextResponse.json({
      success: true,
      message: 'Email vérifié avec succès'
    });
  } catch (error) {
    console.error('Erreur de vérification d\'email:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Le token est invalide ou a expiré';
    
    return NextResponse.json(
      { 
        error: 'Échec de la vérification', 
        message: errorMessage
      },
      { status: 400 }
    );
  }
} 