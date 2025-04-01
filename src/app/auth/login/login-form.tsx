"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { loginUser } from "@/services/auth-service";
import { getFirebaseErrorMessage } from "@/lib/utils/firebase-errors";
import { auth } from "@/lib/firebase";

// Schéma de validation du formulaire
const formSchema = z.object({
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  password: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères.",
  }),
});

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [loading, setLoading] = useState(false);

  // Initialiser le formulaire
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Gérer la soumission du formulaire
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      // Connecter l'utilisateur avec Firebase
      await loginUser(values.email, values.password);

      // Créer un cookie de session valide pour le middleware
      const idToken = await auth.currentUser?.getIdToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      toast.success("Connexion réussie");
      router.push(callbackUrl);
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      toast.error(getFirebaseErrorMessage(error) || "Échec de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Connexion</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Entrez vos identifiants pour vous connecter
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-between">
            <Link
              href="/auth/reset-password"
              className="text-sm text-blue-500 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </form>
      </Form>
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Vous n&apos;avez pas de compte ?{" "}
          <Link href="/auth/register" className="text-blue-500 hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
} 