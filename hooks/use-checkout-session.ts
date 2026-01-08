// Hook para gerenciar sessão do checkout com timeout
// Evita que usuários fiquem com sessões abandonadas por muito tempo

import { useEffect, useRef, useState, useCallback } from 'react';

// Tempo máximo de inatividade em milissegundos (30 minutos)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// Tempo de aviso antes de expirar (5 minutos)
const WARNING_BEFORE_EXPIRY_MS = 5 * 60 * 1000;

interface UseCheckoutSessionOptions {
  /** Callback quando sessão expira */
  onSessionExpired: () => void;
  /** Se a sessão está ativa (ex: modal aberto ou em página de checkout) */
  isActive: boolean;
}

interface UseCheckoutSessionReturn {
  /** Se deve mostrar aviso de sessão prestes a expirar */
  showWarning: boolean;
  /** Minutos restantes até expirar */
  minutesRemaining: number;
  /** Reseta o timer de sessão (chamado em interações do usuário) */
  resetTimer: () => void;
  /** Fecha o aviso de sessão */
  dismissWarning: () => void;
}

/**
 * Hook para gerenciar sessão do checkout com timeout
 * - Monitora inatividade do usuário
 * - Mostra aviso antes de expirar
 * - Executa callback quando sessão expira
 */
export function useCheckoutSession({
  onSessionExpired,
  isActive,
}: UseCheckoutSessionOptions): UseCheckoutSessionReturn {
  const [showWarning, setShowWarning] = useState(false);
  const [minutesRemaining, setMinutesRemaining] = useState(0);
  
  // Refs para timers (evita re-renders desnecessários)
  const expiryTimeRef = useRef<number>(Date.now() + SESSION_TIMEOUT_MS);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Limpa todos os timers
   */
  const clearAllTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  /**
   * Inicia countdown quando aviso é mostrado
   */
  const startCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, expiryTimeRef.current - Date.now());
      const minutes = Math.ceil(remaining / 60000);
      setMinutesRemaining(minutes);

      if (remaining <= 0) {
        clearInterval(countdownIntervalRef.current!);
      }
    }, 1000);
  }, []);

  /**
   * Configura timers de sessão
   */
  const setupTimers = useCallback(() => {
    clearAllTimers();

    // Calcula tempos
    expiryTimeRef.current = Date.now() + SESSION_TIMEOUT_MS;
    const timeUntilWarning = SESSION_TIMEOUT_MS - WARNING_BEFORE_EXPIRY_MS;

    // Timer para mostrar aviso
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setMinutesRemaining(Math.ceil(WARNING_BEFORE_EXPIRY_MS / 60000));
      startCountdown();
    }, timeUntilWarning);

    // Timer para expirar sessão
    expiryTimerRef.current = setTimeout(() => {
      setShowWarning(false);
      onSessionExpired();
    }, SESSION_TIMEOUT_MS);
  }, [clearAllTimers, onSessionExpired, startCountdown]);

  /**
   * Reseta timer de sessão (chamado em interações)
   */
  const resetTimer = useCallback(() => {
    setShowWarning(false);
    setupTimers();
  }, [setupTimers]);

  /**
   * Fecha aviso sem resetar timer
   */
  const dismissWarning = useCallback(() => {
    setShowWarning(false);
  }, []);

  // Configura/limpa timers quando sessão fica ativa/inativa
  useEffect(() => {
    if (isActive) {
      setupTimers();

      // Reseta timer em interações do usuário
      const handleActivity = () => {
        // Não reseta se aviso já foi mostrado (força usuário a tomar ação)
        if (!showWarning) {
          resetTimer();
        }
      };

      // Monitora eventos de atividade
      const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
      events.forEach((event) => {
        window.addEventListener(event, handleActivity, { passive: true });
      });

      return () => {
        clearAllTimers();
        events.forEach((event) => {
          window.removeEventListener(event, handleActivity);
        });
      };
    } else {
      // Limpa timers quando sessão não está ativa
      clearAllTimers();
      setShowWarning(false);
    }
  }, [isActive, setupTimers, resetTimer, clearAllTimers, showWarning]);

  return {
    showWarning,
    minutesRemaining,
    resetTimer,
    dismissWarning,
  };
}

