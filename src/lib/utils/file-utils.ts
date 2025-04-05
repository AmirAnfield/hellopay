/**
 * Utilitaires pour la manipulation des fichiers
 */

/**
 * Simule la compression d'un fichier PDF
 * Note: Cette fonction est une simulation car une vraie compression PDF
 * nécessiterait des bibliothèques externes comme pdf-lib ou pdfjs
 * 
 * @param file Fichier à compresser
 * @param maxSizeMB Taille maximale en MB
 * @returns Fichier compressé (simulé)
 * @deprecated Cette fonction de simulation devrait être remplacée par une implémentation réelle.
 */
export async function compressFile(file: File, maxSizeMB: number): Promise<File> {
  // Simuler un délai de traitement
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Taille cible en octets
  const targetSizeBytes = maxSizeMB * 1024 * 1024;
  
  // Si le fichier est déjà plus petit que la taille cible, le retourner tel quel
  if (file.size <= targetSizeBytes) {
    return file;
  }
  
  // Dans une vraie implémentation, on utiliserait une bibliothèque comme pdf-lib
  // pour réduire la qualité des images, supprimer les données inutiles, etc.
  
  // Pour la simulation, on crée un nouveau fichier avec le même type mais plus petit
  // (dans une vraie implémentation, ce serait le résultat de la compression)
  
  // Simuler un taux de compression entre 40% et 60% de la taille originale
  const compressionRatio = 0.4 + Math.random() * 0.2;
  const simulatedSize = Math.max(file.size * compressionRatio, targetSizeBytes * 0.9);
  
  // Créer un ArrayBuffer vide de la taille simulée
  const buffer = new ArrayBuffer(Math.floor(simulatedSize));
  
  // Créer un nouveau Blob avec le contenu simulé
  const blob = new Blob([buffer], { type: file.type });
  
  // Créer un nouveau File à partir du Blob
  const compressedFile = new File([blob], file.name, { 
    type: file.type,
    lastModified: new Date().getTime()
  });
  
  console.log(`Compression simulée: ${file.size} -> ${compressedFile.size} octets`);
  
  return compressedFile;
}

/**
 * Convertit un File en Base64
 * @param file Fichier à convertir
 * @returns Chaîne Base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Formate la taille d'un fichier en unité lisible
 * @param bytes Taille en octets
 * @param decimals Nombre de décimales (par défaut: 2)
 * @returns Taille formatée (ex: "2.5 MB")
 * @deprecated Utilisez formatFileSize de src/lib/utils.ts à la place.
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Vérifie le type MIME d'un fichier
 * @param file Fichier à vérifier
 * @param allowedTypes Types MIME autorisés
 * @returns True si le type est autorisé
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  // Vérification du type MIME
  if (!file || !file.type) {
    return false;
  }
  
  return allowedTypes.includes(file.type);
}

/**
 * Vérifie la taille d'un fichier
 * @param file Fichier à vérifier
 * @param maxSizeMB Taille maximale en MB
 * @returns True si la taille est valide
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  if (!file) {
    return false;
  }
  
  // Conversion MB en octets
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  return file.size <= maxSizeBytes;
}

/**
 * Obtient l'extension d'un fichier à partir de son nom
 * @param fileName Nom du fichier
 * @returns Extension du fichier (sans le point)
 */
export function getFileExtension(fileName: string): string {
  if (!fileName) return '';
  
  const parts = fileName.split('.');
  if (parts.length === 1) return '';
  
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Génère un nom de fichier unique
 * @param prefix Préfixe du nom (par défaut: "file")
 * @param extension Extension du fichier (sans le point)
 * @returns Nom de fichier unique
 */
export function generateUniqueFileName(prefix: string = 'file', extension?: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  
  return extension
    ? `${prefix}-${timestamp}-${randomStr}.${extension}`
    : `${prefix}-${timestamp}-${randomStr}`;
} 