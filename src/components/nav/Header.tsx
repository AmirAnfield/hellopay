'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, User, LogOut, Settings, FileText, Home, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import AuthModal from '../auth/AuthModal';

interface HeaderProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

export default function Header({ isAuthenticated, setIsAuthenticated }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<'login' | 'register'>('login');
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu utilisateur lors d'un clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    setIsUserMenuOpen(false);
  };

  const openAuthModal = (mode: 'login' | 'register') => {
    setInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    setIsAuthenticated(true);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-primary">
              HelloPay
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-sm font-medium text-gray-600 hover:text-primary flex items-center">
                <Home className="w-4 h-4 mr-1" />
                Accueil
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-primary">
                    Dashboard
                  </Link>
                  <Link href="/payslip" className="text-sm font-medium text-gray-600 hover:text-primary">
                    Fiches de paie
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/demo" className="text-sm font-medium text-gray-600 hover:text-primary">
                    Démo
                  </Link>
                  <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-primary">
                    Tarifs
                  </Link>
                </>
              )}
              
              <Link href="/faq" className="text-sm font-medium text-gray-600 hover:text-primary">
                FAQ
              </Link>
              <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-primary">
                Contact
              </Link>
            </nav>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-primary"
                >
                  <User className="h-5 w-5 mr-1" />
                  Mon compte
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <Link 
                        href="/profile" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profil
                      </Link>
                      <Link 
                        href="/settings" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Paramètres
                      </Link>
                      <Link 
                        href="/payslip" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Fiches de paie
                      </Link>
                      <button
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button 
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span>Connexion / Inscription</span>
              </Button>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-primary"
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Accueil
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/payslip"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Fiches de paie
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/demo"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Démo
                </Link>
                <Link
                  href="/pricing"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tarifs
                </Link>
              </>
            )}
            
            <Link
              href="/faq"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profil
                </Link>
                <Link
                  href="/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Paramètres
                </Link>
                <button
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="mt-4 px-3">
                <Button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full justify-center"
                >
                  Connexion / Inscription
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={initialMode}
        onSuccess={handleAuthSuccess}
      />
    </header>
  );
} 