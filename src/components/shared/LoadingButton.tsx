"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function LoadingButton({
  isLoading = false,
  loadingText,
  children,
  disabled,
  variant = "default",
  size = "default",
  className,
  onClick,
  ...props
}: LoadingButtonProps) {
  // Fonction qui gère le clic et empêche toute navigation par défaut
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Empêcher tout comportement par défaut inattendu
    e.preventDefault();
    
    // Appeler la fonction onClick passée en prop si elle existe
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button
      disabled={isLoading || disabled}
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleClick}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading && loadingText ? loadingText : children}
    </Button>
  );
} 