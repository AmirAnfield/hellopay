import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll, getMetadata, StorageError } from "firebase/storage";
import { auth } from "@/lib/firebase";
import { compressFile, validateFileType, validateFileSize } from "@/lib/utils/file-utils";

// Vérifie l'initialisation d'AppCheck
// Importation sûre de appCheck
let appCheck: unknown;
// Utiliser une IIFE pour l'import
(async () => {
  try {
    const firebase = await import("@/lib/firebase");
    appCheck = firebase.appCheck;
  } catch {
    console.warn("Module AppCheck non disponible");
  }
})().catch(e => {
  console.error("Erreur lors de l'initialisation d'AppCheck:", e);
});

if (!appCheck && typeof window !== 'undefined') {
  console.warn("AppCheck n'est pas initialisé. Les requêtes Firebase pourraient être rejetées si la sécurité est activée.");
}

// Initialisation du service de stockage
const storage = getStorage();

// Types d'erreurs pouvant survenir avec les requêtes Storage
export enum StorageErrorType {
  UNAUTHORIZED = 'unauthorized',
  NOT_FOUND = 'not_found',
  QUOTA_EXCEEDED = 'quota_exceeded',
  INVALID_FILE = 'invalid_file',
  UNKNOWN = 'unknown'
}

// Structure pour les erreurs
export interface StorageErrorInfo {
  type: StorageErrorType;
  message: string;
  originalError?: unknown;
}

// Limites de stockage (en octets)
export const STORAGE_LIMITS = {
  FREE_TIER: 100 * 1024 * 1024, // 100 MB
  PREMIUM_TIER: 1024 * 1024 * 1024, // 1 GB
  ENTERPRISE_TIER: 10 * 1024 * 1024 * 1024, // 10 GB
};

// Types de documents supportés
export type DocumentType = 'contract' | 'certificate';

