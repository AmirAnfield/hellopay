import type { Metadata, Viewport } from "next";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import "@/styles/globals.css";
import { ThemeScript } from "@/components/theme-provider";
import NavBar from "@/components/NavBar";
import Script from 'next/script'

// Définir la police de l'application
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Configuration du viewport
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#090909" },
  ],
};

// Métadonnées pour SEO
export const metadata: Metadata = {
  title: {
    default: "HelloPay - Système de gestion de paie",
    template: "%s | HelloPay",
  },
  description:
    "Gérez facilement vos bulletins de paie, décomptes d'heures et paiements de vos employés.",
  keywords: [
    "paie",
    "gestion",
    "bulletin",
    "salaire",
    "entreprise",
    "employé",
    "France",
    "comptabilité",
  ],
  authors: [{ name: "HelloPay", url: "https://hellopay.fr" }],
  creator: "HelloPay",
  icons: {
    icon: "/favicon.ico",
  },
};

// Layout principal de l'application
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Script 
          src="https://www.google.com/recaptcha/enterprise.js?render=6LdUnwUrAAAAAL3u-4zxXrmXOCLMBEVLjkkd2Y4_"
        />
        <Providers>
          <div className="flex min-h-screen flex-col">
            <NavBar />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
