"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Download, Printer, RefreshCw } from "lucide-react";
import { generateCertificatePDF } from "@/services/certificate-service";

export interface CertificatePreviewProps {
  certificateId: string;
  type: 'attestation-travail' | 'attestation-salaire' | 'attestation-presence';
  autoGenerate?: boolean;
}

export default function CertificatePreview({
  certificateId,
  type,
  autoGenerate = false
}: CertificatePreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Générer une URL de prévisualisation du PDF
  const generatePreview = async () => {
    if (!certificateId) {
      setError("Données manquantes pour générer la prévisualisation");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Génération de PDF pour le certificat:", certificateId, "type:", type);
      
      // Générer le PDF selon le type d'attestation
      const url = await generateCertificatePDF(certificateId);
      console.log("PDF généré avec succès. URL:", url);
      setPdfUrl(url);
    } catch (err) {
      console.error("Erreur détaillée lors de la prévisualisation:", err);
      let errorMessage = "Impossible de générer la prévisualisation.";
      
      if (err instanceof Error) {
        errorMessage += ` Erreur: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Générer automatiquement si demandé
  useEffect(() => {
    if (autoGenerate && certificateId) {
      generatePreview();
    }
  }, [autoGenerate, certificateId]);
  
  // Télécharger le PDF
  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `attestation_${type.split('-')[1]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  // Imprimer le PDF
  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    }
  };
  
  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-[600px]">
            <Spinner className="mr-2" />
            <span>Génération du PDF en cours...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[600px] p-4">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={generatePreview}>Réessayer</Button>
          </div>
        ) : pdfUrl ? (
          <>
            <div className="p-4 bg-gray-100 dark:bg-gray-800 flex flex-wrap gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={generatePreview}>
                <RefreshCw className="mr-2 h-4 w-4 flex-shrink-0" />
                <span>Rafraîchir</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4 flex-shrink-0" />
                <span>Imprimer</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4 flex-shrink-0" />
                <span>Télécharger</span>
              </Button>
            </div>
            <iframe 
              src={pdfUrl} 
              className="w-full h-[600px] border-0" 
              title={`Prévisualisation de l'attestation de ${type.split('-')[1]}`}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-[600px] p-4">
            <p className="mb-4">Aucune prévisualisation disponible.</p>
            <Button onClick={generatePreview}>Générer la prévisualisation</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 