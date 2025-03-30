import { Wrench, Clock, Bell } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MaintenancePage() {
  // Date de fin de maintenance estimée
  const estimatedEndTime = new Date();
  estimatedEndTime.setHours(estimatedEndTime.getHours() + 2); // 2 heures à partir de maintenant
  
  // Format de la date pour l'affichage
  const formattedTime = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(estimatedEndTime);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="inline-flex justify-center items-center w-full">
          <Wrench className="h-16 w-16 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Site en maintenance</h1>
          <p className="text-lg text-muted-foreground">
            Nous effectuons actuellement des améliorations sur nos serveurs pour vous offrir une meilleure expérience.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-center gap-3 text-amber-600 mb-4">
            <Clock className="h-5 w-5" />
            <span className="font-medium">Maintenance en cours</span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Nous travaillons actuellement sur d&apos;importantes mises à jour de notre infrastructure.
            Nous nous excusons pour la gêne occasionnée et vous remercions de votre patience.
          </p>
          
          <div className="bg-muted p-3 rounded-md flex items-center gap-3 text-sm">
            <div className="bg-background p-2 rounded-full">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              Retour estimé à <span className="font-semibold">{formattedTime}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Être notifié de la fin de maintenance</h3>
          </div>
          
          <div className="flex">
            <input 
              type="email" 
              placeholder="Entrez votre email" 
              className="flex-1 px-4 py-2 rounded-l-md border border-r-0 focus:outline-none"
            />
            <Button className="rounded-l-none">
              Me notifier
            </Button>
          </div>
        </div>
        
        <footer className="pt-8 border-t border-gray-200 mt-8">
          <p className="text-sm text-muted-foreground">
            Besoin d&apos;assistance ? <Link href="mailto:support@hellopay.fr" className="text-primary hover:underline">Contactez notre support</Link>
          </p>
        </footer>
      </div>
    </div>
  );
} 