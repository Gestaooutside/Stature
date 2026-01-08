// Hook para sincronizar estado do Zustand entre abas do navegador
// Detecta mudanças no localStorage e atualiza o estado local

import { useEffect, useCallback } from 'react';

const CART_STORAGE_KEY = 'duo-cart-storage';

interface UseStorageSyncOptions {
  /** Callback quando carrinho é limpo em outra aba */
  onCartCleared: () => void;
  /** Callback quando checkout é finalizado em outra aba */
  onCheckoutFinalized: () => void;
  /** Se a sincronização está ativa */
  isActive: boolean;
}

/**
 * Hook para sincronizar estado do carrinho entre abas
 * Detecta quando o carrinho é modificado em outra aba e notifica
 */
export function useStorageSync({
  onCartCleared,
  onCheckoutFinalized,
  isActive,
}: UseStorageSyncOptions): void {
  /**
   * Manipula evento de mudança no localStorage
   * Disparado quando outra aba modifica o storage
   */
  const handleStorageChange = useCallback(
    (event: StorageEvent) => {
      // Ignora se não for a chave do carrinho
      if (event.key !== CART_STORAGE_KEY) return;

      // Se o novo valor for null, storage foi limpo
      if (event.newValue === null) {
        onCartCleared();
        return;
      }

      try {
        const newState = JSON.parse(event.newValue);
        const oldState = event.oldValue ? JSON.parse(event.oldValue) : null;

        // Detecta se carrinho foi limpo (items vazios)
        if (
          newState?.state?.items?.length === 0 &&
          oldState?.state?.items?.length > 0
        ) {
          // Verifica se foi finalização (payment teve status)
          // ou apenas limpeza manual
          if (
            oldState?.state?.payment?.status &&
            !newState?.state?.payment?.status
          ) {
            onCheckoutFinalized();
          } else {
            onCartCleared();
          }
        }
      } catch {
        // Ignora erros de parsing
      }
    },
    [onCartCleared, onCheckoutFinalized]
  );

  useEffect(() => {
    if (!isActive || typeof window === 'undefined') return;

    // Escuta evento de storage (disparado por outras abas)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isActive, handleStorageChange]);
}

/**
 * Hook simplificado para apenas recarregar dados do storage
 * Útil quando foco retorna para a aba
 */
export function useVisibilitySync(onVisible: () => void): void {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        onVisible();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onVisible]);
}

