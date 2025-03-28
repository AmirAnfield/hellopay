import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    
    if (!token) {
      return NextResponse.json(
        { message: 'Token de réinitialisation manquant' },
        { status: 400 }
      );
    }
    
    // Vérifier si le token existe et est valide
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });
    
    if (!verificationToken) {
      return NextResponse.json(
        { message: 'Token de réinitialisation invalide' },
        { status: 400 }
      );
    }
    
    // Vérifier si le token n'est pas expiré
    if (new Date() > new Date(verificationToken.expires)) {
      // Supprimer le token expiré
      await prisma.verificationToken.delete({
        where: { token }
      });
      
      return NextResponse.json(
        { message: 'Token de réinitialisation expiré. Veuillez demander un nouveau lien.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Token valide', valid: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la vérification du token' },
      { status: 500 }
    );
  }
} 