import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold">Erreur d'authentification</h1>
        <p className="text-gray-600 mt-2">
          Une erreur s'est produite pendant l'authentification.
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
        <p className="mb-6">
          Plusieurs raisons peuvent expliquer cette erreur : session expirée, informations invalides 
          ou problème temporaire avec notre service.
        </p>
        
        <div className="flex flex-col space-y-4">
          <Button asChild>
            <Link href="/auth/login">Retourner à la connexion</Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/">Retourner à l'accueil</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 