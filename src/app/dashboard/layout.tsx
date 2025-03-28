"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  Home, 
  FileText, 
  Users, 
  FileCheck, 
  BarChart, 
  Settings, 
  Bell, 
  LogOut, 
  Menu, 
  X,
  PlusCircle,
  Search,
  ChevronDown,
  HelpCircle
} from "lucide-react";
import { Toaster } from "sonner";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("Utilisateur");
  const [userInitial, setUserInitial] = useState("U");
  const [notifications, setNotifications] = useState(2);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserInfo() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/auth/login");
        return;
      }
      
      try {
        const { data } = await supabase
          .from("users")
          .select("name")
          .eq("id", session.user.id)
          .single();
        
        if (data?.name) {
          setUserName(data.name);
          setUserInitial(data.name.charAt(0).toUpperCase());
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    }
    
    getUserInfo();
  }, [router]);

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: Home },
    { name: 'Fiches de paie', href: '/dashboard/payslips', icon: FileText },
    { name: 'Employés', href: '/dashboard/employees', icon: Users },
    { name: 'Contrats', href: '/dashboard/contracts', icon: FileCheck },
    { name: 'Calculateur', href: '/dashboard/payroll-calculator', icon: BarChart },
  ];

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };
  
  // Classes pour les liens de navigation
  const navLinkClass = (path: string) => `
    flex items-center px-3 py-2 text-sm font-medium rounded-md 
    ${isActive(path) 
      ? 'text-blue-600 bg-blue-50' 
      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}
    transition-colors duration-150 ease-in-out
  `;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex items-center flex-shrink-0 px-4 mb-5">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                HelloPay
              </Link>
            </div>
            
            {/* Create new button */}
            <div className="px-4 mb-6">
              <button 
                className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                onClick={() => router.push('/dashboard/payslips/new')}
              >
                <PlusCircle size={16} />
                <span>Nouvelle fiche de paie</span>
              </button>
            </div>
            
            {/* Search */}
            <div className="px-4 mb-6">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="block w-full rounded-md border border-gray-200 py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="mt-1 flex-1 space-y-1 px-2">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href} className={navLinkClass(item.href)}>
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* User section */}
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                {userInitial}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{userName}</p>
                <button 
                  onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 mt-1"
                >
                  <LogOut size={12} />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar */}
      <div className={`
        fixed inset-0 z-40 md:hidden transition-opacity duration-300 ease-in-out
        ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}>
        <div className="absolute inset-0 bg-gray-600 opacity-75" onClick={() => setMenuOpen(false)}></div>
        
        <div className="relative flex h-full w-3/4 max-w-xs flex-col overflow-y-auto bg-white pt-5 pb-4">
          <div className="absolute right-0 top-0 -mr-12 pt-2">
            <button
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setMenuOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              HelloPay
            </Link>
          </div>
          
          {/* Create new button */}
          <div className="px-4 mb-6">
            <button 
              className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              onClick={() => {
                router.push('/dashboard/payslips/new');
                setMenuOpen(false);
              }}
            >
              <PlusCircle size={16} />
              <span>Nouvelle fiche de paie</span>
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {navigation.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                className={navLinkClass(item.href)}
                onClick={() => setMenuOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* User section */}
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                {userInitial}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{userName}</p>
                <button 
                  onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 mt-1"
                >
                  <LogOut size={12} />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center md:hidden">
              <button
                className="text-gray-500 hover:text-gray-600 focus:outline-none"
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex items-center ml-auto">
              {/* Help button */}
              <button className="ml-3 p-1 text-gray-400 hover:text-gray-500">
                <HelpCircle className="h-5 w-5" />
              </button>
              
              {/* Notifications */}
              <button className="ml-3 p-1 relative text-gray-400 hover:text-gray-500">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute right-0 top-0 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center transform translate-x-1/3 -translate-y-1/3">
                    {notifications}
                  </span>
                )}
              </button>
              
              {/* User dropdown - mobile only */}
              <div className="ml-3 relative md:hidden">
                <button className="flex items-center text-gray-400 hover:text-gray-500">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    {userInitial}
                  </div>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
      
      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
} 