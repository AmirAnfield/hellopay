import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TarifsPage() {
  return (
    <div className="container mx-auto px-4 py-14">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Nos tarifs</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm">
          Des solutions adaptées à vos besoins pour la gestion de vos documents RH
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {/* Offre À l'unité */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-1">À l&apos;unité</h2>
            <p className="text-gray-600 text-sm">Pour des besoins ponctuels</p>
          </div>
          
          <div className="mb-4">
            <p className="text-3xl font-bold mb-0.5">14,90 €<span className="text-base font-normal text-gray-600">/document</span></p>
            <p className="text-gray-500 text-xs">Paiement à l&apos;utilisation</p>
          </div>
          
          <ul className="space-y-2 mb-6 flex-grow text-sm">
            <li className="flex items-start">
              <Check size={16} className="text-primary mr-1.5 flex-shrink-0 mt-0.5" />
              <span>Fiches de paie à l&apos;unité</span>
            </li>
            <li className="flex items-start">
              <Check size={16} className="text-primary mr-1.5 flex-shrink-0 mt-0.5" />
              <span>Attestations à l&apos;unité</span>
            </li>
            <li className="flex items-start">
              <Check size={16} className="text-primary mr-1.5 flex-shrink-0 mt-0.5" />
              <span>Contrats à l&apos;unité</span>
            </li>
            <li className="flex items-start">
              <Check size={16} className="text-primary mr-1.5 flex-shrink-0 mt-0.5" />
              <span>Support par email</span>
            </li>
          </ul>
          
          <Button asChild className="w-full" size="sm">
            <Link href="/auth/register">Commencer</Link>
          </Button>
        </div>

        {/* Pack Start */}
        <div className="bg-white p-5 rounded-lg shadow-md border-2 border-primary relative flex flex-col">
          <div className="absolute top-0 right-0 bg-primary text-white py-0.5 px-2 text-xs font-medium rounded-bl-lg rounded-tr-lg">
            Populaire
          </div>
          
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-1">Pack Start</h2>
            <p className="text-gray-600 text-sm">Pour les petites entreprises</p>
          </div>
          
          <div className="mb-4">
            <p className="text-3xl font-bold mb-0.5">49,90 €<span className="text-base font-normal text-gray-600">/employé</span></p>
            <p className="text-gray-500 text-xs">Facturation annuelle</p>
          </div>
          
          <ul className="space-y-2 mb-6 flex-grow text-sm">
            <li className="flex items-start">
              <Check size={16} className="text-primary mr-1.5 flex-shrink-0 mt-0.5" />
              <span>4 fiches de paie</span>
            </li>
            <li className="flex items-start">
              <Check size={16} className="text-primary mr-1.5 flex-shrink-0 mt-0.5" />
              <span>1 attestation</span>
            </li>
            <li className="flex items-start">
              <Check size={16} className="text-primary mr-1.5 flex-shrink-0 mt-0.5" />
              <span>1 contrat</span>
            </li>
            <li className="flex items-start">
              <Check size={16} className="text-primary mr-1.5 flex-shrink-0 mt-0.5" />
              <span>Support prioritaire</span>
            </li>
            <li className="flex items-start">
              <Check size={16} className="text-primary mr-1.5 flex-shrink-0 mt-0.5" />
              <span>Téléchargement au format PDF</span>
            </li>
            <li className="flex items-start">
              <Check size={16} className="text-primary mr-1.5 flex-shrink-0 mt-0.5" />
              <span>Archivage sécurisé</span>
            </li>
          </ul>
          
          <Button asChild size="sm">
            <Link href="/auth/register?plan=start">Choisir ce pack</Link>
          </Button>
        </div>

        {/* Pack Premium */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-1">Pack Premium</h2>
            <p className="text-gray-600 text-sm">Pour une gestion complète</p>
          </div>
          
          <div className="mb-4">
            <p className="text-3xl font-bold mb-0.5">79,90 €<span className="text-base font-normal text-gray-600">/employé</span></p>
            <p className="text-gray-500 text-xs">Facturation annuelle</p>
          </div>
          
          <ul className="space-y-2 mb-6 flex-grow text-sm">
            <li className="flex items-start">
              <Check size={16} className="text-primary mr-1.5 flex-shrink-0 mt-0.5" />
              <span>12 fiches de paie</span>
            </li>
            <li className="flex items-start">
              <Check size={16} className="text-primary mr-1.5 flex-shrink-0 mt-0.5" />
              <span>1 attestation</span>
            </li>
            <li className="flex items-start">
              <Check size={16} className="text-primary mr-1.5 flex-shrink-0 mt-0.5" />
              <span>1 contrat</span>
            </li>
            <li className="flex items-start">
              <Check size={16} className="text-primary mr-1.5 flex-shrink-0 mt-0.5" />
              <span>Support dédié</span>
            </li>
            <li className="flex items-start">
              <Check size={16} className="text-primary mr-1.5 flex-shrink-0 mt-0.5" />
              <span>Téléchargement en lots</span>
            </li>
            <li className="flex items-start">
              <Check size={16} className="text-primary mr-1.5 flex-shrink-0 mt-0.5" />
              <span>Archivage et historique avancés</span>
            </li>
          </ul>
          
          <Button variant="outline" asChild size="sm">
            <Link href="/auth/register?plan=premium">Choisir ce pack</Link>
          </Button>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-xs text-gray-500">
          Version bêta - Nos offres sont en cours de développement et d&apos;amélioration
        </p>
      </div>

      {/* FAQ des tarifs */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-5 text-center">Questions fréquentes sur les tarifs</h2>
        
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="font-semibold text-base mb-1.5">Comment fonctionnent les paiements à l&apos;unité ?</h3>
            <p className="text-gray-600 text-sm">
              Vous payez uniquement pour les documents que vous générez. Chaque document (fiche de paie, attestation ou contrat) coûte 14,90 € et est disponible immédiatement après paiement.
            </p>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="font-semibold text-base mb-1.5">Puis-je changer de pack à tout moment ?</h3>
            <p className="text-gray-600 text-sm">
              Oui, vous pouvez passer d&apos;un pack à l&apos;autre à tout moment. La mise à niveau est immédiate, tandis que le passage à un pack inférieur prendra effet à la fin de votre cycle de facturation.
            </p>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="font-semibold text-base mb-1.5">Y a-t-il des frais supplémentaires ?</h3>
            <p className="text-gray-600 text-sm">
              Non, nos tarifs sont transparents. Vous ne payez que pour le pack choisi ou les documents générés à l&apos;unité. Il n&apos;y a pas de frais de configuration ni de frais cachés.
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-16 py-8 bg-gray-50 border-t border-gray-200/30 rounded-lg">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="mb-3 flex flex-wrap justify-center gap-3">
            <Link 
              href="/mentions-legales" 
              className="text-xs text-gray-500 hover:text-primary transition-colors"
            >
              Mentions légales
            </Link>
            <span className="text-xs text-gray-400">•</span>
            <Link 
              href="/confidentialite" 
              className="text-xs text-gray-500 hover:text-primary transition-colors"
            >
              Politique de confidentialité
            </Link>
            <span className="text-xs text-gray-400">•</span>
            <Link 
              href="/cgu" 
              className="text-xs text-gray-500 hover:text-primary transition-colors"
            >
              CGU
            </Link>
            <span className="text-xs text-gray-400">•</span>
            <Link 
              href="/contact" 
              className="text-xs text-gray-500 hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            HelloPay – Simplifiez votre gestion des ressources humaines
          </p>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} HelloPay. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
} 