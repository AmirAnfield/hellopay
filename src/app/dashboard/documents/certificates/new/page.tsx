"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileBadge, Briefcase, CreditCard, UserCheck } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function NewCertificatePage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Types d'attestations disponibles
  const certificateTypes = [
    {
      id: "work",
      title: "Attestation de travail",
      description: "Atteste de l'emploi actuel d'un salarié dans l'entreprise",
      icon: <Briefcase className="h-5 w-5 text-amber-500" />,
      content: "Document qui certifie qu'un employé travaille actuellement dans l'entreprise, avec ses informations de poste et dates d'emploi.",
      details: [
        "Informations complètes sur l'entreprise et l'employé",
        "Date d'embauche et poste occupé",
        "Signature et cachet de l'entreprise"
      ]
    },
    {
      id: "salary",
      title: "Attestation de salaire",
      description: "Atteste du salaire perçu par un employé sur une période donnée",
      icon: <CreditCard className="h-5 w-5 text-green-500" />,
      content: "Document qui indique le salaire perçu par un employé sur une période précise, avec différents montants (brut, net, imposable).",
      details: [
        "Période personnalisable (3, 6 ou 12 mois)",
        "Salaire brut, net et net imposable",
        "Détails des montants perçus"
      ]
    },
    {
      id: "presence",
      title: "Attestation de présence",
      description: "Atteste de la présence d'un employé sur une période donnée",
      icon: <UserCheck className="h-5 w-5 text-blue-500" />,
      content: "Document qui certifie de la présence d'un employé dans l'entreprise pendant une période déterminée.",
      details: [
        "Dates de début et fin de période",
        "Mention des absences (si nécessaire)",
        "Mention du bon comportement professionnel"
      ]
    }
  ];
  
  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
  };
  
  const handleContinue = () => {
    if (selectedType) {
      router.push(`/dashboard/documents/certificates/new/${selectedType}`);
    }
  };
  
  return (
    <PageContainer>
      <PageHeader
        title="Créer une attestation"
        description="Choisissez le type d'attestation que vous souhaitez générer"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Retour
          </Button>
        }
      />
      
      <div className="grid gap-6 mt-6">
        <Tabs defaultValue="types" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="types">Types d&apos;attestations</TabsTrigger>
            <TabsTrigger value="template" disabled>Aperçu du modèle</TabsTrigger>
          </TabsList>
          
          <TabsContent value="types">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {certificateTypes.map((type) => (
                <Card 
                  key={type.id}
                  className={`transition-all cursor-pointer ${
                    selectedType === type.id 
                      ? "border-2 border-primary shadow-md" 
                      : "hover:border-primary/30"
                  }`}
                  onClick={() => handleSelectType(type.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      {type.icon}
                      {selectedType === type.id && (
                        <Badge className="bg-primary/10 text-primary">Sélectionné</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-2">{type.title}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {type.content}
                    </p>
                    <ul className="text-sm space-y-2">
                      {type.details.map((detail, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <FileBadge className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-4">
          <Button 
            onClick={handleContinue} 
            disabled={!selectedType}
            size="lg"
          >
            {selectedType ? "Continuer" : "Sélectionner un type d'attestation"}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
} 