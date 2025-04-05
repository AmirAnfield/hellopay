"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getFirebaseErrorMessage } from "@/lib/utils/firebase-errors";

// Schéma de validation du formulaire
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  password: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères.",
  }),
  confirmPassword: z.string().min(6, {
    message: "La confirmation du mot de passe doit contenir au moins 6 caractères.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Initialiser le formulaire
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Gérer la soumission du formulaire
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (loading) return;
    
    setLoading(true);
    console.log("Démarrage du processus d'inscription...");
    
    try {
      // Étape 1: Créer l'utilisateur dans Firebase Auth
      console.log("Création de l'utilisateur dans Firebase Auth...");
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const { user } = userCredential;
      
      // Étape 2: Envoyer l'email de vérification
      console.log("Envoi de l'email de vérification...");
      await sendEmailVerification(user);
      
      // Étape 3: Extraire le prénom et le nom
      const nameParts = values.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // Étape 4: Créer le document utilisateur dans Firestore
      console.log("Création du profil utilisateur dans Firestore...");
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: values.name,
        firstName: firstName,
        lastName: lastName,
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isOnboarded: false,
        hasCompletedProfile: false
      });
      
      // Étape 5: Créer un cookie de session pour le middleware
      console.log("Création du cookie de session...");
      const idToken = await user.getIdToken();
      
      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      
      if (!sessionResponse.ok) {
        console.error("Erreur lors de la création de la session:", await sessionResponse.json());
        throw new Error("Erreur lors de la création de la session");
      }

      // Étape 6: Notification de succès et redirection
      console.log("Inscription réussie!");
      toast.success("Inscription réussie! Un email de vérification a été envoyé à votre adresse.");
      setRegistrationComplete(true);
      
      // Attendre 3 secondes avant de rediriger
      setTimeout(() => {
        console.log("Redirection vers le tableau de bord...");
        window.location.href = "/dashboard";
      }, 3000);
      
    } catch (error) {
      console.error("Erreur détaillée lors de l'inscription:", error);
      toast.error(getFirebaseErrorMessage(error) || "Échec de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // Si l'inscription est complète, afficher un message de confirmation
  if (registrationComplete) {
    return (
      <div className="space-y-6 text-center">
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <h2 className="text-xl font-medium text-green-800 mb-2">Inscription réussie!</h2>
          <p className="text-green-700">
            Un email de vérification a été envoyé à votre adresse.
            <br />
            Vous allez être redirigé vers le tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Créer un compte</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Entrez vos informations pour créer un compte
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Votre nom"
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="votre@email.com"
                    type="email"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmer le mot de passe</FormLabel>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Inscription en cours..." : "S'inscrire"}
          </Button>
        </form>
      </Form>
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Vous avez déjà un compte ?{" "}
          <Link href="/auth/login" className="text-blue-500 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
} 