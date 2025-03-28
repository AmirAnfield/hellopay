import Link from "next/link";
import { 
  BuildingIcon, 
  UsersIcon, 
  FileTextIcon,
  DashboardIcon 
} from '@/components/ui/icons';

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Bannière principale */}
      <section className="py-20 px-8 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              La gestion de paie <span className="text-blue-300">simplifiée</span> pour tous
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl text-blue-100 leading-relaxed">
              HelloPay vous aide à créer, gérer et archiver vos fiches de paie en quelques clics, sans complexité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/auth/register" 
                className="px-8 py-4 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200"
              >
                Commencer gratuitement
              </Link>
              <Link 
                href="/auth/login" 
                className="px-8 py-4 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 transition-colors border border-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Caractéristiques */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">Tout ce dont vous avez besoin</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Une solution complète pour la gestion de votre paie et de vos ressources humaines
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 border border-gray-200 rounded-xl hover:shadow-xl transition-all duration-300 bg-white hover:border-blue-200 group">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <BuildingIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors">Gestion d&apos;entreprises</h3>
              <p className="text-gray-600">Gérez plusieurs entreprises avec toutes leurs informations en un seul endroit</p>
            </div>
            
            <div className="p-8 border border-gray-200 rounded-xl hover:shadow-xl transition-all duration-300 bg-white hover:border-green-200 group">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                <UsersIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-green-600 transition-colors">Gestion d&apos;employés</h3>
              <p className="text-gray-600">Ajoutez et gérez les informations de vos employés en toute simplicité</p>
            </div>
            
            <div className="p-8 border border-gray-200 rounded-xl hover:shadow-xl transition-all duration-300 bg-white hover:border-purple-200 group">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                <FileTextIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-purple-600 transition-colors">Fiches de paie</h3>
              <p className="text-gray-600">Générez des fiches de paie conformes à la législation en vigueur en quelques clics</p>
            </div>
            
            <div className="p-8 border border-gray-200 rounded-xl hover:shadow-xl transition-all duration-300 bg-white hover:border-orange-200 group">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                <DashboardIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-orange-600 transition-colors">Tableau de bord</h3>
              <p className="text-gray-600">Visualisez toutes vos données importantes en un coup d&apos;œil</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">Comment ça marche</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Une approche simple en trois étapes pour commencer à utiliser HelloPay
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mb-6 text-2xl font-bold">1</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Créez votre espace</h3>
              <p className="text-gray-600 leading-relaxed">Inscrivez-vous en quelques secondes et configurez votre profil et vos entreprises en quelques minutes</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mb-6 text-2xl font-bold">2</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Ajoutez vos employés</h3>
              <p className="text-gray-600 leading-relaxed">Enregistrez les informations de vos employés nécessaires à la création de fiches de paie précises</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mb-6 text-2xl font-bold">3</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Générez vos fiches</h3>
              <p className="text-gray-600 leading-relaxed">Créez des fiches de paie complètes en quelques clics et envoyez-les directement par email à vos employés</p>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">Ce que nos clients disent</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Découvrez pourquoi les entreprises font confiance à HelloPay pour leur gestion de paie
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-4">
                  M
                </div>
                <div>
                  <h4 className="font-semibold">Martin Dubois</h4>
                  <p className="text-sm text-gray-500">PME de services, 12 employés</p>
                </div>
              </div>
              <p className="text-gray-700 italic">&quot;HelloPay nous a permis de réduire notre temps de gestion des fiches de paie de 80%. Une véritable révolution pour notre entreprise.&quot;</p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold mr-4">
                  S
                </div>
                <div>
                  <h4 className="font-semibold">Sophie Martin</h4>
                  <p className="text-sm text-gray-500">Boutique e-commerce, 5 employés</p>
                </div>
              </div>
              <p className="text-gray-700 italic">&quot;Interface intuitive et support client réactif. Je recommande vivement HelloPay à tous les entrepreneurs qui souhaitent se simplifier la vie.&quot;</p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-4">
                  T
                </div>
                <div>
                  <h4 className="font-semibold">Thomas Leroy</h4>
                  <p className="text-sm text-gray-500">Cabinet d&apos;architecture, 8 employés</p>
                </div>
              </div>
              <p className="text-gray-700 italic">&quot;La possibilité de gérer plusieurs entreprises et employés sur une seule plateforme est un gain de temps considérable. Très satisfait de HelloPay.&quot;</p>
            </div>
          </div>
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="py-20 px-8 bg-gradient-to-br from-blue-600 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à simplifier votre gestion de paie ?</h2>
          <p className="text-xl mb-8 text-blue-100">Rejoignez des milliers d&apos;entreprises qui font confiance à HelloPay</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register" 
              className="px-8 py-4 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-lg"
            >
              Créer un compte gratuitement
            </Link>
            <Link 
              href="/demo" 
              className="px-8 py-4 bg-blue-800 border border-blue-600 text-white rounded-lg font-medium hover:bg-blue-900 transition-colors shadow-lg"
            >
              Voir la démo
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">HelloPay</h3>
            <p className="mb-4">Solution de gestion de paie simple et efficace pour les entreprises de toute taille.</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Liens rapides</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="hover:text-blue-400 transition-colors">Tableau de bord</Link></li>
              <li><Link href="/payslips" className="hover:text-blue-400 transition-colors">Fiches de paie</Link></li>
              <li><Link href="/enterprises" className="hover:text-blue-400 transition-colors">Entreprises</Link></li>
              <li><Link href="/employees" className="hover:text-blue-400 transition-colors">Employés</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Ressources</h4>
            <ul className="space-y-2">
              <li><Link href="/faq" className="hover:text-blue-400 transition-colors">FAQ</Link></li>
              <li><Link href="/tarifs" className="hover:text-blue-400 transition-colors">Tarifs</Link></li>
              <li><Link href="/support" className="hover:text-blue-400 transition-colors">Support</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Légal</h4>
            <ul className="space-y-2">
              <li><Link href="/mentions-legales" className="hover:text-blue-400 transition-colors">Mentions légales</Link></li>
              <li><Link href="/confidentialite" className="hover:text-blue-400 transition-colors">Politique de confidentialité</Link></li>
              <li><Link href="/cgv" className="hover:text-blue-400 transition-colors">CGV</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-700 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} HelloPay. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
