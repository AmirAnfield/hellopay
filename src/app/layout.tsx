import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeScript } from "@/components/theme-provider";
import NavBar from "@/components/NavBar";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";
import Script from 'next/script'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HelloPay - Solution de gestion de paie",
  description: "Plateforme de génération et gestion de bulletins de paie pour les PME",
};

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
      <body className={cn(inter.className, "min-h-screen bg-background")}>
        <Script 
          src="https://www.google.com/recaptcha/enterprise.js?render=6LdUnwUrAAAAAL3u-4zxXrmXOCLMBEVLjkkd2Y4_"
          strategy="afterInteractive"
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
