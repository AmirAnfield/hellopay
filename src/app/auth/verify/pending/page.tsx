'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function EmailVerificationPendingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const userEmail = session?.user?.email || '';

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Email envoyé',
          description: 'Un nouvel email de vérification vous a été envoyé. Veuillez vérifier votre boîte de réception.',
          variant: 'default',
        });
      } else {
        throw new Error(data.message || 'Une erreur est survenue l&apos;envoi de l&apos;email');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error 
          ? error.message 
          : 'Une erreur est survenue l&apos;envoi de l&apos;email de vérification.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-screen items-center justify-center py-10">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-amber-100 p-3">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Vérification requise</CardTitle>
          <CardDescription className="text-center">
            Votre adresse email doit être vérifiée pour accéder à toutes les fonctionnalités.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p className="mb-2">
              <strong>Un email de vérification a été envoyé à :</strong>
            </p>
            <p className="font-medium text-primary">{userEmail}</p>
            <p className="mt-2 text-muted-foreground">
              Veuillez cliquer sur le lien dans l&apos;email pour activer votre compte.
              Si vous ne trouvez pas l&apos;email, vérifiez votre dossier de spam.
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="text-sm text-muted-foreground text-center">
              Vous n&apos;avez pas reçu l&apos;email de vérification ?
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleResendVerification}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Renvoyer l&apos;email de vérification
                </>
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="link"
            className="w-full"
            onClick={() => router.push('/auth/login')}
          >
            Retour à la connexion
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 