"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Mail, AlertTriangle } from "lucide-react";

export default function EmailVerificationPage() {
  const { user, resendVerificationEmail } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Gérer le renvoi de l'email de vérification
  const handleResendEmail = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await resendVerificationEmail();
      setSuccessMessage("Un nouvel email de vérification a été envoyé à votre adresse email.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur s'est produite lors de l'envoi de l'email.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    router.push("/auth/login");
    return null;
  }

  // Si l'email est déjà vérifié, rediriger vers le tableau de bord
  if (user.emailVerified) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="container flex flex-col items-center justify-center max-w-md py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl text-center">Vérification de l'adresse email</CardTitle>
          <CardDescription className="text-center">
            Veuillez vérifier votre adresse email pour continuer
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <Mail className="h-12 w-12 text-blue-500 mb-2" />
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Un email de vérification a été envoyé à <strong>{user.email}</strong>.
              <br />
              Veuillez cliquer sur le lien présent dans cet email pour vérifier votre adresse.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertTitle>Succès</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              Vous n'avez pas reçu l'email ou il a expiré ?
              <br />
              Cliquez sur le bouton ci-dessous pour recevoir un nouvel email.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={handleResendEmail} 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              "Renvoyer l'email de vérification"
            )}
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.push("/auth/login")}
          >
            Retour à la connexion
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 