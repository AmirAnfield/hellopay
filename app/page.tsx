import { FileText, ShieldCheck, BarChart, ArrowRight, Users, FileCheck, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section - Style inspiré de Notion/Stripe */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 text-left">
              <div className="inline-block mb-4 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                Simplifie la gestion de paie
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                La paie simplifiée pour les<br />
                <span className="text-blue-600">entreprises modernes</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl">
                Générateur de fiches de paie, calculs automatiques, cotisations à jour. 
                Une solution complète pour gérer vos salaires en quelques clics.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/auth/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-all flex items-center gap-2 shadow-sm hover:shadow"
                >
                  Commencer gratuitement <ArrowRight size={18} />
                </Link>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-blue-600 px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Connexion
                </Link>
              </div>
              <div className="mt-8 flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white" />
                  ))}
                </div>
                <p className="ml-3 text-sm text-gray-600">
                  <span className="font-medium">+500 entreprises</span> utilisent HelloPay
                </p>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative z-10 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-1">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-blue-700">Fiche de paie - Mai 2024</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Validé</span>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between mb-3">
                        <span className="text-gray-600 text-sm">Salaire brut</span>
                        <span className="font-medium">2 500,00 €</span>
                      </div>
                      <div className="flex justify-between mb-3">
                        <span className="text-gray-600 text-sm">Cotisations salariales</span>
                        <span className="font-medium text-red-600">-500,00 €</span>
                      </div>
                      <div className="flex justify-between mb-3">
                        <span className="text-gray-600 text-sm">Cotisations patronales</span>
                        <span className="font-medium text-orange-600">1 000,00 €</span>
                      </div>
                      <div className="h-px bg-gray-200 my-3"></div>
                      <div className="flex justify-between">
                        <span className="font-medium">Net à payer</span>
                        <span className="font-bold text-green-600">2 000,00 €</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-6 -right-4 z-0 w-60 h-40 bg-blue-100 rounded-lg"></div>
              <div className="absolute -bottom-4 -left-4 z-0 w-60 h-40 bg-gray-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-70">
            <p className="text-gray-500 text-sm font-medium">FAITES CONFIANCE PAR</p>
            {["Société A", "Entreprise B", "Groupe C", "Startup D", "Company E"].map(name => (
              <div key={name} className="text-gray-400 font-semibold text-lg">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Une suite complète pour gérer vos paies</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              HelloPay simplifie et automatise vos processus de paie
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-lg bg-blue-50 text-blue-600">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fiches de paie automatisées</h3>
              <p className="text-gray-600">
                Générez des fiches de paie conformes à la législation française en quelques clics.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-lg bg-green-50 text-green-600">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Sécurité et conformité</h3>
              <p className="text-gray-600">
                Données sécurisées et cotisations toujours à jour avec les dernières réglementations.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-lg bg-purple-50 text-purple-600">
                <BarChart size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Calculs automatiques</h3>
              <p className="text-gray-600">
                Calculs précis et instantanés des salaires bruts, nets et des cotisations sociales.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comment ça marche</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Un processus simple en 4 étapes pour gérer vos fiches de paie
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: <Users size={24} />, title: "Créez votre entreprise", desc: "Renseignez les informations de votre entreprise" },
              { icon: <Users size={24} />, title: "Ajoutez vos salariés", desc: "Créez des profils pour vos employés" },
              { icon: <FileCheck size={24} />, title: "Générez les fiches", desc: "Créez vos fiches de paie en quelques clics" },
              { icon: <Calendar size={24} />, title: "Gérez l'historique", desc: "Accédez à toutes vos fiches de paie" }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                  <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-blue-600 text-white mx-auto">
                    <span className="font-bold">{i+1}</span>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 mb-4 mx-auto text-blue-600">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 left-full -translate-y-1/2 w-8 h-px bg-gray-300" style={{ width: 'calc(100% - 3rem)' }}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-blue-600 rounded-2xl overflow-hidden">
            <div className="p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Prêt à simplifier votre gestion de paie ?</h2>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
                Rejoignez des milliers d'entreprises qui font confiance à HelloPay pour leurs fiches de paie.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-lg"
              >
                Créer mon compte gratuitement <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="pb-20 pt-8">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <p className="text-gray-500">
            Des questions ? <Link href="/contact" className="text-blue-600 hover:underline">Contactez-nous</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
