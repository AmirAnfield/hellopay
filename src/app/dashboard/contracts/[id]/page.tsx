"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { Contract } from "../components/ContractTable";
import { ArrowLeft, Calendar, Edit, ExternalLink, FileText, Loader2, Tag, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Carte de statuts des contrats pour l'affichage
const statusMap: Record<string, { label: string; variant: "default" | "outline" | "secondary" | "destructive" }> = {
  draft: { label: "Brouillon", variant: "outline" },
  active: { label: "Actif", variant: "default" },
  terminated: { label: "Résilié", variant: "destructive" },
  expired: { label: "Expiré", variant: "secondary" },
};

// Carte des types de contrats pour l'affichage
const typeMap: Record<string, string> = {
  employment: "Contrat de travail",
  service: "Contrat de service",
  nda: "Accord de confidentialité",
  partnership: "Partenariat",
  other: "Autre",
};

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchContract = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/contracts/${params.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Contrat non trouvé");
          }
          throw new Error("Erreur lors de la récupération du contrat");
        }

        const result = await response.json();

        if (result.success) {
          setContract(result.data);
        } else {
          throw new Error(result.message || "Une erreur est survenue");
        }
      } catch (error) {
        console.error("Erreur:", error);
        setError(error instanceof Error ? error.message : "Une erreur inconnue est survenue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContract();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce contrat ? Cette action est irréversible.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/contracts/${params.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Contrat supprimé",
          description: "Le contrat a été supprimé avec succès",
        });
        router.push("/dashboard/contracts");
      } else {
        throw new Error(result.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Formater une date au format français (JJ/MM/AAAA)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifiée";
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy", { locale: fr });
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    const statusInfo = statusMap[status] || { label: status, variant: "default" };
    return (
      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
    );
  };

  // Obtenir le libellé du type de contrat
  const getContractType = (type: string) => {
    return typeMap[type] || type;
  };

  // Formater les tags
  const formatTags = (tags: string | null) => {
    if (!tags) return null;
    return tags.split(",").map((tag) => tag.trim());
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4 h-96 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Chargement du contrat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href="/dashboard/contracts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux contrats
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <Alert>
          <AlertTitle>Contrat non trouvé</AlertTitle>
          <AlertDescription>Ce contrat n&apos;existe pas ou a été supprimé.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href="/dashboard/contracts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux contrats
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const tags = formatTags(contract.tags);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* En-tête avec titre et boutons d'action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/dashboard/contracts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{contract.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/contracts/${params.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Supprimer
          </Button>
        </div>
      </div>

      {/* Informations principales */}
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            {getStatusBadge(contract.status)}
            <Badge variant="secondary">{getContractType(contract.contractType)}</Badge>
            {contract.reference && (
              <Badge variant="outline">Réf: {contract.reference}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Description */}
          {contract.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="text-sm">{contract.description}</p>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Date de début</h3>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{formatDate(contract.startDate)}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Date de fin</h3>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{contract.endDate ? formatDate(contract.endDate) : "Non spécifiée"}</span>
              </div>
            </div>
          </div>

          {/* Entreprise */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Entreprise concernée</h3>
            <div className="flex items-center">
              <Link 
                href={`/dashboard/companies/${contract.company.id}`}
                className="text-primary hover:underline"
              >
                {contract.company.name}
              </Link>
            </div>
          </div>

          {/* Partie prenante */}
          {(contract.counterpartyName || contract.counterpartyEmail) && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Partie prenante</h3>
              <div className="flex flex-col gap-1">
                {contract.counterpartyName && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{contract.counterpartyName}</span>
                  </div>
                )}
                {contract.counterpartyEmail && (
                  <div className="flex items-center">
                    <a 
                      href={`mailto:${contract.counterpartyEmail}`}
                      className="text-primary hover:underline"
                    >
                      {contract.counterpartyEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-muted/40">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fichier du contrat */}
      <Card>
        <CardHeader>
          <CardTitle>Document</CardTitle>
          <CardDescription>
            Fichier du contrat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center p-3 border rounded-md bg-muted/50">
            <div className="mr-3">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{contract.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {(contract.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={contract.fileUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir
              </a>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Créé le {formatDate(contract.createdAt)}
        </CardFooter>
      </Card>
    </div>
  );
} 