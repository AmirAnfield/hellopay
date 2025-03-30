"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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

  return (
    <nav className="flex flex-col space-y-1 w-[240px] p-4 border-r h-[calc(100vh-4rem)]">
      {links.map((link) => (
        <div key={link.href} className="mb-2">
          <Link 
            href={link.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
              pathname === link.href 
                ? "bg-accent text-accent-foreground font-medium" 
                : "hover:bg-accent/50"
            )}
          >
            {link.icon && (
              <span className="mr-2 text-muted-foreground">
                {/* Ici vous pourriez utiliser des icônes dynamiques, mais pour simplifier: */}
                {link.icon === "home" && "🏠"}
                {link.icon === "receipt" && "🧾"}
                {link.icon === "building" && "🏢"}
                {link.icon === "users" && "👥"}
                {link.icon === "plus" && "➕"}
                {link.icon === "history" && "📜"}
                {link.icon === "list" && "📋"}
                {link.icon === "file" && "📄"}
                {link.icon === "file-text" && "📝"}
                {link.icon === "badge" && "🏅"}
                {link.icon === "settings" && "⚙️"}
              </span>
            )}
            {link.title}
          </Link>
          
          {link.links && (
            <div className="ml-4 mt-1 space-y-1">
              {link.links.map((subLink) => (
                <Link
                  key={subLink.href}
                  href={subLink.href}
                  className={cn(
                    "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                    pathname === subLink.href 
                      ? "bg-accent/60 text-accent-foreground font-medium" 
                      : "hover:bg-accent/30 text-muted-foreground"
                  )}
                >
                  {subLink.icon && (
                    <span className="mr-2 text-muted-foreground text-xs">
                      {subLink.icon === "plus" && "➕"}
                      {subLink.icon === "list" && "📋"}
                      {subLink.icon === "file-text" && "📝"}
                      {subLink.icon === "badge" && "🏅"}
                      {subLink.icon === "history" && "📜"}
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