"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Settings, CreditCard, Bell, Mail, Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  jobTitle?: string;
  company?: string;
  phoneNumber?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    
    if (!authStatus) {
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Vous devez être connecté pour accéder à cette page."
      });
      router.push("/auth/login");
      return;
    }
    
    // Récupérer les informations de l'utilisateur
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData) as UserData;
        setUser(parsedUser);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de récupérer vos informations. Veuillez vous reconnecter."
        });
        router.push("/auth/login");
      }
    } else {
      // Si pas de données utilisateur, créer un utilisateur fictif pour la démo
      setUser({
        firstName: "Marie",
        lastName: "Dupont",
        email: "marie.dupont@example.com",
        emailVerified: true,
        jobTitle: "Responsable RH",
        company: "Tech Solutions",
        phoneNumber: "06 12 34 56 78"
      });
      setIsLoading(false);
    }
  }, [router, toast]);

  const handleSaveProfile = () => {
    toast({
      title: "Profil mis à jour",
      description: "Vos informations personnelles ont été mises à jour avec succès."
    });

    // En production, envoyez les données à l'API et mettez à jour le localStorage
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  };

  const handleVerifyEmail = () => {
    toast({
      title: "Email de vérification envoyé",
      description: "Veuillez vérifier votre boîte mail pour confirmer votre adresse email."
    });
  };

  const handlePasswordChange = () => {
    toast({
      title: "Email envoyé",
      description: "Un lien pour réinitialiser votre mot de passe vous a été envoyé par email."
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Préférences de notification mises à jour",
      description: "Vos préférences de notification ont été enregistrées."
    });
  };

  if (isLoading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Mon profil</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Informations personnelles
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Facturation
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Informations personnelles */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations personnelles et professionnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input 
                      id="firstName" 
                      value={user?.firstName || ""} 
                      onChange={(e) => setUser(user ? {...user, firstName: e.target.value} : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input 
                      id="lastName" 
                      value={user?.lastName || ""} 
                      onChange={(e) => setUser(user ? {...user, lastName: e.target.value} : null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email">Adresse e-mail</Label>
                    {user?.emailVerified ? (
                      <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                        <Check className="h-3 w-3 mr-1" /> Vérifiée
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Non vérifiée
                      </Badge>
                    )}
                  </div>
                  <Input 
                    id="email" 
                    type="email" 
                    value={user?.email || ""} 
                    onChange={(e) => setUser(user ? {...user, email: e.target.value, emailVerified: false} : null)}
                  />
                  {!user?.emailVerified && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={handleVerifyEmail}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Vérifier cette adresse
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Poste</Label>
                    <Input 
                      id="jobTitle" 
                      value={user?.jobTitle || ""} 
                      onChange={(e) => setUser(user ? {...user, jobTitle: e.target.value} : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Entreprise</Label>
                    <Input 
                      id="company" 
                      value={user?.company || ""} 
                      onChange={(e) => setUser(user ? {...user, company: e.target.value} : null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                  <Input 
                    id="phoneNumber" 
                    value={user?.phoneNumber || ""} 
                    onChange={(e) => setUser(user ? {...user, phoneNumber: e.target.value} : null)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveProfile}>Enregistrer les modifications</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Sécurité */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>
                  Gérez la sécurité de votre compte et modifiez votre mot de passe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Changer votre mot de passe</h3>
                  <p className="text-sm text-muted-foreground">
                    Pour des raisons de sécurité, vous recevrez un email contenant un lien pour réinitialiser votre mot de passe.
                  </p>
                  <Button variant="outline" onClick={handlePasswordChange}>
                    Réinitialiser mon mot de passe
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Sessions actives</h3>
                  <div className="rounded-md border p-4">
                    <div className="flex flex-col space-y-2">
                      <p className="font-medium">Session actuelle</p>
                      <p className="text-sm text-muted-foreground">
                        Dernière connexion: {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">Chrome</Badge>
                        <Badge variant="outline">macOS</Badge>
                        <Badge variant="outline">Paris, France</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Authentification à deux facteurs</h3>
                      <p className="text-sm text-muted-foreground">
                        Ajoutez une couche de sécurité supplémentaire à votre compte
                      </p>
                    </div>
                    <Switch id="2fa" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Facturation */}
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Facturation</CardTitle>
                <CardDescription>
                  Gérez votre plan d&apos;abonnement et vos informations de paiement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-md border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Plan Actuel: Gratuit</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Vous utilisez actuellement le plan gratuit limité à 3 fiches de paie par mois
                      </p>
                    </div>
                    <Button variant="outline">Mettre à niveau</Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Méthodes de paiement</h3>
                  <p className="text-sm text-muted-foreground">
                    Vous n&apos;avez pas encore ajouté de méthode de paiement
                  </p>
                  <Button variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Ajouter une carte de crédit
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Historique de facturation</h3>
                  <p className="text-sm text-muted-foreground">
                    Vous n&apos;avez pas encore d&apos;historique de facturation
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configurez comment et quand vous souhaitez être notifié
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="font-medium">Notifications par email</h3>
                      <p className="text-sm text-muted-foreground">
                        Recevez des notifications par email concernant votre compte
                      </p>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="font-medium">Emails marketing</h3>
                      <p className="text-sm text-muted-foreground">
                        Recevez des emails concernant les nouveautés et offres spéciales
                      </p>
                    </div>
                    <Switch 
                      id="marketing-emails" 
                      checked={marketingEmails}
                      onCheckedChange={setMarketingEmails}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveNotifications}>Enregistrer les préférences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 