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
      // Simulation d'une inscription (à remplacer par le vrai code d'inscription)
      console.log('Tentative d\'inscription avec:', data);
      
      // Attendre un peu pour simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulation de stockage des données utilisateur
      localStorage.setItem('user', JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        emailVerified: false
      }));
      
      localStorage.setItem('isAuthenticated', 'true');
      
      // Afficher un message de succès
      toast({
        variant: "success",
        title: "Inscription réussie",
        description: "Un email de confirmation a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception pour valider votre compte."
      });
      
      setIsRegistered(true);
      onSuccess();
    } catch (err) {
      setError("L'inscription a échoué. Veuillez réessayer.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "L'inscription a échoué. Veuillez réessayer."
      });
      console.error(err);
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
              Veuillez cliquer sur le lien dans l'email pour activer votre compte.
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Jean"
                {...register('firstName')}
                disabled={isLoading}
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
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
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
          </div>
          
          <div className="flex items-start space-x-2">
            <input 
              type="checkbox"
              id="acceptTerms"
              className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              {...register('acceptTerms')}
              disabled={isLoading}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="acceptTerms" className="text-sm font-normal cursor-pointer">
                J&apos;accepte les{' '}
                <a href="/terms" className="text-blue-600 hover:underline">
                  conditions d&apos;utilisation
                </a>{' '}
                et la{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
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
              className="text-blue-600 hover:underline font-medium"
            >
              Se connecter
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 