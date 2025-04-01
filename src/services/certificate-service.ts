import { auth } from '@/lib/firebase';
import { getDocument, getDocuments, setDocument, updateDocument, deleteDocument } from './firestore-service';
import { getEmployee, Employee } from './employee-service';
import { getCompany, Company } from './company-service';
import { uploadCertificate } from './storage-service';
import { Certificate } from '@/types/firebase';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Type pour la création d'un certificat
 */
export interface CertificateInput {
  employeeId: string;
  companyId: string;
  type: 'attestation-travail';
  content?: string;
}

/**
 * Obtenir tous les certificats d'un employé
 */
export async function getEmployeeCertificates(companyId: string, employeeId: string): Promise<Certificate[]> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  try {
    // Vérifier si la collection certificates existe dans Firestore
    const certs = await getDocuments<Certificate>('certificates', {
      where: [
        { field: 'employeeId', operator: '==', value: employeeId },
        { field: 'companyId', operator: '==', value: companyId }
      ],
      orderBy: [{ field: 'createdAt', direction: 'desc' }]
    });
    
    return certs;
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération des certificats:", error);
    
    // Si la collection n'existe pas encore, on renvoie un tableau vide
    const firebaseError = error as { code?: string };
    if (firebaseError.code === 'permission-denied' || firebaseError.code === 'not-found') {
      return [];
    }
    
    throw error;
  }
}

/**
 * Obtenir un certificat par son ID
 */
export async function getCertificate(certificateId: string): Promise<Certificate | null> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  return getDocument<Certificate>(`users/${auth.currentUser.uid}/certificates`, certificateId);
}

/**
 * Créer un nouveau certificat
 */
export async function createCertificate(data: CertificateInput): Promise<string> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  try {
    // Créer le certificat dans Firestore sans typage explicite
    // Les timestamps seront ajoutés automatiquement par setDocument
    const certificateData = {
      employeeId: data.employeeId,
      companyId: data.companyId,
      type: data.type,
      content: data.content || '',
      status: 'draft',
      userId: auth.currentUser.uid,
      createdBy: auth.currentUser.uid,
      pdfUrl: ''
    };
    
    // Vérifier si la collection certificates existe et la créer si nécessaire
    const certificateId = await setDocument('certificates', certificateData);
    console.log("Certificat créé avec succès, ID:", certificateId);
    
    return certificateId;
  } catch (error) {
    console.error("Erreur lors de la création du certificat:", error);
    throw new Error("Impossible de créer le certificat. Veuillez réessayer.");
  }
}

/**
 * Mettre à jour un certificat
 */
export async function updateCertificateStatus(certificateId: string, status: 'draft' | 'generated' | 'signed', pdfUrl?: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Vérifier que le certificat existe
  const certificate = await getCertificate(certificateId);
  if (!certificate) {
    throw new Error("Certificat non trouvé");
  }
  
  const updateData: Partial<Certificate> = { status };
  if (pdfUrl) updateData.pdfUrl = pdfUrl;
  
  // Mettre à jour le certificat
  await updateDocument(
    `users/${auth.currentUser.uid}/certificates`, 
    certificateId, 
    updateData
  );
}

/**
 * Générer le contenu HTML d'une attestation de travail
 */
export async function generateCertificateContent(companyId: string, employeeId: string): Promise<string> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Récupérer les données de l'entreprise et de l'employé
  const company = await getCompany(companyId);
  if (!company) {
    throw new Error("Entreprise non trouvée");
  }
  
  const employee = await getEmployee(companyId, employeeId);
  if (!employee) {
    throw new Error("Employé non trouvé");
  }
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const employmentDate = employee.startDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Construction du contenu textuel du certificat
  return `
    Je soussigné(e), représentant légal de l'entreprise ${company.name}, atteste par la présente que :
    
    ${employee.firstName} ${employee.lastName}
    ${employee.socialSecurityNumber ? `N° de sécurité sociale : ${employee.socialSecurityNumber}` : ''}
    ${employee.address}, ${employee.postalCode} ${employee.city}
    
    Est employé(e) au sein de notre entreprise depuis le ${employmentDate} en qualité de ${employee.position} dans le cadre d'un contrat de travail à durée ${employee.contractType === 'CDI' ? 'indéterminée' : 'déterminée'}.
    
    Cette attestation est délivrée à l'intéressé(e) pour faire valoir ce que de droit.
    
    Fait à ${company.city}, le ${formattedDate}
  `;
}

/**
 * Générer le contenu HTML d'une attestation de travail (pour PDF)
 */
