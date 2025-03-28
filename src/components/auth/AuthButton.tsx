"use client";

import { useState } from 'react';
import { Button } from '../ui/button';
import AuthModal from './AuthModal';
import { 
  UserIcon, 
  LogOut, 
  Settings, 
  LayoutDashboard, 
  FileText, 
  Building2, 
  Users, 
  ChevronDown 
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AuthButtonProps {
  isAuthenticated?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export function AuthButton({ 
  isAuthenticated = false, 
  userName = 'Utilisateur', 
  onLogout = () => {} 
}: AuthButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const handleOpenModal = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setIsModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsModalOpen(false);
    // Si on utilise un système d'authentification plus complexe, on pourrait mettre à jour l'état ici
  };

  if (isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <UserIcon className="h-4 w-4" />
              </div>
              <span className="ml-2 font-medium hidden sm:inline-block">{userName}</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link href="/dashboard" className="flex items-center w-full">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Tableau de bord</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/profile" className="flex items-center w-full">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/settings" className="flex items-center w-full">
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link href="/payslip" className="flex items-center w-full">
                <FileText className="mr-2 h-4 w-4" />
                <span>Fiches de paie</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/enterprises" className="flex items-center w-full">
                <Building2 className="mr-2 h-4 w-4" />
                <span>Entreprises</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/employees" className="flex items-center w-full">
                <Users className="mr-2 h-4 w-4" />
                <span>Employés</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Déconnexion</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center">
      <Button variant="default" onClick={() => handleOpenModal('login')} className="flex items-center gap-2">
        <UserIcon className="h-4 w-4" />
        <span>Connexion / Inscription</span>
      </Button>
      
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialMode={activeTab}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
} 