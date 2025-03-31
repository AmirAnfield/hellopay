'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Configuration du worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFPreviewProps {
  url: string;
  className?: string;
}

export function PDFPreview({ url, className }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  }

  function onDocumentLoadError(err: Error) {
    console.error('Erreur lors du chargement du PDF:', err);
    setError("Impossible de charger le document PDF. Vérifiez que le format est correct.");
    setLoading(false);
  }

  function changePage(offset: number) {
    if (!numPages) return;
    const newPage = pageNumber + offset;
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage);
    }
  }

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  return (
    <div className={cn('flex flex-col', className)}>
      {loading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}
      
      {error && (
        <div className="text-red-500 text-center p-4 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        }
        error={
          <div className="text-red-500 text-center p-4">
            Impossible de charger le document
          </div>
        }
      >
        <Page 
          pageNumber={pageNumber} 
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="mx-auto shadow-md rounded-md overflow-hidden"
          width={450}
        />
      </Document>
      
      {numPages && numPages > 0 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={previousPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
          </Button>
          
          <p className="text-sm">
            Page {pageNumber} sur {numPages}
          </p>
          
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={pageNumber >= numPages}
          >
            Suivant <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
} 