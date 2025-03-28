"use client";

import { PropsWithChildren } from "react";

// Créer un provider simple sans dépendance à next-auth
export default function Providers({ children }: PropsWithChildren) {
  return <>{children}</>;
} 