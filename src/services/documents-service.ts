import { 
  getDocument, 
  getDocuments, 
  setDocument, 
  updateDocument, 
  deleteDocument,
  FirestoreDocument,
  QueryOptions
} from './firestore-service';
import { where, QueryConstraint } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from '@/lib/firebase';
import { uploadCertificate } from './storage-service';
import { Employee } from './employee-service';
import { Company } from './company-service';

// Initialiser le Storage
const storage = getStorage(app);

// Collection Firestore pour les documents
const COLLECTION_NAME = 'documents';

// Types de documents
export type DocumentType = 'contract' | 'certificate' | 'other';

// Interface du document
export interface Document extends FirestoreDocument {
  name: string;
  type: DocumentType;
  status: 'active' | 'archived' | 'draft';
  url: string;
  employeeId: string;
  companyId: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Récupérer un document par son ID
 * @param documentId ID du document
 * @returns Document
 */
export async function getDocumentById(documentId: string): Promise<Document | null> {
  return getDocument<Document>(COLLECTION_NAME, documentId);
}

/**
 * Récupérer tous les documents d'un employé
 * @param employeeId ID de l'employé
 * @param options Options de requête supplémentaires
 * @returns Liste de documents
 */
export async function getEmployeeDocuments(
  employeeId: string,
  options: Partial<QueryOptions> = {}
): Promise<Document[]> {
  const constraints: QueryConstraint[] = [where('employeeId', '==', employeeId)];
  
  return getDocuments<Document>(COLLECTION_NAME, {
    constraints,
    orderByField: 'createdAt',
    orderDirection: 'desc',
    ...options
  });
}

/**
 * Récupérer tous les documents d'une entreprise
 * @param companyId ID de l'entreprise
 * @param options Options de requête supplémentaires
 * @returns Liste de documents
 */
export async function getCompanyDocuments(
  companyId: string,
  options: Partial<QueryOptions> = {}
): Promise<Document[]> {
  const constraints: QueryConstraint[] = [where('companyId', '==', companyId)];
  
  return getDocuments<Document>(COLLECTION_NAME, {
    constraints,
    orderByField: 'createdAt',
    orderDirection: 'desc',
    ...options
  });
}

/**
 * Rechercher des documents par type
 * @param documentType Type de document
 * @param options Options de requête supplémentaires
 * @returns Liste de documents
 */
export async function searchDocumentsByType(
  documentType: DocumentType,
  options: Partial<QueryOptions> = {}
): Promise<Document[]> {
  const constraints: QueryConstraint[] = [where('type', '==', documentType)];
  
  return getDocuments<Document>(COLLECTION_NAME, {
    constraints,
    orderByField: 'createdAt',
    orderDirection: 'desc',
    ...options
  });
}

/**
 * Télécharger un document pour un employé
 * @param file Fichier à télécharger
 * @param employeeId ID de l'employé
 * @param companyId ID de l'entreprise
 * @param documentType Type de document
 * @param metadata Métadonnées supplémentaires
 * @returns Document créé
 */
export async function uploadDocument(
  file: File,
  employeeId: string,
  companyId: string,
  documentType: DocumentType = 'other',
  metadata: Record<string, unknown> = {}
): Promise<Document> {
  try {
    // Générer un ID unique pour le document
    const timestamp = new Date().getTime();
    const randomId = Math.random().toString(36).substring(2, 9);
    const documentId = `${documentType}_${timestamp}_${randomId}`;
    
    // Chemin de stockage
    const path = `companies/${companyId}/employees/${employeeId}/${documentType}/${documentId}`;
    const storageRef = ref(storage, path);
    
    // Télécharger le fichier
    await uploadBytes(storageRef, file);
    
    // Récupérer l'URL de téléchargement
    const url = await getDownloadURL(storageRef);
    
    // Créer l'entrée dans Firestore
    const document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'> = {
      name: file.name,
      type: documentType,
      status: 'active',
      url,
      employeeId,
      companyId,
      metadata: {
        ...metadata,
        size: file.size,
        contentType: file.type,
        originalName: file.name
      }
    };
    
    // Sauvegarder dans Firestore
    await setDocument<Omit<Document, 'id' | 'createdAt' | 'updatedAt'>>(
      COLLECTION_NAME,
      documentId,
      document
    );
    
    // Récupérer le document complet
    const createdDocument = await getDocumentById(documentId);
    if (!createdDocument) {
      throw new Error('Erreur lors de la création du document');
    }
    
    return createdDocument;
  } catch (error) {
    console.error('Erreur lors du téléchargement du document:', error);
    throw error;
  }
}

/**
 * Supprimer un document
 * @param documentId ID du document
 */
