"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RegisterFormValues } from "@/lib/types";
import { AlertCircle, CheckCircle } from "lucide-react";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<RegisterFormValues>({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Vérifier que les mots de passe correspondent
    if (formValues.password !== formValues.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formValues.name,
          email: formValues.email,
          password: formValues.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Une erreur est survenue lors de l'inscription.");
      }

      setSuccess(true);
      
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md flex items-center gap-2 text-sm">
          <CheckCircle size={16} />
          <span>Compte créé avec succès ! Redirection vers la page de connexion...</span>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Nom complet
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          value={formValues.name}
          onChange={handleChange}
          placeholder="Jean Dupont"
          disabled={loading || success}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          value={formValues.email}
          onChange={handleChange}
          placeholder="nom@example.com"
          disabled={loading || success}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium">
          Mot de passe
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          value={formValues.password}
          onChange={handleChange}
          placeholder="••••••••"
          disabled={loading || success}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium">
          Confirmer le mot de passe
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={formValues.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          disabled={loading || success}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading || success}
      >
        {loading ? "Création en cours..." : "Créer un compte"}
      </Button>

      <div className="text-center text-sm text-gray-600 mt-4">
        Déjà un compte?{" "}
        <Link href="/auth/login" className="text-primary hover:underline">
          Se connecter
        </Link>
      </div>
    </form>
  );
} 