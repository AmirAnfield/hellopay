'use client';

import { useState, useEffect } from 'react';
import { DocumentsTable } from '@/components/documents/documents-table';
import { useToast } from '@/components/ui/use-toast';
import { Document, searchDocuments } from '@/services/documents-service';

interface DocumentsDataProps {
  query: string;
  documentType: string;
  employeeId: string;
  status: string;
  page: number;
}

export default function DocumentsData({
  query,
  documentType,
  employeeId,
  status,
  page
}: DocumentsDataProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        
        // Construire les filtres à partir des paramètres
        const filters: {
          employeeId?: string;
          companyId?: string;
          type?: any;
          status?: string;
        } = {};
        
        if (employeeId) filters.employeeId = employeeId;
        if (documentType) filters.type = documentType;
        if (status && status !== 'all') filters.status = status;
        
        // Récupérer les documents
        const fetchedDocuments = await searchDocuments(query, filters);
        
        // Calculer la pagination
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, fetchedDocuments.length);
        
        // Mettre à jour l'état
        setDocuments(fetchedDocuments.slice(startIndex, endIndex));
        setTotalDocuments(fetchedDocuments.length);
      } catch (error) {
        console.error('Erreur lors de la récupération des documents:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de récupérer les documents.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [query, documentType, employeeId, status, page, toast]);
  
  // Gérer le changement de page
  const handlePageChange = (newPage: number) => {
    // Utilisez router.push pour changer de page
    const url = new URL(window.location.href);
    url.searchParams.set('page', String(newPage));
    window.history.pushState({}, '', url.toString());
    
    // On pourrait aussi utiliser le router de Next.js pour une approche plus robuste
    // router.push(`/documents?page=${newPage}&q=${query}&type=${documentType}...`)
  };

  return (
    <DocumentsTable
      documents={documents}
      totalDocuments={totalDocuments}
      page={page}
      pageSize={pageSize}
      onPageChange={handlePageChange}
    />
  );
} 