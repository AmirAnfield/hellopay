import { FileText, ShieldCheck, BarChart } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Fiches de paie simplifiées avec <span className="text-primary">HelloPay</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          La solution de génération de fiches de paie en ligne qui simplifie vos démarches administratives.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/auth/register"
            className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Commencer gratuitement
          </Link>
          <Link
            href="/auth/login"
            className="bg-white border border-gray-300 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 rounded-lg">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Pourquoi choisir HelloPay ?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Notre plateforme offre des avantages uniques pour la gestion des fiches de paie.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="mb-4 text-primary">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Conformité légale</h3>
            <p className="text-gray-600">
              Fiches de paie 100% conformes à la législation française, toujours à jour avec les dernières réglementations.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="mb-4 text-primary">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sécurité maximale</h3>
            <p className="text-gray-600">
              Protection avancée des données sensibles et conformité RGPD pour garantir la confidentialité.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="mb-4 text-primary">
              <BarChart size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Simple et efficace</h3>
            <p className="text-gray-600">
              Interface intuitive et automatisation des calculs pour générer des fiches de paie en quelques clics.
            </p>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Prêt à simplifier votre gestion de paie ?</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Rejoignez des milliers d'entreprises qui font confiance à HelloPay pour leurs fiches de paie.
        </p>
        <Link
          href="/auth/register"
          className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          Créer un compte
        </Link>
      </section>
    </div>
  );
}
