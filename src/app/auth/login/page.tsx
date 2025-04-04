"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AtSign, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getFirebaseErrorMessage } from "@/lib/utils/firebase-errors";

// Schéma de validation
const loginSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse email valide" }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
  rememberMe: z.boolean().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginValues) => {
    setIsLoading(true);

    try {
      console.log("Tentative de connexion avec:", { email: data.email, password: "******" });
      
      // Utiliser Firebase Auth directement pour tester
      try {
        // Récupérer la configuration Firebase
        console.log("Configuration Firebase chargée");
        
        // Utiliser Firebase Auth via notre hook useAuth
        await loginUser(data.email, data.password);
        console.log("Connexion réussie!");
        
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté à votre compte.",
        });
  
        // Redirection directe vers le tableau de bord ou l'URL de callback
        console.log("Redirection vers:", callbackUrl);
        
        // Utiliser window.location.href pour une redirection forcée après l'authentification
        window.location.href = callbackUrl;
      } catch (authError: any) {
        console.error("Erreur d'authentification directe:", authError);
        throw authError;
      }
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      console.error("Code d'erreur:", error.code);
      console.error("Message d'erreur:", error.message);
      
      // Messages d'erreur personnalisés selon le code d'erreur Firebase
      const errorMessage = getFirebaseErrorMessage(error);
      
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen items-center justify-center py-8">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 px-7 py-8 rounded-lg shadow-sm">
        <div className="mb-5">
          <h1 className="text-xl font-semibold tracking-tight mb-2">Connexion</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Entrez vos identifiants pour accéder à votre compte
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                {...register("email")}
                className={`pl-9 ${errors.email ? "border-red-500" : "border-zinc-200 dark:border-zinc-700"}`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-500"
              >
                Mot de passe oublié?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className={`pl-9 ${errors.password ? "border-red-500" : "border-zinc-200 dark:border-zinc-700"}`}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 pt-1">
            <Checkbox id="rememberMe" {...register("rememberMe")} className="h-3.5 w-3.5" />
            <Label
              htmlFor="rememberMe"
              className="text-xs font-normal text-zinc-600 dark:text-zinc-400"
            >
              Se souvenir de moi
            </Label>
          </div>
          
          <Button type="submit" className="w-full mt-2 h-9" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                <span className="text-sm">Connexion en cours...</span>
              </>
            ) : (
              <div className="flex items-center justify-center">
                <span className="text-sm">Se connecter</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </div>
            )}
          </Button>
        </form>
        
        <div className="mt-6 mb-1 pt-5 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Vous n&apos;avez pas de compte?
            </p>
            <Link 
              href="/auth/register" 
              className="w-full flex items-center justify-center px-4 py-2 text-sm bg-primary/10 text-primary hover:bg-primary/20 font-medium rounded-md transition-colors"
            >
              <span>Créer un compte</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="text-center text-xs text-zinc-400 dark:text-zinc-500 mt-5">
            En vous connectant, vous acceptez nos{" "}
            <Link href="/mentions-legales" className="underline hover:text-blue-600">
              conditions d&apos;utilisation
            </Link>{" "}
            et notre{" "}
            <Link href="/confidentialite" className="underline hover:text-blue-600">
              politique de confidentialité
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
} 