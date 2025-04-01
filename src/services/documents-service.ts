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

// Initialiser le Storage
const storage = getStorage(app);

// Collection Firestore pour les documents
const COLLECTION_NAME = 'documents';

// Types de documents
export type DocumentType = 'payslip' | 'contract' | 'certificate' | 'other';

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