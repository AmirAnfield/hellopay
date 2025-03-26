import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TarifsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Nos tarifs</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choisissez l'offre qui correspond le mieux à vos besoins de gestion des fiches de paie
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Offre Gratuite */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Gratuit</h2>
            <p className="text-gray-600">Idéal pour démarrer et tester</p>
          </div>
          
          <div className="mb-6">
            <p className="text-4xl font-bold mb-1">0 €<span className="text-lg font-normal text-gray-600">/mois</span></p>
            <p className="text-gray-500 text-sm">Aucun paiement requis</p>
          </div>
          
          <ul className="space-y-3 mb-8 flex-grow">
            <li className="flex items-start">
              <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>5 fiches de paie par mois</span>
            </li>
            <li className="flex items-start">
              <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>1 utilisateur</span>
            </li>
            <li className="flex items-start">
              <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Support communautaire (email)</span>
            </li>
            <li className="flex items-start">
              <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Modèles de base</span>
            </li>
          </ul>
          
          <Button asChild className="w-full">
            <Link href="/auth/register">Commencer gratuitement</Link>
          </Button>
        </div>

        {/* Offre Pro */}
        <div className="bg-white p-8 rounded-lg shadow-md border-2 border-primary relative flex flex-col">
          <div className="absolute top-0 right-0 bg-primary text-white py-1 px-3 text-sm font-medium rounded-bl-lg rounded-tr-lg">
            Populaire
          </div>
          
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Pro</h2>
            <p className="text-gray-600">Pour les petites entreprises</p>
          </div>
          
          <div className="mb-6">
            <p className="text-4xl font-bold mb-1">19 €<span className="text-lg font-normal text-gray-600">/mois</span></p>
            <p className="text-gray-500 text-sm">Facturation mensuelle ou annuelle</p>
          </div>
          
          <ul className="space-y-3 mb-8 flex-grow">
            <li className="flex items-start">
              <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>50 fiches de paie par mois</span>
            </li>
            <li className="flex items-start">
              <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>5 utilisateurs</span>
            </li>
            <li className="flex items-start">
              <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Support prioritaire (email + chat)</span>
            </li>
            <li className="flex items-start">
              <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Modèles personnalisables</span>
            </li>
            <li className="flex items-start">
              <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Archivage avancé</span>
            </li>
            <li className="flex items-start">
              <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Envoi automatique par email</span>
            </li>
          </ul>
          
          <Button asChild>
            <Link href="/auth/register?plan=pro">Choisir l'offre Pro</Link>
          </Button>
        </div>

        {/* Offre Entreprise */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Entreprise</h2>
            <p className="text-gray-600">Pour les grandes organisations</p>
          </div>
          
          <div className="mb-6">
            <p className="text-4xl font-bold mb-1">Sur devis</p>
            <p className="text-gray-500 text-sm">Contactez-nous pour un tarif adapté</p>
          </div>
          
          <ul className="space-y-3 mb-8 flex-grow">
            <li className="flex items-start">
              <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Fiches de paie illimitées</span>
            </li>
            <li className="flex items-start">
              <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Utilisateurs illimités</span>
            </li>
            <li className="flex items-start">
              <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Support dédié (téléphone et email)</span>
            </li>
            <li className="flex items-start">
              <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Intégration avec vos outils RH/Compta</span>
            </li>
            <li className="flex items-start">
              <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Personnalisation complète du système</span>
            </li>
            <li className="flex items-start">
              <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Déploiement sur site possible</span>
            </li>
          </ul>
          
          <Button variant="outline" asChild>
            <Link href="/contact">Demander un devis</Link>
          </Button>
        </div>
      </div>

      {/* FAQ des tarifs */}
      <div className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Questions fréquentes sur les tarifs</h2>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Puis-je changer d'offre à tout moment ?</h3>
            <p className="text-gray-600">
              Oui, vous pouvez passer d'une offre à l'autre à tout moment. La mise à niveau est immédiate, tandis que le passage à une offre inférieure prendra effet à la fin de votre cycle de facturation.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Y a-t-il des frais cachés ?</h3>
            <p className="text-gray-600">
              Non, nos tarifs sont transparents. Il n'y a pas de frais de configuration, ni de frais cachés. Vous ne payez que pour l'abonnement choisi.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Offrez-vous une réduction pour les associations ?</h3>
            <p className="text-gray-600">
              Oui, nous proposons des tarifs spéciaux pour les associations et organismes à but non lucratif. Contactez-nous pour en savoir plus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 