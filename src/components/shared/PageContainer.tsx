import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

/**
 * Conteneur standard pour les pages du tableau de bord
 * Applique une largeur maximale, des marges et des paddings cohérents
 */
export function PageContainer({
  children,
  className,
  fullWidth = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "px-4 md:px-6 py-6 space-y-6",
        !fullWidth && "max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Composant pour les actions d'en-tête standardisées
 * Permet un placement cohérent des boutons d'action dans l'en-tête
 */
export function HeaderActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col sm:flex-row items-center gap-2", className)}>
      {children}
    </div>
  );
}

/**
 * Composant pour les titres de page standardisés
 */
export function PageHeader({
  title,
  description,
  children,
  className,
  actions,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6", className)}>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children || actions ? (
        <div className="mt-2 sm:mt-0">
          {actions || children}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Composant pour organiser des sections dans une page
 * Permet de regrouper visuellement du contenu avec un titre et une description
 */
export function SectionBlock({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h2 className="text-lg font-medium">{title}</h2>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

/**
 * Composant pour les conteneurs de contenu
 */
export function ContentContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow", className)}>
      {children}
    </div>
  );
}

/**
 * État de chargement standardisé
 */
export function LoadingState({ message = "Chargement en cours..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-4">
      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * État vide standardisé
 */
export function EmptyState({
  title = "Aucun élément trouvé",
  description = "Aucun élément à afficher pour le moment.",
  icon: Icon,
  action,
}: {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
      {Icon && <Icon className="h-10 w-10 text-muted-foreground" />}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/**
 * Message pour les tableaux vides
 * Plus léger que EmptyState, intégré directement dans les tableaux
 */
export function NoDataMessage({
  message = "Aucune donnée à afficher",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn("text-center py-6 text-sm text-muted-foreground", className)}>
      {message}
    </div>
  );
} 