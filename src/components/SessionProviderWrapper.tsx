'use client';

import React from 'react';
import { AuthProvider } from '@/hooks/useAuth';

export const SessionProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}; 