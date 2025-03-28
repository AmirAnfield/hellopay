'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email invalide').min(1, 'L\'email est requis'),
  password: z.string().min(1, 'Le mot de passe est requis'),
  rememberMe: z.boolean().optional()
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess: () => void;
  onRegisterClick: () => void;
}

export default function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulation d'une connexion (à remplacer par le vrai code de connexion)
      console.log('Tentative de connexion avec:', data);
      
      // Attendre un peu pour simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulation de succès (à remplacer par le vrai code)
      localStorage.setItem('isAuthenticated', 'true');
      onSuccess();
    } catch (err) {
      setError('Identifiants incorrects. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
          {error}
        </div>
      )}
      
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
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mot de passe</Label>
          <a
            href="/auth/reset-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Mot de passe oublié ?
          </a>
        </div>
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
      
      <div className="flex items-center space-x-2">
        <input 
          type="checkbox"
          id="rememberMe"
          className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
          {...register('rememberMe')}
          disabled={isLoading}
        />
        <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
          Se souvenir de moi
        </Label>
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connexion en cours...
          </>
        ) : (
          'Se connecter'
        )}
      </Button>
      
      <div className="text-center text-sm">
        Pas encore de compte ?{' '}
        <button
          type="button"
          onClick={onRegisterClick}
          className="text-blue-600 hover:underline font-medium"
        >
          S&apos;inscrire
        </button>
      </div>
    </form>
  );
} 