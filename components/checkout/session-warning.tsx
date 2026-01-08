// Componente de aviso de sessão prestes a expirar
// Mostra modal de alerta quando sessão do checkout está expirando

'use client';

import { AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionWarningProps {
  /** Se deve mostrar o aviso */
  isOpen: boolean;
  /** Minutos restantes até expirar */
  minutesRemaining: number;
  /** Callback para continuar (reseta timer) */
  onContinue: () => void;
  /** Callback para sair do checkout */
  onExit: () => void;
}

/**
 * Modal de aviso de sessão expirando
 * Permite usuário continuar ou sair do checkout
 */
export function SessionWarning({
  isOpen,
  minutesRemaining,
  onContinue,
  onExit,
}: SessionWarningProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className={cn(
          'bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4',
          'animate-in zoom-in-95 fade-in duration-200'
        )}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Sessão Expirando
              </h3>
              <p className="text-sm text-neutral-600">
                Sua sessão de checkout está prestes a expirar
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-6 py-4 space-y-4">
          {/* Alerta */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Atenção!</p>
              <p>
                Por segurança, sua sessão expirará em{' '}
                <span className="font-bold">
                  {minutesRemaining} {minutesRemaining === 1 ? 'minuto' : 'minutos'}
                </span>
                . Os dados não salvos serão perdidos.
              </p>
            </div>
          </div>

          {/* Informação adicional */}
          <p className="text-sm text-neutral-600">
            Deseja continuar com sua compra? Clique em &quot;Continuar&quot; para
            manter sua sessão ativa e finalizar seu pedido.
          </p>
        </div>

        {/* Ações */}
        <div className="px-6 py-4 border-t border-neutral-200 flex gap-3">
          <button
            onClick={onExit}
            className="flex-1 px-4 py-2.5 rounded-lg border-2 border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
          >
            Sair
          </button>
          <button
            onClick={onContinue}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--color-brand-primary)] text-white font-medium hover:bg-[var(--color-brand-primary-dark)] transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

