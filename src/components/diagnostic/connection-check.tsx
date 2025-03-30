"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, XCircle, AlertCircle, Loader2, RadioTower } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useErrorHandler } from "@/hooks/use-error-handler";

interface CheckResult {
  name: string;
  status: "success" | "error" | "warning" | "pending";
  message?: string;
  details?: string;
}

export function ConnectionCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [progress, setProgress] = useState(0);
  const { handleError } = useErrorHandler();

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    setResults([]);
    setProgress(0);

    try {
      // Vérification de la connexion internet
      const internetCheck: CheckResult = {
        name: "Connexion Internet",
        status: "pending"
      };
      setResults(prev => [...prev, internetCheck]);

      try {
        const online = navigator.onLine;
        
        if (online) {
          internetCheck.status = "success";
          internetCheck.message = "Votre appareil est connecté à Internet";
        } else {
          internetCheck.status = "error";
          internetCheck.message = "Votre appareil n'est pas connecté à Internet";
        }
      } catch (_) {
        internetCheck.status = "warning";
        internetCheck.message = "Impossible de déterminer l'état de la connexion";
      }

      setResults(prev => {
        const updated = [...prev];
        const index = updated.findIndex(r => r.name === internetCheck.name);
        if (index !== -1) updated[index] = internetCheck;
        return updated;
      });
      setProgress(25);

      // Vérification de l'API
      const apiCheck: CheckResult = {
        name: "Connexion à l'API",
        status: "pending"
      };
      setResults(prev => [...prev, apiCheck]);

      try {
        const response = await fetch("/api/health", { 
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        
        if (response.ok) {
          const data = await response.json();
          apiCheck.status = "success";
          apiCheck.message = "L'API répond correctement";
          apiCheck.details = `Version: ${data.version || "N/A"}`;
        } else {
          apiCheck.status = "error";
          apiCheck.message = `L'API a retourné une erreur: ${response.status}`;
        }
      } catch (_) {
        apiCheck.status = "error";
        apiCheck.message = "Impossible de se connecter à l'API";
      }

      setResults(prev => {
        const updated = [...prev];
        const index = updated.findIndex(r => r.name === apiCheck.name);
        if (index !== -1) updated[index] = apiCheck;
        return updated;
      });
      setProgress(50);

      // Vérification de l'authentification
      const authCheck: CheckResult = {
        name: "État de l'authentification",
        status: "pending"
      };
      setResults(prev => [...prev, authCheck]);

      try {
        const response = await fetch("/api/auth/session", { 
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.user) {
            authCheck.status = "success";
            authCheck.message = "Vous êtes correctement authentifié";
            authCheck.details = `Utilisateur: ${data.user.email}`;
          } else {
            authCheck.status = "warning";
            authCheck.message = "Vous n'êtes pas authentifié";
          }
        } else {
          authCheck.status = "error";
          authCheck.message = "Impossible de vérifier l'état de l'authentification";
        }
      } catch (_) {
        authCheck.status = "error";
        authCheck.message = "Erreur lors de la vérification de l'authentification";
      }

      setResults(prev => {
        const updated = [...prev];
        const index = updated.findIndex(r => r.name === authCheck.name);
        if (index !== -1) updated[index] = authCheck;
        return updated;
      });
      setProgress(75);

      // Vérification des cookies
      const cookiesCheck: CheckResult = {
        name: "Cookies",
        status: "pending"
      };
      setResults(prev => [...prev, cookiesCheck]);

      try {
        const cookiesEnabled = navigator.cookieEnabled;
        
        if (cookiesEnabled) {
          const sessionCookie = document.cookie.includes("next-auth.session-token");
          
          if (sessionCookie) {
            cookiesCheck.status = "success";
            cookiesCheck.message = "Les cookies sont activés et le cookie de session est présent";
          } else {
            cookiesCheck.status = "warning";
            cookiesCheck.message = "Les cookies sont activés mais le cookie de session est absent";
          }
        } else {
          cookiesCheck.status = "error";
          cookiesCheck.message = "Les cookies sont désactivés, la connexion ne peut pas être maintenue";
        }
      } catch (_) {
        cookiesCheck.status = "warning";
        cookiesCheck.message = "Impossible de vérifier l'état des cookies";
      }

      setResults(prev => {
        const updated = [...prev];
        const index = updated.findIndex(r => r.name === cookiesCheck.name);
        if (index !== -1) updated[index] = cookiesCheck;
        return updated;
      });
      setProgress(100);

    } catch (error) {
      handleError(error, { component: "ConnectionCheck" });
    } finally {
      setIsChecking(false);
    }
  }, [handleError]);

  // Exécuter la vérification au chargement
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RadioTower className="w-5 h-5" />
          Diagnostic de connexion
        </CardTitle>
        <CardDescription>
          Vérification de l&apos;état de votre connexion au serveur
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isChecking && progress < 100 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Vérification en cours...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
        
        <div className="space-y-3">
          {results.map((result, index) => (
            <div key={index} className="flex items-start gap-2 p-2 rounded-md border">
              <div className="mt-0.5">
                {result.status === "success" && (
                  <Check className="w-5 h-5 text-green-600" />
                )}
                {result.status === "error" && (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                {result.status === "warning" && (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                )}
                {result.status === "pending" && (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{result.name}</h4>
                  <Badge 
                    variant={
                      result.status === "success" ? "outline" : 
                      result.status === "error" ? "destructive" : 
                      result.status === "warning" ? "secondary" : "default"
                    }
                    className={
                      result.status === "success" ? "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800" : 
                      result.status === "warning" ? "bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800" : ""
                    }
                  >
                    {result.status === "success" && "Succès"}
                    {result.status === "error" && "Erreur"}
                    {result.status === "warning" && "Avertissement"}
                    {result.status === "pending" && "En cours"}
                  </Badge>
                </div>
                
                {result.message && (
                  <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                )}
                
                {result.details && (
                  <p className="text-xs text-muted-foreground mt-1">{result.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={checkConnection} 
          disabled={isChecking}
          className="w-full"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Vérification en cours...
            </>
          ) : (
            "Relancer le diagnostic"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 