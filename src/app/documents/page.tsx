import { Suspense } from 'react';
import { DocumentsTable } from '@/components/documents/documents-table';
import { DocumentsTableSkeleton } from '@/components/documents/documents-table-skeleton';
import { DocumentsFilters } from '@/components/documents/documents-filters';
import { DocumentUploadButton } from '@/components/documents/document-upload-button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { SearchIcon } from 'lucide-react';
import { getServerSession } from 'next-auth';

export const metadata = {
  title: 'Documents | HelloPay',
  description: 'Gérez tous vos documents dans un seul endroit'
};

export default async function DocumentsPage({
  searchParams
}: {
  searchParams: {
    q?: string;
    type?: string;
    employee?: string;
    status?: string;
    page?: string;
  }
}) {
  // Récupérer la session utilisateur
  const session = await getServerSession();
  
  // Vérifier l'authentification
  if (!session) {
    return (
      <div className="container mx-auto py-10">
        <Card className="bg-destructive/10">
          <CardHeader>
            <CardTitle>Accès non autorisé</CardTitle>
            <CardDescription>
              Vous devez être connecté pour accéder à cette page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentPage = Number(searchParams.page) || 1;
  const query = searchParams.q || '';
  const documentType = searchParams.type || '';
  const employeeId = searchParams.employee || '';
  const status = searchParams.status || 'active';

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Gérez et organisez tous vos documents d&apos;entreprise.
          </p>
        </div>
        <DocumentUploadButton />
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
            <CardTitle>Rechercher des documents</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <DocumentsFilters 
            query={query} 
            documentType={documentType}
            employeeId={employeeId}
            status={status}
          />
        </CardContent>
      </Card>
      
      <Suspense fallback={<DocumentsTableSkeleton />}>
        <DocumentsTable 
          query={query}
          documentType={documentType}
          employeeId={employeeId}
          status={status}
          page={currentPage}
        />
      </Suspense>
    </div>
  );
} 