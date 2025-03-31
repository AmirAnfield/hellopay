"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Redirection vers la nouvelle URL standardisée
 * Cette page existe pour maintenir la compatibilité avec les liens existants
 */
export default function EmployeeNewRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/dashboard/employees/create');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
        <p className="text-muted-foreground text-sm">Redirection...</p>
      </div>
    </div>
  );
} 