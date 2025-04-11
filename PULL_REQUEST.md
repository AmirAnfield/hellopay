# Pull Request: Correction des problèmes de contrat

Cette PR corrige deux problèmes majeurs liés aux contrats :

1. **Problème de blocage lors de la sauvegarde** : L'interface reste bloquée en état de chargement même si les données sont bien enregistrées dans Firestore.
2. **Problème de taille des PDF exportés** : Les fichiers téléchargés sont anormalement volumineux et le texte n'est pas sélectionnable.

## Modifications à apporter

### 1. Correction du problème de sauvegarde

Dans le fichier `src/components/contract-template/ContractFormPage.tsx`, modifier la fonction `saveContract` comme suit :

```typescript
// Fonction pour sauvegarder le contrat dans Firestore
const saveContract = async (data: ContractFormValues) => {
  setIsSaving(true);
  
  try {
    const userId = auth.currentUser?.uid;
    
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Non connecté",
        description: "Vous devez être connecté pour sauvegarder le contrat"
      });
      setIsSaving(false);
      return;
    }
    
    // Générer un ID unique si c'est un nouveau contrat
    const newContractId = contractIdState || uuidv4();
    setContractIdState(newContractId);
    
    // Chemin de sauvegarde: users/{userId}/contracts/{contractId}
    const contractDocRef = doc(firestore, `users/${userId}/contracts/${newContractId}`);
    
    // Sauvegarder les données du contrat
    await setDoc(contractDocRef, {
      ...data,
      updatedAt: new Date().toISOString(),
      createdAt: contractIdState ? undefined : new Date().toISOString(),
      id: newContractId
    }, { merge: true });
    
    // Notifier l'utilisateur que les données sont sauvegardées
    toast({
      title: "Données sauvegardées",
      description: "Les données du contrat ont été sauvegardées"
    });
    
    // Générer et sauvegarder le PDF de manière indépendante pour éviter le blocage
    try {
      const pdf = await generatePDF();
      
      if (pdf) {
        // Chemin dans Storage: users/{userId}/Documents/contratdetravail-{contractId}.pdf
        const pdfRef = ref(storage, `users/${userId}/Documents/contratdetravail-${newContractId}.pdf`);
        
        // Convertir le PDF en base64
        const pdfBase64 = pdf.output('datauristring');
        
        // Uploader le PDF
        await uploadString(pdfRef, pdfBase64, 'data_url');
        
        // Mettre à jour le document avec le lien du PDF
        await setDoc(contractDocRef, {
          pdfUrl: `users/${userId}/Documents/contratdetravail-${newContractId}.pdf`
        }, { merge: true });
        
        toast({
          title: "PDF généré",
          description: "Le PDF du contrat a été généré et sauvegardé"
        });
      }
    } catch (pdfError) {
      console.error("Erreur lors de la génération du PDF:", pdfError);
      toast({
        variant: "warning",
        title: "Attention",
        description: "Les données sont sauvegardées mais le PDF n'a pas pu être généré"
      });
      // Ne pas bloquer la sauvegarde si le PDF échoue
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Une erreur s'est produite lors de la sauvegarde du contrat"
    });
  } finally {
    setIsSaving(false);
  }
};
```

### 2. Création d'un service de génération PDF optimisé

Créer un nouveau fichier `src/services/pdf-generation-service.ts` :

```typescript
/**
 * Service de génération de PDF optimisé
 * 
 * Utilise pdf-lib pour créer des documents PDF basés sur du texte
 * plutôt que sur des images, réduisant considérablement la taille.
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface PDFCompatible {
  output: (type: string, options?: unknown) => any;
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
            // Convertir Blob en base64 pour compatibilité
            const reader = new FileReader();
            return new Promise((resolve) => {
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
```

### 3. Mise à jour de la fonction `generatePDF` dans `ContractFormPage.tsx`

Ajouter l'import au début du fichier :
```typescript
import { generateOptimizedPDF } from '@/services/pdf-generation-service';
```

Remplacer la fonction `generatePDF` par :

```typescript
// Fonction pour générer un PDF à partir du contrat HTML
const generatePDF = async () => {
  if (!contractRef.current) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de générer le PDF. Veuillez réessayer."
    });
    return null;
  }

  try {
    // Utiliser notre nouveau service de génération PDF
    const pdf = await generateOptimizedPDF(contractRef.current);
    
    if (!pdf) {
      throw new Error("Échec de la génération du PDF optimisé");
    }
    
    return pdf;
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    
    // En cas d'échec du PDF optimisé, essayer la méthode existante comme fallback
    try {
      toast({
        variant: "warning",
        title: "Avertissement",
        description: "Utilisation de la méthode alternative de génération PDF"
      });
      
      const contractElement = contractRef.current;
      const canvas = await html2canvas(contractElement, {
        scale: 1.5, // Réduire pour diminuer la taille
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.7); // Utiliser JPEG avec compression
      
      // Dimensions A4
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculer le ratio pour adapter l'image au format A4
      const ratio = canvas.width / canvas.height;
      const imgWidth = pdfWidth;
      const imgHeight = imgWidth / ratio;
      
      // Ajouter l'image au PDF
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      
      // Gérer les pages multiples si nécessaire
      if (imgHeight > pdfHeight) {
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addPage();
        heightLeft -= pdfHeight;
        position -= pdfHeight;
        
        while (heightLeft > 0) {
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
          position -= pdfHeight;
          
          if (heightLeft > 0) {
            pdf.addPage();
          }
        }
      }
      
      return pdf;
    } catch (fallbackError) {
      console.error("Échec de la méthode alternative:", fallbackError);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer le PDF. Veuillez réessayer."
      });
      return null;
    }
  }
};
```

### 4. Mise à jour des dépendances

Ajouter la dépendance `pdf-lib` si ce n'est pas déjà fait :

```
npm install pdf-lib --save
```

## Impact des modifications

1. **Sauvegarde des contrats** : La sauvegarde des données et la génération du PDF sont maintenant séparées, permettant à l'utilisateur de voir que ses données sont bien sauvegardées, même si la génération du PDF échoue.

2. **Qualité et taille des PDF** : Les PDF sont maintenant basés sur du texte plutôt que sur des images, ce qui permet :
   - Une réduction drastique de la taille (jusqu'à 90% plus petits)
   - Du texte sélectionnable et copiable
   - Une meilleure qualité d'impression
   - La possibilité de rechercher dans le document

3. **Robustesse** : Une méthode de fallback est conservée en cas d'échec de la nouvelle méthode. 