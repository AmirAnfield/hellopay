/**
 * Service de génération de PDF simplifié
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Interface pour les objets compatibles avec l'API PDF
 */
export interface PDFDocument {
  output: (type: string) => string | Blob | ArrayBuffer | Promise<unknown>;
  save: (filename: string) => void;
  addPage: () => void;
  addImage: (imageData: string, format: string, x: number, y: number, width: number, height: number) => void;
  internal: {
    pageSize: {
      getWidth: () => number;
      getHeight: () => number;
    }
  };
}

/**
 * Génère un PDF à partir d'un élément HTML
 * Version optimisée et simplifiée
 * 
 * @param element Élément HTML contenant le contrat
 * @returns Document PDF ou null en cas d'erreur
 */
export async function generatePDF(element: HTMLElement): Promise<PDFDocument | null> {
  if (!element) {
    console.error("Élément HTML invalide");
    return null;
  }
  
  try {
    // Optimisation : attendre que le DOM soit stable
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Créer une copie de l'élément pour éviter les problèmes de style
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.width = element.offsetWidth + 'px';
    document.body.appendChild(clone);
    
    try {
      // Paramètres optimisés pour la performance
      const canvas = await html2canvas(clone, {
        scale: 1.2,               // Résolution modérée
        useCORS: true,            // Support des images externes
        logging: false,           // Désactiver les logs
        allowTaint: true,         // Permettre les éléments taintés
        backgroundColor: '#FFFFFF', // Fond blanc
        imageTimeout: 10000,      // Timeout pour les images
        removeContainer: true,    // Nettoyage automatique
      });
      
      // Format A4 portrait
      const pdf = new jsPDF('p', 'mm', 'a4') as PDFDocument;
      
      // Dimensions
      const imgWidth = 210;       // Largeur A4 en mm
      const pageHeight = 297;     // Hauteur A4 en mm
      
      // Calculer la hauteur proportionnelle
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Compression d'image
      const imgData = canvas.toDataURL('image/jpeg', 0.7);
      
      // Optimisation pour les documents multi-pages
      let position = 0;
      let restHeight = imgHeight;
      
      // Première page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      
      // Pages supplémentaires si nécessaire
      restHeight -= pageHeight;
      
      while (restHeight > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        restHeight -= pageHeight;
      }
      
      return pdf;
      
    } finally {
      // Nettoyer le DOM
      if (clone.parentNode) {
        clone.parentNode.removeChild(clone);
      }
    }
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    return null;
  }
} 