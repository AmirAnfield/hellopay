"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { User, Settings, LogOut } from "lucide-react";
import { useCallback } from "react";

export function UserNav() {
  const { data: session, status } = useSession();
  const user = session?.user;
  
  // Fonction sécurisée pour obtenir les initiales de l'utilisateur
  const getUserInitials = useCallback((name?: string | null): string => {
    if (!name) return "HP";
    
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    
    return name.substring(0, 2).toUpperCase();
  }, []);
  
  // Fonction pour gérer la déconnexion de façon sécurisée
  const handleSignOut = useCallback(() => {
    signOut({ 
      callbackUrl: "/", 
      redirect: true 
    });
  }, []);
  
  // Si l'utilisateur n'est pas connecté, on ne montre pas le menu
  if (status === "loading") {
    return (
      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary">...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }
  
  if (status !== "authenticated") {
    return (
      <Link href="/auth/login">
        <Button variant="ghost" size="sm">
          Connexion
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image || undefined} alt="Photo de profil" />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getUserInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || "Utilisateur"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || "utilisateur@example.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/dashboard/profile" className="w-full">
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profil
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
          <Link href="/dashboard/settings" className="w-full">
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 