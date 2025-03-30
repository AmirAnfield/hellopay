import { cn } from "@/lib/utils";

/**
 * Composant Skeleton générique
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

/**
 * Skeleton pour une ligne de texte
 */
export function TextLineLoader({
  width = "100%",
  height = "1rem",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  width?: string;
  height?: string;
}) {
  return (
    <Skeleton
      className={cn("h-[1rem] w-full", className)}
      style={{ width, height }}
      {...props}
    />
  );
}

/**
 * Skeleton pour une carte
 */
export function CardLoader({
  rows = 3,
  hasHeader = true,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  rows?: number;
  hasHeader?: boolean;
}) {
  return (
    <div
      className={cn("rounded-lg border bg-card p-4 space-y-4", className)}
      {...props}
    >
      {hasHeader && (
        <div className="space-y-2">
          <TextLineLoader width="40%" height="1.5rem" />
          <TextLineLoader width="70%" height="0.875rem" />
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <TextLineLoader key={i} width={`${Math.floor(Math.random() * 40) + 60}%`} />
        ))}
      </div>
    </div>
  );
}

/**
 * Loader pour un tableau
 */
export function TableLoader({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}) {
  return (
    <div className={cn("rounded-md border", className)} {...props}>
      <div className="w-full divide-y divide-border">
        {showHeader && (
          <div className="bg-muted/50 px-4 py-3 grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full max-w-[8rem]" />
            ))}
          </div>
        )}
        <div>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div 
              key={rowIndex}
              className="px-4 py-3 grid gap-3 border-b border-border last:border-0"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  className="h-4 w-full"
                  style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Loader pour une liste
 */
export function ListLoader({
  items = 5,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  items?: number;
}) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <TextLineLoader width="40%" />
            <TextLineLoader width="70%" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Loader pour les statistiques
 */
export function StatsLoader({
  count = 4,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  count?: number;
}) {
  return (
    <div 
      className={cn("grid gap-4", className)} 
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))` }}
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-lg border bg-card">
          <div className="flex justify-between items-center">
            <TextLineLoader width="30%" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <div className="mt-4">
            <TextLineLoader width="50%" height="1.5rem" />
            <div className="mt-2">
              <TextLineLoader width="70%" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 