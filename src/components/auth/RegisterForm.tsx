'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide').min(1, 'L\'email est requis'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter les conditions d\'utilisation'
  })
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess: () => void;
  onLoginClick: () => void;
}

export default function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      acceptTerms: false
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Appeler l'API d'inscription
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          password: data.password,
        }),
      });

      // Analyser les erreurs de l'API
      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 409) {
          setError("Un compte existe déjà avec cette adresse email.");
        } else {
          setError(errorData.message || "Erreur lors de l'inscription");
        }
        
        return;
      }

      // Afficher le succès et rediriger
      setIsRegistered(true);
      onSuccess();
      
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès. Consultez votre boîte mail pour confirmer votre adresse email.",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue lors de la création de votre compte";
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isRegistered ? (
        <div className="text-center py-4 space-y-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="font-medium text-green-800 mb-2">Inscription réussie!</h3>
            <p className="text-sm text-green-700">
              Un email de confirmation a été envoyé à votre adresse email.
              Veuillez cliquer sur le lien dans l&apos;email pour activer votre compte.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={onLoginClick}
          >
            Retour à la connexion
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Jean"
                {...register('firstName')}
                disabled={isLoading}
                autoComplete="given-name"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Dupont"
                {...register('lastName')}
                disabled={isLoading}
                autoComplete="family-name"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              {...register('email')}
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              Le mot de passe doit contenir au moins 8 caractères
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <input 
              type="checkbox"
              id="acceptTerms"
              className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 mt-1"
              {...register('acceptTerms')}
              disabled={isLoading}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="acceptTerms" className="text-sm font-normal cursor-pointer">
                J&apos;accepte les{' '}
                <a href="/mentions-legales" className="text-blue-600 hover:underline">
                  conditions d&apos;utilisation
                </a>{' '}
                et la{' '}
                <a href="/confidentialite" className="text-blue-600 hover:underline">
                  politique de confidentialité
                </a>
              </Label>
              {errors.acceptTerms && (
                <p className="text-sm text-red-500">{errors.acceptTerms.message}</p>
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
              'S&apos;inscrire'
            )}
          </Button>
          
          <div className="text-center text-sm">
            Déjà inscrit ?{' '}
            <button
              type="button"
              onClick={onLoginClick}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Se connecter
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 