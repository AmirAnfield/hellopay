'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/nav/Header';
import Link from 'next/link';
import { Toaster } from '@/components/ui/toaster';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Vérifier l'état d'authentification au chargement
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">À propos</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-sm text-gray-600 hover:text-primary">
                    Notre mission
                  </Link>
                </li>
                <li>
                  <Link href="/team" className="text-sm text-gray-600 hover:text-primary">
                    Notre équipe
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-sm text-gray-600 hover:text-primary">
                    Carrières
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Ressources</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/blog" className="text-sm text-gray-600 hover:text-primary">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="text-sm text-gray-600 hover:text-primary">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-sm text-gray-600 hover:text-primary">
                    Centre d&apos;aide
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Légal</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/terms" className="text-sm text-gray-600 hover:text-primary">
                    Conditions d&apos;utilisation
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-gray-600 hover:text-primary">
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-sm text-gray-600 hover:text-primary">
                    Politique de cookies
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/contact" className="text-sm text-gray-600 hover:text-primary">
                    Nous contacter
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-sm text-gray-600 hover:text-primary">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="text-sm text-gray-600 hover:text-primary">
                    Donner un avis
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} HelloPay. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
} 