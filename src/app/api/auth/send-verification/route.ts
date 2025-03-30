import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      console.log('Tentative d\'envoi d\'email sans adresse email');
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
      console.log(`Tentative d'envoi de vérification à un email non enregistré: ${email}`);
      return NextResponse.json(
        { message: 'Si votre email est enregistré, un lien de vérification vous a été envoyé.' },
        { status: 200 }
      );
    }
    
    // Si l'email est déjà vérifié, pas besoin d'envoyer un nouveau lien
    if (user.emailVerified) {
      console.log(`Email déjà vérifié pour: ${email}`);
      return NextResponse.json(
        { message: 'Votre email est déjà vérifié' },
        { status: 200 }
      );
    }
    
    // Supprimer les anciens tokens pour cet utilisateur
    try {
      await prisma.verificationToken.deleteMany({
        where: { identifier: email }
      });
      console.log(`Anciens tokens de vérification supprimés pour: ${email}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression des anciens tokens pour ${email}:`, error);
      // Continuer même en cas d'erreur
    }
    
    // Générer un token de vérification
    const verificationToken = randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Expire après 24h
    
    // Sauvegarder le token dans la base de données
    try {
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires: tokenExpiry
        }
      });
      console.log(`Token de vérification créé pour: ${email}, expire le: ${tokenExpiry}`);
    } catch (error) {
      console.error(`Erreur lors de la création du token pour ${email}:`, error);
      return NextResponse.json(
        { message: 'Une erreur est survenue lors de la création du token de vérification' },
        { status: 500 }
      );
    }
    
    // Envoyer l'email de vérification
    try {
      await sendVerificationEmail(email, verificationToken);
      console.log(`Email de vérification envoyé avec succès à ${email}`);
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'email à ${email}:`, error);
      return NextResponse.json(
        { message: 'Une erreur est survenue lors de l\'envoi de l\'email' },
        { status: 500 }
      );
    }
    
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