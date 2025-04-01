'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblings?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblings = 1,
}: PaginationProps) {
  // Générer les liens de pagination
  const generatePagination = () => {
    // Si pas assez de pages, afficher tous les numéros
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Calcul des pages à afficher
    const leftSiblings = Math.max(currentPage - siblings, 1);
    const rightSiblings = Math.min(currentPage + siblings, totalPages);

    // Afficher les ellipses
    const showLeftDots = leftSiblings > 2;
    const showRightDots = rightSiblings < totalPages - 1;

    // Pages initiales
    const pages: (number | 'dots')[] = [];

    // Toujours afficher la première page
    pages.push(1);

    // Afficher des points à gauche si nécessaire
    if (showLeftDots) {
      pages.push('dots');
    }

    // Ajouter les pages autour de la page courante
    for (let i = leftSiblings; i <= rightSiblings; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Afficher des points à droite si nécessaire
    if (showRightDots) {
      pages.push('dots');
    }

    // Toujours afficher la dernière page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  // Pas de pagination si une seule page
  if (totalPages <= 1) {
    return null;
  }

  const pages = generatePagination();

  return (
    <nav className="flex items-center justify-center space-x-1" aria-label="Pagination">
      {/* Bouton "Précédent" */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <span className="sr-only">Page précédente</span>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Numéros de page */}
      {pages.map((page, index) => {
        // Points de suspension
        if (page === 'dots') {
          return (
            <Button
              key={`dots-${index}`}
              variant="ghost"
              size="icon"
              disabled
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          );
        }

        // Numéro de page
        return (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="icon"
            onClick={() => onPageChange(page)}
          >
            <span>{page}</span>
          </Button>
        );
      })}

      {/* Bouton "Suivant" */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <span className="sr-only">Page suivante</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
} 