'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AtSign, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez saisir une adresse email."
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "Demande envoyée",
          description: "Si cette adresse est associée à un compte, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe."
        });
      } else {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: "Erreur",
          description: data.message || "Une erreur est survenue. Veuillez réessayer."
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la demande. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container flex h-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl text-center">Mot de passe oublié</CardTitle>
          <CardDescription className="text-center">
            {isSubmitted 
              ? "Vérifiez votre boîte de réception" 
              : "Entrez votre adresse email pour réinitialiser votre mot de passe"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div className="space-y-2">
                <p className="font-medium">Instructions envoyées</p>
                <p className="text-sm text-gray-500">
                  Si l&apos;adresse <span className="font-medium">{email}</span> est associée à un compte, 
                  vous recevrez sous peu un email contenant un lien pour réinitialiser votre mot de passe.
                </p>
                <p className="text-xs text-gray-500 mt-4">
                  N&apos;oubliez pas de vérifier votre dossier de spam si vous ne trouvez pas l&apos;email.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="votre@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer les instructions'
                )}
              </Button>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/auth/login')}
            className="mt-2"
          >
            Retour à la connexion
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 