'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HomeIcon, UsersIcon, BuildingIcon, FileTextIcon, FileDownIcon } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 md:py-6">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <Link href="/dashboard">
                <HomeIcon className="mr-2 h-4 w-4" />
                Tableau de bord
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <Link href="/dashboard/employees">
                <UsersIcon className="mr-2 h-4 w-4" />
                Employés
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <Link href="/dashboard/companies">
                <BuildingIcon className="mr-2 h-4 w-4" />
                Entreprises
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <Link href="/dashboard/payslips">
                <FileTextIcon className="mr-2 h-4 w-4" />
                Bulletins de paie
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <Link href="/dashboard/payslips/generate">
                <FileDownIcon className="mr-2 h-4 w-4" />
                Générer des bulletins
              </Link>
            </Button>
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
} 