export async function removeDocument(documentId: string): Promise<void> {
  try {
    // Récupérer le document pour obtenir le chemin Storage
    const document = await getDocumentById(documentId);
    if (!document) {
      throw new Error('Document non trouvé');
    }
    
    // Supprimer de Firestore
    await deleteDocument(COLLECTION_NAME, documentId);
    
    // Supprimer du Storage en extrayant le chemin de l'URL
    try {
      const url = new URL(document.url);
      const path = url.pathname.split('/o/')[1];
      if (path) {
        const decodedPath = decodeURIComponent(path);
        const storageRef = ref(storage, decodedPath);
        await deleteObject(storageRef);
      }
    } catch (storageError) {
      console.error('Erreur lors de la suppression du fichier dans Storage:', storageError);
      // On continue même en cas d'erreur de suppression du Storage
    }
    
  } catch (error) {
    console.error(`Erreur lors de la suppression du document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Archiver un document
 * @param documentId ID du document
 */
export async function archiveDocument(documentId: string): Promise<void> {
  try {
    await updateDocument(COLLECTION_NAME, documentId, {
      status: 'archived'
    });
  } catch (error) {
    console.error(`Erreur lors de l'archivage du document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Rechercher des documents
 * @param searchTerm Terme de recherche
 * @param filters Filtres supplémentaires
 * @returns Liste de documents
 */
export async function searchDocuments(
  searchTerm: string,
  filters: {
    employeeId?: string;
    companyId?: string;
    type?: DocumentType;
    status?: 'active' | 'archived' | 'draft';
  } = {}
): Promise<Document[]> {
  // Limitation : Firestore n'a pas de recherche full-text native
  // On utilise ici une recherche basique sur les métadonnées
  
  try {
    // Construire les contraintes de base
    const constraints: QueryConstraint[] = [];
    
    // Ajouter les filtres
    if (filters.employeeId) {
      constraints.push(where('employeeId', '==', filters.employeeId));
    }
    
    if (filters.companyId) {
      constraints.push(where('companyId', '==', filters.companyId));
    }
    
    if (filters.type) {
      constraints.push(where('type', '==', filters.type));
    }
    
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    
    // Récupérer les documents selon les filtres
    const documents = await getDocuments<Document>(COLLECTION_NAME, {
      constraints,
      orderByField: 'createdAt',
      orderDirection: 'desc'
    });
    
    // Filtrer côté client selon le terme de recherche
    // (une solution plus robuste nécessiterait Algolia ou un service similaire)
    if (!searchTerm) return documents;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return documents.filter(doc => {
      // Rechercher dans le nom
      if (doc.name.toLowerCase().includes(lowerSearchTerm)) return true;
      
      // Rechercher dans les métadonnées
      for (const [_, value] of Object.entries(doc.metadata)) {
        if (
          typeof value === 'string' && 
          value.toLowerCase().includes(lowerSearchTerm)
        ) {
          return true;
        }
      }
      
      return false;
    });
    
  } catch (error) {
    console.error('Erreur lors de la recherche de documents:', error);
    throw error;
  }
}

/**
 * Génère le contenu HTML d'une attestation de travail
 * @param employee Données de l'employé
 * @param company Données de l'entreprise
 * @returns Contenu HTML de l'attestation
 */
export function generateWorkCertificateHTML(employee: Employee, company: Company): string {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const employmentDate = employee.startDate instanceof Date 
    ? employee.startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date(employee.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

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
        ${company.logoUrl ? `<img src="${company.logoUrl}" class="logo" alt="Logo entreprise" />` : ''}
        <div class="company-name">${company.name}</div>
        <div class="company-details">
          ${company.address}, ${company.postalCode} ${company.city}<br>
          SIRET: ${company.siret}
        </div>
      </div>
      
      <div class="document-title">ATTESTATION DE TRAVAIL</div>
      
      <div class="content">
        <p>Je soussigné(e), représentant légal de l'entreprise ${company.name}, atteste par la présente que :</p>
        
        <p style="margin-left: 1cm;">
          <strong>${employee.firstName} ${employee.lastName}</strong><br>
          ${employee.socialSecurityNumber ? `N° de sécurité sociale : ${employee.socialSecurityNumber}<br>` : ''}
          ${employee.address}, ${employee.postalCode} ${employee.city}
        </p>
        
        <p>Est employé(e) au sein de notre entreprise depuis le <strong>${employmentDate}</strong> en qualité de <strong>${employee.position}</strong> dans le cadre d'un contrat de travail à durée ${employee.contractType === 'CDI' ? 'indéterminée' : 'déterminée'}.</p>
        
        <p>Cette attestation est délivrée à l'intéressé(e) pour faire valoir ce que de droit.</p>
      </div>
      
      <div class="signature">
        <p>Fait à ${company.city}, le ${formattedDate}</p>
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
 * Génère un PDF d'attestation de travail
 * @param certificateId ID du certificat
 * @param employeeId ID de l'employé
 * @param companyId ID de l'entreprise
 * @returns La promesse d'URL de téléchargement
 */
export async function generateWorkCertificatePDF(certificateId: string, employeeId: string, companyId: string): Promise<string> {
  // Cette fonction simulera l'utilisation de Puppeteer ou React-PDF
  // En production, elle utiliserait une API/Cloud Function qui génère le PDF
  
  // Récupération des données
  const htmlContent = await new Promise<string>((resolve) => {
    // Simulation d'opération asynchrone qui récupère les données et génère le HTML
    setTimeout(() => {
      // En production, ces données proviendraient de Firestore
      const mockEmployee = {
        firstName: 'Prénom',
        lastName: 'Nom',
        startDate: new Date('2020-01-01'),
        position: 'Développeur Web',
        contractType: 'CDI',
        address: '1 rue de la Paix',
        postalCode: '75000',
        city: 'Paris',
        socialSecurityNumber: '1234567890123'
      };
      
      const mockCompany = {
        name: 'Entreprise SAS',
        address: '10 rue des Entrepreneurs',
        postalCode: '75001',
        city: 'Paris',
        siret: '12345678901234',
        logoUrl: null
      };
      
      const html = generateWorkCertificateHTML(mockEmployee, mockCompany);
      resolve(html);
    }, 1000);
  });
  
  // Création d'un blob PDF factice (en production, ce serait un vrai PDF)
  const blob = new Blob([htmlContent], { type: 'application/pdf' });
  const file = new File([blob], `attestation_travail_${employeeId}.pdf`, { type: 'application/pdf' });
  
  // Upload du fichier PDF
  const downloadUrl = await uploadCertificate(file, employeeId, certificateId, companyId);
  
  return downloadUrl;
} 