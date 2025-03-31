"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Building2,
  CreditCard,
  File,
  FileText,
  Home,
  LogIn,
  LogOut,
  Menu,
  Settings,
  User,
  Users,
  X,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setMobileMenuOpen(false);
    router.push("/");
  };

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <File className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">HelloPay</span>
          </Link>

          {/* Navigation principale - Desktop */}
          <nav className="hidden md:flex items-center gap-8 ml-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Accueil
            </Link>

            {isAuthenticated ? (
              // Liens pour utilisateurs authentifiés
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname?.startsWith("/dashboard") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Tableau de bord
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary">
                    <span className={
                      pathname?.includes("/companies") || pathname?.includes("/employees") 
                        ? "text-primary" 
                        : "text-muted-foreground"
                    }>
                      Gestion
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-background border shadow-lg">
                    <DropdownMenuItem onClick={() => router.push("/dashboard/companies")}>
                      <Building2 className="h-4 w-4 mr-2" />
                      Entreprises
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/employees")}>
                      <Users className="h-4 w-4 mr-2" />
                      Employés
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/payslips/create")}>
                      <FileText className="h-4 w-4 mr-2" />
                      Nouveau bulletin
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link
                  href="/dashboard/documents"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname?.startsWith("/dashboard/documents") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Documents
                </Link>
              </>
            ) : (
              // Liens pour visiteurs
              <>
                <Link
                  href="/pricing"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/pricing" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Tarifs
                </Link>
                <Link
                  href="/demo"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/demo" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Démo
                </Link>
                <Link
                  href="/faq"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/faq" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  FAQ
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Actions - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {/* Sélecteur de thème supprimé */}
          
          {isAuthenticated ? (
            // Utilisateur connecté - Menu du profil
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-2"
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">{user?.name || "Mon compte"}</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background border shadow-lg">
                <DropdownMenuLabel className="flex justify-between items-center">
                  <span>Mon compte</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/profile/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/profile/billing")}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Facturation
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs">Gestion</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/companies")}>
                    <Building2 className="h-4 w-4 mr-2" />
                    Mes entreprises
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/employees")}>
                    <Users className="h-4 w-4 mr-2" />
                    Mes employés
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/documents")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Documents
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Utilisateur non connecté - Bouton de connexion unifié
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center gap-2 px-3 py-2">
                  <LogIn className="h-4 w-4" />
                  Se connecter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background border shadow-lg">
                <DropdownMenuItem onClick={() => router.push("/auth/login")}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Connexion
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/auth/register")}>
                  <User className="h-4 w-4 mr-2" />
                  Inscription
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                <File className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">HelloPay</span>
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
                  <Link
                    href="/"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium leading-7 text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Home className="h-4 w-4 inline-block mr-2" />
                    Accueil
                  </Link>
                  
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 inline-block mr-2" />
                        Tableau de bord
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
                        href="/pricing"
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
                        <FileText className="h-4 w-4 inline-block mr-2" />
                        Démo
                      </Link>
                      <Link
                        href="/faq"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FileText className="h-4 w-4 inline-block mr-2" />
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
                    <>
                      <Link
                        href="/auth/login"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-medium leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LogIn className="h-4 w-4 inline-block mr-2" />
                        Connexion
                      </Link>
                      <Link
                        href="/auth/register"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-medium leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 inline-block mr-2" />
                        Inscription
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 