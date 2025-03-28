'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function VerifySuccessPage() {
  const router = useRouter();
  
  return (
    <div className="container flex h-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl text-center">Email vérifié avec succès</CardTitle>
          <CardDescription className="text-center">
            Votre adresse email a été vérifiée
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
          
          <p className="text-center text-gray-700 mt-4">
            Merci d&apos;avoir vérifié votre adresse email. Vous pouvez maintenant accéder à toutes les fonctionnalités de HelloPay.
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-center gap-4">
          <Button 
            onClick={() => router.push('/auth/login')}
            className="w-full"
          >
            Se connecter
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 