import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validators/auth";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Valider les données avec le schéma Zod
    try {
      const { name, email, password, termsAccepted } = registerSchema.parse(body);
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Cet email est déjà utilisé" },
          { status: 409 }
        );
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          // Enregistrer que les conditions ont été acceptées
          metadata: JSON.stringify({
            termsAccepted: termsAccepted,
            termsAcceptedAt: new Date().toISOString()
          })
        },
      });

      return NextResponse.json(
        { 
          success: true, 
          message: "Utilisateur créé avec succès", 
          userId: user.id 
        },
        { status: 201 }
      );
    } catch (validationError) {
      // Gérer les erreurs de validation Zod
      if (validationError instanceof ZodError) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Données d'inscription invalides", 
            errors: validationError.errors 
          },
          { status: 400 }
        );
      }
      throw validationError; // Relancer d'autres types d'erreurs
    }
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Une erreur est survenue lors de l'inscription" 
      },
      { status: 500 }
    );
  }
} 