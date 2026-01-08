// Campo de input para cupom de desconto
// Valida cupons demonstrativos e exibe feedback visual

'use client';

import { useState } from 'react';
import { Tag, Check, X, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart-store';
import { cn } from '@/lib/utils';

/**
 * Componente de input para aplicar cupom de desconto
 * Valida cupons demonstrativos e exibe mensagens de feedback
 */
export function DiscountInput() {
  const { coupon, applyCoupon, removeCoupon } = useCartStore();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  /**
   * Tenta aplicar cupom de desconto
   * Valida cupom via API do servidor
   */
  const handleApplyCoupon = async () => {
    if (!inputValue.trim()) {
      setError('Digite um cupom');
      return;
    }

    // Obtém subtotal do carrinho para validar valor mínimo
    const subtotal = useCartStore.getState().getSubtotal();

    try {
      // Chama API de validação de cupom
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inputValue.trim(),
          subtotal,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        // Aplica cupom validado no store com tipo de desconto e recorrência
        applyCoupon(
          inputValue.trim(),
          data.discountType,
          data.discount,
          data.isRecurring,
          data.recurringCycle
        );
        setInputValue('');
        setError('');
      } else {
        // Exibe mensagem de erro do servidor
        setError(data.message || 'Cupom inválido');
      }
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      setError('Erro ao validar cupom. Tente novamente.');
    }
  };

  /**
   * Remove cupom aplicado
   */
  const handleRemoveCoupon = () => {
    removeCoupon();
    setInputValue('');
    setError('');
  };

  /**
   * Permite aplicar cupom com Enter
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  return (
    <div className="w-full space-y-2 md:space-y-3">
      {/* Label */}
      <label
        htmlFor="coupon-input"
        className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700"
      >
        <Tag className="h-3.5 w-3.5 md:h-4 md:w-4" />
        Cupom de desconto
      </label>

      {/* Input e botão */}
      <div className="flex gap-1.5 md:gap-2">
        <div className="relative flex-1">
          <input
            id="coupon-input"
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value.toUpperCase());
              setError(''); // Limpa erro ao digitar
            }}
            onKeyPress={handleKeyPress}
            disabled={!!coupon}
            placeholder="Digite seu cupom"
            className={cn(
              'w-full rounded-lg border px-3 py-2 md:px-4 md:py-3 font-mono text-xs md:text-sm uppercase transition-all',
              'placeholder:text-neutral-400 placeholder:normal-case',
              'focus:outline-none focus:ring-2',
              error
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : coupon
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : 'border-neutral-200 bg-white focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20',
              coupon && 'cursor-not-allowed'
            )}
          />

          {/* Ícone de status */}
          {error && (
            <AlertCircle className="absolute right-2 md:right-3 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-red-500" />
          )}
          {coupon && (
            <Check className="absolute right-2 md:right-3 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-green-600" />
          )}
        </div>

        {coupon ? (
          <button
            onClick={handleRemoveCoupon}
            className="flex items-center gap-1 md:gap-2 rounded-full border-2 border-red-200 bg-white px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-semibold text-red-600 transition-all hover:border-red-300 hover:bg-red-50 active:scale-95"
          >
            <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Remover</span>
          </button>
        ) : (
          <button
            onClick={handleApplyCoupon}
            disabled={!inputValue.trim()}
            className={cn(
              'rounded-full px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm font-semibold transition-all whitespace-nowrap',
              inputValue.trim()
                ? 'bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-dark)] active:scale-95'
                : 'cursor-not-allowed bg-neutral-100 text-neutral-400'
            )}
          >
            Aplicar
          </button>
        )}
      </div>

      {/* Mensagens de feedback */}
      {error && (
        <p className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-red-600">
          <AlertCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
          {error}
        </p>
      )}

      {coupon && (
        <div className={cn(
          "flex items-center justify-between rounded-lg px-3 py-2 md:px-4 md:py-3",
          coupon.isRecurring
            ? "bg-blue-50 border-2 border-blue-200"
            : "bg-green-50"
        )}>
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
            <Check className={cn(
              "h-3.5 w-3.5 md:h-4 md:w-4",
              coupon.isRecurring ? "text-blue-600" : "text-green-600"
            )} />
            <span className={cn(
              "text-xs md:text-sm font-medium",
              coupon.isRecurring ? "text-blue-700" : "text-green-700"
            )}>
              {coupon.isRecurring ? "Cupom recorrente aplicado:" : "Cupom aplicado:"}
            </span>
            <span className={cn(
              "font-mono text-xs md:text-sm font-bold",
              coupon.isRecurring ? "text-blue-800" : "text-green-800"
            )}>
              {coupon.code}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {coupon.isRecurring && (
              <span className="text-xs md:text-sm font-medium text-blue-600 whitespace-nowrap bg-blue-100 px-2 py-1 rounded">
                Assinatura Mensal
              </span>
            )}
            <span className={cn(
              "text-xs md:text-sm font-bold whitespace-nowrap",
              coupon.isRecurring ? "text-blue-700" : "text-green-700"
            )}>
              {coupon.discountType === 'percentage'
                ? `${coupon.discount}% OFF`
                : `R$ ${coupon.discount.toFixed(2)} OFF`}
            </span>
          </div>
        </div>
      )}

      {/* Aviso adicional sobre cupom recorrente */}
      {coupon && coupon.isRecurring && (
        <div className="rounded-lg md:rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100/50 p-3 md:p-4 border-2 border-blue-200">
          <div className="flex items-start gap-2 md:gap-3">
            <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs md:text-sm text-blue-900 font-semibold">
                Assinatura Recorrente Ativada
              </p>
              <p className="text-xs md:text-sm text-blue-800 mt-1">
                Este cupom ativará cobranças mensais automáticas no seu cartão de crédito.
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Confirme os termos de recorrência antes de continuar para o pagamento.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
