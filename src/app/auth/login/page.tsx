'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, AlertCircle, Mail, Lock, Github, Loader2 } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      rememberMe: checked
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callbackUrl: '/dashboard'
      });
      
      if (result?.error) {
        setError('Identifiants incorrects. Veuillez réessayer.');
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGithubSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('github', { callbackUrl: '/dashboard' });
    } catch {
      setError('Erreur lors de la connexion avec GitHub. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] md:w-[450px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Connexion à HelloPay</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Accédez à votre espace personnel pour gérer vos fiches de paie
          </p>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Connexion</CardTitle>
            <CardDescription>
              Utilisez votre adresse email et mot de passe pour vous connecter
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="github">GitHub</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email">
                {error && (
                  <div className="flex items-center p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        id="email"
                        name="email"
                        type="email"
                        placeholder="nom@exemple.fr"
                        autoComplete="email"
                        required
                        className="pl-10"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Mot de passe</Label>
                      <Link href="/auth/reset-password" className="text-xs text-primary hover:underline">
                        Mot de passe oublié ?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                        className="pl-10"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember"
                        checked={formData.rememberMe} 
                        onCheckedChange={handleCheckboxChange}
                      />
                      <Label htmlFor="remember" className="text-sm">Se souvenir de moi</Label>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        Se connecter
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="github">
                <div className="flex flex-col space-y-4">
                  <p className="text-sm text-gray-500 text-center mx-auto max-w-xs">
                    Connectez-vous avec votre compte GitHub pour un accès rapide
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleGithubSignIn}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Github className="mr-2 h-4 w-4" />
                    )}
                    Continuer avec GitHub
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="flex items-center justify-center text-sm">
              <p className="text-center text-sm text-gray-500">
                Pas encore inscrit ?{' '}
                <Link href="/auth/register" className="text-primary hover:underline">
                  Créer un compte
                </Link>
              </p>
            </div>
            
            <div className="text-center text-xs text-gray-500">
              En vous connectant, vous acceptez nos{' '}
              <Link href="/mentions-legales" className="text-primary hover:underline">Conditions d&apos;utilisation</Link>{' '}
              et notre{' '}
              <Link href="/confidentialite" className="text-primary hover:underline">Politique de confidentialité</Link>.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 