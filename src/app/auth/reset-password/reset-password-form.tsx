"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
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
import { confirmPasswordResetWithCode } from "@/services/auth-service";
import { getFirebaseErrorMessage } from "@/lib/utils/firebase-errors";

// Schéma de validation pour les mots de passe
const passwordSchema = z
  .object({
    password: z.string().min(8, {
      message: "Le mot de passe doit contenir au moins 8 caractères.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Le mot de passe doit contenir au moins 8 caractères.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const [loading, setLoading] = useState(false);

  // Initialiser le formulaire
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Gérer la soumission du formulaire
  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    if (!oobCode) {
      toast.error("Code de réinitialisation manquant. Veuillez réessayer.");
      return;
    }

    setLoading(true);
    try {
      // Soumettre la réinitialisation du mot de passe
      await confirmPasswordResetWithCode(oobCode, values.password);
      
      toast.success("Mot de passe réinitialisé avec succès.");
      router.push("/auth/login");
    } catch (error) {
      console.error("Erreur de réinitialisation:", error);
      toast.error(getFirebaseErrorMessage(error) || "Erreur lors de la réinitialisation du mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  // Si aucun code oobCode n'est trouvé dans l'URL
  if (!oobCode) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Lien invalide</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.
        </p>
        <Button asChild>
          <Link href="/auth/forgot-password">Demander un nouveau lien</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Réinitialiser le mot de passe</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Veuillez entrer votre nouveau mot de passe
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nouveau mot de passe</FormLabel>
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
            {loading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
          </Button>
        </form>
      </Form>
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <Link href="/auth/login" className="text-blue-500 hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
} 