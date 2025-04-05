"use client";

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PaginationProps } from '@/types/pagination';

/**
 * Générer la plage de pages à afficher
 */
function generatePageRange(currentPage: number, totalPages: number, siblingCount: number = 1) {
  // Calculer le nombre de pages à afficher
  const totalPageNumbers = siblingCount * 2 + 3; // sibling gauche + sibling droit + page courante + première + dernière

  // Si le nombre total de pages est inférieur au nombre total à afficher, afficher toutes les pages
  if (totalPageNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Calculer les index des pages autour de la page courante
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  // Ne pas afficher les points de suspension si les pages adjacentes sont proches
  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  // Cas 1: Points de suspension à droite seulement
  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 1 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, -1, totalPages];
  }

  // Cas 2: Points de suspension à gauche seulement
  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 1 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [1, -2, ...rightRange];
  }

  // Cas 3: Points de suspension des deux côtés
  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, -3, ...middleRange, -4, totalPages];
  }

  // Par défaut, retourner un tableau vide (ne devrait jamais arriver)
  return [];
}

/**
 * Composant de pagination réutilisable
 * 
 * @example
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   onPageChange={handlePageChange}
 * />
 */
export function Pagination({
  currentPage,
  totalPages,
  pageSize = 10,
  onPageChange,
  showFirstLast = true,
  siblingCount = 1,
  className
}: PaginationProps) {
  // Générer la plage de pages à afficher
  const pageRange = useMemo(() => {
    return generatePageRange(currentPage, totalPages, siblingCount);
  }, [currentPage, totalPages, siblingCount]);

  // Si pas de pagination nécessaire (0 ou 1 page)
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex justify-center items-center space-x-2", className)}
    >
      {/* Bouton Première page */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="Première page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Bouton Page précédente */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Page précédente"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Pages numérotées */}
      {pageRange.map((page, index) => {
        // Points de suspension à gauche
        if (page === -1 || page === -3) {
          return (
            <Button
              key={`dots-${index}`}
              variant="outline"
              size="icon"
              className="h-8 w-8 cursor-default"
              disabled
            >
              ...
            </Button>
          );
        }

        // Points de suspension à droite
        if (page === -2 || page === -4) {
          return (
            <Button
              key={`dots-${index}`}
              variant="outline" 
              size="icon"
              className="h-8 w-8 cursor-default"
              disabled
            >
              ...
            </Button>
          );
        }

        // Page régulière
        return (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(page)}
            aria-current={currentPage === page ? "page" : undefined}
            aria-label={`Page ${page}`}
          >
            {page}
          </Button>
        );
      })}

      {/* Bouton Page suivante */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Page suivante"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Bouton Dernière page */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Dernière page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      )}
    </nav>
  );
}

/**
 * Composant pour afficher les informations de pagination
 */
export function PaginationInfo({
  currentPage,
  pageSize,
  totalItems,
  className
}: {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  className?: string;
}) {
  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={cn("text-sm text-muted-foreground", className)}>
      Affichage de <span className="font-medium">{startItem}</span> à{" "}
      <span className="font-medium">{endItem}</span> sur{" "}
      <span className="font-medium">{totalItems}</span> résultats
    </div>
  );
}

/**
 * Composant de sélection du nombre d'éléments par page
 */
export function PageSizeSelector({
  pageSize,
  onPageSizeChange,
  options = [10, 25, 50, 100],
  className
}: {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  options?: number[];
  className?: string;
}) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <span className="text-sm text-muted-foreground">Afficher</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm"
        aria-label="Nombre d'éléments par page"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-sm text-muted-foreground">par page</span>
    </div>
  );
} 