import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  uploadString as firebaseUploadString, 
  uploadBytesResumable, 
  UploadTask
} from 'firebase/storage';
import { storage } from './config';

/**
 * Télécharge un fichier dans Firebase Storage
 * @param path Chemin de destination dans Firebase Storage
 * @param file Fichier à télécharger
 */
export async function uploadFile(path: string, file: File): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier:', error);
    throw error;
  }
}

/**
 * Télécharge un fichier avec suivi de progression
 * @param path Chemin de destination dans Firebase Storage
 * @param file Fichier à télécharger
 * @param onProgress Callback de progression (0-100)
 */
export function uploadFileWithProgress(
  path: string, 
  file: File, 
  onProgress?: (progress: number) => void
): UploadTask {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  if (onProgress) {
    uploadTask.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress(progress);
    });
  }
  
  return uploadTask;
}

/**
 * Télécharge une chaîne de caractères (ex: base64) dans Firebase Storage
 * @param path Chemin de destination dans Firebase Storage
 * @param dataUrl Données à télécharger au format texte ou base64
 * @param format Format des données ('raw', 'data_url', 'base64')
 */
export async function uploadDataString(
  path: string, 
  dataUrl: string, 
  format: 'raw' | 'data_url' | 'base64' = 'data_url'
): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    await firebaseUploadString(storageRef, dataUrl, format);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Erreur lors du téléchargement de la chaîne:', error);
    throw error;
  }
}

/**
 * Récupère l'URL de téléchargement d'un fichier
 * @param path Chemin du fichier dans Firebase Storage
 */
export async function getFileUrl(path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'URL du fichier:', error);
    throw error;
  }
}

/**
 * Supprime un fichier de Firebase Storage
 * @param path Chemin du fichier à supprimer
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
    throw error;
  }
}

/**
 * Liste tous les fichiers dans un dossier
 * @param folderPath Chemin du dossier dans Firebase Storage
 */
export async function listFiles(folderPath: string): Promise<{name: string, url: string}[]> {
  try {
    const folderRef = ref(storage, folderPath);
    const fileList = await listAll(folderRef);
    
    const results = await Promise.all(
      fileList.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          url,
        };
      })
    );
    
    return results;
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error);
    throw error;
  }
} 