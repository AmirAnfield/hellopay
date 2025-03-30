"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="font-bold">
          HelloPay
        </span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/dashboard"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"
          )}
        >
          Tableau de bord
        </Link>
        <Link
          href="/dashboard/payslips"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/dashboard/payslips")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Bulletins
        </Link>
        <Link
          href="/dashboard/employees"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/dashboard/employees")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Employés
        </Link>
      </nav>
    </div>
  );
} 