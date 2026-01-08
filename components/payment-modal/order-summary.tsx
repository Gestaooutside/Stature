// Resumo do pedido com subtotal, desconto, frete e total
// Exibe valores dinâmicos do carrinho com cálculo de frete

'use client';

import { Receipt } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart-store';
import { cn } from '@/lib/utils';
import { SHIPPING_CONFIG } from '@/lib/config/products';

interface OrderSummaryProps {
  className?: string;
}

/**
 * Componente de resumo do pedido
 * Exibe subtotal, desconto aplicado e total final
 */
export function OrderSummary({ className }: OrderSummaryProps) {
  const { getSubtotal, getDiscount, getTotal, getShipping, coupon, getTotalItems } =
    useCartStore();

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shipping = getShipping();
  const total = getTotal();
  const totalItems = getTotalItems();
  // ⚠️ NOTA: isFreeShipping sempre será false com frete fixo ativo
  // Mantida para compatibilidade com código comentado (funcionalidade desativada)
  const isFreeShipping = shipping === 0;

  /**
   * Formata valor em reais
   */
  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-4 md:p-6 lg:p-8',
        className
      )}
    >
      {/* Header */}
      <div className="mb-3 md:mb-4 flex items-center gap-1.5 md:gap-2 border-b border-neutral-200 pb-3 md:pb-4">
        <Receipt className="h-4 w-4 md:h-5 md:w-5 text-neutral-600" />
        <h3 className="text-sm md:text-base font-semibold text-neutral-900">Resumo do Pedido</h3>
      </div>

      {/* Itens do resumo */}
      <div className="space-y-2 md:space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm text-neutral-600">
            Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'itens'}):
          </span>
          <span className="text-sm md:text-base font-semibold text-neutral-900">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {/* Desconto (se aplicado) */}
        {coupon && discount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-green-600">
              Desconto ({coupon.code}):
            </span>
            <span className="text-sm md:text-base font-semibold text-green-600">
              - {formatCurrency(discount)}
            </span>
          </div>
        )}

        {/* Frete */}
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm text-neutral-600">
            Frete:
          </span>
          <span className={cn(
            "text-sm md:text-base font-semibold",
            isFreeShipping ? "text-green-600" : "text-neutral-900"
          )}>
            {isFreeShipping ? 'Grátis' : formatCurrency(shipping)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-200 pt-2 md:pt-3">
          {/* Total */}
          <div className="flex items-baseline justify-between">
            <span className="text-sm md:text-base font-semibold text-neutral-900">
              Total:
            </span>
            <div className="flex flex-col items-end">
              <span className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-brand-primary-dark)]">
                {formatCurrency(total)}
              </span>
              {discount > 0 && (
                <span className="text-[10px] md:text-xs text-green-600">
                  Você economizou {formatCurrency(discount)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Informação adicional - FRETE GRÁTIS DESATIVADO */}
      {/* 
      ⚠️ FUNCIONALIDADE DESATIVADA: Frete grátis acima de threshold
      Para reativar: descomentar o bloco abaixo e ajustar calculateShipping()
      
      <div className="mt-3 md:mt-4 rounded-lg bg-[var(--color-brand-primary-light)] p-2.5 md:p-3">
        <p className="text-[10px] md:text-xs text-neutral-700">
          {isFreeShipping ? (
            <>
              <span className="font-semibold text-green-600">✓ Frete grátis</span> aplicado ao seu pedido!
            </>
          ) : (
            <>
              <span className="font-semibold">Frete grátis</span> para todo o Brasil
              em compras acima de R$ {SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD.toFixed(2).replace('.', ',')}
            </>
          )}
        </p>
      </div>
      */}
    </div>
  );
}
