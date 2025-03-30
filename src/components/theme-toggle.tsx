"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Effet pour gérer le montage côté client
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Ne rien afficher jusqu'au montage pour éviter l'hydratation incohérente
  if (!mounted) {
    return <div className="w-10 h-10" />  // espace réservé de même taille
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Changer de thème"
      className="rounded-full"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700" />
      )}
    </Button>
  )
} 