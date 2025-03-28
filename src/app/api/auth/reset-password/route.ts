import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    
    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token de réinitialisation et nouveau mot de passe requis' },
        { status: 400 }
      );
    }
    
    // Rechercher le token de vérification
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
    if (new Date(verificationToken.expires) < new Date()) {
      await prisma.verificationToken.delete({
        where: { token }
      });
      
      return NextResponse.json(
        { message: 'Token de réinitialisation expiré. Veuillez demander un nouveau lien.' },
        { status: 400 }
      );
    }
    
    // Identifier l'utilisateur et réinitialiser son mot de passe
    const user = await prisma.user.findUnique({
      where: { id: verificationToken.identifier }
    });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Mettre à jour le mot de passe de l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword }
    });
    
    // Supprimer le token utilisé
    await prisma.verificationToken.delete({
      where: { token }
    });
    
    return NextResponse.json(
      { message: 'Mot de passe réinitialisé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la réinitialisation du mot de passe' },
      { status: 500 }
    );
  }
} 