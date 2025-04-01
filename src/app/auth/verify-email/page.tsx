'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { resendVerificationEmail, getCurrentUser, isEmailVerified } from '@/services/auth-service';
import { useToast } from '@/components/ui/use-toast';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Vérifier si l'utilisateur est connecté et si son email est vérifié
  useEffect(() => {
    const checkEmailVerification = async () => {
      const user = getCurrentUser();

      if (!user) {
        // L'utilisateur n'est pas connecté, rediriger vers la page de connexion
        router.push('/auth/login');
        return;
      }

      // Actualiser la page pour vérifier si l'email a été vérifié
      await user.reload();
      
      setUserEmail(user.email);
      setIsVerified(isEmailVerified());
      setIsLoading(false);

      // Si l'email est vérifié, rediriger vers le tableau de bord
      if (isEmailVerified()) {
        toast({
          title: "Email vérifié",
          description: "Votre email a été vérifié avec succès. Vous allez être redirigé vers votre tableau de bord.",
          variant: "success",
        });
        
        // Rediriger après un court délai pour que l'utilisateur puisse voir le message
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    };

    checkEmailVerification();

    // Vérifier périodiquement si l'email a été vérifié
    const interval = setInterval(checkEmailVerification, 5000);

    return () => clearInterval(interval);
  }, [router, toast]);

  // Fonction pour renvoyer l'email de vérification
  const handleResendEmail = async () => {
    setIsSending(true);
    try {
      await resendVerificationEmail();
      toast({
        title: "Email envoyé",
        description: "Un nouvel email de vérification a été envoyé. Veuillez vérifier votre boîte de réception.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'envoi de l'email",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Vérification de votre email</CardTitle>
          <CardDescription>
            Veuillez vérifier votre adresse email pour continuer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVerified ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Email vérifié</AlertTitle>
              <AlertDescription>
                Votre adresse email a été vérifiée avec succès. Vous allez être redirigé vers votre tableau de bord.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle>Email non vérifié</AlertTitle>
                <AlertDescription>
                  Votre adresse email ({userEmail}) n'a pas encore été vérifiée. Veuillez consulter votre boîte de réception et cliquer sur le lien de vérification dans l'email que nous vous avons envoyé.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 text-sm text-gray-600">
                <p>Si vous n'avez pas reçu l'email, vérifiez votre dossier de spam ou cliquez sur le bouton ci-dessous pour recevoir un nouvel email de vérification.</p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {!isVerified && (
            <Button 
              onClick={handleResendEmail} 
              disabled={isSending} 
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              {isSending ? "Envoi en cours..." : "Renvoyer l'email de vérification"}
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => router.push('/auth/login')} 
            className="w-full"
          >
            Retour à la connexion
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 