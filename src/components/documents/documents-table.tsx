'use client'

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  File, 
  FileText, 
  FileCog, 
  Download, 
  Trash2, 
  MoreHorizontal, 
  Eye,
  Archive 
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Document, DocumentType, removeDocument, archiveDocument } from "@/services/documents-service";
import { useToast } from "@/components/ui/use-toast";
import { formatFileSize } from "@/lib/utils/file-utils";
import Link from "next/link";

interface DocumentsTableProps {
  documents: Document[];
  totalDocuments: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

// Afficher le type de document avec une icône
const DocumentTypeIcon = ({ type }: { type: DocumentType }) => {
  switch (type) {
    case 'payslip':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'contract':
      return <FileCog className="h-4 w-4 text-orange-500" />;
    case 'certificate':
      return <File className="h-4 w-4 text-green-500" />;
    default:
      return <File className="h-4 w-4 text-gray-500" />;
  }
};

// Afficher le statut du document avec un badge
const DocumentStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'active':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Actif</Badge>;
    case 'archived':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Archivé</Badge>;
    case 'draft':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Brouillon</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function DocumentsTable({ 
  documents, 
  totalDocuments, 
  page, 
  pageSize, 
  onPageChange 
}: DocumentsTableProps) {
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  
  // Formatter la date
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Supprimer un document
  const handleDelete = async (documentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
    
    setActionLoading(prev => ({ ...prev, [documentId]: true }));
    
    try {
      await removeDocument(documentId);
      toast({
        title: 'Document supprimé',
        description: 'Le document a été supprimé avec succès',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le document',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [documentId]: false }));
    }
  };
  
  // Archiver un document
  const handleArchive = async (documentId: string) => {
    setActionLoading(prev => ({ ...prev, [documentId]: true }));
    
    try {
      await archiveDocument(documentId);
      toast({
        title: 'Document archivé',
        description: 'Le document a été archivé avec succès',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'archiver le document',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [documentId]: false }));
    }
  };
  
  // Pagination
  const totalPages = Math.ceil(totalDocuments / pageSize);
  
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-10">
            <File className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium">Aucun document trouvé</h3>
            <p className="text-muted-foreground mt-1">
              Aucun document ne correspond à vos critères de recherche.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Taille</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DocumentTypeIcon type={doc.type} />
                    <span className="capitalize">{doc.type}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{doc.name}</TableCell>
                <TableCell>
                  <DocumentStatusBadge status={doc.status} />
                </TableCell>
                <TableCell>
                  {formatFileSize(doc.metadata.size as number || 0)}
                </TableCell>
                <TableCell>{formatDate(doc.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <a href={doc.url} download>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Télécharger</span>
                      </a>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Plus</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/documents/${doc.id}`}>
                            Détails
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={actionLoading[doc.id] || doc.status === 'archived'}
                          onClick={() => handleArchive(doc.id)}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Archiver
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={actionLoading[doc.id]}
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Affichage de <strong>{Math.min(documents.length, pageSize)}</strong> document{documents.length !== 1 ? 's' : ''} sur <strong>{totalDocuments}</strong>
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </CardFooter>
    </Card>
  );
} 