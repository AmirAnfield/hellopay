import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase/firebase-admin";
import { generatePDF } from "@/lib/pdf-generation";
import { contractSchema } from "@/lib/validators/contracts";
import { generateContractFromTemplate } from "@/lib/contracts/template-generator";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 }
      );
    }

    // Traiter le FormData
    const formData = await req.formData();
    const contractDataJson = formData.get("contractData");
    const generatePdfOption = formData.get("generatePdf");

    if (!contractDataJson || typeof contractDataJson !== "string") {
      return NextResponse.json(
        { success: false, message: "Données de contrat manquantes" },
        { status: 400 }
      );
    }

    // Parser et valider les données du contrat
    const contractData = JSON.parse(contractDataJson);
    
    try {
      contractSchema.parse(contractData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Données de contrat invalides", 
            errors: error.errors 
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Générer le contenu du contrat
    const contractContent = generateContractFromTemplate(contractData);

    // Si l'option de génération PDF est activée
    let pdfUrl = null;
    if (generatePdfOption === "true") {
      // Générer le PDF
      const pdfBuffer = await generatePDF(contractContent);
      
      // Stocker le PDF dans Firebase Storage
      // Code à implémenter pour le stockage du PDF
      // pdfUrl = await uploadPdfToStorage(pdfBuffer, contractData.id);
      
      // Pour l'instant, on simule l'URL du PDF
      pdfUrl = `/api/contracts/${contractData.id}/pdf`;
    }

    // Préparer les données pour Firestore
    const firestoreData = {
      ...contractData,
      createdAt: Timestamp.fromDate(new Date(contractData.createdAt)),
      updatedAt: Timestamp.fromDate(new Date()),
      userId: session.user.id,
      userEmail: session.user.email,
      generation: {
        ...contractData.generation,
        dateGeneration: Timestamp.fromDate(new Date()),
        documentGenere: pdfUrl
      }
    };

    // Enregistrer dans Firestore
    await db.collection("contracts").doc(contractData.id).set(firestoreData, { merge: true });

    // Retourner la réponse
    return NextResponse.json({
      success: true,
      message: "Contrat généré avec succès",
      data: {
        id: contractData.id,
        pdfUrl: pdfUrl
      }
    });
  } catch (error: any) {
    console.error("Erreur lors de la génération du contrat:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Une erreur est survenue" },
      { status: 500 }
    );
  }
} 