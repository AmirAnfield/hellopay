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
import { User, Settings, CreditCard, Bell, Mail, Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  PageContainer, 
  PageHeader, 
  LoadingState
} from "@/components/shared/PageContainer";

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
    // Récupérer les informations de l'utilisateur depuis Firebase Auth et Firestore
    const getUserData = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer l'utilisateur Firebase actuel
        const { auth, db } = await import('@/lib/firebase');
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          toast({
            variant: "destructive",
            title: "Accès refusé",
            description: "Vous devez être connecté pour accéder à cette page."
          });
          router.push("/auth/login");
          return;
        }
        
        // Récupérer les données utilisateur supplémentaires depuis Firestore
        const { doc, getDoc } = await import('firebase/firestore');
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          // Combiner les données Firebase Auth et Firestore
          const firestoreData = userDoc.data();
          setUser({
            firstName: firestoreData.firstName || '',
            lastName: firestoreData.lastName || '',
            email: currentUser.email || '',
            emailVerified: currentUser.emailVerified,
            jobTitle: firestoreData.jobTitle || '',
            company: firestoreData.companyName || '',
            phoneNumber: firestoreData.phone || ''
          });
        } else {
          // Utiliser uniquement les données de Firebase Auth si Firestore n'a pas de document
          setUser({
            firstName: '',
            lastName: '',
            email: currentUser.email || '',
            emailVerified: currentUser.emailVerified,
            jobTitle: '',
            company: '',
            phoneNumber: ''
          });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de récupérer vos informations. Veuillez vous reconnecter."
        });
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    getUserData();
  }, [router, toast]);

  // Pour récupérer le paramètre d'URL pour l'onglet
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['general', 'security', 'billing', 'notifications'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Récupérer les références Firebase
      const { auth, db } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour effectuer cette action."
        });
        return;
      }

      // Mettre à jour les données dans Firestore
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      await updateDoc(userDocRef, {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        jobTitle: user.jobTitle || '',
        companyName: user.company || '',
        phone: user.phoneNumber || '',
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Profil mis à jour",
        description: "Vos informations personnelles ont été mises à jour avec succès."
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      // Récupérer l'utilisateur Firebase actuel
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour effectuer cette action."
        });
        return;
      }

      // Envoyer un email de vérification
      const { sendEmailVerification } = await import('firebase/auth');
      await sendEmailVerification(currentUser);
      
      toast({
        title: "Email de vérification envoyé",
        description: "Veuillez vérifier votre boîte mail pour confirmer votre adresse email."
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de vérification:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer l'email de vérification. Veuillez réessayer plus tard."
      });
    }
  };

  const handlePasswordChange = async () => {
    try {
      // Récupérer l'utilisateur Firebase actuel
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;
      
      if (!currentUser || !currentUser.email) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour effectuer cette action."
        });
        return;
      }

      // Envoyer un email de réinitialisation de mot de passe
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, currentUser.email);
      
      toast({
        title: "Email envoyé",
        description: "Un lien pour réinitialiser votre mot de passe vous a été envoyé par email."
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de réinitialisation:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer l'email de réinitialisation. Veuillez réessayer plus tard."
      });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      // Récupérer l'utilisateur Firebase actuel
      const { auth, db } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour effectuer cette action."
        });
        return;
      }

      // Mettre à jour les préférences de notification dans Firestore
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      await updateDoc(userDocRef, {
        notifications: {
          email: emailNotifications,
          marketing: marketingEmails
        },
        updatedAt: serverTimestamp()
      });
      
      toast({
        title: "Préférences de notification mises à jour",
        description: "Vos préférences de notification ont été enregistrées."
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour des préférences de notification:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour vos préférences. Veuillez réessayer."
      });
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Mon profil"
          description="Gérez vos informations personnelles et vos préférences"
        />
        <LoadingState message="Chargement de vos informations..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Mon profil"
        description="Gérez vos informations personnelles et vos préférences"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 flex w-full flex-wrap overflow-x-auto md:flex-nowrap">
          <TabsTrigger value="general" className="flex items-center gap-2 flex-1 min-w-[130px]">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Informations</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 flex-1 min-w-[130px]">
            <Settings className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2 flex-1 min-w-[130px]">
            <CreditCard className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Facturation</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 flex-1 min-w-[130px]">
            <Bell className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Informations personnelles */}
        <TabsContent value="general">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Mettez à jour vos informations personnelles et professionnelles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
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
                <div className="flex items-center justify-between flex-wrap gap-2">
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
            <CardFooter className="px-4 sm:px-6 flex flex-col sm:flex-row gap-3">
              <Button onClick={handleSaveProfile} className="w-full sm:w-auto">Enregistrer les modifications</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Sécurité */}
        <TabsContent value="security">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Sécurité</CardTitle>
              <CardDescription>
                Gérez la sécurité de votre compte et modifiez votre mot de passe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Changer votre mot de passe</h3>
                <p className="text-sm text-muted-foreground">
                  Pour des raisons de sécurité, vous recevrez un email contenant un lien pour réinitialiser votre mot de passe.
                </p>
                <Button variant="outline" onClick={handlePasswordChange} className="w-full sm:w-auto">
                  Réinitialiser mon mot de passe
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sessions actives</h3>
                <div className="rounded-md border p-3 sm:p-4">
                  <div className="flex flex-col space-y-2">
                    <p className="font-medium">Session actuelle</p>
                    <p className="text-sm text-muted-foreground">
                      Dernière connexion: {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant="outline">Chrome</Badge>
                      <Badge variant="outline">macOS</Badge>
                      <Badge variant="outline">Paris, France</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-medium">Authentification à deux facteurs</h3>
                    <p className="text-sm text-muted-foreground">
                      Ajoutez une couche de sécurité supplémentaire à votre compte
                    </p>
                  </div>
                  <Switch id="2fa" className="mt-2 sm:mt-0" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facturation */}
        <TabsContent value="billing">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Facturation</CardTitle>
              <CardDescription>
                Gérez votre plan d&apos;abonnement et vos informations de paiement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div className="rounded-md border p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">Plan Actuel: Gratuit</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Vous utilisez actuellement le plan gratuit limité à 3 fiches de paie par mois
                    </p>
                  </div>
                  <Button variant="outline" className="mt-2 sm:mt-0 w-full sm:w-auto">Mettre à niveau</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Méthodes de paiement</h3>
                <p className="text-sm text-muted-foreground">
                  Vous n&apos;avez pas encore ajouté de méthode de paiement
                </p>
                <Button variant="outline" className="w-full sm:w-auto">
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
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configurez comment et quand vous souhaitez être notifié
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                    className="mt-2 sm:mt-0"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                    className="mt-2 sm:mt-0"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-4 sm:px-6 flex flex-col sm:flex-row gap-3">
              <Button onClick={handleSaveNotifications} className="w-full sm:w-auto">Enregistrer les préférences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
} 