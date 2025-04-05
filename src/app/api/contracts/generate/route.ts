import { NextResponse } from "next/server";
import { firestore, auth } from '@/lib/firebase/config';
import { doc, setDoc, collection } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const user = auth.currentUser;
    if (!user) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer les données du formulaire
    const formData = await request.formData();
    const contractDataStr = formData.get('contractData') as string;
    const contractToSaveStr = formData.get('contractToSave') as string;
    
    if (!contractDataStr) {
      return NextResponse.json({ success: false, message: 'Données du contrat manquantes' }, { status: 400 });
    }

    // Parser les données
    const contractData = JSON.parse(contractDataStr);
    const contractToSave = contractToSaveStr ? JSON.parse(contractToSaveStr) : null;
    
    // TODO: Générer le PDF avec un service dédié
    // const pdfBuffer = await generateContractPdf(contractData);
    
    // Enregistrer dans Firestore avec la nouvelle structure
    if (contractToSave) {
      // S'assurer que l'ID utilisateur est celui qui est connecté
      contractToSave.userId = user.uid;
      
      // Créer une référence au document dans la collection contracts
      const contractRef = doc(collection(firestore, 'contracts'), contractToSave.id);
      
      // Enregistrer les données
      await setDoc(contractRef, {
        ...contractToSave,
        updatedAt: new Date().toISOString()
      });
      
      // TODO: Si un PDF est généré, l'uploader sur Storage et mettre à jour le documentURL
    }

    return NextResponse.json({
      success: true,
      message: 'Contrat généré avec succès',
      data: {
        id: contractData.id,
        // documentUrl: pdfUrl (si disponible)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la génération du contrat:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
} 