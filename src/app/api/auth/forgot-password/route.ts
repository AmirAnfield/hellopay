import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { message: 'Adresse email requise' },
        { status: 400 }
      );
    }
    
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      // Ne pas divulguer que l'utilisateur n'existe pas pour des raisons de sécurité
      return NextResponse.json(
        { message: 'Si votre email est enregistré, vous recevrez un lien de réinitialisation.' },
        { status: 200 }
      );
    }
    
    // Générer un token de réinitialisation
    const resetToken = randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Expire après 1h
    
    // Mettre à jour l'utilisateur avec le token de réinitialisation
    // Note: Comme les champs resetToken et resetExpires ne sont pas dans notre schéma actuel,
    // nous utilisons VerificationToken pour stocker temporairement cette information
    await prisma.verificationToken.upsert({
      where: { 
        identifier_token: {
          identifier: user.id,
          token: 'reset_password'
        }
      },
      update: {
        token: resetToken,
        expires: tokenExpiry
      },
      create: {
        identifier: user.id,
        token: resetToken,
        expires: tokenExpiry
      }
    });
    
    // Créer le lien de réinitialisation
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    
    // Simuler l'envoi d'un email (à remplacer par un vrai service d'email)
    console.log(`Lien de réinitialisation pour ${email}: ${resetLink}`);
    
    // En production, utiliser un service comme SendGrid, Mailgun, etc.
    // await sendResetPasswordEmail(email, resetLink);
    
    return NextResponse.json(
      { message: 'Si votre email est enregistré, vous recevrez un lien de réinitialisation.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation de mot de passe:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la demande de réinitialisation' },
      { status: 500 }
    );
  }
} 