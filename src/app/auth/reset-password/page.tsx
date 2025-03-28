'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const [tokenChecked, setTokenChecked] = useState(false);
  
  // Vérification de la validité du token
  useEffect(() => {
    if (!token) {
      setIsValid(false);
      setMessage('Token de réinitialisation manquant ou invalide');
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Token de réinitialisation manquant ou invalide."
      });
      setTokenChecked(true);
      return;
    }
    
    const checkToken = async () => {
      try {
        // Appel à l'API réelle pour vérifier le token
        const response = await fetch('/api/auth/check-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setIsValid(true);
        } else {
          setIsValid(false);
          setMessage(data.message || 'Token invalide ou expiré');
          toast({
            variant: "destructive",
            title: "Token invalide",
            description: data.message || "Le token de réinitialisation est invalide ou a expiré."
          });
        }
      } catch {
        setIsValid(false);
        setMessage('Erreur lors de la vérification du token');
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Erreur lors de la vérification du token."
        });
      } finally {
        setTokenChecked(true);
      }
    };
    
    checkToken();
  }, [token, toast]);
  
  // Soumission du formulaire de réinitialisation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !isValid) return;
    
    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas');
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas."
      });
      return;
    }
    
    if (password.length < 8) {
      setMessage('Le mot de passe doit contenir au moins 8 caractères');
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères."
      });
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    try {
      // Appel à l'API réelle pour réinitialiser le mot de passe
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsValid(null); // Affichage du message de succès
        setMessage(data.message || 'Mot de passe réinitialisé avec succès');
        toast({
          title: "Succès",
          description: "Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion."
        });
        
        // Rediriger vers la page de connexion après un délai
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setMessage(data.message || 'Une erreur est survenue. Veuillez réessayer.');
        toast({
          variant: "destructive",
          title: "Erreur",
          description: data.message || "Une erreur est survenue lors de la réinitialisation du mot de passe."
        });
      }
    } catch {
      setMessage('Une erreur est survenue. Veuillez réessayer.');
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la réinitialisation du mot de passe."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container flex h-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl text-center">Réinitialisation du mot de passe</CardTitle>
          <CardDescription className="text-center">
            {!tokenChecked ? 'Vérification du token...' : 
              isValid === null ? 'Mot de passe réinitialisé' : 
              isValid ? 'Créez un nouveau mot de passe' : ''
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!tokenChecked ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isValid === true ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">{message}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-10 ${
                      confirmPassword && password !== confirmPassword 
                        ? 'border-red-500' 
                        : ''
                    }`}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Réinitialisation en cours...
                  </>
                ) : (
                  'Réinitialiser le mot de passe'
                )}
              </Button>
            </form>
          ) : isValid === false ? (
            <div className="text-center py-6 space-y-4">
              <XCircle className="h-12 w-12 text-red-500 mx-auto" />
              <p>{message}</p>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <p className="text-green-700">{message}</p>
              <p className="text-sm text-gray-500">Redirection vers la page de connexion...</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          {(isValid === false || isValid === null) && (
            <Button 
              variant="ghost" 
              onClick={() => router.push('/auth/login')}
              className="mt-2"
            >
              Retour à la connexion
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 