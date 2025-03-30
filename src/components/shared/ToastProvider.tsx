"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";

export function ToastProvider() {
  const { theme } = useTheme();
  
  return (
    <>
      {/* ShadCN Toaster pour les notifications système */}
      <Toaster />
      
      {/* Sonner pour les notifications plus complexes avec des actions */}
      <SonnerToaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          className: "!bg-background !text-foreground border border-border",
          descriptionClassName: "text-muted-foreground",
          style: {
            border: "1px solid var(--border)",
            borderRadius: "0.5rem",
          }
        }}
        theme={theme as "light" | "dark" | "system"}
        richColors
      />
    </>
  );
} 