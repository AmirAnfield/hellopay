import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

/**
 * Composant d'écran de chargement à afficher pendant les opérations asynchrones
 */
export default function LoadingScreen({ message = "Chargement..." }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
} 