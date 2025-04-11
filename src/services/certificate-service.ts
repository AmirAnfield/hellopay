import { auth } from '@/lib/firebase';
import { getDocument, getDocuments, setDocument, updateDocument, deleteDocument } from './firestore-service';
import { Employee } from './employee-service';
import { Company } from './company-service';
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
  type: 'attestation-travail' | 'attestation-salaire' | 'attestation-presence';
  content?: string;
  options?: Record<string, unknown>;
  title?: string;
}

// Fonctions pour récupérer les données d'un employé et d'une entreprise
export async function getEmployee(companyId: string, employeeId: string): Promise<Employee | null> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  return getDocument<Employee>(`users/${auth.currentUser.uid}/employees`, employeeId);
}

export async function getCompany(companyId: string): Promise<Company | null> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  return getDocument<Company>(`users/${auth.currentUser.uid}/companies`, companyId);
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
    const certs = await getDocuments<Certificate>(`users/${auth.currentUser.uid}/certificates`, {
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
  
  console.log("Création d'un nouveau certificat avec les données:", {
    employeeId: data.employeeId,
    companyId: data.companyId,
    type: data.type,
    title: data.title,
    optionsSize: data.options ? Object.keys(data.options).length : 0
  });
  
  try {
    // Générer un titre par défaut si non fourni
    const title = data.title || `Attestation - ${data.type.split('-')[1]}`;
    
    // Nettoyer les options pour éviter les valeurs undefined
    let cleanOptions: Record<string, unknown> = {};
    if (data.options) {
      cleanOptions = { ...data.options };
      Object.keys(cleanOptions).forEach(key => {
        if (cleanOptions[key] === undefined) {
          delete cleanOptions[key];
        }
      });
    }
    
    // Créer le certificat dans Firestore
    const certificateData = {
      employeeId: data.employeeId,
      companyId: data.companyId,
      type: data.type,
      title: title,
      content: data.content || '',
      options: cleanOptions,
      status: 'draft',
      userId: auth.currentUser.uid,
      createdBy: auth.currentUser.uid,
      pdfUrl: '',
      createdAt: new Date()
    };
    
    console.log("Données du certificat à enregistrer:", certificateData);
    
    // Utiliser la collection appropriée de l'utilisateur
    const collectionPath = `users/${auth.currentUser.uid}/certificates`;
    console.log("Chemin de collection:", collectionPath);
    
    const certificateId = await setDocument(collectionPath, certificateData);
    console.log("Certificat créé avec succès, ID:", certificateId);
    
    return certificateId;
  } catch (error) {
    console.error("Erreur détaillée lors de la création du certificat:", error);
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
 * Mettre à jour les données d'un certificat
 */
export async function updateCertificate(certificateId: string, data: Partial<CertificateInput>): Promise<void> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Vérifier que le certificat existe
  const certificate = await getCertificate(certificateId);
  if (!certificate) {
    throw new Error("Certificat non trouvé");
  }
  
  // Préparer les données à mettre à jour
  const updateData: Partial<Certificate> = {};
  
  if (data.title) updateData.title = data.title;
  if (data.content) updateData.content = data.content;
  
  if (data.options) {
    // Fusion des options existantes avec les nouvelles
    updateData.options = {
      ...certificate.options,
      ...data.options
    };
  }
  
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
 * Générer un PDF pour un certificat en fonction de son type
 */
export async function generateCertificatePDF(certificateId: string): Promise<string> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  console.log("Début de génération du PDF pour certificat:", certificateId);
  
  // Récupérer le certificat
  const certificate = await getCertificate(certificateId);
  console.log("Certificat récupéré:", certificate);
  
  if (!certificate) {
    throw new Error("Certificat non trouvé");
  }
  
  // Vérifier que le type du certificat est valide
  if (!certificate.type || 
      !['attestation-travail', 'attestation-salaire', 'attestation-presence'].includes(certificate.type)) {
    throw new Error(`Type d'attestation invalide ou manquant: ${certificate.type}`);
  }
  
  // Générer le PDF selon le type d'attestation
  try {
    console.log("Génération du PDF pour le type:", certificate.type);
    let url;
    
    switch (certificate.type) {
      case 'attestation-travail':
        url = await generateWorkCertificatePDF(certificateId);
        break;
      case 'attestation-salaire':
        url = await generateSalaryCertificatePDF(certificateId);
        break;
      case 'attestation-presence':
        url = await generatePresenceCertificatePDF(certificateId);
        break;
      default:
        throw new Error(`Type d'attestation non pris en charge: ${certificate.type}`);
    }
    
    console.log("PDF généré avec succès, URL:", url);
    return url;
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    throw error; // Rethrow pour permettre la gestion en amont
  }
}

/**
 * Générer un PDF d'attestation de salaire
 */
export async function generateSalaryCertificatePDF(certificateId: string): Promise<string> {
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
  
  // Extraire les options spécifiques
  const options = certificate.options || {};
  const grossSalary = options.grossSalary as number || 0;
  const netSalary = options.netSalary as number || 0;
  const taxableSalary = options.taxableSalary as number || 0;
  const startDate = options.startDate as string || '';
  const endDate = options.endDate as string || '';
  const salaryDetail = options.salaryDetail as string || 'detailed';
  const language = options.language as string || 'fr';
  
  // Générer le PDF avec jsPDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Variables pour le positionnement
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;
  const marginTop = 20;
  const contentWidth = pageWidth - (marginLeft * 2);
  
  // Entête
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, pageWidth / 2, marginTop, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${company.address}, ${company.postalCode} ${company.city}`, pageWidth / 2, marginTop + 10, { align: 'center' });
  doc.text(`SIRET: ${company.siret}`, pageWidth / 2, marginTop + 15, { align: 'center' });
  
  // Titre
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ATTESTATION DE SALAIRE', pageWidth / 2, marginTop + 30, { align: 'center' });
  
  // Contenu principal
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  let yPosition = marginTop + 45;
  
  // Date du jour
  const today = new Date();
  const formattedDate = today.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  });
  
  // Introduction
  doc.text(`Je soussigné(e), représentant légal de l'entreprise ${company.name}, atteste que :`, marginLeft, yPosition);
  
  // Informations de l'employé
  yPosition += 15;
  doc.setFont('helvetica', 'bold');
  doc.text(`${employee.firstName} ${employee.lastName}`, marginLeft + 10, yPosition);
  doc.setFont('helvetica', 'normal');
  
  yPosition += 10;
  doc.text(`Employé(e) depuis le ${startDate ? new Date(startDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  }) : "N/A"}`, marginLeft + 10, yPosition);
  
  yPosition += 5;
  doc.text(`En qualité de ${employee.position || "employé(e)"}`, marginLeft + 10, yPosition);
  
  // Informations salariales
  yPosition += 15;
  doc.text(`A perçu les rémunérations suivantes au cours de la période du ${startDate ? new Date(startDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  }) : "N/A"} au ${endDate ? new Date(endDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  }) : "N/A"} :`, marginLeft, yPosition);
  
  // Détails du salaire
  yPosition += 10;
  
  if (salaryDetail === 'detailed') {
    doc.text(`Salaire brut mensuel: ${grossSalary.toLocaleString()} €`, marginLeft + 10, yPosition);
    yPosition += 5;
    doc.text(`Salaire net mensuel: ${netSalary.toLocaleString()} €`, marginLeft + 10, yPosition);
    yPosition += 5;
    doc.text(`Salaire net imposable: ${taxableSalary.toLocaleString()} €`, marginLeft + 10, yPosition);
  } else {
    doc.text(`Salaire net mensuel: ${netSalary.toLocaleString()} €`, marginLeft + 10, yPosition);
  }
  
  // Phrase de conclusion
  yPosition += 15;
  doc.text("Cette attestation est délivrée à la demande de l'intéressé(e) pour servir et valoir ce que de droit.", marginLeft, yPosition, {
    maxWidth: contentWidth
  });
  
  // Signature
  yPosition += 30;
  doc.text(`Fait à ${company.city}, le ${formattedDate}`, pageWidth - marginLeft, yPosition, { align: 'right' });
  
  yPosition += 15;
  doc.text("Signature et cachet de l'entreprise", pageWidth - marginLeft, yPosition, { align: 'right' });
  
  // Pied de page
  doc.setFontSize(8);
  doc.text("Document généré automatiquement par HelloPay - Ne pas modifier", pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  
  // Convertir en Blob
  const pdfBlob = doc.output('blob');
  const file = new File([pdfBlob], `attestation_salaire_${employee.id}.pdf`, { type: 'application/pdf' });
  
  // Upload du fichier PDF
  const downloadUrl = await uploadCertificate(file, certificate.employeeId, certificate.id, certificate.companyId);
  
  // Mettre à jour le certificat avec l'URL du PDF
  await updateCertificateStatus(certificateId, 'generated', downloadUrl);
  
  return downloadUrl;
}

/**
 * Générer un PDF d'attestation de présence
 */
export async function generatePresenceCertificatePDF(certificateId: string): Promise<string> {
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
  
  // Extraire les options spécifiques
  const options = certificate.options || {};
  const startDate = options.startDate as string || '';
  const endDate = options.endDate as string || '';
  const showAddress = options.showAddress as boolean || false;
  const showRegularAttendance = options.showRegularAttendance as boolean || true;
  const showAbsences = options.showAbsences as boolean || false;
  const absenceText = options.absenceText as string || '';
  
  // Générer le PDF avec jsPDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Variables pour le positionnement
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;
  const marginTop = 20;
  const contentWidth = pageWidth - (marginLeft * 2);
  
  // Entête
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, pageWidth / 2, marginTop, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${company.address}, ${company.postalCode} ${company.city}`, pageWidth / 2, marginTop + 10, { align: 'center' });
  doc.text(`SIRET: ${company.siret}`, pageWidth / 2, marginTop + 15, { align: 'center' });
  
  // Titre
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ATTESTATION DE PRÉSENCE', pageWidth / 2, marginTop + 30, { align: 'center' });
  
  // Contenu principal
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
  
  // Introduction
  doc.text(`Je soussigné(e), représentant légal de l'entreprise ${company.name}, certifie que :`, marginLeft, yPosition);
  
  // Informations de l'employé
  yPosition += 15;
  doc.setFont('helvetica', 'bold');
  doc.text(`${employee.firstName} ${employee.lastName}`, marginLeft + 10, yPosition);
  doc.setFont('helvetica', 'normal');
  
  // Afficher l'adresse si demandé
  if (showAddress && employee.address) {
    yPosition += 5;
    doc.text(`Demeurant à ${employee.address}, ${employee.postalCode} ${employee.city}`, marginLeft + 10, yPosition);
  }
  
  // Période de présence
  yPosition += 10;
  doc.text(`A été présent(e) dans notre entreprise du ${startDate ? new Date(startDate).toLocaleDateString('fr-FR', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  }) : "N/A"} au ${endDate ? new Date(endDate).toLocaleDateString('fr-FR', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  }) : "N/A"},`, marginLeft, yPosition);
  
  yPosition += 5;
  doc.text(`En qualité de ${employee.position || "employé(e)"}, sous contrat ${employee.contractType || "CDI"}.`, marginLeft, yPosition);
  
  // Assiduité
  if (showRegularAttendance) {
    yPosition += 10;
    doc.text("Durant cette période, le salarié a exercé ses fonctions de manière régulière.", marginLeft, yPosition);
  }
  
  // Absences
  if (showAbsences && absenceText) {
    yPosition += 10;
    doc.text(`Absences constatées : ${absenceText}`, marginLeft, yPosition);
  } else if (showRegularAttendance) {
    yPosition += 5;
    doc.text("Aucune absence significative n'a été constatée sur cette période, hormis les congés légaux.", marginLeft, yPosition);
  }
  
  // Phrase de conclusion
  yPosition += 15;
  doc.text("Cette attestation est remise à la demande de l'intéressé(e) pour servir et valoir ce que de droit.", marginLeft, yPosition, {
    maxWidth: contentWidth
  });
  
  // Signature
  yPosition += 30;
  doc.text(`Fait à ${company.city}, le ${formattedDate}`, pageWidth - marginLeft, yPosition, { align: 'right' });
  
  yPosition += 15;
  doc.text("Signature et cachet de l'entreprise", pageWidth - marginLeft, yPosition, { align: 'right' });
  
  // Pied de page
  doc.setFontSize(8);
  doc.text("Document généré automatiquement par HelloPay - Ne pas modifier", pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  
  // Convertir en Blob
  const pdfBlob = doc.output('blob');
  const file = new File([pdfBlob], `attestation_presence_${employee.id}.pdf`, { type: 'application/pdf' });
  
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