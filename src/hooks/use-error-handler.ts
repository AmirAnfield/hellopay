"use client";

import { useState, useCallback } from 'react';
import { AppError, ErrorCode, logError } from '@/lib/error-handler';
import { useToast } from '@/components/ui/use-toast';

interface ErrorState {
  error: Error | AppError | null;
  code: ErrorCode | null;
  message: string | null;
}

export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    code: null,
    message: null,
  });
  const { toast } = useToast();

  const handleError = useCallback((error: Error | AppError | unknown, context?: Record<string, unknown>) => {
    if (error instanceof AppError) {
      setErrorState({
        error,
        code: error.code,
        message: error.message,
      });
      
      // Journaliser l'erreur
      logError(error, context);
      
      // Afficher une notification toast
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
      
      return error;
    } 
    
    if (error instanceof Error) {
      setErrorState({
        error,
        code: null,
        message: error.message,
      });
      
      // Journaliser l'erreur
      logError(error, context);
      
      // Afficher une notification toast
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
      
      return error;
    }
    
    // Pour tout autre type d'erreur
    const genericError = new Error('Une erreur inattendue est survenue');
    setErrorState({
      error: genericError,
      code: null,
      message: genericError.message,
    });
    
    // Journaliser l'erreur
    logError(genericError, { originalError: error, ...context });
    
    // Afficher une notification toast
    toast({
      variant: "destructive",
      title: "Erreur",
      description: genericError.message,
    });
    
    return genericError;
  }, [toast]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      code: null,
      message: null,
    });
  }, []);

  return {
    ...errorState,
    isError: errorState.error !== null,
    handleError,
    clearError,
  };
} 