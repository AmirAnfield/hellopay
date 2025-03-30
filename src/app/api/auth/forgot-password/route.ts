import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      console.log('Tentative de réinitialisation de mot de passe sans adresse email');
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
      console.log(`Tentative de réinitialisation pour un email non enregistré: ${email}`);
      return NextResponse.json(
        { message: 'Si votre email est enregistré, un lien de réinitialisation vous a été envoyé.' },
        { status: 200 }
      );
    }
    
    // Générer un token de réinitialisation
    const resetToken = randomBytes(32).toString('hex');
    
    // Date d'expiration (1 heure)
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);
    
    // Mettre à jour l'utilisateur avec le token de réinitialisation
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetExpires
        }
      });
      console.log(`Token de réinitialisation créé pour ${email}, expire le: ${resetExpires}`);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du token pour ${email}:`, error);
      return NextResponse.json(
        { message: 'Une erreur est survenue lors de la création du token de réinitialisation' },
        { status: 500 }
      );
    }
    
    // Envoyer l'email de réinitialisation
    try {
      await sendPasswordResetEmail(email, resetToken);
      console.log(`Email de réinitialisation envoyé avec succès à ${email}`);
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'email à ${email}:`, error);
      return NextResponse.json(
        { message: 'Une erreur est survenue lors de l\'envoi de l\'email' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Si votre email est enregistré, un lien de réinitialisation vous a été envoyé.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de l\'envoi de l\'email' },
      { status: 500 }
    );
  }
} 