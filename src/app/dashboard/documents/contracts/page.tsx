"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Download, FileSignature, Eye, Pen, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  PageContainer, 
  PageHeader, 
  EmptyState, 
  LoadingState 
} from "@/components/shared/PageContainer";
import { Badge } from "@/components/ui/badge";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Types pour les contrats
interface Contract {
  id: string;
  title: string;
  date: Date;
  employeeName: string;
  companyName: string;
  status: 'generated' | 'pending' | 'validated' | 'draft' | 'signed' | 'archived';
  pdfUrl?: string;
  type: string;
  startDate?: string;
  endDate?: string;
}

export default function ContractsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Chargement des contrats
  useEffect(() => {
    const fetchContracts = async () => {
      if (!user || !user.uid) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const userId = user.uid;
        
        // Récupérer les contrats depuis Firestore
        const contractsRef = collection(db, `users/${userId}/contracts`);
        const contractsSnapshot = await getDocs(contractsRef);
        
        const contractsList: Contract[] = [];
        
        if (!contractsSnapshot.empty) {
          contractsSnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Traitement amélioré des données d'employé
            let employeeName = 'Employé non spécifié';
            if (data.employeeName && data.employeeName.trim() !== '') {
              employeeName = data.employeeName;
            } else if (data.formData?.employee?.firstName || data.formData?.employee?.lastName) {
              const firstName = data.formData.employee.firstName || '';
              const lastName = data.formData.employee.lastName || '';
              employeeName = `${firstName} ${lastName}`.trim();
            }
            
            // Traitement amélioré des données d'entreprise
            let companyName = 'Entreprise non spécifiée';
            if (data.companyName && data.companyName.trim() !== '') {
              companyName = data.companyName;
            } else if (data.formData?.company?.name) {
              companyName = data.formData.company.name;
            }
            
            // Titre du contrat amélioré
            let title = 'Contrat sans titre';
            if (data.title && data.title.trim() !== '') {
              title = data.title;
            } else if (employeeName !== 'Employé non spécifié') {
              title = `Contrat - ${employeeName}`;
            } else if (companyName !== 'Entreprise non spécifiée') {
              title = `Contrat pour ${companyName}`;
            }
            
            contractsList.push({
              id: doc.id,
              title: title,
              date: data.date ? new Date(data.date.toDate ? data.date.toDate() : data.date) : new Date(),
              employeeName: employeeName,
              companyName: companyName,
              status: (data.status || 'draft') as 'generated' | 'pending' | 'validated' | 'draft' | 'signed' | 'archived',
              pdfUrl: data.pdfUrl || undefined,
              type: data.formData?.contractDetails?.type || 'CDI',
              startDate: data.formData?.contractDetails?.startDate,
              endDate: data.formData?.contractDetails?.endDate
            });
          });
        }
        
        setContracts(contractsList);
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
    };
    
    fetchContracts();
  }, [toast, user]);

  // Afficher un badge selon le statut du contrat
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return <Badge variant="secondary" className="bg-green-50 text-green-600 hover:bg-green-50 hover:text-green-600">Généré</Badge>;
      case 'pending':
        return <Badge variant="outline">En attente</Badge>;
      case 'validated':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-50 hover:text-blue-600">Validé</Badge>;
      case 'draft':
        return <Badge variant="outline" className="text-gray-500">Brouillon</Badge>;
      case 'signed':
        return <Badge variant="secondary" className="bg-amber-50 text-amber-600 hover:bg-amber-50 hover:text-amber-600">Signé</Badge>;
      case 'archived':
        return <Badge variant="outline" className="text-gray-400">Archivé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Fonction pour télécharger un PDF
  const handleDownloadPDF = (contract: Contract) => {
    if (contract.pdfUrl) {
      window.open(contract.pdfUrl, '_blank');
      toast({
        title: "Téléchargement en cours",
        description: "Le PDF est en cours de téléchargement..."
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Aucun PDF disponible pour ce contrat."
      });
    }
  };

  // Si les données sont en cours de chargement
  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Contrats"
          description="Gérez tous vos contrats de travail"
        />
        <LoadingState />
      </PageContainer>
    );
  }

  // Si une erreur est survenue lors du chargement
  if (error) {
    return (
      <PageContainer>
        <PageHeader
          title="Contrats"
          description="Gérez tous vos contrats de travail"
        />
        <EmptyState
          title="Erreur de chargement"
          description={error}
          icon={FileText}
          action={
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          }
        />
      </PageContainer>
    );
  }

  // Si aucun contrat n'a été trouvé
  if (contracts.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="Contrats"
          description="Gérez tous vos contrats de travail"
          actions={
            <Button asChild>
              <Link href="/dashboard/contracts/create">
                <Plus className="h-4 w-4 mr-1" />
                Nouveau contrat
              </Link>
            </Button>
          }
        />
        <EmptyState
          title="Aucun contrat trouvé"
          description="Vous n'avez pas encore créé de contrats. Commencez par en créer un nouveau."
          icon={FileSignature}
          action={
            <Button asChild>
              <Link href="/dashboard/contracts/create">
                <Plus className="h-4 w-4 mr-1" />
                Créer un contrat
              </Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Contrats"
        description="Gérez tous vos contrats de travail"
        actions={
          <Button asChild>
            <Link href="/dashboard/contracts/create">
              <Plus className="h-4 w-4 mr-1" />
              Nouveau contrat
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col space-y-3">
        {contracts.map((contract) => (
          <Card key={contract.id} className="border-t-0 border-l-0 border-r-0 border-b">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <FileSignature className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                    <h3 className="font-medium text-base truncate md:col-span-2">{contract.title}</h3>
                    <div className="flex items-center gap-2">
                      {renderStatusBadge(contract.status)}
                      <Badge variant="outline">
                        {contract.type === 'CDD' ? (
                          <span>CDD{contract.endDate ? ` jusqu'au ${format(new Date(contract.endDate), 'dd/MM/yyyy')}` : ''}</span>
                        ) : (
                          <span>CDI</span>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Employé:</span> 
                      <span className="truncate font-semibold text-foreground">
                        {contract.employeeName !== 'Employé non spécifié' 
                          ? contract.employeeName 
                          : <span className="text-muted-foreground italic">Non spécifié</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Entreprise:</span> 
                      <span className="truncate font-semibold text-foreground">
                        {contract.companyName !== 'Entreprise non spécifiée' 
                          ? contract.companyName 
                          : <span className="text-muted-foreground italic">Non spécifiée</span>}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {contract.startDate 
                          ? format(new Date(contract.startDate), 'dd MMM yyyy', { locale: fr }) 
                          : format(contract.date, 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2 justify-end ml-4 shrink-0">
                  {contract.status === 'draft' ? (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild title="Éditer">
                      <Link href={`/dashboard/contracts/edit/${contract.id}`}>
                        <Pen className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild title="Voir">
                      <Link href={`/dashboard/contracts/${contract.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  
                  {contract.pdfUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      title="Télécharger le PDF"
                      onClick={() => handleDownloadPDF(contract)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
} 