import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    
    if (!token) {
      return NextResponse.json(
        { message: 'Token de vérification manquant' },
        { status: 400 }
      );
    }

    // Vérifier si le token existe et est valide
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      return NextResponse.json(
        { message: 'Token de vérification invalide ou expiré' },
        { status: 400 }
      );
    }

    // Vérifier si le token n'est pas expiré
    if (new Date() > verificationToken.expires) {
      // Supprimer le token expiré
      await prisma.verificationToken.delete({
        where: { token }
      });
      
      return NextResponse.json(
        { message: 'Token de vérification expiré' },
        { status: 400 }
      );
    }

    // Mettre à jour l'utilisateur comme vérifié
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    });

    // Supprimer le token utilisé
    await prisma.verificationToken.delete({
      where: { token }
    });

    return NextResponse.json(
      { message: 'Email vérifié avec succès' },
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

// Route GET pour gérer la verification via lien direct (clic dans l'email)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      // Rediriger vers la page d'erreur
      return NextResponse.redirect(new URL('/auth/error?error=missing_token', req.url));
    }

    // Vérifier si le token existe et est valide
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      return NextResponse.redirect(new URL('/auth/error?error=invalid_token', req.url));
    }

    // Vérifier si le token n'est pas expiré
    if (new Date() > verificationToken.expires) {
      // Supprimer le token expiré
      await prisma.verificationToken.delete({
        where: { token }
      });
      
      return NextResponse.redirect(new URL('/auth/error?error=expired_token', req.url));
    }

    // Mettre à jour l'utilisateur comme vérifié
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier }
    });

    if (!user) {
      return NextResponse.redirect(new URL('/auth/error?error=user_not_found', req.url));
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    });

    // Supprimer le token utilisé
    await prisma.verificationToken.delete({
      where: { token }
    });

    // Rediriger vers la page de confirmation
    return NextResponse.redirect(new URL('/auth/verify/success', req.url));
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return NextResponse.redirect(new URL('/auth/error?error=server_error', req.url));
  }
} 