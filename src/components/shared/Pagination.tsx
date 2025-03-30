import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// Type pour les options de traduction
type TranslationOptions = Record<string, string | number | boolean>;

// Fonction de traduction simple par défaut
const defaultTranslate = (key: string, options?: TranslationOptions) => {
  // Remplacer les variables dans la chaîne
  if (options) {
    let result = key;
    Object.entries(options).forEach(([k, v]) => {
      result = result.replace(`{${k}}`, String(v));
    });
    return result;
  }
  return key;
};

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  showGoToFirst?: boolean;
  showGoToLast?: boolean;
  maxPageButtons?: number;
  className?: string;
  translate?: (key: string, options?: TranslationOptions) => string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  showGoToFirst = true,
  showGoToLast = true,
  maxPageButtons = 5,
  className = "",
  translate = defaultTranslate,
}: PaginationProps) {
  // Utiliser la fonction de traduction fournie ou la fonction par défaut
  const t = translate;

  // Gérer les cas limites
  if (totalPages <= 1) {
    return null;
  }

  // S'assurer que la page courante est dans les limites valides
  const safePage = Math.max(1, Math.min(currentPage, totalPages));

  // Déterminer quelles pages afficher
  const getPageNumbers = () => {
    // Si peu de pages, afficher toutes les pages
    if (totalPages <= maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Calcul du milieu
    const half = Math.floor(maxPageButtons / 2);
    
    // Si on est proche du début
    if (safePage <= half + 1) {
      return [
        ...Array.from({ length: maxPageButtons - 1 }, (_, i) => i + 1),
        "ellipsis",
        totalPages,
      ];
    }
    
    // Si on est proche de la fin
    if (safePage >= totalPages - half) {
      return [
        1,
        "ellipsis",
        ...Array.from(
          { length: maxPageButtons - 1 },
          (_, i) => totalPages - maxPageButtons + i + 2
        ),
      ];
    }
    
    // On est au milieu
    return [
      1,
      "ellipsis",
      ...Array.from(
        { length: maxPageButtons - 2 },
        (_, i) => safePage - Math.floor((maxPageButtons - 2) / 2) + i
      ),
      "ellipsis",
      totalPages,
    ];
  };

  const pages = getPageNumbers();

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="text-sm text-muted-foreground">
        {totalItems !== undefined && pageSize !== undefined && (
          <p>
            {t("pagination.showing")} {Math.min((safePage - 1) * pageSize + 1, totalItems)} - {Math.min(safePage * pageSize, totalItems)} {t("pagination.of")} {totalItems}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-1">
        {showGoToFirst && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={safePage === 1}
            className="h-8 w-8"
            aria-label={t("pagination.firstPage")}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage === 1}
          className="h-8 w-8"
          aria-label={t("pagination.previousPage")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((page, i) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="px-2">
              ...
            </span>
          ) : (
            <Button
              key={`page-${page}`}
              variant={page === safePage ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(page as number)}
              className="h-8 w-8"
              aria-label={t("pagination.goToPage", { page })}
              aria-current={page === safePage ? "page" : undefined}
            >
              {page}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage === totalPages}
          className="h-8 w-8"
          aria-label={t("pagination.nextPage")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {showGoToLast && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={safePage === totalPages}
            className="h-8 w-8"
            aria-label={t("pagination.lastPage")}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
} 