import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "./button";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  showEdges?: boolean;
  disabled?: boolean;
}

export function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  showEdges = true,
  disabled = false,
}: PaginationProps) {
  // Calcul des pages à afficher (toujours montrer la page courante et quelques pages autour)
  const getPageNumbers = () => {
    // Toujours afficher la première et la dernière page
    const pages: (number | "ellipsis")[] = [];
    const maxPagesToShow = 7; // Nombre maximal de boutons de page à afficher
    
    if (totalPages <= maxPagesToShow) {
      // Si le nombre total de pages est inférieur à maxPagesToShow, afficher toutes les pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Toujours inclure la première page
      pages.push(1);
      
      // Calculer les pages à afficher autour de la page courante
      const leftSide = Math.floor(maxPagesToShow / 2);
      const rightSide = maxPagesToShow - leftSide - 1;
      
      // Si la page courante est proche du début
      if (currentPage <= leftSide + 1) {
        for (let i = 2; i <= maxPagesToShow - 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
      } 
      // Si la page courante est proche de la fin
      else if (currentPage >= totalPages - rightSide) {
        pages.push("ellipsis");
        for (let i = totalPages - maxPagesToShow + 2; i < totalPages; i++) {
          pages.push(i);
        }
      } 
      // Si la page courante est au milieu
      else {
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
      }
      
      // Toujours inclure la dernière page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <nav className="flex justify-center" aria-label="Pagination">
      <ul className="flex list-none gap-1 items-center">
        {/* Bouton Précédent */}
        {showEdges && (
          <li>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={disabled || currentPage <= 1}
              aria-label="Page précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </li>
        )}
        
        {/* Numéros de page */}
        {getPageNumbers().map((page, index) => (
          <li key={index}>
            {page === "ellipsis" ? (
              <span className="px-1">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <Button
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => page !== currentPage && onPageChange(page as number)}
                disabled={disabled || page === currentPage}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </Button>
            )}
          </li>
        ))}
        
        {/* Bouton Suivant */}
        {showEdges && (
          <li>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={disabled || currentPage >= totalPages}
              aria-label="Page suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </li>
        )}
      </ul>
    </nav>
  );
} 