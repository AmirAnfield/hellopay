"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  Download, 
  Check, 
  Plus,
  AlertCircle,
  FileSignature,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  PageContainer, 
  PageHeader, 
  EmptyState, 
  LoadingState
} from "@/components/shared/PageContainer";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

// Types pour les documents
interface Document {
  id: string;
  type: 'attestation' | 'contrat' | 'autre';
  title: string;
  date: Date;
  employeeName: string;
  companyName: string;
  status: 'generated' | 'pending' | 'validated' | 'draft' | 'signed' | 'archived';
  pdfUrl?: string;
  config?: {
    showSalary: boolean;
    salaryType: 'monthly' | 'annual';
    salaryAmount: number;
    startDate: string;
    position: string;
    contractType: string;
    noEndDate: boolean;
  };
  contractConfig?: {
    employeeId: string;
    companyId: string;
    type: 'CDI' | 'CDD';
    startDate: string;
    endDate?: string;
    trialPeriodEndDate?: string;
    isFullTime: boolean;
    monthlyHours: number;
    baseSalary: number;
    conventions?: string[];
    specificClauses?: string[];
  };
}

type DocumentData = Record<string, unknown>;

export default function ContractsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chargement des données
  useEffect(() => {
    try {
      setIsLoading(true);
      
      // Charger les documents depuis le localStorage
      const savedDocs = localStorage.getItem('userDocuments');
      const parsedDocs: DocumentData[] = savedDocs ? JSON.parse(savedDocs) : [];
      
      // Convertir les dates de string à Date
      const documentsList = parsedDocs.map((doc: DocumentData) => ({
        id: String(doc.id || ''),
        type: (doc.type || 'autre') as 'attestation' | 'contrat' | 'autre',
        title: String(doc.title || ''),
        date: new Date(doc.date ? String(doc.date) : Date.now()),
        employeeName: String(doc.employeeName || ''),
        companyName: String(doc.companyName || ''),
        status: (doc.status || 'draft') as 'generated' | 'pending' | 'validated' | 'draft' | 'signed' | 'archived',
        pdfUrl: doc.pdfUrl ? String(doc.pdfUrl) : undefined,
        config: doc.config as Document['config'],
        contractConfig: doc.contractConfig as Document['contractConfig']
      }));
      
      // N'afficher que les contrats créés par l'utilisateur
      const userContracts = documentsList.filter(doc => 
        doc.id.startsWith('doc-') && doc.type === 'contrat'
      );
      
      setDocuments(userContracts);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement des contrats:", err);
      setError("Impossible de charger les contrats. Veuillez réessayer.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les contrats. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Obtenir le document sélectionné pour les détails
  const selectedDocument = selectedDocId ? documents.find(d => d.id === selectedDocId) : null;

  // Gérer le click sur voir les détails
  const handleViewDetails = (docId: string) => {
    setSelectedDocId(docId);
    setDetailsOpen(true);
  };

  // Générer un nouveau document PDF et ouvrir dans un nouvel onglet
  const generatePdf = (doc: Document) => {
    // Construire l'URL avec tous les paramètres nécessaires
    const params = new URLSearchParams();
    
    // Paramètres communs
    params.append('id', doc.id);
    params.append('type', doc.type);
    params.append('employeeName', doc.employeeName);
    params.append('companyName', doc.companyName);
    
    // Paramètres pour les contrats
    if (doc.type === 'contrat' && doc.contractConfig) {
      params.append('position', doc.config?.position || '');
      params.append('startDate', doc.contractConfig.startDate);
      params.append('contractType', doc.contractConfig.type);
      params.append('salaryAmount', doc.contractConfig.baseSalary.toString());
      
      if (doc.contractConfig.endDate) {
        params.append('endDate', doc.contractConfig.endDate);
      }
      
      if (doc.contractConfig.trialPeriodEndDate) {
        params.append('trialPeriodEndDate', doc.contractConfig.trialPeriodEndDate);
      }
      
      params.append('isFullTime', doc.contractConfig.isFullTime.toString());
      params.append('monthlyHours', doc.contractConfig.monthlyHours.toString());
    }
    
    // Ouvrir le PDF dans un nouvel onglet
    window.open(`/api/generate-pdf?${params.toString()}`, '_blank');
  };

  // Afficher un badge selon le statut du document
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return <Badge variant="default" className="flex gap-1 items-center"><Check className="h-3 w-3" /> Généré</Badge>;
      case 'pending':
        return <Badge variant="outline" className="flex gap-1 items-center">En attente</Badge>;
      case 'validated':
        return <Badge variant="secondary" className="flex gap-1 items-center"><Check className="h-3 w-3" /> Validé</Badge>;
      case 'draft':
        return <Badge variant="outline" className="flex gap-1 items-center">Brouillon</Badge>;
      case 'signed':
        return <Badge variant="secondary" className="flex gap-1 items-center text-green-500"><Check className="h-3 w-3" /> Signé</Badge>;
      case 'archived':
        return <Badge variant="outline" className="flex gap-1 items-center text-muted-foreground">Archivé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Si une erreur est survenue lors du chargement
  if (error) {
    return (
      <PageContainer>
        <PageHeader
          title="Contrats de travail"
          description="Consultez vos contrats de travail"
        />
        <EmptyState
          title="Erreur de chargement"
          description={error}
          icon={AlertCircle}
          action={
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Contrats de travail"
        description="Consultez et gérez vos contrats de travail"
        actions={
          <Button onClick={() => window.location.href = '/dashboard/documents?documentType=contrat&openCreateDialog=true'}>
            <Plus className="h-4 w-4 mr-2" />
            Créer un contrat
          </Button>
        }
      />

      {/* Boîte de dialogue pour les détails */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedDocument && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileSignature className="h-5 w-5 text-blue-500" />
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
                
                {selectedDocument.contractConfig && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Poste</h4>
                        <p className="text-sm">{selectedDocument.config?.position || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Date d&apos;entrée</h4>
                        <p className="text-sm">{
                          selectedDocument.contractConfig.startDate ? 
                          format(new Date(selectedDocument.contractConfig.startDate), 'dd/MM/yyyy') : 
                          'Non spécifiée'
                        }</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Type de contrat</h4>
                        <p className="text-sm">{selectedDocument.contractConfig.type}</p>
                      </div>
                      {selectedDocument.contractConfig.endDate && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Date de fin</h4>
                          <p className="text-sm">{format(new Date(selectedDocument.contractConfig.endDate), 'dd/MM/yyyy')}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {selectedDocument.contractConfig.trialPeriodEndDate && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Fin période d&apos;essai</h4>
                          <p className="text-sm">{format(new Date(selectedDocument.contractConfig.trialPeriodEndDate), 'dd/MM/yyyy')}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-medium mb-1">Temps de travail</h4>
                        <p className="text-sm">
                          {selectedDocument.contractConfig.isFullTime ? 'Temps plein' : 'Temps partiel'} 
                          {' - '}{selectedDocument.contractConfig.monthlyHours} heures/mois
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Salaire mensuel brut</h4>
                      <p className="text-sm">{selectedDocument.contractConfig.baseSalary.toLocaleString()} €</p>
                    </div>
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

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Mes contrats de travail</CardTitle>
          <CardDescription>
            Consultez et gérez vos contrats de travail
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState message="Chargement des contrats..." />
          ) : documents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Employé</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <FileSignature className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">{doc.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{doc.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{doc.companyName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {doc.contractConfig?.type || '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(doc.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(doc.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetails(doc.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {doc.pdfUrl && (
                          <Button variant="ghost" size="icon" onClick={() => generatePdf(doc)}>
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
              title="Aucun contrat"
              description="Vous n'avez pas encore généré de contrat de travail."
              icon={FileSignature}
              action={
                <Button onClick={() => window.location.href = '/dashboard/documents?documentType=contrat&openCreateDialog=true'}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un contrat
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
} 