export function generateWorkCertificateHTML(employeeData: Employee, companyData: Company): string {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const employmentDate = employeeData.startDate instanceof Date 
    ? employeeData.startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date(employeeData.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  // Construction de l'HTML du certificat
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Attestation de travail</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 2cm;
          line-height: 1.5;
        }
        .header {
          text-align: center;
          margin-bottom: 2cm;
        }
        .logo {
          max-width: 200px;
          margin-bottom: 1cm;
        }
        .company-name {
          font-size: 18pt;
          font-weight: bold;
          margin-bottom: 5mm;
        }
        .company-details {
          font-size: 10pt;
          margin-bottom: 1cm;
        }
        .document-title {
          font-size: 16pt;
          font-weight: bold;
          text-align: center;
          margin: 1cm 0;
        }
        .content {
          font-size: 11pt;
          text-align: justify;
        }
        .signature {
          margin-top: 2cm;
          text-align: right;
        }
        .footer {
          margin-top: 2cm;
          font-size: 9pt;
          text-align: center;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${companyData.name}</div>
        <div class="company-details">
          ${companyData.address}, ${companyData.postalCode} ${companyData.city}<br>
          SIRET: ${companyData.siret}
        </div>
      </div>
      
      <div class="document-title">ATTESTATION DE TRAVAIL</div>
      
      <div class="content">
        <p>Je soussigné(e), représentant légal de l'entreprise ${companyData.name}, atteste par la présente que :</p>
        
        <p style="margin-left: 1cm;">
          <strong>${employeeData.firstName} ${employeeData.lastName}</strong><br>
          ${employeeData.socialSecurityNumber ? `N° de sécurité sociale : ${employeeData.socialSecurityNumber}<br>` : ''}
          ${employeeData.address}, ${employeeData.postalCode} ${employeeData.city}
        </p>
        
        <p>Est employé(e) au sein de notre entreprise depuis le <strong>${employmentDate}</strong> en qualité de <strong>${employeeData.position}</strong> dans le cadre d'un contrat de travail à durée ${employeeData.contractType === 'CDI' ? 'indéterminée' : 'déterminée'}.</p>
        
        <p>Cette attestation est délivrée à l'intéressé(e) pour faire valoir ce que de droit.</p>
      </div>
      
      <div class="signature">
        <p>Fait à ${companyData.city}, le ${formattedDate}</p>
        <p style="margin-top: 2cm;">Signature et cachet de l'entreprise</p>
      </div>
      
      <div class="footer">
        <p>Document généré automatiquement par HelloPay - Ne pas modifier</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Générer un PDF d'attestation de travail
 */
export async function generateWorkCertificatePDF(certificateId: string): Promise<string> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Récupérer le certificat
  const certificate = await getCertificate(certificateId);
  if (!certificate) {
    throw new Error("Certificat non trouvé");
  }
  
  // Récupérer les données de l'entreprise et de l'employé
  const company = await getCompany(certificate.companyId);
  if (!company) {
    throw new Error("Entreprise non trouvée");
  }
  
  const employee = await getEmployee(certificate.companyId, certificate.employeeId);
  if (!employee) {
    throw new Error("Employé non trouvé");
  }
  
  // Générer le PDF avec jsPDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Définir quelques variables pour le positionnement
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;
  const marginTop = 20;
  const contentWidth = pageWidth - (marginLeft * 2);
  
  // Ajout de l'en-tête avec les informations de l'entreprise
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, pageWidth / 2, marginTop, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${company.address}, ${company.postalCode} ${company.city}`, pageWidth / 2, marginTop + 10, { align: 'center' });
  doc.text(`SIRET: ${company.siret}`, pageWidth / 2, marginTop + 15, { align: 'center' });
  
  // Titre du document
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ATTESTATION DE TRAVAIL', pageWidth / 2, marginTop + 30, { align: 'center' });
  
  // Contenu principal de l'attestation
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  let yPosition = marginTop + 45;
  
  // Date du jour
  const today = new Date();
  const formattedDate = today.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  });
  
  // Date d'emploi
  const employmentDate = employee.startDate instanceof Date 
    ? employee.startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date(employee.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  
  // Paragraphe d'introduction
  doc.text(`Je soussigné(e), représentant légal de l'entreprise ${company.name}, atteste par la présente que :`, marginLeft, yPosition);
  
  // Informations de l'employé
  yPosition += 10;
  doc.setFont('helvetica', 'bold');
  doc.text(`${employee.firstName} ${employee.lastName}`, marginLeft + 10, yPosition);
  doc.setFont('helvetica', 'normal');
  
  yPosition += 5;
  if (employee.socialSecurityNumber) {
    doc.text(`N° de sécurité sociale : ${employee.socialSecurityNumber}`, marginLeft + 10, yPosition);
    yPosition += 5;
  }
  
  doc.text(`${employee.address}, ${employee.postalCode} ${employee.city}`, marginLeft + 10, yPosition);
  
  // Détails de l'emploi
  yPosition += 10;
  const contractType = employee.contractType === 'CDI' ? 'indéterminée' : 'déterminée';
  doc.text(`Est employé(e) au sein de notre entreprise depuis le ${employmentDate} en qualité de ${employee.position} dans le cadre d'un contrat de travail à durée ${contractType}.`, marginLeft, yPosition, {
    maxWidth: contentWidth,
    align: 'justify'
  });
  
  // Phrase de conclusion
  yPosition += 15;
  doc.text(`Cette attestation est délivrée à l'intéressé(e) pour faire valoir ce que de droit.`, marginLeft, yPosition, {
    maxWidth: contentWidth
  });
  
  // Signature
  yPosition += 30;
  doc.text(`Fait à ${company.city}, le ${formattedDate}`, pageWidth - marginLeft, yPosition, { align: 'right' });
  
  yPosition += 15;
  doc.text(`Signature et cachet de l'entreprise`, pageWidth - marginLeft, yPosition, { align: 'right' });
  
  // Pied de page
  doc.setFontSize(8);
  doc.text(`Document généré automatiquement par HelloPay - Ne pas modifier`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  
  // Convertir en Blob
  const pdfBlob = doc.output('blob');
  const file = new File([pdfBlob], `attestation_travail_${employee.id}.pdf`, { type: 'application/pdf' });
  
  // Upload du fichier PDF
  const downloadUrl = await uploadCertificate(file, certificate.employeeId, certificate.id, certificate.companyId);
  
  // Mettre à jour le certificat avec l'URL du PDF
  await updateCertificateStatus(certificateId, 'generated', downloadUrl);
  
  return downloadUrl;
}

/**
 * Supprimer un certificat
 */
export async function deleteCertificate(certificateId: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Vérifier que le certificat existe
  const certificate = await getCertificate(certificateId);
  if (!certificate) {
    throw new Error("Certificat non trouvé");
  }
  
  // Supprimer le certificat
  await deleteDocument(`users/${auth.currentUser.uid}/certificates`, certificateId);
} 