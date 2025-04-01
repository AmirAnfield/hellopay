"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  FileText, 
  FileBadge,
  Plus,
  Eye,
  Download,
  Search
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  PageContainer, 
  PageHeader, 
  EmptyState, 
  LoadingState
} from "@/components/shared/PageContainer";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Document {
  id: string;
  type: string;
  title: string;
  date: Date;
  employeeName: string;
  companyName: string;
  status: string;
  pdfUrl?: string;
  config?: any;
}

export default function CertificatesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [certificates, setCertificates] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    try {
      setIsLoading(true);
      
      // Charger les documents depuis le localStorage
      const savedDocs = localStorage.getItem('userDocuments');
      const parsedDocs = savedDocs ? JSON.parse(savedDocs) : [];
      
      // Convertir les dates et filtrer uniquement les attestations
      const certificatesList = parsedDocs
        .filter((doc: any) => doc.type === 'attestation' && doc.id.startsWith('doc-'))
        .map((doc: any) => ({
          ...doc,
          date: new Date(doc.date)
        }));
      
      setCertificates(certificatesList);
    } catch (err) {
      console.error("Erreur lors du chargement des attestations:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les attestations. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Filtrer les attestations par terme de recherche
  const filteredCertificates = certificates.filter(cert => 
    cert.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gérer le click sur voir les détails
  const handleViewDetails = (docId: string) => {
    setSelectedDocId(docId);
    setDetailsOpen(true);
  };

  // Générer un PDF pour une attestation
  const generatePdf = (doc: Document) => {
    // Construire l'URL avec tous les paramètres nécessaires
    const params = new URLSearchParams();
    params.append('id', doc.id);
    params.append('type', doc.type);
    params.append('employeeName', doc.employeeName);
    params.append('companyName', doc.companyName);
    
    if (doc.config) {
      params.append('position', doc.config.position);
      params.append('startDate', doc.config.startDate);
      params.append('contractType', doc.config.contractType);
      params.append('showSalary', String(doc.config.showSalary));
      params.append('salaryType', doc.config.salaryType);
      params.append('salaryAmount', String(doc.config.salaryAmount));
      params.append('noEndDate', String(doc.config.noEndDate));
    }
    
    // URL de l'API avec tous les paramètres
    const apiUrl = `/api/generate-pdf?${params.toString()}`;
    
    // Ouvrir dans un nouvel onglet
    window.open(apiUrl, '_blank');
  };

  // Obtenir le document sélectionné pour les détails
  const selectedDocument = selectedDocId ? certificates.find(d => d.id === selectedDocId) : null;

  // Afficher un badge selon le statut du document
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return <Badge className="bg-green-500">Généré</Badge>;
      case 'pending':
        return <Badge variant="outline">En attente</Badge>;
      case 'validated':
        return <Badge variant="secondary">Validé</Badge>;
      case 'draft':
        return <Badge variant="outline">Brouillon</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Attestations de Travail" 
        description="Gérez les attestations de travail de vos employés"
        actions={
          <Button 
            onClick={() => router.push('/dashboard/documents?openCreateDialog=true&documentType=attestation')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle attestation
          </Button>
        }
      />

      <Card>
        <CardHeader className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Mes attestations</CardTitle>
              <CardDescription>
                Consultez et gérez vos attestations de travail
              </CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState message="Chargement des attestations..." />
          ) : filteredCertificates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attestation</TableHead>
                  <TableHead>Employé</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <FileBadge className="h-5 w-5 text-amber-500" />
                        <span className="font-medium">{cert.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{cert.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{cert.companyName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(cert.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(cert.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetails(cert.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {cert.pdfUrl && (
                          <Button variant="ghost" size="icon" onClick={() => generatePdf(cert)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Aucune attestation"
              description="Vous n'avez pas encore généré d'attestation de travail."
              icon={FileText}
              action={
                <Button onClick={() => router.push('/dashboard/documents?openCreateDialog=true&documentType=attestation')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une attestation
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Boîte de dialogue pour les détails */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          {selectedDocument && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileBadge className="h-5 w-5 text-amber-500" />
                  {selectedDocument.title}
                </DialogTitle>
                <DialogDescription>
                  Créé le {format(new Date(selectedDocument.date), 'dd MMMM yyyy', { locale: fr })}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Employé</h4>
                    <p className="text-sm">{selectedDocument.employeeName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Entreprise</h4>
                    <p className="text-sm">{selectedDocument.companyName}</p>
                  </div>
                </div>
                
                <Separator />
                
                {selectedDocument.config && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Poste</h4>
                        <p className="text-sm">{selectedDocument.config.position}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Date d&apos;entrée</h4>
                        <p className="text-sm">{
                          selectedDocument.config.startDate ? 
                          format(new Date(selectedDocument.config.startDate), 'dd/MM/yyyy') : 
                          'Non spécifiée'
                        }</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Type de contrat</h4>
                        <p className="text-sm">{selectedDocument.config.contractType}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Contrat en cours</h4>
                        <p className="text-sm">{selectedDocument.config.noEndDate ? 'Oui' : 'Non'}</p>
                      </div>
                    </div>
                    
                    {selectedDocument.config.showSalary && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Salaire {selectedDocument.config.salaryType === 'monthly' ? 'mensuel' : 'annuel'}</h4>
                        <p className="text-sm">{selectedDocument.config.salaryAmount.toLocaleString()} €</p>
                      </div>
                    )}
                  </>
                )}
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Statut:</span>
                    {renderStatusBadge(selectedDocument.status)}
                  </div>
                  {selectedDocument.pdfUrl && (
                    <Button onClick={() => generatePdf(selectedDocument)}>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
} 