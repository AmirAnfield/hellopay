'use client';

import React from 'react';
import { SideNav } from "@/components/dashboard/side-nav";
import { Toaster } from "sonner";
import { PropsWithChildren } from "react";
import AuthGuard from "@/components/auth/AuthGuard";

// Note: Les métadonnées doivent être définies dans un fichier de composant serveur, pas dans un composant client
// export const metadata = {
//   title: "HelloPay - Dashboard",
//   description: "Gérez vos bulletins de paie simplement",
// };

export default function DashboardLayout({
  children,
}: PropsWithChildren) {
  return (
    <AuthGuard>
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
                title: "Entreprises",
                href: "/dashboard/companies",
                icon: "building",
              },
              {
                title: "Employés",
                href: "/dashboard/employees",
                icon: "users",
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
              {
                title: "Test du workflow",
                href: "/workflow-test",
                icon: "list",
              },
              {
                title: "Test Firebase",
                href: "/test-firebase",
                icon: "file",
              },
            ]}
          />
          <main className="flex-1 p-4">{children}</main>
        </div>
        <Toaster richColors position="top-right" />
      </div>
    </AuthGuard>
  );
} 