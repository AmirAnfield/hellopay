import { notFound } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, CalendarIcon, Info, User, Building, Tag } from 'lucide-react';
import Link from 'next/link';
import { formatFileSize } from '@/lib/utils';
import { Metadata } from 'next';
import { getDocumentById } from '@/services/documents-service';

interface DocumentPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata(
  { params }: DocumentPageProps
): Promise<Metadata> {
  const document = await getDocumentById(params.id);
  
  if (!document) {
    return {
      title: 'Document non trouvé | HelloPay',
      description: 'Le document demandé n\'a pas été trouvé'
    };
  }
  
  return {
    title: `${document.name} | HelloPay`,
    description: `Document ${document.type} - ${document.status}`
  };
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const document = await getDocumentById(params.id);
  
  if (!document) {
    notFound();
  }
  
  // Formatter la date
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{document.name}</h1>
          <p className="text-muted-foreground">
            Document {document.type} - {document.status}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/documents">
              Retour
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a href={document.url} download>
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </a>
          </Button>
          <Button asChild>
            <Link href={document.url} target="_blank" rel="noopener noreferrer">
              <FileText className="mr-2 h-4 w-4" />
              Voir
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu du document</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center min-h-[400px] bg-muted/20 p-0 rounded-md overflow-hidden">
              <iframe 
                src={`${document.url}#toolbar=0&navpanes=0`} 
                className="w-full h-[600px] border-0" 
                title={`Aperçu de ${document.name}`}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Tag className="h-4 w-4 mr-2" /> Type
                </div>
                <div className="font-medium capitalize">{document.type}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" /> Date de création
                </div>
                <div className="font-medium">{formatDate(document.createdAt)}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Info className="h-4 w-4 mr-2" /> Taille
                </div>
                <div className="font-medium">
                  {formatFileSize(document.metadata.size as number || 0)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center">
                  <User className="h-4 w-4 mr-2" /> ID Employé
                </div>
                <div className="font-medium">{document.employeeId}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Building className="h-4 w-4 mr-2" /> ID Entreprise
                </div>
                <div className="font-medium">{document.companyId}</div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/employees/${document.employeeId}`}>
                  Voir l&apos;employé
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 