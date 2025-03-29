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
  Moon,
  Settings,
  Sun,
  User,
  Users,
  X,
  ChevronDown,
  LayoutDashboard,
  AlertTriangle,
  Mail,
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
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = status === "authenticated";
  const user = session?.user;
  // Vérifier si l'email est vérifié
  const emailVerified = !!session?.user && 'emailVerified' in session.user && !!session.user.emailVerified;

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
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/companies")}>
                      <Building2 className="h-4 w-4 mr-2" />
                      Entreprises
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/employees")}>
                      <Users className="h-4 w-4 mr-2" />
                      Employés
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/payslip/new")}>
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
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Changer de thème</span>
          </Button>

          {isAuthenticated ? (
            <>
              {/* Indicateur d'email non vérifié */}
              {!emailVerified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/auth/verify/pending">
                        <Button variant="outline" size="sm" className="gap-2 text-amber-600 border-amber-400 hover:bg-amber-50">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="hidden sm:inline">Vérifiez votre email</span>
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Votre email n&apos;est pas vérifié. Cliquez pour envoyer une vérification.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 px-3 py-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="max-w-[120px] truncate">{user?.name || "Mon compte"}</span>
                    {!emailVerified && (
                      <Badge variant="outline" className="h-2 w-2 rounded-full bg-amber-500 p-0" />
                    )}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Mon compte</span>
                    {!emailVerified && (
                      <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-200">
                        Non vérifié
                      </Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!emailVerified && (
                    <DropdownMenuItem onClick={() => router.push("/auth/verify/pending")}>
                      <Mail className="h-4 w-4 mr-2 text-amber-500" />
                      Vérifier email
                    </DropdownMenuItem>
                  )}
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
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/auth/login")}
                className="px-4"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Connexion
              </Button>
              <Button
                size="sm"
                onClick={() => router.push("/auth/register")}
                className="px-4"
              >
                S&apos;inscrire
              </Button>
            </>
          )}
        </div>

        {/* Bouton menu mobile */}
        <div className="md:hidden flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Changer de thème</span>
          </Button>

          {/* Indicateur d'email non vérifié (version mobile) */}
          {isAuthenticated && !emailVerified && (
            <Link href="/auth/verify/pending">
              <Button variant="outline" size="icon" className="rounded-full text-amber-600 border-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            className="rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-6 border-t bg-background">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md ${
                pathname === "/" ? "bg-primary-50 text-primary" : "text-foreground"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="h-4 w-4 mr-2 inline-block" />
              Accueil
            </Link>

            {isAuthenticated ? (
              // Liens pour utilisateurs authentifiés
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md ${
                    pathname?.startsWith("/dashboard") ? "bg-primary-50 text-primary" : "text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2 inline-block" />
                  Tableau de bord
                </Link>

                <Link
                  href="/dashboard/companies"
                  className={`px-3 py-2 rounded-md ${
                    pathname?.includes("/companies") ? "bg-primary-50 text-primary" : "text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Building2 className="h-4 w-4 mr-2 inline-block" />
                  Entreprises
                </Link>

                <Link
                  href="/dashboard/employees"
                  className={`px-3 py-2 rounded-md ${
                    pathname?.includes("/employees") ? "bg-primary-50 text-primary" : "text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="h-4 w-4 mr-2 inline-block" />
                  Employés
                </Link>

                <Link
                  href="/dashboard/documents"
                  className={`px-3 py-2 rounded-md ${
                    pathname?.includes("/documents") ? "bg-primary-50 text-primary" : "text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="h-4 w-4 mr-2 inline-block" />
                  Documents
                </Link>

                <Link
                  href="/profile"
                  className={`px-3 py-2 rounded-md ${
                    pathname?.includes("/profile") ? "bg-primary-50 text-primary" : "text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-2 inline-block" />
                  Mon compte
                </Link>

                {!emailVerified && (
                  <Link
                    href="/auth/verify/pending"
                    className="px-3 py-2 rounded-md bg-amber-50 text-amber-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2 inline-block" />
                    Vérifier mon email
                  </Link>
                )}

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </>
            ) : (
              // Liens pour visiteurs
              <>
                <Link
                  href="/pricing"
                  className={`px-3 py-2 rounded-md ${
                    pathname === "/pricing" ? "bg-primary-50 text-primary" : "text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <CreditCard className="h-4 w-4 mr-2 inline-block" />
                  Tarifs
                </Link>
                <Link
                  href="/demo"
                  className={`px-3 py-2 rounded-md ${
                    pathname === "/demo" ? "bg-primary-50 text-primary" : "text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="h-4 w-4 mr-2 inline-block" />
                  Démo
                </Link>
                <Link
                  href="/faq"
                  className={`px-3 py-2 rounded-md ${
                    pathname === "/faq" ? "bg-primary-50 text-primary" : "text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="h-4 w-4 mr-2 inline-block" />
                  FAQ
                </Link>

                <div className="flex flex-col gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => {
                      router.push("/auth/login");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Connexion
                  </Button>
                  <Button
                    variant="default"
                    className="w-full justify-center"
                    onClick={() => {
                      router.push("/auth/register");
                      setMobileMenuOpen(false);
                    }}
                  >
                    S&apos;inscrire
                  </Button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
} 