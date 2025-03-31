'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, XCircle, Download, Send } from 'lucide-react';
import useRecaptcha from '@/hooks/useRecaptcha';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

export default function RecaptchaTestPage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string>('');
  const [userAction, setUserAction] = useState<string>('login');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<Record<string, unknown> | null>(null);
  
  // Utiliser notre hook reCAPTCHA
  const { executeRecaptcha, token, status: recaptchaStatus, error: recaptchaError } = useRecaptcha({
    action: userAction
  });

  // Générer le token reCAPTCHA
  const generateToken = async () => {
    try {
      await executeRecaptcha(userAction);
      toast({
        title: 'Token généré',
        description: 'Le token reCAPTCHA a été généré avec succès.',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: `Impossible de générer le token: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive'
      });
    }
  };

  // Télécharger le fichier request.json
  const downloadRequestJson = () => {
    if (!token) {
      toast({
        title: 'Erreur',
        description: 'Veuillez d\'abord générer un token reCAPTCHA.',
        variant: 'destructive'
      });
      return;
    }

    const requestData = {
      event: {
        token: token,
        expectedAction: userAction,
        siteKey: '6LdUnwUrAAAAAL3u-4zxXrmXOCLMBEVLjkkd2Y4_',
      }
    };

    const blob = new Blob([JSON.stringify(requestData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'request.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Fichier téléchargé',
      description: 'Le fichier request.json a été téléchargé.',
      variant: 'success'
    });
  };

  // Envoyer la requête à l'API reCAPTCHA Enterprise
  const sendRequest = async () => {
    if (!token) {
      toast({
        title: 'Erreur',
        description: 'Veuillez d\'abord générer un token reCAPTCHA.',
        variant: 'destructive'
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer une clé API valide.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    setResponse(null);

    try {
      const requestData = {
        event: {
          token: token,
          expectedAction: userAction,
          siteKey: '6LdUnwUrAAAAAL3u-4zxXrmXOCLMBEVLjkkd2Y4_',
        }
      };

      const response = await fetch(`https://recaptchaenterprise.googleapis.com/v1/projects/hellopay-a852d/assessments?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      setResponse(data);

      if (response.ok) {
        toast({
          title: 'Requête envoyée',
          description: 'La requête a été envoyée avec succès à l\'API reCAPTCHA Enterprise.',
          variant: 'success'
        });
      } else {
        toast({
          title: 'Erreur',
          description: `Erreur lors de l'envoi de la requête: ${data.error?.message || 'Erreur inconnue'}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: `Erreur lors de l'envoi de la requête: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test de l&apos;API reCAPTCHA Enterprise</CardTitle>
          <CardDescription>
            Générez un token reCAPTCHA, créez le fichier request.json et envoyez la requête à l&apos;API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userAction">Action utilisateur</Label>
                <Input 
                  id="userAction" 
                  value={userAction} 
                  onChange={(e) => setUserAction(e.target.value)}
                  placeholder="login, signup, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">Clé API Google</Label>
                <Input 
                  id="apiKey" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Entrez votre clé API Google"
                  type="password"
                />
              </div>
            </div>

            <Button
              onClick={generateToken}
              disabled={recaptchaStatus === 'loading'}
              className="w-full"
            >
              {recaptchaStatus === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération du token...
                </>
              ) : (
                'Générer un token reCAPTCHA'
              )}
            </Button>
          </div>

          {token && (
            <div className="space-y-4">
              <Separator />
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-blue-700">Token reCAPTCHA</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <p className="text-xs text-gray-600 break-all">
                      {token}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={downloadRequestJson}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger request.json
                </Button>
                
                <Button
                  onClick={sendRequest}
                  disabled={isLoading || !apiKey}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer à l&apos;API
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {response && (
            <div className="space-y-2">
              <Separator />
              <h3 className="text-lg font-medium">Réponse de l&apos;API</h3>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-md overflow-auto max-h-60">
                <pre className="text-xs text-gray-800">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {recaptchaError && (
            <div className="p-4 border rounded-md bg-red-50 border-red-200">
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700">Erreur</p>
                  <p className="text-sm text-red-600">{recaptchaError.message}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-sm text-gray-500">
            La clé API n&apos;est jamais stockée et reste uniquement dans votre navigateur
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 