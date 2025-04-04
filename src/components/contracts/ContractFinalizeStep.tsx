"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle, Download, FileText, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ContractData } from "./ContractData";

interface ContractFinalizeStepProps {
  contractData: ContractData;
  onDataChange: (newData: Partial<ContractData>) => void;
  onNext: () => void;
}

export function ContractFinalizeStep({
  contractData,
  onDataChange,
  onNext,
}: ContractFinalizeStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Déterminer si un PDF a déjà été généré
  const pdfGenerated = contractData.generatedFile?.url && contractData.generatedFile?.generatedAt;

  // Formatage de la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "PPP à HH:mm", { locale: fr });
    } catch {
      return dateString;
    }
  };

  // Formatage de la taille de fichier
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  // Génération du PDF final
  const generatePDF = () => {
    setIsGenerating(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // Simulation de génération PDF
      setTimeout(() => {
        const generatedAt = new Date().toISOString();
        onDataChange({
          generatedFile: {
            url: `https://example.com/contracts/${contractData.id}.pdf`,
            name: `${contractData.title.replace(/\s+/g, "_")}_${generatedAt.split("T")[0]}.pdf`,
            size: 512000 + Math.floor(Math.random() * 100000),
            generatedAt,
          },
          status: "ready",
          updatedAt: new Date().toISOString(),
        });
        
        setSuccessMessage("PDF généré avec succès");
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      setErrorMessage("Erreur lors de la génération du PDF");
      setIsGenerating(false);
    }
  };

  // Téléchargement du PDF
  const downloadPDF = () => {
    if (!contractData.generatedFile?.url) return;
    
    // Dans une implémentation réelle, créer un lien de téléchargement
    const link = document.createElement("a");
    link.href = contractData.generatedFile.url;
    link.download = contractData.generatedFile.name || "contract.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Partage du contrat (simulation)
  const shareContract = () => {
    setIsSharing(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // Simulation de partage
      setTimeout(() => {
        onDataChange({
          sharing: {
            sharedAt: new Date().toISOString(),
            sharedWith: ["email@example.com"],
          },
        });
        
        setSuccessMessage("Lien de partage envoyé avec succès");
        setIsSharing(false);
      }, 1500);
    } catch (error) {
      setErrorMessage("Erreur lors du partage du contrat");
      setIsSharing(false);
    }
  };

  // Finalisation du contrat
  const finalizeContract = () => {
    onDataChange({
      status: "active",
      updatedAt: new Date().toISOString(),
      wizardProgress: {
        ...contractData.wizardProgress,
        completedSteps: [...contractData.wizardProgress.completedSteps, "finalize"],
      },
    });
    
    onNext(); // Terminer le processus
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Résumé du contrat */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé du contrat</CardTitle>
              <CardDescription>
                Vérifiez les informations avant de finaliser le contrat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Type de contrat</h4>
                  <p>{contractData.contractType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Statut</h4>
                  <Badge 
                    variant={contractData.status === "draft" ? "outline" : "default"} 
                    className="text-xs"
                  >
                    {contractData.status === "draft" ? "Brouillon" : 
                     contractData.status === "ready" ? "Prêt" : 
                     contractData.status === "active" ? "Actif" : "Brouillon"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Entreprise</h4>
                  <p>{contractData.company.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Salarié</h4>
                  <p>{contractData.employee ? 
                    `${contractData.employee.firstName} ${contractData.employee.lastName}` : 
                    "Non spécifié"}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Date de début</h4>
                  <p>{formatDate(contractData.startDate.split("T")[0])}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Date de fin</h4>
                  <p>{contractData.endDate ? formatDate(contractData.endDate) : "Non applicable"}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Salaire de base</h4>
                  <p>{`${contractData.compensation.baseSalary} ${contractData.compensation.currency} (${
                    contractData.compensation.paymentFrequency === "monthly" ? "mensuel" :
                    contractData.compensation.paymentFrequency === "hourly" ? "horaire" : "journalier"
                  })`}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Horaire de travail</h4>
                  <p>{`${contractData.workSchedule.hoursPerWeek}h / semaine (${contractData.workSchedule.daysPerWeek} jours)`}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-1">Documents générés</h4>
                {pdfGenerated ? (
                  <div className="flex items-center justify-between border rounded-md p-3">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{contractData.generatedFile?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(contractData.generatedFile?.size)} - 
                          Généré le {formatDate(contractData.generatedFile?.generatedAt)}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={downloadPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Aucun document n&apos;a encore été généré.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <p className="text-green-800">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
              <p className="text-red-800">{errorMessage}</p>
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Finalisez votre contrat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                variant={pdfGenerated ? "outline" : "default"}
                onClick={generatePDF} 
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></div>
                    Génération...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    {pdfGenerated ? "Régénérer le PDF" : "Générer le PDF"}
                  </>
                )}
              </Button>

              {pdfGenerated && (
                <>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={downloadPDF}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>

                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={shareContract}
                    disabled={isSharing}
                  >
                    {isSharing ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-primary rounded-full"></div>
                        Partage...
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4 mr-2" />
                        Partager le contrat
                      </>
                    )}
                  </Button>
                </>
              )}

              <Separator />

              <Button 
                className="w-full" 
                onClick={finalizeContract}
                disabled={!pdfGenerated}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Finaliser le contrat
              </Button>

              {!pdfGenerated && (
                <p className="text-xs text-muted-foreground mt-2">
                  Veuillez générer le PDF du contrat avant de finaliser.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 