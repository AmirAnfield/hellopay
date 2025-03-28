import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import NavBar from "@/components/NavBar";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

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
      <body className={`${inter.className} min-h-screen bg-background`}>
        <SessionProviderWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NavBar />
            <main className="flex-1">{children}</main>
            <footer className="border-t py-6">
              <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-center text-sm text-muted-foreground md:text-left">
                  &copy; {new Date().getFullYear()} HelloPay. Tous droits réservés.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <a href="/mentions-legales" className="hover:underline">Mentions légales</a>
                  <a href="/confidentialite" className="hover:underline">Confidentialité</a>
                  <a href="/contact" className="hover:underline">Contact</a>
                </div>
              </div>
            </footer>
            <Toaster />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
