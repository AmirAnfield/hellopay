"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  Download, 
  Check, 
  FileBadge,
  Plus,
  AlertCircle,
  Eye,
  PencilIcon
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
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

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
}

export default function CertificatesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chargement des données
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user || !user.uid) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Charger les attestations depuis Firestore
        const certificatesRef = collection(db, `users/${user.uid}/certificates`);
        const certificatesQuery = query(certificatesRef);
        const snapshot = await getDocs(certificatesQuery);
        
        // Pour débogage - vérifier si Firestore retourne des documents
        console.log("Documents trouvés dans Firestore :", snapshot.size);
        
        const certificatesList: Document[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          certificatesList.push({
            id: doc.id,
            type: 'attestation',
            title: data.title || 'Attestation sans titre',
            date: data.createdAt?.toDate() || new Date(),
            employeeName: data.options?.employeeName || '',
            companyName: data.options?.companyName || '',
            status: data.status || 'draft',
            pdfUrl: data.pdfUrl,
            config: {
              showSalary: data.options?.showSalary || false,
              salaryType: data.options?.salaryType || 'monthly',
              salaryAmount: data.options?.salaryAmount || 0,
              startDate: data.options?.startDate || '',
              position: data.options?.position || '',
              contractType: data.options?.contractType || 'CDI',
              noEndDate: data.options?.noEndDate || true
            }
          });
        });
        
        setDocuments(certificatesList);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des attestations:", err);
        setError("Impossible de charger les attestations. Veuillez réessayer.");
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les attestations. Veuillez réessayer."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCertificates();
  }, [toast, user]);

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
    
    // Paramètres spécifiques selon le type de document
    if (doc.type === 'attestation' && doc.config) {
      params.append('position', doc.config.position);
      params.append('startDate', doc.config.startDate);
      params.append('contractType', doc.config.contractType);
      params.append('noEndDate', doc.config.noEndDate.toString());
      
      if (doc.config.showSalary) {
        params.append('showSalary', 'true');
        params.append('salaryType', doc.config.salaryType);
        params.append('salaryAmount', doc.config.salaryAmount.toString());
      } else {
        params.append('showSalary', 'false');
      }
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
          title="Attestations de travail"
          description="Consultez vos attestations de travail"
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
        title="Attestations"
        description="Gérez les attestations de travail, de salaire et de présence"
        actions={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/documents')}
            >
              Retour
            </Button>
            <Button
              size="sm"
              onClick={() => router.push('/dashboard/documents/certificates/builder')}
            >
              Nouveau certificat
            </Button>
          </div>
        }
      />

      {/* Boîte de dialogue pour les détails */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Mes attestations de travail</CardTitle>
          <CardDescription>
            Consultez et gérez vos attestations de travail
          </CardDescription>
          </CardHeader>
        <CardContent>
            {isLoading ? (
              <LoadingState message="Chargement des attestations..." />
          ) : documents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Employé</TableHead>
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
                        <FileBadge className="h-5 w-5 text-amber-500" />
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => router.push(`/dashboard/documents/certificates/edit/${doc.id}`)}
                        >
                          <PencilIcon className="h-4 w-4" />
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
              title="Aucune attestation"
              description="Vous n'avez pas encore généré d'attestation de travail."
              icon={FileBadge}
                action={
                <Button onClick={() => window.location.href = '/dashboard/documents/certificates/new'}>
                  <Plus className="h-4 w-4 mr-2" />
                    Créer une attestation
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
    </PageContainer>
  );
} 