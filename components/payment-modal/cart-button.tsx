// Botão do carrinho com badge de contador de itens
// Exibido no canto superior direito do modal

'use client';

import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart-store';
import { cn } from '@/lib/utils';

interface CartButtonProps {
  onClick?: () => void;
  className?: string;
}

/**
 * Botão do carrinho com badge indicador de quantidade
 * Exibe número total de itens no carrinho
 */
export function CartButton({ onClick, className }: CartButtonProps) {
  const { getTotalItems, toggleCart } = useCartStore();
  const totalItems = getTotalItems();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toggleCart();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'group relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white transition-all hover:bg-[var(--color-brand-primary)] hover:shadow-lg active:scale-95',
        'border-2 border-neutral-200 hover:border-[var(--color-brand-primary-dark)]',
        className
      )}
      aria-label={`Carrinho com ${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}
    >
      {/* Ícone do carrinho */}
      <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-neutral-700 transition-colors group-hover:text-white" />

      {/* Badge com contador */}
      {totalItems > 0 && (
        <div className="absolute -right-0.5 -top-0.5 md:-right-1 md:-top-1 flex h-5 min-w-[20px] md:h-6 md:min-w-[24px] items-center justify-center rounded-full bg-[var(--color-dia-primary)] px-1 md:px-1.5 shadow-md ring-2 ring-white">
          <span className="text-[10px] md:text-xs font-bold text-white">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        </div>
      )}

      {/* Animação de pulso quando há itens */}
      {totalItems > 0 && (
        <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-[var(--color-dia-primary)] opacity-20" />
      )}
    </button>
  );
}
