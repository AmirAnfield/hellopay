import { useState, useCallback } from 'react';
import { Company } from '@/services/company-service';

// Interface pour la structure de cache
interface CompanyCache {
  companies: Company[];
  timestamp: number;
  query?: string;
}

// Durée de validité du cache en millisecondes (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Hook personnalisé pour mettre en cache les résultats de recherche d'entreprises
 */
export function useCompanyCache() {
  const [cache, setCache] = useState<CompanyCache | null>(null);

  // Vérifier si le cache est valide
  const isCacheValid = useCallback((query?: string): boolean => {
    if (!cache) return false;
    
    // Si une requête est spécifiée, vérifier qu'elle correspond au cache
    if (query && cache.query !== query) return false;
    
    // Vérifier si le cache n'est pas expiré
    const now = Date.now();
    return (now - cache.timestamp) < CACHE_DURATION;
  }, [cache]);

  // Mettre à jour le cache avec de nouvelles données
  const updateCache = useCallback((companies: Company[], query?: string) => {
    setCache({
      companies,
      timestamp: Date.now(),
      query
    });
  }, []);

  // Récupérer les entreprises du cache
  const getCachedCompanies = useCallback((query?: string): Company[] | null => {
    if (isCacheValid(query)) {
      return cache?.companies || null;
    }
    return null;
  }, [cache, isCacheValid]);

  // Vider le cache
  const clearCache = useCallback(() => {
    setCache(null);
  }, []);

  return {
    getCachedCompanies,
    updateCache,
    clearCache,
    isCacheValid
  };
} 