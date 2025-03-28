'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, ArrowLeft, Mail, Loader2 } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBack?: () => void;
}

export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (!email) {
      setError('Veuillez entrer votre adresse email.');
      setIsLoading(false);
      return;
    }
    
    try {
      // Appeler l'API pour envoyer un email de réinitialisation
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue lors de la demande de réinitialisation.');
      }
      
      setSuccess(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue. Veuillez réessayer.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {success ? (
        <div className="flex flex-col items-center space-y-4 py-2">
          <div className="flex items-center p-3 bg-green-50 border border-green-200 text-green-700 rounded-md w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">
              Un email de réinitialisation a été envoyé à {email}. Vérifiez votre boîte de réception.
            </span>
          </div>
          <Button type="button" onClick={onBack} className="w-full">
            Retour à la connexion
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-1 mb-2">
            <p className="text-sm text-gray-600">
              Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="nom@exemple.fr"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 pt-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Réinitialiser mon mot de passe'
              )}
            </Button>
            
            <Button type="button" variant="ghost" onClick={onBack} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour à la connexion
            </Button>
          </div>
        </>
      )}
    </form>
  );
} 