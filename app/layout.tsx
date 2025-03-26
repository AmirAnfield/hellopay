import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Import des composants layout
import Navbar from "../src/components/layout/Navbar";
import Footer from "../src/components/layout/Footer";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HelloPay - Solution de fiches de paie",
  description: "Plateforme de génération de fiches de paie simple et sécurisée",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
