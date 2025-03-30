"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Download, Printer, RefreshCw } from "lucide-react";

interface PayslipPreviewProps {
  calculationResult: any;
  employeeId: string;
  period: string;
  onSave?: (result: any) => void;
  autoGenerate?: boolean;
}

export default function PayslipPreview({
  calculationResult,
  employeeId,
  period,
  onSave,
  autoGenerate = false
}: PayslipPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Générer une URL de prévisualisation du PDF
  const generatePreview = async () => {
    if (!calculationResult || !employeeId || !period) {
      setError("Données manquantes pour générer la prévisualisation");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Appel API pour générer le PDF sans sauvegarde
      const response = await fetch("/api/payslips/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calculationResult,
          employeeId,
          period,
          saveToDatabase: false
        })
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la génération de la prévisualisation");
      }
      
      // Créer une URL d'objet pour le PDF
      const pdfBlob = await response.blob();
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      
    } catch (err) {
      console.error("Erreur de prévisualisation:", err);
      setError("Impossible de générer la prévisualisation. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Nettoyer l'URL générée lorsque le composant se démonte
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);
  
  // Générer automatiquement si demandé et que les données changent
  useEffect(() => {
    if (autoGenerate && calculationResult && employeeId && period) {
      generatePreview();
    }
  }, [autoGenerate, calculationResult, employeeId, period]);
  
  // Sauvegarder le bulletin
  const handleSave = async () => {
    if (!calculationResult || !employeeId || !period) {
      setError("Données manquantes pour sauvegarder le bulletin");
      return;
    }
    
    try {
      setIsLoading(true);
      // Appel API pour générer et sauvegarder le PDF
      const response = await fetch("/api/payslips/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calculationResult,
          employeeId,
          period,
          saveToDatabase: true
        })
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde du bulletin");
      }
      
      const data = await response.json();
      
      // Informer le parent du succès et des données
      if (onSave) {
        onSave(data);
      }
      
    } catch (err) {
      console.error("Erreur de sauvegarde:", err);
      setError("Impossible de sauvegarder le bulletin. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Télécharger le PDF
  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `bulletin_${period.slice(0, 7)}.pdf`;
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
              <Button size="sm" onClick={handleSave} disabled={isLoading}>
                <span>Enregistrer le bulletin</span>
              </Button>
            </div>
            <iframe 
              src={pdfUrl} 
              className="w-full h-[600px] border-0" 
              title="Prévisualisation du bulletin de paie"
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