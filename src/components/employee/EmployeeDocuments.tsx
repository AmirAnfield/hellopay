'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getEmployeeCertificates } from '@/services/certificate-service';

interface EmployeeDocumentsProps {
  employeeId: string;
  companyId: string;
}

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  url: string;
  createdAt: Date;
}

export default function EmployeeDocuments({ employeeId, companyId }: EmployeeDocumentsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  
  // Charger les documents et certificats
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        
        // Charger les certificats depuis Firestore
        const certs = await getEmployeeCertificates(companyId, employeeId)
          .catch(error => {
            console.error("Erreur lors du chargement des certificats:", error);
            toast({
              title: "Avertissement", 
              description: "Impossible de charger les certificats. Vérifiez vos droits d'accès.",
              variant: "destructive",
            });
            return [];
          });
        
        // Convertir les certificats en documents
        const certDocs = certs
          .filter(cert => cert.pdfUrl) // Ne garder que ceux avec un PDF
          .map(cert => ({
            id: cert.id,
            name: 'Attestation de travail',
            type: 'certificate',
            url: cert.pdfUrl || '',
            createdAt: cert.createdAt instanceof Date ? cert.createdAt : new Date(cert.createdAt.seconds * 1000)
          }));
        
        setDocuments(certDocs);
      } catch (error) {
        console.error('Erreur lors du chargement des documents:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les documents',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDocuments();
  }, [employeeId, companyId, toast]);
  
  // Fonction pour formater la date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Fonction pour télécharger un document
  const handleDownload = (url: string, name: string) => {
    // Créer un lien invisible et simuler un clic
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Si chargement en cours
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-muted-foreground">Chargement des documents...</p>
      </div>
    );
  }
  
  // Si aucun document trouvé
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48">
        <FileText className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Aucun document disponible</p>
        <p className="text-sm text-muted-foreground mb-4">Les certificats générés apparaîtront ici</p>
        
        <Button asChild>
          <a href={`/dashboard/certificates/new?employeeId=${employeeId}&companyId=${companyId}`}>
            <FileText className="h-4 w-4 mr-2" />
            Créer une attestation
          </a>
        </Button>
      </div>
    );
  }
  
  // Affichage de la liste des documents
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Documents disponibles</h3>
        <Button asChild>
          <a href={`/dashboard/documents/certificates/create?employeeId=${employeeId}&companyId=${companyId}`}>
            <FileText className="h-4 w-4 mr-2" />
            Nouvelle attestation
          </a>
        </Button>
      </div>
      
      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="p-4 flex justify-between items-center">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-blue-500 mr-3" />
              <div>
                <p className="font-medium">{doc.name}</p>
                <p className="text-sm text-muted-foreground">
                  Créé le {formatDate(doc.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(doc.url, '_blank')}
              >
                <FileText className="h-4 w-4 mr-1" />
                Voir
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDownload(doc.url, doc.name)}
              >
                <Download className="h-4 w-4 mr-1" />
                Télécharger
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 