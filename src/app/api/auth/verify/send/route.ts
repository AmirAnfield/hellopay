import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { message: 'Email requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Si l'email est déjà vérifié, pas besoin d'envoyer un nouveau token
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Cet email est déjà vérifié' },
        { status: 400 }
      );
    }

    // Supprimer les anciens tokens pour cet utilisateur
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });

    // Créer un nouveau token de vérification (valide 24h)
    const token = uuidv4();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires
      }
    });

    // Envoyer l'email de vérification
    try {
      await sendVerificationEmail(email, token);
      
      return NextResponse.json(
        { message: 'Email de vérification envoyé avec succès' },
        { status: 200 }
      );
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      
      // Supprimer le token si l'envoi d'email échoue
      await prisma.verificationToken.deleteMany({
        where: { token }
      });
      
      return NextResponse.json(
        { message: 'Échec de l\'envoi de l\'email de vérification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la création du token de vérification:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 