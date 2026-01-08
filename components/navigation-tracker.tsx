// Rastreador de navegação para saber a rota anterior
// Mantém histórico simples em sessionStorage para uso no checkout

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function NavigationTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;

    const currentPath = sessionStorage.getItem('duo-current-path');
    if (currentPath) {
      sessionStorage.setItem('duo-prev-path', currentPath);
    }

    sessionStorage.setItem('duo-current-path', pathname);
  }, [pathname]);

  return null;
}


