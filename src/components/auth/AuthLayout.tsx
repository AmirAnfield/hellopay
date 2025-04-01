"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from 'next/image';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/logo.svg" 
              alt="HelloPay Logo" 
              width={32} 
              height={32} 
              className="h-8 w-auto"
            />
            <span className="font-bold text-primary">HelloPay</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center gap-4 sm:gap-6">
              {pathname !== "/auth/login" && (
                <Link href="/auth/login" className="text-sm font-medium hover:underline">
                  Connexion
                </Link>
              )}
              {pathname !== "/auth/register" && (
                <Link href="/auth/register" className="text-sm font-medium hover:underline">
                  Inscription
                </Link>
              )}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center text-center justify-center text-sm">
          <p>© {new Date().getFullYear()} HelloPay. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
} 