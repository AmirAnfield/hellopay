import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createHash } from "crypto";
import { format } from "date-fns";
import { getCurrentUser } from "@/lib/session";

// GET /api/contracts - Récupère les contrats de l'utilisateur connecté avec pagination
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification de l'utilisateur
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 }
      );
    }

    // Récupérer tous les paramètres de requête pour le filtrage/pagination
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const contractType = searchParams.get("contractType");
    const companyId = searchParams.get("companyId");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Construire le filtre pour la requête
    const filter: Record<string, unknown> = {
      userId: user.id, // Limiter aux contrats de l'utilisateur actuel
      OR: search
        ? [
            { title: { contains: search, mode: "insensitive" } },
            { reference: { contains: search, mode: "insensitive" } },
            { counterpartyName: { contains: search, mode: "insensitive" } },
            { tags: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
      status: status ? status : undefined,
      contractType: contractType ? contractType : undefined,
      companyId: companyId ? companyId : undefined,
    };

    // Nettoyer les filtres non définis
    Object.keys(filter).forEach((key) => {
      if (filter[key] === undefined) {
        delete filter[key];
      }
    });

    // Calcul des valeurs pour la pagination
    const skip = (page - 1) * pageSize;

    // Récupérer les contrats avec pagination et tri
    const [contracts, totalCount] = await Promise.all([
      prisma.contract.findMany({
        where: filter,
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take: pageSize,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.contract.count({ where: filter }),
    ]);

    // Calculer les informations de pagination
    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      success: true,
      data: contracts,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des contrats:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Une erreur est survenue" 
      },
      { status: 500 }
    );
  }
}

// POST /api/contracts - Crée un nouveau contrat
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification de l'utilisateur
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 }
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
    const file = formData.get("file") as File;

    // Validation de base
    if (!title || !status || !contractType || !companyId || !file) {
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

    // Générer un nom de fichier unique basé sur le titre, la date et une partie aléatoire
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
    } else {
      // Pour le développement et les tests, simuler le stockage
      fileUrl = `https://example.com/uploads/${fileName}`;
      fileKey = `uploads/${fileName}`;
    }

    // Créer le contrat dans la base de données
    const contract = await prisma.contract.create({
      data: {
        title,
        description,
        reference,
        status,
        contractType,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        companyId,
        counterpartyName,
        counterpartyEmail,
        tags,
        fileName,
        fileSize: file.size,
        fileType: file.type,
        fileUrl,
        fileKey,
        userId: user.id,
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
      data: contract,
      message: "Contrat créé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la création du contrat:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Une erreur est survenue" 
      },
      { status: 500 }
    );
  }
} 