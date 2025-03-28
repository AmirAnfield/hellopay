"use client";

import { useState } from "react";
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

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setIsMenuOpen(false);
    router.push("/");
  };

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-2"
                >
                  <User className="h-4 w-4" />
                  <span>{user?.name || "Mon compte"}</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
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
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

        {/* Menu mobile */}
        <div className="md:hidden flex items-center gap-4">
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
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            className="rounded-full"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Menu mobile ouvert */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-4 px-4">
            <nav className="flex flex-col gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 py-2 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                Accueil
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 py-2 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Tableau de bord
                  </Link>
                  
                  <Link
                    href="/dashboard/companies"
                    className="flex items-center gap-2 py-2 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Building2 className="h-4 w-4" />
                    Entreprises
                  </Link>
                  
                  <Link
                    href="/dashboard/employees"
                    className="flex items-center gap-2 py-2 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Users className="h-4 w-4" />
                    Employés
                  </Link>
                  
                  <Link
                    href="/payslip/new"
                    className="flex items-center gap-2 py-2 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FileText className="h-4 w-4" />
                    Nouveau bulletin
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/pricing"
                    className="flex items-center gap-2 py-2 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <CreditCard className="h-4 w-4" />
                    Tarifs
                  </Link>
                  <Link
                    href="/demo"
                    className="flex items-center gap-2 py-2 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FileText className="h-4 w-4" />
                    Démo
                  </Link>
                  <Link
                    href="/faq"
                    className="flex items-center gap-2 py-2 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FileText className="h-4 w-4" />
                    FAQ
                  </Link>
                </>
              )}
            </nav>

            {!isAuthenticated && (
              <div className="flex flex-col gap-3 pt-3 border-t">
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    <LogIn className="h-4 w-4 mr-2" />
                    Connexion
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    S&apos;inscrire
                  </Button>
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="flex flex-col gap-3 pt-3 border-t">
                <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Mon profil
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 