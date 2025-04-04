"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Download, Printer } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ContractData } from "./ContractData";

interface ContractPreviewStepProps {
  contractData: ContractData;
  onDataChange: (newData: Partial<ContractData>) => void;
  onNext: () => void;
}

export function ContractPreviewStep({
  contractData,
  onDataChange,
  onNext,
}: ContractPreviewStepProps) {
  // Options d'affichage du document
  const [documentOptions, setDocumentOptions] = useState({
    templateId: contractData.documentOptions.templateId || "standard",
    includeCompanyLogo: contractData.documentOptions.includeCompanyLogo || true,
    includeCompanyHeader: contractData.documentOptions.includeCompanyHeader || true,
    includeFooter: contractData.documentOptions.includeFooter || true,
    footerText: contractData.documentOptions.footerText || "Document généré via HelloPay",
  });

  // Mise à jour des options du document
  const handleOptionChange = (
    field: keyof typeof documentOptions,
    value: string | boolean
  ) => {
    const updatedOptions = {
      ...documentOptions,
      [field]: value,
    };
    setDocumentOptions(updatedOptions);
    onDataChange({ documentOptions: updatedOptions });
  };

  // Formatage de date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "PPP", { locale: fr });
    } catch {
      return dateString;
    }
  };

  // Génération fictive d'un PDF
  const generatePdf = () => {
    // Dans une implémentation réelle, appel à un service de génération de PDF
    // Pour l'instant, simulation d'un délai puis ajout d'une URL fictive
    onDataChange({
      generatedFile: {
        url: `https://example.com/contracts/${contractData.id}.pdf`,
        name: `${contractData.title.replace(/\s+/g, "_")}.pdf`,
        size: 256000,
        generatedAt: new Date().toISOString(),
      },
    });
    
    // Notification que le PDF est prêt
    alert("PDF prêt à être téléchargé!");
  };

  // Imprimer le contrat
  const printContract = () => {
    window.print();
  };

  // Passage à l'étape suivante
  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="space-y-6 print:p-0">
      <div className="flex justify-between items-center pb-4 border-b print:hidden">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Aperçu du contrat</h3>
          <p className="text-sm text-muted-foreground">
            Prévisualisez votre contrat avant génération. Vous pouvez ajuster les options d&apos;affichage.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={printContract}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button size="sm" onClick={generatePdf}>
            <Download className="h-4 w-4 mr-2" />
            Générer PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Aperçu du document */}
          <div className="border rounded-md bg-white p-8 shadow-sm min-h-[842px] w-full max-w-[595px] mx-auto">
            {/* En-tête du document */}
            <div className="mb-8 pb-4 border-b text-center">
              {documentOptions.includeCompanyLogo && contractData.company.logoUrl && (
                <div className="mb-2">
                  <img
                    src={contractData.company.logoUrl}
                    alt={contractData.company.name}
                    className="h-12 mx-auto"
                  />
                </div>
              )}
              <h1 className="text-xl font-bold uppercase mb-1">{contractData.title}</h1>
              <p className="text-sm">{contractData.reference && `Réf: ${contractData.reference}`}</p>
            </div>

            {/* Entités */}
            <div className="mb-8">
              <p className="font-medium mb-4">ENTRE LES SOUSSIGNÉS :</p>
              <p className="mb-2">
                <span className="font-medium">La société {contractData.company.name}</span>, 
                {contractData.company.address && ` située ${contractData.company.address}, `}
                {contractData.company.siren && ` SIREN ${contractData.company.siren}, `}
                représentée par {contractData.company.representativeName || "_______"} 
                en qualité de {contractData.company.representativeTitle || "_______"},
              </p>
              <p className="mb-4">Ci-après dénommée &ldquo;l&apos;EMPLOYEUR&rdquo;,</p>

              <p className="mb-2">
                <span className="font-medium">
                  {contractData.employee ? 
                    `${contractData.employee.firstName} ${contractData.employee.lastName}` : 
                    "______________________"}
                </span>, 
                {contractData.employee?.address && ` domicilié(e) ${contractData.employee.address}, `}
                {contractData.employee?.socialSecurityNumber && ` N° de sécurité sociale : ${contractData.employee.socialSecurityNumber}, `}
              </p>
              <p>Ci-après dénommé(e) &ldquo;le SALARIE&rdquo;,</p>
            </div>

            {/* Corps du document - Articles */}
            <div className="mb-8">
              <p className="font-medium mb-4">IL A ÉTÉ CONVENU CE QUI SUIT :</p>
              {contractData.articles.map((article) => (
                <div key={article.id} className="mb-6">
                  <h3 className="font-medium mb-2">{article.title}</h3>
                  <div className="whitespace-pre-wrap text-sm">
                    {article.content
                      .replace(/\[FONCTION\]/g, contractData.employee?.position || "___________")
                      .replace(/\[DATE_DEBUT\]/g, formatDate(contractData.startDate))
                      .replace(/\[DATE_FIN\]/g, formatDate(contractData.endDate))
                      .replace(/\[SALAIRE_BASE\]/g, `${contractData.compensation.baseSalary} ${contractData.compensation.currency}`)
                      .replace(/\[HEURES_HEBDO\]/g, `${contractData.workSchedule.hoursPerWeek}`)
                      .replace(/\[DUREE_ESSAI\]/g, `${contractData.probationPeriod.durationMonths} mois`)
                    }
                  </div>
                </div>
              ))}
            </div>

            {/* Clauses additionnelles */}
            {contractData.additionalClauses.length > 0 && (
              <div className="mb-8">
                <p className="font-medium mb-4">CLAUSES ADDITIONNELLES :</p>
                {contractData.additionalClauses.map((clause) => (
                  <div key={clause.id} className="mb-6">
                    <h3 className="font-medium mb-2">{clause.title}</h3>
                    <div className="whitespace-pre-wrap text-sm">
                      {clause.content}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Signatures */}
            <div className="mt-12 pt-4 border-t">
              <p className="mb-4">
                Fait à {contractData.documentOptions.signatureLocation || "___________"}, 
                le {formatDate(contractData.documentOptions.signatureDate) || "___________"}
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-medium mb-3">Pour l&apos;employeur</p>
                  <p className="text-sm mb-1">{contractData.company.representativeName || "Nom et prénom"}</p>
                  <p className="text-sm italic">Signature précédée de la mention &ldquo;Lu et approuvé&rdquo;</p>
                  <div className="border-b border-dashed h-16 mt-2" />
                </div>
                <div>
                  <p className="font-medium mb-3">Le salarié</p>
                  <p className="text-sm mb-1">
                    {contractData.employee ? 
                      `${contractData.employee.firstName} ${contractData.employee.lastName}` : 
                      "Nom et prénom"}
                  </p>
                  <p className="text-sm italic">Signature précédée de la mention &ldquo;Lu et approuvé&rdquo;</p>
                  <div className="border-b border-dashed h-16 mt-2" />
                </div>
              </div>
            </div>

            {/* Pied de page */}
            {documentOptions.includeFooter && (
              <div className="mt-16 pt-4 border-t text-center text-xs text-gray-500">
                <p>{documentOptions.footerText}</p>
                <p>Page 1/1</p>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-1 print:hidden">
          {/* Options d'affichage */}
          <Card>
            <CardHeader>
              <CardTitle>Options du document</CardTitle>
              <CardDescription>
                Personnalisez l&apos;apparence du document final
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template">Modèle de document</Label>
                <Select
                  value={documentOptions.templateId}
                  onValueChange={(value) => handleOptionChange("templateId", value)}
                >
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Choisir un modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="modern">Moderne</SelectItem>
                    <SelectItem value="classic">Classique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="logo-toggle">Afficher le logo</Label>
                  <Switch
                    id="logo-toggle"
                    checked={documentOptions.includeCompanyLogo}
                    onCheckedChange={(checked) =>
                      handleOptionChange("includeCompanyLogo", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="header-toggle">Afficher l&apos;en-tête de l&apos;entreprise</Label>
                  <Switch
                    id="header-toggle"
                    checked={documentOptions.includeCompanyHeader}
                    onCheckedChange={(checked) =>
                      handleOptionChange("includeCompanyHeader", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="footer-toggle">Afficher le pied de page</Label>
                  <Switch
                    id="footer-toggle"
                    checked={documentOptions.includeFooter}
                    onCheckedChange={(checked) =>
                      handleOptionChange("includeFooter", checked)
                    }
                  />
                </div>

                {documentOptions.includeFooter && (
                  <div className="pt-2">
                    <Label htmlFor="footer-text">Texte du pied de page</Label>
                    <Input
                      id="footer-text"
                      value={documentOptions.footerText}
                      onChange={(e) =>
                        handleOptionChange("footerText", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleContinue} className="w-full">
                Continuer
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 