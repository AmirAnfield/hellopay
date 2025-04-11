/**
 * Service de génération de PDF optimisé
 * 
 * Utilise pdf-lib pour créer des documents PDF basés sur du texte
 * plutôt que sur des images, réduisant considérablement la taille.
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface PDFCompatible {
  output: (type: string, options?: unknown) => unknown;
  save: (filename: string) => void;
}

interface TextSection {
  title: string;
  content: string[];
}

interface ContractTextContent {
  title: string;
  sections: TextSection[];
}

/**
 * Génère un PDF à partir du texte extrait d'un document HTML
 * 
 * @param contractContent Contenu textuel du contrat
 * @returns Objet PDF compatible avec les fonctions existantes
 */
export async function generateTextBasedPDF(contractContent: ContractTextContent): Promise<PDFCompatible | null> {
  try {
    // Créer un nouveau document PDF
    const pdfDoc = await PDFDocument.create();
    
    // Ajouter une page
    let page = pdfDoc.addPage([595, 842]); // Format A4
    
    // Obtenir les polices
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Définir les marges et positions
    const margin = 50;
    let y = page.getHeight() - margin;
    const width = page.getWidth() - 2 * margin;
    
    // Ajouter le titre
    page.drawText(contractContent.title, {
      x: margin,
      y,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0)
    });
    y -= 30;
    
    // Fonction pour ajouter du texte avec retour à la ligne
    const drawWrappedText = (text: string, size: number = 11, isTitle: boolean = false) => {
      const font = isTitle ? boldFont : helveticaFont;
      const lineHeight = size * 1.2;
      const words = text.split(' ');
      let line = '';
      
      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, size);
        
        if (testWidth > width) {
          page.drawText(line, {
            x: margin,
            y,
            size,
            font,
            color: rgb(0, 0, 0)
          });
          line = word;
          y -= lineHeight;
          
          // Ajouter une nouvelle page si nécessaire
          if (y < margin) {
            page = pdfDoc.addPage([595, 842]);
            y = page.getHeight() - margin;
          }
        } else {
          line = testLine;
        }
      }
      
      if (line) {
        page.drawText(line, {
          x: margin,
          y,
          size,
          font,
          color: rgb(0, 0, 0)
        });
        y -= lineHeight;
      }
      
      // Espace après le texte
      y -= isTitle ? 10 : 5;
    };
    
    // Ajouter les sections du contrat
    for (const section of contractContent.sections) {
      // Ajouter une nouvelle page si nécessaire
      if (y < margin + 100) {
        page = pdfDoc.addPage([595, 842]);
        y = page.getHeight() - margin;
      }
      
      // Titre de section
      if (section.title) {
        drawWrappedText(section.title, 14, true);
      }
      
      // Contenu de la section
      for (const paragraph of section.content) {
        if (paragraph) {
          drawWrappedText(paragraph, 11);
        }
      }
      
      // Espace entre les sections
      y -= 15;
    }
    
    // Sérialiser le document PDF
    const pdfBytes = await pdfDoc.save();
    
    // Convertir en blob et créer un objet URL
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Créer un objet compatible avec l'API jsPDF existante
    const jsPdfCompatible: PDFCompatible = {
      output: (type: string) => {
        switch (type) {
          case 'blob':
            return blob;
          case 'datauristring':
            // Convertir proprement en data URI
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
          case 'arraybuffer':
            return pdfBytes;
          default:
            return url;
        }
      },
      save: (filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        // Nettoyer l'URL créée
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    };
    
    return jsPdfCompatible;
  } catch (error) {
    console.error("Erreur lors de la génération du PDF basé sur le texte:", error);
    return null;
  }
}

/**
 * Extrait le texte d'un élément HTML de contrat
 * 
 * @param contractElement Élément HTML contenant le contrat
 * @returns Structure de contenu textuel
 */
export function extractContractText(contractElement: HTMLElement): ContractTextContent | null {
  if (!contractElement) return null;
  
  try {
    const sections = Array.from(contractElement.querySelectorAll('section, div.section'));
    
    const result: ContractTextContent = {
      title: contractElement.querySelector('h1')?.textContent || 'Contrat de travail',
      sections: sections.map(section => ({
        title: section.querySelector('h2, h3')?.textContent || '',
        content: Array.from(section.querySelectorAll('p, li, .paragraph')).map(el => el.textContent || '')
      }))
    };
    
    return result;
  } catch (error) {
    console.error("Erreur lors de l'extraction du texte du contrat:", error);
    return null;
  }
}

/**
 * Fonction principale pour générer un PDF à partir d'un élément HTML
 * 
 * @param element Élément HTML contenant le contrat
 * @returns Objet PDF compatible ou null en cas d'erreur
 */
export async function generateOptimizedPDF(element: HTMLElement): Promise<PDFCompatible | null> {
  // Extraire le texte
  const contractText = extractContractText(element);
  
  if (!contractText) {
    console.error("Impossible d'extraire le texte du contrat");
    return null;
  }
  
  // Générer le PDF basé sur le texte
  return generateTextBasedPDF(contractText);
} 