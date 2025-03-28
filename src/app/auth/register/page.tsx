"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";

// Schéma de validation
const registerSchema = z.object({
  name: z.string().min(2, { message: "Le nom est requis (minimum 2 caractères)" }),
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
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: RegisterValues) => {
    setIsLoading(true);

    try {
      // Appeler l'API d'inscription
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'inscription");
      }

      // Connecter automatiquement l'utilisateur
      const signInResponse = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (signInResponse?.error) {
        throw new Error("Inscription réussie mais erreur lors de la connexion automatique");
      }

      // Envoyer un email de vérification
      await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès. Un email de vérification a été envoyé.",
      });

      // Rediriger vers le tableau de bord
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création de votre compte. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-screen items-center justify-center py-10">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>
            Inscrivez-vous pour accéder à toutes les fonctionnalités
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox id="termsAccepted" {...register("termsAccepted")} />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="termsAccepted"
                  className="text-sm font-normal leading-none"
                >
                  J&apos;accepte les{" "}
                  <Link href="/mentions-legales" className="text-primary hover:underline">
                    conditions d&apos;utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link href="/confidentialite" className="text-primary hover:underline">
                    politique de confidentialité
                  </Link>
                </Label>
                {errors.termsAccepted && (
                  <p className="text-sm text-red-500">{errors.termsAccepted.message}</p>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inscription en cours...
                </>
              ) : (
                "S&apos;inscrire"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm w-full">
            Vous avez déjà un compte?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
