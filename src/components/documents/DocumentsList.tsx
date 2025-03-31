'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUploader } from './FileUploader';
import { getEmployeeDocuments, deleteDocument, DocumentType } from '@/services/storage-service';
import { useToast } from '@/components/ui/use-toast';
import { 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  FileX,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentItemProps {
  id: string;
  url: string;
  employeeId: string;
  documentType: DocumentType;
  onDelete: () => void;
  isDefault?: boolean;
}

function DocumentItem({ id, url, employeeId, documentType, onDelete, isDefault }: DocumentItemProps) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
    
    setDeleting(true);
    try {
      await deleteDocument(employeeId, documentType, id);
      toast({
        title: 'Document supprimé',
        description: 'Le document a été supprimé avec succès.'
      });
      onDelete();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de suppression',
        description: 'Impossible de supprimer le document. Veuillez réessayer.'
      });
    } finally {
      setDeleting(false);
    }
  };
  
  const handleDownload = () => {
    // Ouvrir le lien dans un nouvel onglet
    window.open(url, '_blank');
  };
  
  return (
    <div className={cn(
      'flex items-center justify-between border p-3 rounded-md',
      isDefault ? 'bg-blue-50 border-blue-200' : 'bg-white'
    )}>
      <div className="flex items-center space-x-3">
        <FileText className="h-6 w-6 text-primary" />
        <div>
          <p className="font-medium">{documentType} - {id}</p>
          {isDefault && <p className="text-xs text-blue-600">Document par défaut</p>}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDownload}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
        </Button>
        {!isDefault && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-red-500" />}
          </Button>
        )}
      </div>
    </div>
  );
}

interface DocumentsListProps {
  employeeId: string;
  documentType: DocumentType;
  title: string;
  description?: string;
  className?: string;
}

export function DocumentsList({
  employeeId,
  documentType,
  title,
  description,
  className
}: DocumentsListProps) {
  const [documents, setDocuments] = useState<{ id: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const { toast } = useToast();
  
  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const docs = await getEmployeeDocuments(employeeId, documentType);
      setDocuments(docs);
    } catch (err) {
      console.error('Erreur lors du chargement des documents:', err);
      setError('Impossible de charger les documents. Veuillez réessayer.');
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les documents.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (employeeId) {
      loadDocuments();
    }
  }, [employeeId, documentType]);
  
  const handleDocumentUploaded = (url: string) => {
    // Recharger la liste après un téléchargement réussi
    loadDocuments();
    setShowUploader(false);
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowUploader(!showUploader)}
          >
            {showUploader ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Masquer
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Ajouter
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showUploader && (
          <div className="mb-6">
            <FileUploader
              employeeId={employeeId}
              documentType={documentType}
              onSuccess={handleDocumentUploaded}
            />
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileX className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">{error}</p>
            <Button variant="outline" onClick={loadDocuments}>
              Réessayer
            </Button>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileX className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">Aucun document trouvé</p>
            {!showUploader && (
              <Button onClick={() => setShowUploader(true)}>
                Ajouter un document
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <DocumentItem
                key={doc.id}
                id={doc.id}
                url={doc.url}
                employeeId={employeeId}
                documentType={documentType}
                onDelete={loadDocuments}
              />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <p className="text-sm text-gray-500">
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </p>
      </CardFooter>
    </Card>
  );
} 