'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Vérification de votre adresse email...');
  
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de vérification manquant ou invalide.');
      return;
    }
    
    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Votre adresse email a été vérifiée avec succès !');
        } else {
          setStatus('error');
          setMessage(data.message || 'Échec de la vérification. Le token est peut-être expiré ou invalide.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Une erreur est survenue lors de la vérification de votre email.');
      }
    };
    
    verifyEmail();
  }, [token]);
  
  return (
    <div className="container flex h-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl text-center">Vérification de l'adresse email</CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' ? 'Validation de votre identité...' : ''}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-4">
          {status === 'loading' && (
            <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
          )}
          
          {status === 'success' && (
            <CheckCircle className="h-16 w-16 text-green-500" />
          )}
          
          {status === 'error' && (
            <XCircle className="h-16 w-16 text-red-500" />
          )}
          
          <p className="text-center text-gray-700 mt-4">
            {message}
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          {status !== 'loading' && (
            <Button 
              onClick={() => router.push('/auth/login')}
              className="w-full"
            >
              {status === 'success' ? 'Se connecter' : 'Retour à la connexion'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 