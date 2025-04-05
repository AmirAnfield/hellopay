"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Building2,
  CreditCard,
  FileText,
  LogIn,
  LogOut,
  Menu,
  Settings,
  User,
  Users,
  X,
  HelpCircle,
  MonitorSmartphone,
  Briefcase,
  Home,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logoutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!user;

  // Charger les données utilisateur depuis Firestore
  useEffect(() => {
    // Fermer le menu mobile lors du changement de route
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logoutUser();
    setMobileMenuOpen(false);
    router.push("/");
  };

  const handleLogin = () => {
    router.push("/auth/login");
  };

  return (
    <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Logo - côté gauche */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/media/logo/logo_hellopay.png" 
              alt="HelloPay Logo" 
              width={96} 
              height={38} 
              className="h-9 w-auto object-contain" 
              priority
            />
          </Link>
        </div>

        {/* Navigation principale - Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {isAuthenticated ? (
            // Liens pour utilisateurs authentifiés
            <>
              {/* Espace réservé pour les futures notifications */}
            </>
          ) : (
            // Liens pour visiteurs
            <>
              <Link
                href="/solutions"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/solutions" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Solutions
                </span>
              </Link>
              <Link
                href="/tarifs"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/tarifs" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Tarifs
                </span>
              </Link>
              <Link
                href="/demo"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/demo" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span className="flex items-center">
                  <MonitorSmartphone className="h-4 w-4 mr-1" />
                  Démo
                </span>
              </Link>
              <Link
                href="/faq"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/faq" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span className="flex items-center">
                  <HelpCircle className="h-4 w-4 mr-1" />
                  FAQ
                </span>
              </Link>
            </>
          )}
        </nav>

        {/* Actions - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            // Utilisateur connecté - Icônes de navigation
            <>
              <Button
                variant="ghost"
                size="icon"
                asChild
                title="Tableau de bord"
              >
                <Link href="/dashboard">
                  <Home className="h-5 w-5" />
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                asChild
                title="Profil"
              >
                <Link href="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                asChild
                title="Facturation"
              >
                <Link href="/profile/billing">
                  <CreditCard className="h-5 w-5" />
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                asChild
                title="Paramètres"
              >
                <Link href="/profile/settings">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
              
              {/* Sélecteur de thème */}
              <ThemeToggle />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Déconnexion"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            // Utilisateur non connecté - Bouton de connexion direct
            <>
              <Button 
                className="flex items-center gap-2"
                onClick={handleLogin}
              >
                <LogIn className="h-4 w-4" />
                Se connecter
              </Button>
              
              {/* Sélecteur de thème - toujours à droite */}
              <ThemeToggle />
            </>
          )}
        </div>

        {/* Menu mobile - Bouton */}
        <div className="md:hidden flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Menu mobile - Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="-m-1.5 p-1.5 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Image 
                  src="/media/logo/logo_hellopay.png" 
                  alt="HelloPay Logo" 
                  width={96} 
                  height={38} 
                  className="h-9 w-auto object-contain" 
                  priority
                />
              </Link>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-200">
                <div className="space-y-2 py-6">                  
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Home className="h-4 w-4 inline-block mr-2" />
                        Hub
                      </Link>
                      <Link
                        href="/dashboard/companies"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Building2 className="h-4 w-4 inline-block mr-2" />
                        Entreprises
                      </Link>
                      <Link
                        href="/dashboard/employees"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Users className="h-4 w-4 inline-block mr-2" />
                        Employés
                      </Link>
                      <Link
                        href="/dashboard/documents"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FileText className="h-4 w-4 inline-block mr-2" />
                        Documents
                      </Link>
                      <Link
                        href="/profile"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 inline-block mr-2" />
                        Mon profil
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/solutions"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Briefcase className="h-4 w-4 inline-block mr-2" />
                        Solutions
                      </Link>
                      <Link
                        href="/tarifs"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <CreditCard className="h-4 w-4 inline-block mr-2" />
                        Tarifs
                      </Link>
                      <Link
                        href="/demo"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <MonitorSmartphone className="h-4 w-4 inline-block mr-2" />
                        Démo
                      </Link>
                      <Link
                        href="/faq"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <HelpCircle className="h-4 w-4 inline-block mr-2" />
                        FAQ
                      </Link>
                    </>
                  )}
                </div>
                
                <div className="py-6">
                  {isAuthenticated ? (
                    <a
                      href="#"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-medium leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLogout();
                      }}
                    >
                      <LogOut className="h-4 w-4 inline-block mr-2" />
                      Déconnexion
                    </a>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-medium leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogIn className="h-4 w-4 inline-block mr-2" />
                      Connexion
                    </Link>
                  )}
                  <div className="mt-4 px-3">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 