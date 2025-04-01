'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Trash2, Plus } from 'lucide-react';
import { Certificate } from '@/types/firebase';
import { deleteCertificate } from '@/services/certificate-service';
import { formatDate } from '@/lib/utils';

interface CertificatesListProps {
  certificates: Certificate[];
  companyNames: Record<string, string>;
  employeeNames: Record<string, string>;
}

export default function CertificatesList({ certificates, companyNames, employeeNames }: CertificatesListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fonction pour formater le statut en français
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'generated':
        return 'Généré';
      case 'signed':
        return 'Signé';
      default:
        return status;
    }
  };
  
  // Fonction pour supprimer un certificat
  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette attestation ?')) {
      try {
        setDeletingId(id);
        setIsLoading(true);
        
        await deleteCertificate(id);
        
        toast({
          title: 'Succès',
          description: 'Attestation supprimée',
        });
        
        // Rafraîchir la page
        router.refresh();
        
      } catch (error) {
        toast({
          title: 'Erreur',
          description: error instanceof Error ? error.message : 'Impossible de supprimer l\'attestation',
          variant: 'destructive',
        });
        console.error(error);
      } finally {
        setDeletingId(null);
        setIsLoading(false);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Attestations de travail</CardTitle>
          <CardDescription>Gérez les attestations de travail de vos employés</CardDescription>
        </div>
        <Button asChild>
          <Link href="/dashboard/certificates/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle attestation
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {certificates.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Aucune attestation trouvée.</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/certificates/new">
                <Plus className="mr-2 h-4 w-4" />
                Créer une attestation
              </Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Employé</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map((certificate) => (
                <TableRow key={certificate.id}>
                  <TableCell>{formatDate(certificate.createdAt.toDate())}</TableCell>
                  <TableCell>{employeeNames[certificate.employeeId] || 'Employé inconnu'}</TableCell>
                  <TableCell>{companyNames[certificate.companyId] || 'Entreprise inconnue'}</TableCell>
                  <TableCell>{getStatusLabel(certificate.status)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {certificate.pdfUrl && (
                      <>
                        <Button size="sm" variant="outline" asChild>
                          <a href={certificate.pdfUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="mr-1 h-4 w-4" />
                            Voir
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={certificate.pdfUrl} download="attestation_travail.pdf">
                            <Download className="mr-1 h-4 w-4" />
                            Télécharger
                          </a>
                        </Button>
                      </>
                    )}
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(certificate.id)}
                      disabled={isLoading && deletingId === certificate.id}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 