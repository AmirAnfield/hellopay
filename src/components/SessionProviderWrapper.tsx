'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export default function SessionProviderWrapper({ 
  children 
}: { 
  children: ReactNode 
}) {
  return (
    <SessionProvider
      maxAge={30 * 24 * 60 * 60}
      updateAge={24 * 60 * 60}
      strategy="jwt"
    >
      {children}
    </SessionProvider>
  );
} 