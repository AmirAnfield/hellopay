"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Receipt, 
  Building, 
  Users, 
  Plus, 
  History, 
  List, 
  FileText, 
  Award, 
  Settings,
  Archive
} from "lucide-react";

interface NavLink {
  title: string;
  href: string;
  icon?: string;
  links?: NavLink[];
}

interface SideNavProps {
  links: NavLink[];
}

export function SideNav({ links }: SideNavProps) {
  const pathname = usePathname();
  
  // Fonction pour déterminer si un lien est actif (correspondance exacte ou dossier parent)
  const isActive = (href: string) => {
    if (pathname === href) return true;
    if (href !== '/dashboard' && pathname?.startsWith(href + '/')) return true;
    return false;
  };

  // Fonction pour rendre l'icône appropriée
  const renderIcon = (iconName: string | undefined, className: string = "h-4 w-4") => {
    if (!iconName) return null;
    
    switch (iconName) {
      case "home": return <Home className={className} />;
      case "receipt": return <Receipt className={className} />;
      case "building": return <Building className={className} />;
      case "users": return <Users className={className} />;
      case "plus": return <Plus className={className} />;
      case "history": return <History className={className} />;
      case "list": return <List className={className} />;
      case "file": return <FileText className={className} />;
      case "file-text": return <FileText className={className} />;
      case "badge": return <Award className={className} />;
      case "settings": return <Settings className={className} />;
      case "archive": return <Archive className={className} />;
      default: return null;
    }
  };

  return (
    <nav className="hidden md:flex flex-col space-y-1 w-64 p-4 border-r h-[calc(100vh-4rem)] bg-card">
      {links.map((link) => (
        <div key={link.href} className="mb-2">
          <Link 
            href={link.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent",
              isActive(link.href) 
                ? "bg-primary/10 text-primary font-medium" 
                : "text-muted-foreground"
            )}
          >
            {link.icon && (
              <span className="mr-2 text-current">
                {renderIcon(link.icon)}
              </span>
            )}
            {link.title}
          </Link>
          
          {link.links && link.links.length > 0 && (
            <div className="ml-4 mt-1 space-y-1">
              {link.links.map((subLink) => (
                <Link
                  key={subLink.href}
                  href={subLink.href}
                  className={cn(
                    "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors hover:bg-accent/50",
                    isActive(subLink.href) 
                      ? "bg-primary/5 text-primary font-medium" 
                      : "text-muted-foreground"
                  )}
                >
                  {subLink.icon && (
                    <span className="mr-2 text-current">
                      {renderIcon(subLink.icon, "h-3.5 w-3.5")}
                    </span>
                  )}
                  {subLink.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
} 