// Types de fichiers acceptés et leurs limites
export const ACCEPTED_FILE_TYPES = {
  pdf: ['application/pdf'],
  image: ['image/jpeg', 'image/png', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

export const FILE_SIZE_LIMITS = {
  pdf: 10, // 10 MB
  image: 5, // 5 MB
  document: 15 // 15 MB
};

/**
 * Interface pour les métadonnées de document
 */
export interface DocumentMetadata {
  name: string;
  type: string;
  size: number;
  createdAt: number;
  compressedSize?: number;
  originalSize?: number;
}

/**
 * Options pour le téléchargement de fichier
 */
export interface UploadOptions {
  customPath?: string;
  metadata?: Record<string, string>;
  compress?: boolean;
  maxSizeMB?: number;
}

/**
 * Gère les erreurs de Storage et retourne une structure normalisée
 * @param error L'erreur d'origine
 * @returns Informations structurées sur l'erreur
 */
function handleStorageError(error: unknown): StorageErrorInfo {
  if (error instanceof StorageError) {
    // Erreurs Firebase Storage spécifiques
    switch (error.code) {
      case 'storage/unauthorized':
      case 'storage/app-check-token-is-invalid':
      case 'storage/app-check-token-expired':
        return {
          type: StorageErrorType.UNAUTHORIZED,
          message: "Vous n'êtes pas autorisé à accéder à ce fichier. Vérifiez vos droits d'accès.",
          originalError: error
        };
      
      case 'storage/object-not-found':
        return {
          type: StorageErrorType.NOT_FOUND,
          message: "Le fichier demandé n'existe pas.",
          originalError: error
        };
      
      case 'storage/quota-exceeded':
        return {
          type: StorageErrorType.QUOTA_EXCEEDED,
          message: "Quota de stockage dépassé. Veuillez supprimer des fichiers ou passer à un forfait supérieur.",
          originalError: error
        };
      
      default:
        return {
          type: StorageErrorType.UNKNOWN,
          message: `Erreur Firebase Storage: ${error.message}`,
          originalError: error
        };
    }
  }
  
  return {
    type: StorageErrorType.UNKNOWN,
    message: error instanceof Error ? error.message : "Erreur inconnue lors de l'accès au stockage.",
    originalError: error
  };
}

/**
 * Vérifie si l'utilisateur a atteint sa limite de stockage
 * @returns Informations sur l'utilisation du stockage
 */
export async function checkStorageQuota(): Promise<{
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  isNearLimit: boolean;
  isOverLimit: boolean;
}> {
  const user = auth.currentUser;
  if (!user) throw new Error("Utilisateur non authentifié");
  
  // TODO: Récupérer le niveau d'abonnement de l'utilisateur depuis Firestore
  const userTier = 'FREE_TIER'; // Par défaut
  const storageLimit = STORAGE_LIMITS[userTier];
  
  // Calculer l'utilisation totale
  const userStoragePath = `users/${user.uid}`;
  const storageRef = ref(storage, userStoragePath);
  
  let totalSize = 0;
  
  try {
    // Fonction pour calculer la taille
    const calculateSize = async (path: string): Promise<number> => {
      const currentRef = path ? ref(storage, path) : storageRef;
      const result = await listAll(currentRef);
      
      // Récupérer les métadonnées des fichiers
      const fileSizes = await Promise.all(
        result.items.map(async (itemRef) => {
          const metadata = await getMetadata(itemRef);
          return metadata.size || 0;
        })
      );
      
      // Somme des tailles de fichiers
      const currentLevelSize = fileSizes.reduce((acc, size) => acc + size, 0);
      
      // Récursion dans les sous-dossiers
      const subFolderSizes = await Promise.all(
        result.prefixes.map(async (prefixRef) => {
          return calculateSize(prefixRef.fullPath);
        })
      );
      
      const subFolderTotal = subFolderSizes.reduce((acc, size) => acc + size, 0);
      
      return currentLevelSize + subFolderTotal;
    };
    
    totalSize = await calculateSize('');
  } catch (error) {
    console.error("Erreur lors du calcul de l'utilisation du stockage:", error);
    // Estimation par défaut en cas d'erreur
    totalSize = storageLimit * 0.5; // 50% comme valeur par défaut
  }
  
  const remaining = Math.max(0, storageLimit - totalSize);
  const percentage = (totalSize / storageLimit) * 100;
  
  return {
    used: totalSize,
    limit: storageLimit,
    remaining,
    percentage,
    isNearLimit: percentage >= 85, // Alerte à 85%
    isOverLimit: percentage >= 100,
  };
}

/**
 * Téléchargement d'un document PDF pour un employé spécifique
 * avec compression et vérification des quotas
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
  if (!user) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Valider le type de fichier
  const isValidType = validateFileType(file, ACCEPTED_FILE_TYPES.pdf);
  if (!isValidType) {
    throw {
      type: StorageErrorType.INVALID_FILE,
      message: "Type de fichier invalide. Seuls les fichiers PDF sont acceptés."
    };
  }
  
  // Valider la taille du fichier
  const maxSize = options?.maxSizeMB || FILE_SIZE_LIMITS.pdf;
  const isValidSize = validateFileSize(file, maxSize);
  if (!isValidSize) {
    throw {
      type: StorageErrorType.INVALID_FILE,
      message: `Taille de fichier trop grande. La taille maximale est de ${maxSize} MB.`
    };
  }
  
  // Vérifier le quota de stockage
  const quota = await checkStorageQuota();
  if (quota.isOverLimit) {
    throw {
      type: StorageErrorType.QUOTA_EXCEEDED,
      message: "Quota de stockage dépassé. Veuillez supprimer des documents ou passer à un forfait supérieur."
    };
  }
  
  // Alerte si proche de la limite (mais on permet quand même le téléchargement)
  if (quota.isNearLimit) {
    console.warn("Attention: vous approchez de votre limite de stockage");
  }
  
  // Générer un ID unique si non fourni
  const docId = documentId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Construire le chemin
  let path = options?.customPath;
  if (!path) {
    path = `users/${user.uid}/employees/${employeeId}/${documentType}s/${docId}.pdf`;
  }
  
  // Compression du fichier si nécessaire
  let fileToUpload = file;
  const originalSize = file.size;
  let compressedSize = null;
  
  if (options?.compress !== false && file.type === 'application/pdf' && file.size > 1024 * 1024) {
    try {
      fileToUpload = await compressFile(file, options?.maxSizeMB || 1);
      compressedSize = fileToUpload.size;
    } catch (error) {
      console.warn("Impossible de compresser le fichier:", error);
      // On continue avec le fichier original en cas d'erreur
    }
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
      fileName: file.name,
      originalSize: originalSize.toString(),
      ...(compressedSize && { compressedSize: compressedSize.toString() })
    }
  };
  
  try {
    // Upload du fichier
    await uploadBytes(storageRef, fileToUpload, metadata);
    
    // Récupérer l'URL de téléchargement
    return await getDownloadURL(storageRef);
  } catch (error) {
    const handledError = handleStorageError(error);
    throw handledError;
  }
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
 * Téléchargement d'un certificat pour un employé dans Firebase Storage
 * @param file Fichier PDF à télécharger
 * @param employeeId ID de l'employé
 * @param certificateId ID du certificat
 * @returns URL du fichier téléchargé
 */
export async function uploadCertificate(
  file: File, 
  employeeId: string, 
  certificateId: string,
  companyId: string
): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Utilisateur non authentifié");
  
  // Validation du type de fichier (PDF uniquement)
  if (!validateFileType(file, ACCEPTED_FILE_TYPES.pdf)) {
    throw new Error("Seuls les fichiers PDF sont acceptés pour les certificats");
  }
  
  // Validation de la taille du fichier
  if (!validateFileSize(file, FILE_SIZE_LIMITS.pdf)) {
    throw new Error(`Le fichier ne doit pas dépasser ${FILE_SIZE_LIMITS.pdf} Mo`);
  }
  
  // Chemin du certificat dans le Storage
  const certificatePath = `users/${user.uid}/companies/${companyId}/employees/${employeeId}/certificates/${certificateId}.pdf`;
  
  try {
    // Upload du fichier
    const fileRef = ref(storage, certificatePath);
    const metadata = {
      contentType: 'application/pdf',
      customMetadata: {
        'createdBy': user.uid,
        'createdAt': Date.now().toString(),
        'type': 'certificate',
        'employeeId': employeeId,
        'companyId': companyId
      }
    };
    
    await uploadBytes(fileRef, file, metadata);
    const downloadURL = await getDownloadURL(fileRef);
    
    return downloadURL;
  } catch (error) {
    const handledError = handleStorageError(error);
    throw new Error(`Erreur lors du téléchargement du certificat: ${handledError.message}`);
  }
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
  if (!user) {
    throw new Error("Utilisateur non authentifié");
  }
  
  const path = `users/${user.uid}/employees/${employeeId}/${documentType}s/${documentId}.pdf`;
  const docRef = ref(storage, path);
  
  try {
    return await getDownloadURL(docRef);
  } catch (error) {
    const handledError = handleStorageError(error);
    throw handledError;
  }
}

/**
 * Suppression d'un document
 * @param employeeId ID de l'employé
 * @param documentType Type de document
 * @param documentId ID du document
 */
export async function deleteDocument(employeeId: string, documentType: DocumentType, documentId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Utilisateur non authentifié");
  }
  
  const path = `users/${user.uid}/employees/${employeeId}/${documentType}s/${documentId}.pdf`;
  const docRef = ref(storage, path);
  
  try {
    await deleteObject(docRef);
  } catch (error) {
    const handledError = handleStorageError(error);
    throw handledError;
  }
}

