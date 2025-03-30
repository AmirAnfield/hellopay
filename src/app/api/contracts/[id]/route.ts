import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createHash } from "crypto";
import { format } from "date-fns";
import { getCurrentUser } from "@/lib/session";

// GET /api/contracts/[id] - Récupère un contrat spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification de l'utilisateur
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 }
      );
    }

    // Récupérer l'ID du contrat depuis les paramètres
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID du contrat manquant" },
        { status: 400 }
      );
    }

    // Récupérer le contrat
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { success: false, message: "Contrat non trouvé" },
        { status: 404 }
      );
    }

    // Vérification d'autorisation
    if (contract.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Vous n'avez pas accès à ce contrat" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contract,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du contrat:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Une erreur est survenue"
      },
      { status: 500 }
    );
  }
}

// PUT /api/contracts/[id] - Met à jour un contrat existant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification de l'utilisateur
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 }
      );
    }

    // Récupérer l'ID du contrat depuis les paramètres
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID du contrat manquant" },
        { status: 400 }
      );
    }

    // Vérifier si le contrat existe
    const existingContract = await prisma.contract.findUnique({
      where: { id },
      select: { id: true, fileUrl: true, fileKey: true, userId: true },
    });

    if (!existingContract) {
      return NextResponse.json(
        { success: false, message: "Contrat non trouvé" },
        { status: 404 }
      );
    }

    // Vérification d'autorisation
    if (existingContract.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Vous n'avez pas accès à ce contrat" },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    // Extraire les données de base
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const reference = formData.get("reference") as string;
    const status = formData.get("status") as string;
    const contractType = formData.get("contractType") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const companyId = formData.get("companyId") as string;
    const counterpartyName = formData.get("counterpartyName") as string;
    const counterpartyEmail = formData.get("counterpartyEmail") as string;
    const tags = formData.get("tags") as string;
    const file = formData.get("file") as File | null;

    // Validation de base
    if (!title || !status || !contractType || !companyId) {
      return NextResponse.json(
        { success: false, message: "Données manquantes" },
        { status: 400 }
      );
    }

    // Validation de la société
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, message: "Entreprise non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur a accès à cette entreprise
    if (company.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Vous n'avez pas accès à cette entreprise" },
        { status: 403 }
      );
    }

    // Préparation des données relatives au fichier
    const fileData: Record<string, unknown> = {};

    // Si un nouveau fichier est téléchargé
    if (file) {
      // Générer un nom de fichier unique
      const fileExtension = file.name.split(".").pop();
      const randomPart = createHash("md5")
        .update(Date.now().toString())
        .digest("hex")
        .substring(0, 6);
      const safeTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .substring(0, 30);
      const dateStr = format(new Date(), "yyyyMMdd");
      const fileName = `${safeTitle}-${dateStr}-${randomPart}.${fileExtension}`;

      // Gestion des fichiers pour l'environnement de production vs. test
      let fileUrl = "";
      let fileKey = "";

      if (process.env.NODE_ENV === 'production') {
        // Utilisation d'un service de stockage réel
        // Implémentation à ajouter selon le service choisi (UploadThing, Supabase, etc.)
        // Exemple fictif :
        // const uploadResponse = await fileStorageService.uploadFile(file);
        // fileUrl = uploadResponse.url;
        // fileKey = uploadResponse.key;
        
        // Suppression de l'ancien fichier si nécessaire
        // if (existingContract.fileKey) {
        //   await fileStorageService.deleteFile(existingContract.fileKey);
        // }
      } else {
        // Pour le développement et les tests, simuler le stockage
        fileUrl = `https://example.com/uploads/${fileName}`;
        fileKey = `uploads/${fileName}`;
      }

      // Mettre à jour les données du fichier
      Object.assign(fileData, {
        fileName,
        fileSize: file.size,
        fileType: file.type,
        fileUrl,
        fileKey,
      });
    }

    // Mettre à jour le contrat dans la base de données
    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        title,
        description,
        reference,
        status,
        contractType,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        companyId,
        counterpartyName,
        counterpartyEmail,
        tags,
        ...fileData,
        updatedAt: new Date(),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedContract,
      message: "Contrat mis à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du contrat:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Une erreur est survenue"
      },
      { status: 500 }
    );
  }
}

// DELETE /api/contracts/[id] - Supprime un contrat existant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification de l'utilisateur
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 }
      );
    }

    // Récupérer l'ID du contrat depuis les paramètres
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID du contrat manquant" },
        { status: 400 }
      );
    }

    // Vérifier si le contrat existe
    const existingContract = await prisma.contract.findUnique({
      where: { id },
      select: { id: true, fileKey: true, userId: true },
    });

    if (!existingContract) {
      return NextResponse.json(
        { success: false, message: "Contrat non trouvé" },
        { status: 404 }
      );
    }

    // Vérification d'autorisation
    if (existingContract.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Vous n'avez pas accès à ce contrat" },
        { status: 403 }
      );
    }

    // Gestion de la suppression du fichier en production
    if (process.env.NODE_ENV === 'production' && existingContract.fileKey) {
      // Supprimer le fichier associé au contrat
      // Exemple fictif :
      // await fileStorageService.deleteFile(existingContract.fileKey);
    }

    // Supprimer le contrat de la base de données
    await prisma.contract.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Contrat supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du contrat:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Une erreur est survenue"
      },
      { status: 500 }
    );
  }
} 