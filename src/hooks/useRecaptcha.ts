import { useState, useCallback } from 'react';

// Type pour window.grecaptcha.enterprise
declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

type RecaptchaStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseRecaptchaOptions {
  siteKey?: string;
  action?: string;
}

/**
 * Hook pour utiliser reCAPTCHA Enterprise dans l'application
 */
export const useRecaptcha = (options?: UseRecaptchaOptions) => {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<RecaptchaStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  
  // Paramètres par défaut
  const siteKey = options?.siteKey || '6LdUnwUrAAAAAL3u-4zxXrmXOCLMBEVLjkkd2Y4_';
  const defaultAction = options?.action || 'default_action';
  
  /**
   * Exécute reCAPTCHA et récupère un token
   * @param action Action spécifique (login, submit_form, etc.)
   * @returns Token reCAPTCHA
   */
  const executeRecaptcha = useCallback(async (action?: string): Promise<string | null> => {
    // Réinitialiser l'état
    setStatus('loading');
    setError(null);
    
    try {
      // Vérifier si reCAPTCHA est chargé
      if (!window.grecaptcha || !window.grecaptcha.enterprise) {
        throw new Error('reCAPTCHA n\'est pas chargé. Assurez-vous que le script est bien inclus.');
      }
      
      // Utiliser l'action spécifiée ou celle par défaut
      const actionToUse = action || defaultAction;
      
      // Exécuter reCAPTCHA
      return new Promise<string>((resolve, reject) => {
        window.grecaptcha.enterprise.ready(async () => {
          try {
            const newToken = await window.grecaptcha.enterprise.execute(
              siteKey,
              { action: actionToUse }
            );
            
            setToken(newToken);
            setStatus('success');
            resolve(newToken);
          } catch (err) {
            const error = err instanceof Error ? err : new Error('Erreur inconnue');
            setError(error);
            setStatus('error');
            reject(error);
          }
        });
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue');
      setError(error);
      setStatus('error');
      return null;
    }
  }, [siteKey, defaultAction]);
  
  return {
    executeRecaptcha,
    token,
    status,
    error,
    isLoading: status === 'loading'
  };
};

export default useRecaptcha; 