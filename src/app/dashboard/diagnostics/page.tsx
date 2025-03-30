import { Metadata } from "next";
import { ConnectionCheck } from "@/components/diagnostic/connection-check";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Database, RadioTower, Server, Shield } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Diagnostic - HelloPay",
  description: "Outils de diagnostic pour résoudre les problèmes techniques",
};

export default function DiagnosticsPage() {
  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Diagnostic système</h1>
        </div>
      </div>

      <p className="text-muted-foreground mb-8">
        Ces outils vous permettent de diagnostiquer et résoudre les problèmes techniques que vous pourriez rencontrer avec HelloPay.
      </p>

      <Tabs defaultValue="connection" className="space-y-6">
        <TabsList className="grid grid-cols-3 gap-4 w-full md:w-auto">
          <TabsTrigger value="connection" className="flex items-center gap-2">
            <RadioTower className="h-4 w-4" />
            <span className="hidden sm:inline">Connexion</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Données</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Sécurité</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="connection" className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <ConnectionCheck />
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Problèmes courants de connexion</h2>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Déconnexions fréquentes</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Les déconnexions peuvent être causées par:
                  </p>
                  <ul className="text-sm space-y-1.5 list-disc pl-4 text-muted-foreground">
                    <li>Cookies désactivés dans votre navigateur</li>
                    <li>Utilisation du mode de navigation privée</li>
                    <li>Problème de réseau ou connexion instable</li>
                    <li>Expiration de session (après 30 jours d&apos;inactivité)</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Problèmes de chargement</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Si certaines pages ne se chargent pas correctement:
                  </p>
                  <ul className="text-sm space-y-1.5 list-disc pl-4 text-muted-foreground">
                    <li>Essayez de vider le cache de votre navigateur</li>
                    <li>Vérifiez que JavaScript est activé</li>
                    <li>Désactivez temporairement les extensions de navigateur</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Problèmes avec votre compte</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Si vous ne pouvez pas vous connecter:
                  </p>
                  <ul className="text-sm space-y-1.5 list-disc pl-4 text-muted-foreground">
                    <li>Vérifiez que votre adresse email est correcte</li>
                    <li>Utilisez la fonction &quot;Mot de passe oublié&quot;</li>
                    <li>Vérifiez que votre email a été validé</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="data" className="space-y-4">
          <div className="p-8 border rounded-lg flex flex-col items-center justify-center">
            <Server className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Diagnostic des données</h2>
            <p className="text-muted-foreground text-center max-w-lg mb-4">
              Les outils de diagnostic de données seront disponibles dans une prochaine mise à jour.
            </p>
            <Button disabled>Bientôt disponible</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <div className="p-8 border rounded-lg flex flex-col items-center justify-center">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Diagnostic de sécurité</h2>
            <p className="text-muted-foreground text-center max-w-lg mb-4">
              Les outils de diagnostic de sécurité seront disponibles dans une prochaine mise à jour.
            </p>
            <Button disabled>Bientôt disponible</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 