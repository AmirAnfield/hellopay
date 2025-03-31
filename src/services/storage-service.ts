import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll, getMetadata } from "firebase/storage";
import { auth } from "@/lib/firebase";
import { compressFile } from "@/lib/utils/file-utils";

const storage = getStorage();

// Limites de stockage (en octets)
export const STORAGE_LIMITS = {
  FREE_TIER: 100 * 1024 * 1024, // 100 MB
  PREMIUM_TIER: 1024 * 1024 * 1024, // 1 GB
  ENTERPRISE_TIER: 10 * 1024 * 1024 * 1024, // 10 GB
};

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
    // Fonction récursive pour calculer la taille
    async function calculateSize(path) {
      const ref = path ? ref(storage, path) : storageRef;
      const result = await listAll(ref);
      
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
    }
    
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
  if (!user) throw new Error("Utilisateur non authentifié");
  
  // Vérifier le quota de stockage
  const quota = await checkStorageQuota();
  if (quota.isOverLimit) {
    throw new Error("Quota de stockage dépassé. Veuillez supprimer des documents ou passer à un forfait supérieur.");
  }
  
  // Alerte si proche de la limite (mais on permet quand même le téléchargement)
  if (quota.isNearLimit) {
    console.warn("Attention: vous approchez de votre limite de stockage");
    // On pourrait déclencher une notification ici
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
  let originalSize = file.size;
  let compressedSize = null;
  
  if (options?.compress !== false && file.type === 'application/pdf' && file.size > 1024 * 1024) {
    try {
      const maxSizeMB = options?.maxSizeMB || 1; // 1 MB par défaut
      fileToUpload = await compressFile(file, maxSizeMB);
      compressedSize = fileToUpload.size;
      console.log(`Fichier compressé: ${originalSize} -> ${compressedSize} octets`);
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
  
  // Upload du fichier
  await uploadBytes(storageRef, fileToUpload, metadata);
  
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
        const metadata = await getMetadata(itemRef);
        
        return { 
          url, 
          id, 
          metadata: metadata.customMetadata || {},
          size: metadata.size,
          contentType: metadata.contentType,
          createdAt: new Date(metadata.timeCreated).getTime()
        };
      })
    );
    
    // Tri par date de création (du plus récent au plus ancien)
    return documents.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    return [];
  }
}

/**
 * Nettoyer les documents périmés
 * @param olderThan Nombre de jours (documents plus anciens seront supprimés)
 * @returns Nombre de documents supprimés
 */
export async function cleanupExpiredDocuments(olderThan: number = 365): Promise<number> {
  const user = auth.currentUser;
  if (!user) throw new Error("Utilisateur non authentifié");
  
  const now = new Date().getTime();
  const cutoffDate = now - (olderThan * 24 * 60 * 60 * 1000);
  let deletedCount = 0;
  
  // Fonction récursive pour parcourir le stockage
  async function cleanupDirectory(path: string) {
    const dirRef = ref(storage, path);
    const result = await listAll(dirRef);
    
    // Traiter les fichiers du répertoire actuel
    for (const itemRef of result.items) {
      try {
        const metadata = await getMetadata(itemRef);
        const creationTime = new Date(metadata.timeCreated).getTime();
        
        if (creationTime < cutoffDate) {
          await deleteObject(itemRef);
          deletedCount++;
        }
      } catch (error) {
        console.error(`Erreur lors du nettoyage du fichier ${itemRef.fullPath}:`, error);
      }
    }
    
    // Traiter récursivement les sous-répertoires
    for (const prefixRef of result.prefixes) {
      await cleanupDirectory(prefixRef.fullPath);
    }
  }
  
  // Commencer le nettoyage à partir du répertoire de l'utilisateur
  await cleanupDirectory(`users/${user.uid}`);
  
  return deletedCount;
} 