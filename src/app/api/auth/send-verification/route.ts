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
        { message: 'Si votre email est enregistré, un lien de vérification vous a été envoyé.' },
        { status: 200 }
      );
    }
    
    // Générer un token de vérification
    const verificationToken = randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Expire après 24h
    
    // Sauvegarder le token dans la base de données
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: tokenExpiry
      }
    });
    
    // Créer le lien de vérification
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=${verificationToken.token}`;
    
    // TODO: Envoyer l'email de vérification via un service d'email réel
    // await sendVerificationEmail(email, verificationLink);
    
    return NextResponse.json(
      { message: 'Email de vérification envoyé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de l\'envoi de l\'email' },
      { status: 500 }
    );
  }
} 