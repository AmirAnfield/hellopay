import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import { auth } from "@/lib/firebase";

const storage = getStorage();

/**
 * Types de documents supportés
 */
export type DocumentType = 'payslip' | 'contract' | 'certificate';

/**
 * Interface pour les métadonnées de document
 */
export interface DocumentMetadata {
  name: string;
  type: string;
  size: number;
  createdAt: number;
}

/**
 * Options pour le téléchargement de fichier
 */
export interface UploadOptions {
  customPath?: string;
  metadata?: Record<string, string>;
}

/**
 * Téléchargement d'un document PDF pour un employé spécifique
 * @param file Fichier à télécharger
 * @param employeeId ID de l'employé
 * @param documentType Type de document
 * @param documentId ID unique du document (généré si non fourni)
 * @param options Options supplémentaires
 * @returns URL de téléchargement du document
 */
export async function uploadEmployeeDocument(
  file: File, 
  employeeId: string, 
  documentType: DocumentType,
  documentId?: string,
  options?: UploadOptions
): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Utilisateur non authentifié");
  
  // Générer un ID unique si non fourni
  const docId = documentId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Construire le chemin
  let path = options?.customPath;
  if (!path) {
    path = `users/${user.uid}/employees/${employeeId}/${documentType}s/${docId}.pdf`;
  }
  
  const storageRef = ref(storage, path);
  
  // Préparer les métadonnées
  const metadata = {
    contentType: 'application/pdf',
    customMetadata: {
      ...options?.metadata,
      employeeId,
      documentType,
      documentId: docId,
      uploadedBy: user.uid,
      uploadedAt: Date.now().toString(),
      fileName: file.name
    }
  };
  
  // Upload du fichier
  await uploadBytes(storageRef, file, metadata);
  
  // Récupérer l'URL de téléchargement
  return await getDownloadURL(storageRef);
}

/**
 * Téléchargement d'un bulletin de paie
 * @param file Fichier PDF du bulletin
 * @param employeeId ID de l'employé
 * @param payslipId ID du bulletin
 * @returns URL de téléchargement
 */
export async function uploadPayslip(file: File, employeeId: string, payslipId: string): Promise<string> {
  return uploadEmployeeDocument(file, employeeId, 'payslip', payslipId);
}

/**
 * Téléchargement d'un contrat
 * @param file Fichier PDF du contrat
 * @param employeeId ID de l'employé
 * @param contractId ID du contrat
 * @returns URL de téléchargement
 */
export async function uploadContract(file: File, employeeId: string, contractId: string): Promise<string> {
  return uploadEmployeeDocument(file, employeeId, 'contract', contractId);
}

/**
 * Récupérer l'URL de téléchargement d'un document
 * @param employeeId ID de l'employé
 * @param documentType Type de document
 * @param documentId ID du document
 * @returns URL de téléchargement
 */
export async function getDocumentUrl(employeeId: string, documentType: DocumentType, documentId: string): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Utilisateur non authentifié");
  
  const path = `users/${user.uid}/employees/${employeeId}/${documentType}s/${documentId}.pdf`;
  const docRef = ref(storage, path);
  
  return await getDownloadURL(docRef);
}

/**
 * Suppression d'un document
 * @param employeeId ID de l'employé
 * @param documentType Type de document
 * @param documentId ID du document
 */
export async function deleteDocument(employeeId: string, documentType: DocumentType, documentId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Utilisateur non authentifié");
  
  const path = `users/${user.uid}/employees/${employeeId}/${documentType}s/${documentId}.pdf`;
  const docRef = ref(storage, path);
  
  await deleteObject(docRef);
}

/**
 * Récupérer tous les documents d'un employé par type
 * @param employeeId ID de l'employé
 * @param documentType Type de document
 * @returns Liste des documents (URLs et métadonnées)
 */
export async function getEmployeeDocuments(
  employeeId: string, 
  documentType: DocumentType
): Promise<{ url: string; id: string; metadata?: Record<string, string> }[]> {
  const user = auth.currentUser;
  if (!user) throw new Error("Utilisateur non authentifié");
  
  const path = `users/${user.uid}/employees/${employeeId}/${documentType}s`;
  const listRef = ref(storage, path);
  
  try {
    const res = await listAll(listRef);
    
    // Récupération en parallèle des URLs et métadonnées
    const documents = await Promise.all(
      res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        const id = itemRef.name.replace('.pdf', '');
        
        return { url, id };
      })
    );
    
    return documents;
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    return [];
  }
} 