/**
 * Récupère tous les documents d'un employé par type
 * @param employeeId ID de l'employé
 * @param documentType Type de document
 * @returns Liste des documents avec leurs URL
 */
export async function getEmployeeDocuments(
  employeeId: string, 
  documentType: DocumentType
): Promise<{ url: string; id: string; metadata?: Record<string, string> }[]> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Utilisateur non authentifié");
  }
  
  const folderPath = `users/${user.uid}/employees/${employeeId}/${documentType}s`;
  const folderRef = ref(storage, folderPath);
  
  try {
    const result = await listAll(folderRef);
    
    const documents = await Promise.all(
      result.items.map(async (itemRef) => {
        try {
          const metadata = await getMetadata(itemRef);
          const url = await getDownloadURL(itemRef);
          
          // Extraire l'ID du document (nom du fichier sans extension)
          const fileName = itemRef.name;
          const id = fileName.replace(/\.[^/.]+$/, ""); // Enlever l'extension
          
          return {
            url,
            id,
            metadata: metadata.customMetadata || {}
          };
        } catch (error) {
          console.warn(`Erreur lors de la récupération du document ${itemRef.name}:`, error);
          return null;
        }
      })
    );
    
    // Filtrer les documents qui n'ont pas pu être récupérés
    return documents.filter(doc => doc !== null) as { url: string; id: string; metadata?: Record<string, string> }[];
  } catch (error) {
    const handledError = handleStorageError(error);
    throw handledError;
  }
}

/**
 * Nettoie les documents expirés
 * @param olderThan Nombre de jours pour considérer un document comme expiré
 * @returns Nombre de documents supprimés
 */
export async function cleanupExpiredDocuments(olderThan: number = 30): Promise<number> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Utilisateur non authentifié");
  }
  
  let deletedCount = 0;
  
  try {
    // Récupérer les documents temporaires
    const tempFolderPath = `temp/${user.uid}`;
    
    // Fonction pour nettoyer un répertoire récursivement
    const cleanupDirectory = async (path: string): Promise<number> => {
      let count = 0;
      const directoryRef = ref(storage, path);
      const result = await listAll(directoryRef);
      
      // Calculer la date limite
      const now = Date.now();
      const expirationTime = now - (olderThan * 24 * 60 * 60 * 1000);
      
      // Traiter les fichiers
      for (const item of result.items) {
        try {
          const metadata = await getMetadata(item);
          const uploadTime = metadata.customMetadata?.uploadedAt 
            ? parseInt(metadata.customMetadata.uploadedAt) 
            : metadata.timeCreated 
              ? new Date(metadata.timeCreated).getTime() 
              : 0;
          
          if (uploadTime < expirationTime) {
            await deleteObject(item);
            count++;
          }
        } catch (error) {
          console.warn(`Erreur lors du nettoyage du fichier ${item.name}:`, error);
        }
      }
      
      // Traiter les sous-dossiers récursivement
      for (const prefix of result.prefixes) {
        count += await cleanupDirectory(prefix.fullPath);
      }
      
      return count;
    };
    
    deletedCount = await cleanupDirectory(tempFolderPath);
    
    return deletedCount;
  } catch (error) {
    console.error("Erreur lors du nettoyage des documents expirés:", error);
    const handledError = handleStorageError(error);
    throw handledError;
  }
} 