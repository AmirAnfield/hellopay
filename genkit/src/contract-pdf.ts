import { onCall, CallableRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as puppeteer from "puppeteer";
import * as logger from "firebase-functions/logger";
import { AIContractMemory } from "./types/firebase";

// Interface pour les paramètres de la fonction
interface ExportContractPdfParams {
  contractId: string;
  memoryId?: string;
}

// Interface pour la réponse de la fonction
interface ExportContractPdfResponse {
  pdfUrl: string;
  fileName: string;
  success: boolean;
  message?: string;
}

/**
 * Fonction Cloud pour exporter un contrat en PDF
 * 
 * Cette fonction va:
 * 1. Récupérer les données du contrat depuis Firestore (ou la mémoire AI)
 * 2. Générer un document HTML formaté
 * 3. Convertir le HTML en PDF avec Puppeteer
 * 4. Stocker le PDF dans Firebase Storage
 * 5. Retourner l'URL du PDF stocké
 */
export const exportContractPdf = onCall<ExportContractPdfParams, ExportContractPdfResponse>({
  region: "europe-west1",
  memory: "1GiB",  // Puppeteer a besoin de plus de mémoire
  timeoutSeconds: 120, // Les PDFs peuvent prendre du temps à générer
}, async (request: CallableRequest<ExportContractPdfParams>) => {
  // Vérifier l'authentification
  if (!request.auth) {
    throw new Error("Utilisateur non authentifié");
  }

  // Récupérer les paramètres
  const { contractId, memoryId } = request.data;
  if (!contractId) {
    throw new Error("L'ID du contrat est requis");
  }

  try {
    // Essayer d'abord de récupérer le contrat depuis Firestore (s'il existe déjà)
    let contractData: any;
    let memory: AIContractMemory | undefined;
    
    // Vérifier si le contrat existe déjà
    const contractRef = admin.firestore()
      .collection("contracts")
      .doc(contractId);
    
    const contractDoc = await contractRef.get();
    
    if (contractDoc.exists) {
      // Le contrat existe déjà, utiliser ses données
      contractData = contractDoc.data();
      
      // Vérifier que l'utilisateur a le droit d'accéder à ce contrat
      if (contractData.userId !== request.auth.uid && contractData.createdBy !== request.auth.uid) {
        throw new Error("Vous n'êtes pas autorisé à exporter ce contrat");
      }
      
      // Vérifier si le contrat est verrouillé
      if (contractData.locked) {
        // Si une URL de PDF existe déjà, la retourner directement
        if (contractData.pdfUrl) {
          return {
            pdfUrl: contractData.pdfUrl,
            fileName: `${contractId}.pdf`,
            success: true,
            message: "PDF existant récupéré"
          };
        }
      }
    } else {
      // Le contrat n'existe pas, essayer d'utiliser la mémoire AI
      const memoryDocRef = admin.firestore()
        .collection("ai_contract_memories")
        .doc(memoryId || contractId);
      
      const memoryDoc = await memoryDocRef.get();
      
      if (!memoryDoc.exists) {
        throw new Error("Contrat ou mémoire AI introuvable");
      }
      
      memory = memoryDoc.data() as AIContractMemory;
      
      // Vérifier que l'utilisateur a le droit d'accéder à cette mémoire
      if (memory.userId !== request.auth.uid) {
        throw new Error("Vous n'êtes pas autorisé à exporter ce contrat");
      }
      
      // Utiliser la mémoire AI comme source des données du contrat
      contractData = {
        contractId: contractId,
        companyId: memory.company?.id,
        employeeId: memory.employee?.id,
        contractType: memory.contractType,
        fields: memory.fields,
        clauses: memory.clauses,
        createdBy: memory.userId,
        locked: false,
        signed: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
    }

    // Générer le HTML du contrat
    const contractHtml = generateContractHtml(contractData, memory);

    // Convertir le HTML en PDF avec Puppeteer
    logger.info("Génération du PDF avec Puppeteer pour le contrat", { contractId });
    const pdfBuffer = await generatePdf(contractHtml);

    // Stocker le PDF dans Firebase Storage
    const fileName = `${contractId}_${Date.now()}.pdf`;
    const filePath = `contracts_pdfs/${fileName}`;
    
    const bucket = admin.storage().bucket();
    const file = bucket.file(filePath);
    
    await file.save(pdfBuffer, {
      metadata: {
        contentType: 'application/pdf',
      },
    });

    // Créer une URL signée pour le téléchargement (valide 1 semaine)
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 semaine
    });

    // Si le contrat n'existait pas encore, le créer maintenant
    if (!contractDoc.exists) {
      await contractRef.set({
        ...contractData,
        pdfUrl: signedUrl,
        pdfStoragePath: filePath,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Sinon mettre à jour le document existant
      await contractRef.update({
        pdfUrl: signedUrl,
        pdfStoragePath: filePath,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Retourner l'URL du PDF et le message de succès
    return {
      pdfUrl: signedUrl,
      fileName: fileName,
      success: true,
      message: "PDF généré et stocké avec succès"
    };

  } catch (error) {
    logger.error("Erreur lors de l'exportation du contrat en PDF:", error);
    throw new Error(`Échec de l'exportation PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
});

/**
 * Verrouille un contrat pour empêcher les modifications futures
 */
export const lockContract = onCall<{ contractId: string }, { success: boolean, message: string }>({
  region: "europe-west1",
}, async (request: CallableRequest<{ contractId: string }>) => {
  // Vérifier l'authentification
  if (!request.auth) {
    throw new Error("Utilisateur non authentifié");
  }

  const { contractId } = request.data;
  if (!contractId) {
    throw new Error("L'ID du contrat est requis");
  }

  try {
    const contractRef = admin.firestore()
      .collection("contracts")
      .doc(contractId);
    
    const contractDoc = await contractRef.get();
    
    if (!contractDoc.exists) {
      throw new Error("Contrat introuvable");
    }
    
    const contractData = contractDoc.data();
    
    // Vérifier que l'utilisateur a le droit d'accéder à ce contrat
    if (contractData?.userId !== request.auth.uid && contractData?.createdBy !== request.auth.uid) {
      throw new Error("Vous n'êtes pas autorisé à verrouiller ce contrat");
    }
    
    // Vérifier si le contrat est déjà verrouillé
    if (contractData?.locked) {
      return {
        success: true,
        message: "Le contrat est déjà verrouillé"
      };
    }
    
    // Verrouiller le contrat
    await contractRef.update({
      locked: true,
      lockedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: true,
      message: "Contrat verrouillé avec succès"
    };
    
  } catch (error) {
    logger.error("Erreur lors du verrouillage du contrat:", error);
    throw new Error(`Échec du verrouillage: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
});

/**
 * Génère un document HTML formaté à partir des données du contrat
 */
function generateContractHtml(contractData: any, memory?: AIContractMemory): string {
  // Récupérer les informations nécessaires
  const company = contractData.company || memory?.company || {};
  const employee = contractData.employee || memory?.employee || {};
  const contractType = contractData.contractType || memory?.contractType || '';
  const fields = contractData.fields || {};
  const clauses = contractData.clauses || {};
  
  // Formater le type de contrat pour l'affichage
  const formattedContractType = formatContractType(contractType);
  
  // Construire le HTML du contrat
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Contrat de travail - ${employee.fullName || 'Employé'}</title>
      <style>
        @page {
          size: A4;
          margin: 2cm;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .title {
          font-size: 16pt;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 14pt;
          margin-bottom: 20px;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 10px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .clause {
          margin-bottom: 15px;
          text-align: justify;
        }
        .signature-block {
          margin-top: 50px;
          page-break-inside: avoid;
        }
        .signature {
          display: inline-block;
          width: 45%;
          vertical-align: top;
        }
        .footer {
          text-align: center;
          font-size: 9pt;
          color: #777;
          margin-top: 50px;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
        .page-number {
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-size: 9pt;
        }
        .page-break {
          page-break-after: always;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">Contrat de travail</div>
        <div class="subtitle">${formattedContractType}</div>
      </div>
      
      <div class="section">
        <div class="section-title">Entre les soussignés</div>
        <div class="clause">
          <strong>${company.name || 'L\'entreprise'}</strong>
          ${company.siret ? `<br>SIRET : ${company.siret}` : ''}
          ${company.address ? `<br>Siège social : ${company.address}` : ''}
          ${company.postalCode && company.city ? `<br>${company.postalCode} ${company.city}` : ''}
          <br>Représentée par son représentant légal en exercice,
          <br>Ci-après dénommée « l'Employeur »,
        </div>
        <div class="clause">
          <strong>Et</strong>
          <br>${employee.fullName || 'L\'employé(e)'}
          ${employee.birthDate && employee.birthPlace ? `<br>Né(e) le ${employee.birthDate} à ${employee.birthPlace}` : ''}
          ${employee.address ? `<br>Demeurant : ${employee.address}` : ''}
          ${employee.postalCode && employee.city ? `<br>${employee.postalCode} ${employee.city}` : ''}
          ${employee.socialSecurityNumber ? `<br>N° de sécurité sociale : ${employee.socialSecurityNumber}` : ''}
          <br>Ci-après dénommé(e) « le/la Salarié(e) »,
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Il a été convenu ce qui suit</div>
        
        <div class="clause">
          <strong>Article 1 - Engagement</strong>
          <br>${clauses.introduction || ''}
        </div>
        
        <div class="clause">
          <strong>Article 2 - Fonction</strong>
          <br>Le/la salarié(e) est engagé(e) en qualité de ${fields.position || '[Fonction]'}, statut ${fields.qualification || 'employé'}.
        </div>
        
        <div class="clause">
          <strong>Article 3 - Durée du contrat</strong>
          <br>${generateDurationClause(contractType, fields)}
        </div>
        
        <div class="clause">
          <strong>Article 4 - Période d'essai</strong>
          <br>${generateTrialPeriodClause(fields, clauses)}
        </div>
        
        <div class="clause">
          <strong>Article 5 - Lieu de travail</strong>
          <br>Le/la salarié(e) exercera ses fonctions à ${fields.workLocation || company.address || '[Adresse du lieu de travail]'}.
          ${fields.hasRemoteWork ? '<br>Le télétravail est autorisé selon les modalités définies par l\'entreprise.' : ''}
        </div>
        
        <div class="clause">
          <strong>Article 6 - Horaires de travail</strong>
          <br>${clauses.workingTime || generateWorkingTimeClause(fields)}
        </div>
        
        <div class="clause">
          <strong>Article 7 - Rémunération</strong>
          <br>${generateRemunerationClause(fields)}
        </div>
        
        <div class="clause">
          <strong>Article 8 - Obligations et confidentialité</strong>
          <br>Le/la salarié(e) s'engage à respecter les règles internes de l'entreprise et à préserver la confidentialité des informations auxquelles il/elle pourrait avoir accès dans le cadre de ses fonctions.
        </div>
        
        ${generateAdditionalClauses(clauses)}
      </div>
      
      <div class="signature-block">
        <div class="section-title">Fait en deux exemplaires</div>
        <div class="clause">
          À ${company.city || '[Ville]'}, le ${new Date().toLocaleDateString('fr-FR')}
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
          <div class="signature">
            <div>Pour l'employeur,</div>
            <div style="margin-top: 50px;">Signature précédée de la mention "Lu et approuvé"</div>
          </div>
          
          <div class="signature">
            <div>Le/la salarié(e),</div>
            <div style="margin-top: 50px;">Signature précédée de la mention "Lu et approuvé"</div>
          </div>
        </div>
      </div>
      
      <div class="footer">
        Contrat généré par HelloPay - Tous droits réservés
      </div>
      
      <div class="page-number">Page 1/1</div>
    </body>
    </html>
  `;
}

/**
 * Génère le PDF à partir du HTML avec Puppeteer
 */
async function generatePdf(html: string): Promise<Buffer> {
  // Lancer un navigateur headless
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Créer une nouvelle page
    const page = await browser.newPage();
    
    // Définir le contenu HTML
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Générer le PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="width: 100%; font-size: 10px; text-align: center; color: #777;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `
    });
    
    return pdfBuffer;
  } finally {
    // Fermer le navigateur dans tous les cas
    await browser.close();
  }
}

/**
 * Formate le type de contrat pour l'affichage
 */
function formatContractType(contractType: string): string {
  switch (contractType) {
    case 'CDI_temps_plein':
      return 'Contrat à Durée Indéterminée à temps plein';
    case 'CDI_temps_partiel':
      return 'Contrat à Durée Indéterminée à temps partiel';
    case 'CDD_temps_plein':
      return 'Contrat à Durée Déterminée à temps plein';
    case 'CDD_temps_partiel':
      return 'Contrat à Durée Déterminée à temps partiel';
    case 'STAGE':
      return 'Convention de Stage';
    case 'FREELANCE':
      return 'Contrat de Prestation de Services';
    default:
      return contractType.replace('_', ' ');
  }
}

/**
 * Génère la clause de durée du contrat
 */
function generateDurationClause(contractType: string, fields: any): string {
  if (contractType.includes('CDI')) {
    return 'Le présent contrat est conclu pour une durée indéterminée.';
  } else if (contractType.includes('CDD')) {
    let clause = 'Le présent contrat est conclu pour une durée déterminée.';
    
    if (fields.startDate) {
      clause += `<br>Il commencera le ${formatDate(fields.startDate)}`;
      
      if (fields.endDate) {
        clause += ` et se terminera le ${formatDate(fields.endDate)}.`;
      } else {
        clause += ' et aura une durée de [durée].';
      }
    }
    
    return clause;
  } else if (contractType === 'STAGE') {
    let clause = 'La présente convention de stage';
    
    if (fields.startDate) {
      clause += ` débute le ${formatDate(fields.startDate)}`;
      
      if (fields.endDate) {
        clause += ` et se termine le ${formatDate(fields.endDate)}.`;
      } else {
        clause += ' et aura une durée de [durée].';
      }
    }
    
    return clause;
  } else if (contractType === 'FREELANCE') {
    return 'Le présent contrat est conclu pour la durée de la mission définie, à compter de sa signature.';
  }
  
  return 'Le présent contrat commence à la date de signature.';
}

/**
 * Génère la clause de période d'essai
 */
function generateTrialPeriodClause(fields: any, clauses: any): string {
  if (clauses.trialPeriod) {
    return clauses.trialPeriod;
  }
  
  if (fields.trialPeriod) {
    return `Le présent contrat comporte une période d'essai de ${fields.trialPeriodDuration || '2 mois'}, au cours de laquelle chacune des parties pourra rompre le contrat sans indemnité ni préavis.`;
  }
  
  return 'Le présent contrat ne comporte pas de période d\'essai.';
}

/**
 * Génère la clause d'horaires de travail
 */
function generateWorkingTimeClause(fields: any): string {
  let clause = `Le/la salarié(e) est engagé(e) pour une durée hebdomadaire de travail de ${fields.workingHours || '35'} heures.`;
  
  return clause;
}

/**
 * Génère la clause de rémunération
 */
function generateRemunerationClause(fields: any): string {
  let clause = 'En contrepartie de son travail, le/la salarié(e) percevra';
  
  if (fields.salary) {
    clause += ` une rémunération mensuelle brute de ${fields.salary} euros, pour une durée mensuelle de travail de ${fields.workingHours || '35'} heures.`;
  } else {
    clause += ' une rémunération mensuelle brute de [montant] euros.';
  }
  
  return clause;
}

/**
 * Génère des clauses additionnelles à partir des clauses personnalisées
 */
function generateAdditionalClauses(clauses: any): string {
  let additionalClausesHtml = '';
  let articleNumber = 9;
  
  // Ajouter des clauses supplémentaires s'il y en a
  if (clauses.duties) {
    additionalClausesHtml += `
      <div class="clause">
        <strong>Article ${articleNumber++} - Missions et obligations</strong>
        <br>${clauses.duties}
      </div>
    `;
  }
  
  if (clauses.remuneration) {
    additionalClausesHtml += `
      <div class="clause">
        <strong>Article ${articleNumber++} - Détails de rémunération</strong>
        <br>${clauses.remuneration}
      </div>
    `;
  }
  
  if (clauses.duration) {
    additionalClausesHtml += `
      <div class="clause">
        <strong>Article ${articleNumber++} - Précisions sur la durée</strong>
        <br>${clauses.duration}
      </div>
    `;
  }
  
  if (clauses.termination) {
    additionalClausesHtml += `
      <div class="clause">
        <strong>Article ${articleNumber++} - Rupture du contrat</strong>
        <br>${clauses.termination}
      </div>
    `;
  }
  
  return additionalClausesHtml;
}

/**
 * Formate une date pour l'affichage
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
} 