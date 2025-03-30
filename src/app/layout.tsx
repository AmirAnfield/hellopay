import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NavBar from "@/components/NavBar";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import ClientProviders from "./client-providers";
import Providers from "./providers";
import { ToastProvider } from "@/components/shared/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HelloPay - Solution de gestion de paie",
  description: "Plateforme de génération et gestion de bulletins de paie pour les PME",
};

// Note: Le composant SessionProviderWrapper gère le contexte client
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <SessionProviderWrapper>
            <ClientProviders>
              <NavBar />
              <main className="min-h-[calc(100vh-4rem)]">
                <div className="max-w-7xl px-4 mx-auto">
                  {children}
                </div>
              </main>
              <footer className="border-t py-6 mt-10">
                <div className="container max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                  <p className="text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} HelloPay. Tous droits réservés.
                  </p>
                  <div className="mt-4 md:mt-0 flex items-center space-x-4 text-sm text-gray-500">
                    <a href="/mentions-legales" className="hover:text-gray-900 hover:underline">Mentions légales</a>
                    <a href="/confidentialite" className="hover:text-gray-900 hover:underline">Politique de confidentialité</a>
                    <a href="/contact" className="hover:text-gray-900 hover:underline">Contact</a>
                  </div>
                </div>
              </footer>
              <ToastProvider />
            </ClientProviders>
          </SessionProviderWrapper>
        </Providers>
      </body>
    </html>
  );
}
