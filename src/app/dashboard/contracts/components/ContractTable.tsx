"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginatedResponse } from "@/lib/validators/pagination";
import { 
  Edit, 
  Eye, 
  FileText, 
  MoreHorizontal, 
  Trash2
} from "lucide-react";
import Link from "next/link";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Types
export interface Contract {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  status: string;
  contractType: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  reference: string | null;
  tags: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
  };
}

interface ContractTableProps {
  data: PaginatedResponse<Contract>;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

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

export default function ContractTable({ 
  data, 
  currentPage, 
  onPageChange, 
  isLoading = false 
}: ContractTableProps) {
  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  // Afficher un message si aucun contrat n'est trouvé
  if (data.data.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">Aucun contrat trouvé</h3>
        <p className="text-muted-foreground mt-2">
          Vous n&apos;avez pas encore de contrats. Créez votre premier contrat en cliquant sur le bouton &quot;Nouveau contrat&quot;.
        </p>
      </div>
    );
  }

  const { data: contracts, meta } = data;
  const totalPages = meta.totalPages;

  // Formater une date au format français (JJ/MM/AAAA)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: fr });
  };

  // Déterminer le statut d'affichage du contrat
  const getStatusBadge = (status: string) => {
    const statusInfo = statusMap[status] || { label: status, variant: "default" };
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  // Obtenir le libellé traduit du type de contrat
  const getContractType = (type: string) => {
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Type de contrat</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date de début</TableHead>
              <TableHead>Entreprise</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell className="font-medium">
                  {contract.title}
                </TableCell>
                <TableCell>
                  {getContractType(contract.contractType)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(contract.status)}
                </TableCell>
                <TableCell>
                  {formatDate(contract.startDate)}
                </TableCell>
                <TableCell>
                  {contract.company.name}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/contracts/${contract.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir les détails
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/contracts/${contract.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Êtes-vous sûr de vouloir supprimer ce contrat ?")) {
                            // Pour l'instant un simple alert, sera implémenté plus tard
                            alert("Suppression non implémentée");
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            Précédent
          </Button>
          
          <div className="flex items-center gap-1 mx-2">
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(i + 1)}
                className="w-8 h-8 p-0"
              >
                {i + 1}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
} 