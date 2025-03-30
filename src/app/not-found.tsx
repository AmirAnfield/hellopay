import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileQuestion, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <div className="space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <div className="inline-block p-5 bg-muted rounded-full">
            <FileQuestion className="h-12 w-12 text-primary" />
          </div>
          
          <h1 className="text-4xl font-bold tracking-tighter mt-6">
            Page non trouvée
          </h1>
          
          <p className="text-lg text-muted-foreground">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button asChild variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
            <Link href="/">
              <Home className="h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
          </Button>
          
          <Button asChild variant="default" size="lg" className="gap-2 w-full sm:w-auto">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Tableau de bord
            </Link>
          </Button>
        </div>
        
        <div className="pt-8 pb-12 border-t mt-8">
          <p className="text-sm text-muted-foreground">
            Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, veuillez contacter notre équipe de support.
          </p>
          
          <div className="relative mt-6 max-w-sm mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Rechercher dans l'aide..." 
              className="w-full pl-10 pr-4 py-2 rounded-full border bg-background"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 