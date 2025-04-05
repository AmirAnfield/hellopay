"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, UserRound, AtSign, KeyRound, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getFirebaseErrorMessage } from "@/lib/utils/firebase-errors";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// Schéma de validation
const registerSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom est requis (minimum 2 caractères)" }),
  lastName: z.string().min(2, { message: "Le nom est requis (minimum 2 caractères)" }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide" }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
  confirmPassword: z.string().min(8, { message: "Veuillez confirmer votre mot de passe" }),
  termsAccepted: z.boolean().refine(val => val === true, { 
    message: "Vous devez accepter les conditions d'utilisation" 
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // État pour gérer les erreurs de validation globales
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    watch,
    setValue,
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  // Effet pour collecter les erreurs de validation lorsque le formulaire est soumis
  useEffect(() => {
    if (isSubmitted) {
      const allErrors: string[] = [];
      
      if (errors.firstName) allErrors.push("Le prénom est requis (minimum 2 caractères)");
      if (errors.lastName) allErrors.push("Le nom est requis (minimum 2 caractères)");
      if (errors.email) allErrors.push("L'adresse email n'est pas valide");
      if (errors.password) allErrors.push("Le mot de passe doit contenir au moins 8 caractères");
      if (errors.confirmPassword) allErrors.push("Les mots de passe ne correspondent pas");
      if (errors.termsAccepted) allErrors.push("Vous devez accepter les conditions d'utilisation");
      
      setValidationErrors(allErrors);
    }
  }, [errors, isSubmitted]);

  const handleSignup = async (values: z.infer<typeof registerSchema>) => {
    // Réinitialiser les erreurs de validation
    setValidationErrors([]);
    
    try {
      setErrorMessage(null);
      setIsLoading(true);
      console.log("Début de l'inscription avec Firebase...");
      const { email, password, firstName, lastName } = values;

      console.log("Tentative de création du compte utilisateur...");
      // Créer l'utilisateur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Compte utilisateur créé avec succès", userCredential.user.uid);
      
      // L'utilisateur vient d'être créé, on initialise son profil avec son nom et prénom
      console.log("Création du profil utilisateur dans Firestore...");
      try {
        const userDoc = doc(db, 'users', userCredential.user.uid);
        await setDoc(userDoc, {
          uid: userCredential.user.uid,
          email: email,
          firstName: firstName,
          lastName: lastName,
          displayName: `${firstName} ${lastName}`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          role: 'user',
          isOnboarded: false,
          hasCompletedProfile: false,
          emailVerified: false,
          phoneNumber: '',
          jobTitle: '',
          company: '',
          companyName: '',
          address: '',
          postalCode: '',
          city: '',
          country: 'France',
          photoURL: '',
          lastLoginAt: serverTimestamp(),
          settings: {
            emailNotifications: true,
            language: 'fr',
            theme: 'system'
          }
        });
        console.log("Profil utilisateur créé avec succès dans Firestore");
      } catch (firestoreError) {
        console.error("Erreur lors de la création du profil dans Firestore:", firestoreError);
        // Continuer malgré l'erreur Firestore - l'utilisateur est déjà créé dans Auth
      }
      
      // Envoyer l'email de vérification
      console.log("Envoi de l'email de vérification...");
      try {
        await sendEmailVerification(userCredential.user);
        console.log("Email de vérification envoyé");
      } catch (emailError) {
        console.error("Erreur lors de l'envoi de l'email de vérification:", emailError);
        // Continuer malgré l'erreur d'email - l'utilisateur est déjà créé
      }

      // Afficher une notification de succès
      toast({
        title: "Inscription réussie !",
        description: "Un email de vérification a été envoyé à votre adresse. Vous pouvez dès maintenant accéder à votre espace.",
        duration: 5000,
      });
      
      // Marquer l'inscription comme réussie
      setIsSuccess(true);
      setIsLoading(false);
      
      // Attendre un peu avant de rediriger vers le dashboard pour que l'utilisateur puisse voir le message de succès
      console.log("Redirection vers le dashboard dans 5 secondes...");
      setTimeout(() => {
        window.location.href = '/dashboard'; // Redirection forcée
      }, 5000);
    } catch (error) {
      console.error("Erreur détaillée lors de l'inscription:", error);
      const errorMsg = getFirebaseErrorMessage(error as FirebaseError);
      setErrorMessage(errorMsg);
      setIsLoading(false);
      toast({
        title: "Erreur d'inscription",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container flex min-h-screen items-center justify-center py-8">
      <Card className="mx-auto w-full max-w-4xl bg-card shadow-elevation-2">
        <CardHeader className="text-center pb-4 border-b">
          <CardTitle className="text-2xl font-bold mb-1">Créer votre compte HelloPay</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Rejoignez-nous pour simplifier votre gestion des ressources humaines
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isSuccess ? (
            <div className="text-center py-10 px-4 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-green-600">Inscription réussie !</h3>
              <p className="text-muted-foreground">Un email de vérification a été envoyé à votre adresse.</p>
              <p className="text-muted-foreground text-sm">Redirection vers votre tableau de bord...</p>
              <div className="flex justify-center mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleSignup)}>
              {errorMessage && (
                <div className="p-3 mb-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
                  {errorMessage}
                </div>
              )}
              
              {/* Affichage des erreurs de validation globales */}
              {validationErrors.length > 0 && (
                <div className="p-3 mb-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
                  <p className="font-medium mb-1">Veuillez corriger les erreurs suivantes :</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-xs">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Colonne gauche */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center mb-1.5">
                      <UserRound className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      <Label htmlFor="firstName" className="text-sm font-medium">Prénom *</Label>
                    </div>
                    <Input
                      id="firstName"
                      placeholder="Votre prénom"
                      autoComplete="given-name"
                      {...register("firstName")}
                      className={`h-9 text-sm ${errors.firstName ? "border-destructive ring-destructive" : ""}`}
                      required
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-1.5">
                      <UserRound className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      <Label htmlFor="lastName" className="text-sm font-medium">Nom *</Label>
                    </div>
                    <Input
                      id="lastName"
                      placeholder="Votre nom de famille"
                      autoComplete="family-name"
                      {...register("lastName")}
                      className={`h-9 text-sm ${errors.lastName ? "border-destructive ring-destructive" : ""}`}
                      required
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-1.5">
                      <AtSign className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      <Label htmlFor="email" className="text-sm font-medium">Email professionnel *</Label>
            </div>
              <Input
                id="email"
                type="email"
                      placeholder="votreemail@entreprise.com"
                      autoComplete="email"
                {...register("email")}
                      className={`h-9 text-sm ${errors.email ? "border-destructive ring-destructive" : ""}`}
                      required
                    />
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-md border border-border text-xs space-y-1 mt-2">
                    <p className="font-medium">Après votre inscription :</p>
                    <p className="text-muted-foreground">1. Vérifiez votre email pour confirmer votre compte</p>
                    <p className="text-muted-foreground">2. Complétez votre profil pour personnaliser votre expérience</p>
                    <p className="text-muted-foreground">3. Commencez à utiliser HelloPay immédiatement</p>
                  </div>
                </div>
                
                {/* Colonne droite */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center mb-1.5">
                      <KeyRound className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      <Label htmlFor="password" className="text-sm font-medium">Mot de passe *</Label>
            </div>
              <Input
                id="password"
                type="password"
                      placeholder="8 caractères minimum"
                      autoComplete="new-password"
                {...register("password")}
                      className={`h-9 text-sm ${errors.password ? "border-destructive ring-destructive" : ""}`}
                      required
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-1.5">
                      <ShieldCheck className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmer le mot de passe *</Label>
            </div>
              <Input
                id="confirmPassword"
                type="password"
                      placeholder="Répéter votre mot de passe"
                      autoComplete="new-password"
                {...register("confirmPassword")}
                      className={`h-9 text-sm ${errors.confirmPassword ? "border-destructive ring-destructive" : ""}`}
                      required
              />
            </div>
                  
                  <div className="flex items-start space-x-2 mt-4">
              <Checkbox 
                id="termsAccepted" 
                checked={!!watch("termsAccepted")}
                onCheckedChange={(checked) => {
                  setValue("termsAccepted", checked === true);
                }}
                      className={errors.termsAccepted ? "border-destructive" : ""}
                      required
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="termsAccepted"
                        className="text-xs font-normal leading-tight"
                >
                        En créant un compte, j&apos;accepte les{" "}
                        <Link href="/mentions-legales" className="text-primary hover:underline text-xs">
                    conditions d&apos;utilisation
                  </Link>{" "}
                  et la{" "}
                        <Link href="/confidentialite" className="text-primary hover:underline text-xs">
                    politique de confidentialité
                        </Link>{" "}
                        de HelloPay
                </Label>
              </div>
            </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-4" 
                    disabled={isLoading}
                    size="sm"
                  >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inscription en cours...
                </>
              ) : (
                      "Créer mon compte"
              )}
            </Button>
                  
                  <p className="text-center text-xs text-muted-foreground mt-2">
            Vous avez déjà un compte?{" "}
                    <Link href="/auth/login" className="text-primary hover:underline text-xs">
              Se connecter
            </Link>
          </p>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
