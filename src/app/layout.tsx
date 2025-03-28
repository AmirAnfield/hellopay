import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { 
  UserIcon,
  LogoutIcon,
  LoginIcon
} from '@/components/ui/icons';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "HelloPay - Gestion de fiches de paie simplifiée",
  description: "Simplifiez la gestion de vos fiches de paie avec HelloPay",
};

// Cette fonction simule la vérification d'authentification côté client
// Dans une vraie application, utilisez un hook comme useSession de next-auth
const isLoggedIn = false; // Simuler un état de non-connexion

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} h-full flex flex-col antialiased text-gray-800 bg-gray-50`}>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Logo et nom de l'application */}
              <div className="flex">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
                    HP
                  </div>
                  <span className="font-bold text-lg text-blue-600">HelloPay</span>
                </Link>
              </div>

              {/* Navigation pour desktop */}
              <nav className="hidden md:flex items-center space-x-8">
                {isLoggedIn ? (
                  <>
                    <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 hover:underline transition-colors px-3 py-2 rounded-md text-sm font-medium">
                      Tableau de bord
                    </Link>
                    <Link href="/enterprises" className="text-gray-600 hover:text-blue-600 hover:underline transition-colors px-3 py-2 rounded-md text-sm font-medium">
                      Entreprises
                    </Link>
                    <Link href="/employees" className="text-gray-600 hover:text-blue-600 hover:underline transition-colors px-3 py-2 rounded-md text-sm font-medium">
                      Employés
                    </Link>
                    <Link href="/payslips" className="text-gray-600 hover:text-blue-600 hover:underline transition-colors px-3 py-2 rounded-md text-sm font-medium">
                      Fiches de paie
                    </Link>
                    <div className="pl-4 border-l border-gray-200">
                      <Link href="/profile" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <UserIcon className="h-5 w-5" />
                        <span>Profil</span>
                      </Link>
                    </div>
                    <div>
                      <Link href="/auth/logout" className="inline-flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors">
                        <LogoutIcon className="h-5 w-5" />
                        <span>Déconnexion</span>
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/#features" className="text-gray-600 hover:text-blue-600 hover:underline transition-colors px-3 py-2 rounded-md text-sm font-medium">
                      Fonctionnalités
                    </Link>
                    <Link href="/#pricing" className="text-gray-600 hover:text-blue-600 hover:underline transition-colors px-3 py-2 rounded-md text-sm font-medium">
                      Tarifs
                    </Link>
                    <Link href="/demo" className="text-gray-600 hover:text-blue-600 hover:underline transition-colors px-3 py-2 rounded-md text-sm font-medium">
                      Démo
                    </Link>
                    <Link href="/faq" className="text-gray-600 hover:text-blue-600 hover:underline transition-colors px-3 py-2 rounded-md text-sm font-medium">
                      FAQ
                    </Link>
                    <div className="pl-4 border-l border-gray-200">
                      <Link 
                        href="/auth/login" 
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <LoginIcon className="h-5 w-5" />
                        <span>Connexion</span>
                      </Link>
                    </div>
                    <div>
                      <Link 
                        href="/auth/register" 
                        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        Inscription
                      </Link>
                    </div>
                  </>
                )}
              </nav>

              {/* Bouton mobile menu */}
              <div className="md:hidden flex items-center">
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  aria-expanded="false"
                >
                  <span className="sr-only">Ouvrir le menu</span>
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Menu mobile (peut être activé via JavaScript en production) */}
          <div className="hidden md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-md">
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                    Tableau de bord
                  </Link>
                  <Link href="/enterprises" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                    Entreprises
                  </Link>
                  <Link href="/employees" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                    Employés
                  </Link>
                  <Link href="/payslips" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                    Fiches de paie
                  </Link>
                  <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                    Profil
                  </Link>
                  <Link href="/auth/logout" className="block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50">
                    Déconnexion
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/#features" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                    Fonctionnalités
                  </Link>
                  <Link href="/#pricing" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                    Tarifs
                  </Link>
                  <Link href="/demo" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                    Démo
                  </Link>
                  <Link href="/faq" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                    FAQ
                  </Link>
                  <Link href="/auth/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                    Connexion
                  </Link>
                  <Link href="/auth/register" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
