'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ width = 28, height = 28, className = '' }: LogoProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return (
      <div className={`w-${width} h-${height} bg-primary/10 flex items-center justify-center text-sm ${className}`}>
        HP
      </div>
    );
  }

  return (
    <div className={className}>
      <Image
        src="/images/logo/logo_hellopay.png"
        alt="HelloPay Logo"
        width={width}
        height={height}
        onError={(e) => {
          // Fallback en cas d'erreur de chargement
          const target = e.target as HTMLElement;
          target.outerHTML = `<div class="w-${width} h-${height} bg-primary/10 flex items-center justify-center text-sm">HP</div>`;
        }}
      />
    </div>
  );
}

export default Logo; 