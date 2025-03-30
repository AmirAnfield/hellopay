import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { resetPasswordSchema } from '@/lib/validators/auth';
import { validateRouteBody } from '@/lib/validators/adapters';

export async function POST(req: Request) {
  try {
    // Valider les données avec le schéma Zod
    const validation = await validateRouteBody(resetPasswordSchema)(req.clone());
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, ...validation.error },
        { status: 400 }
      );
    }
    
    const { token, password } = validation.data;
    
    // Rechercher l'utilisateur avec ce token de réinitialisation
    const user = await prisma.user.findFirst({
      where: { 
        resetToken: token,
        resetExpires: { gt: new Date() }
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Token de réinitialisation invalide ou expiré' },
        { status: 400 }
      );
    }
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Mettre à jour le mot de passe de l'utilisateur et effacer le token
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        passwordHash: hashedPassword,
        resetToken: null,
        resetExpires: null
      }
    });
    
    return NextResponse.json(
      { success: true, message: 'Mot de passe réinitialisé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return NextResponse.json(
      { success: false, message: 'Une erreur est survenue lors de la réinitialisation du mot de passe' },
      { status: 500 }
    );
  }
} 