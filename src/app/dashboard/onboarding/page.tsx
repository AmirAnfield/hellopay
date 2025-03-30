"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";

export default function OnboardingPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendVerificationEmail = async () => {
    if (!session?.user?.email) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: session.user.email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || "Une erreur est survenue lors de l'envoi de l'email.");
      }
    } catch (err) {
      setError("Impossible de contacter le serveur. Veuillez réessayer plus tard.");
      console.error("Erreur lors de l'envoi de l'email:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl py-10">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Vérifiez votre email</CardTitle>
          <CardDescription>
            Pour utiliser toutes les fonctionnalités de HelloPay, vous devez vérifier votre adresse email.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center p-6">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            Nous avons envoyé un email de vérification à{" "}
            <span className="font-medium text-primary">{session?.user?.email}</span>. Veuillez
            vérifier votre boîte de réception et cliquer sur le lien de vérification.
          </p>
          
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Email envoyé</AlertTitle>
              <AlertDescription className="text-green-700">
                L&apos;email de vérification a été envoyé avec succès. Veuillez vérifier votre boîte de réception.
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            disabled={isLoading}
          >
            Rafraîchir la page
          </Button>
          
          <Button
            onClick={sendVerificationEmail}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              "Renvoyer l'email"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 