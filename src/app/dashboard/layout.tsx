'use client';

import React from 'react';
import { Search } from "@/components/dashboard/search";
import { UserNav } from "@/components/dashboard/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { SideNav } from "@/components/dashboard/side-nav";
import { Toaster } from "sonner";
import { PropsWithChildren } from "react";

// Note: Les métadonnées doivent être définies dans un fichier de composant serveur, pas dans un composant client
// export const metadata = {
//   title: "HelloPay - Dashboard",
//   description: "Gérez vos bulletins de paie simplement",
// };

export default function DashboardLayout({
  children,
}: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <SideNav 
          links={[
            {
              title: "Tableau de bord",
              href: "/dashboard",
              icon: "home",
            },
            {
              title: "Bulletins de paie",
              href: "/dashboard/payslips",
              icon: "receipt",
              links: [
                {
                  title: "Créer un bulletin",
                  href: "/dashboard/payslips/create",
                  icon: "plus",
                },
                {
                  title: "Historique",
                  href: "/dashboard/payslips",
                  icon: "history",
                },
              ],
            },
            {
              title: "Entreprises",
              href: "/dashboard/companies",
              icon: "building",
            },
            {
              title: "Employés",
              href: "/dashboard/employees",
              icon: "users",
              links: [
                {
                  title: "Liste des employés",
                  href: "/dashboard/employees",
                  icon: "list",
                },
                {
                  title: "Ajouter un employé",
                  href: "/dashboard/employees/create",
                  icon: "plus",
                },
              ],
            },
            {
              title: "Documents",
              href: "/dashboard/documents",
              icon: "file",
              links: [
                {
                  title: "Contrats",
                  href: "/dashboard/documents/contracts",
                  icon: "file-text",
                },
                {
                  title: "Attestations",
                  href: "/dashboard/documents/certificates",
                  icon: "badge",
                },
              ],
            },
            {
              title: "Paramètres",
              href: "/dashboard/settings",
              icon: "settings",
            },
            {
              title: "Diagnostics",
              href: "/dashboard/diagnostics",
              icon: "list",
            },
          ]}
        />
        <main className="flex-1 p-4">{children}</main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
} 