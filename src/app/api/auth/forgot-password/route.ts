import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { forgotPasswordSchema } from '@/lib/validators/auth';
import { validateRouteBody } from '@/lib/validators/adapters';

export async function POST(req: Request) {
  try {
    // Valider les données avec le schéma Zod
    const validation = await validateRouteBody(forgotPasswordSchema)(req.clone());
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, ...validation.error },
        { status: 400 }
      );
    }
    
    const { email } = validation.data;
    
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      // Ne pas divulguer que l'utilisateur n'existe pas pour des raisons de sécurité
      return NextResponse.json(
        { success: true, message: 'Si votre email est enregistré, vous recevrez un lien de réinitialisation.' },
        { status: 200 }
      );
    }
    
    // Générer un token de réinitialisation
    const resetToken = randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Expire après 1h
    
    // Mettre à jour l'utilisateur avec le token de réinitialisation
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetExpires: tokenExpiry
      }
    });
    
    // Créer le lien de réinitialisation
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    
    // TODO: Envoyer l'email de réinitialisation via un service d'email réel
    console.log(`Lien de réinitialisation pour ${email}: ${resetLink}`);
    // await sendResetPasswordEmail(email, resetLink);
    
    return NextResponse.json(
      { success: true, message: 'Si votre email est enregistré, vous recevrez un lien de réinitialisation.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation de mot de passe:', error);
    return NextResponse.json(
      { success: false, message: 'Une erreur est survenue lors de la demande de réinitialisation' },
      { status: 500 }
    );
  }
} 