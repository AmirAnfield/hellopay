import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// Validation du schéma de la requête
const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requis"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validation des données
    const result = resetPasswordSchema.safeParse(body);
    
    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message || "Données invalides";
      console.log(`Échec de validation: ${errorMessage}`);
      return NextResponse.json(
        { message: errorMessage },
        { status: 400 }
      );
    }
    
    const { token, password } = result.data;
    
    // Rechercher l'utilisateur avec ce token de réinitialisation
    const user = await prisma.user.findFirst({
      where: { 
        resetToken: token,
        resetExpires: { gt: new Date() }
      }
    });
    
    if (!user) {
      console.log(`Tentative de réinitialisation avec un token invalide ou expiré: ${token.substring(0, 8)}...`);
      return NextResponse.json(
        { message: 'Token de réinitialisation invalide ou expiré' },
        { status: 400 }
      );
    }
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
      // Mettre à jour le mot de passe de l'utilisateur et effacer le token
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          passwordHash: hashedPassword,
          resetToken: null,
          resetExpires: null
        }
      });
      
      console.log(`Mot de passe réinitialisé avec succès pour l'utilisateur: ${user.email}`);
      
      return NextResponse.json(
        { message: 'Mot de passe réinitialisé avec succès' },
        { status: 200 }
      );
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du mot de passe pour ${user.email}:`, error);
      return NextResponse.json(
        { message: 'Une erreur est survenue lors de la mise à jour du mot de passe' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la réinitialisation du mot de passe' },
      { status: 500 }
    );
  }
} 