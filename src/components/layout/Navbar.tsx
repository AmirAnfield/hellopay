"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  // Fonction pour déterminer si un lien est actif
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-primary">HelloPay</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/tarifs"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/tarifs')
                    ? 'border-primary text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Tarifs
              </Link>

              <Link
                href="/faq"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/faq')
                    ? 'border-primary text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                FAQ
              </Link>

              <Link
                href="/contact"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/contact')
                    ? 'border-primary text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Contact
              </Link>

              {session?.user && (
                <>
                  <Link
                    href="/payslips"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/payslips')
                        ? 'border-primary text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Fiches de paie
                  </Link>
                  
                  <Link
                    href="/test-payslip"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/test-payslip')
                        ? 'border-primary text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Tester les fiches
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {session?.user ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    className="flex text-sm rounded-full focus:outline-none items-center"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <span className="mr-2">{session.user.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Mon profil
                    </Link>
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Tableau de bord
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link href="/auth/login">
                  <Button variant="outline">Connexion</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Inscription</Button>
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Version mobile du menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/tarifs"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/tarifs')
                  ? 'border-primary text-primary bg-primary-50'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Tarifs
            </Link>
            <Link
              href="/faq"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/faq')
                  ? 'border-primary text-primary bg-primary-50'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/contact')
                  ? 'border-primary text-primary bg-primary-50'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Contact
            </Link>
            {session?.user && (
              <>
                <Link
                  href="/payslips"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/payslips')
                      ? 'border-primary text-primary bg-primary-50'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Fiches de paie
                </Link>
                
                <Link
                  href="/test-payslip"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/test-payslip')
                      ? 'border-primary text-primary bg-primary-50'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Tester les fiches
                </Link>
              </>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {session?.user ? (
              <>
                <div className="flex items-center px-4">
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{session.user.name}</div>
                    <div className="text-sm font-medium text-gray-500">{session.user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Mon profil
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Tableau de bord
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Déconnexion
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4 flex flex-col space-y-2">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">Connexion</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="w-full">Inscription</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar; 