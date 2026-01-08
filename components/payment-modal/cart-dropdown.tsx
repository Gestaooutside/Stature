// Dropdown do carrinho que exibe itens selecionados
// Aparece ao clicar no botão do carrinho

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, Trash2, X } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart-store';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
}

/**
 * Dropdown do carrinho com lista de itens
 * Mostra nome, quantidade, preço e total
 */
export function CartDropdown({ isOpen, onClose, onContinue }: CartDropdownProps) {
  const { items, removeItem, getTotal } = useCartStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Fecha dropdown ao clicar fora
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const total = getTotal();
  const isEmpty = items.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-12 md:top-14 z-50 w-72 md:w-80 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-3 py-2 md:px-4 md:py-3">
            <div className="flex items-center gap-1.5 md:gap-2">
              <ShoppingBag className="h-4 w-4 md:h-5 md:w-5 text-neutral-600" />
              <h3 className="text-sm md:text-base font-semibold text-neutral-900">
                Meu Carrinho
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 transition-colors hover:bg-neutral-200"
              aria-label="Fechar carrinho"
            >
              <X className="h-3.5 w-3.5 md:h-4 md:w-4 text-neutral-600" />
            </button>
          </div>

          {/* Lista de itens */}
          <div className="max-h-60 md:max-h-80 overflow-y-auto">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center gap-2 md:gap-3 py-8 md:py-12">
                <ShoppingBag className="h-10 w-10 md:h-12 md:w-12 text-neutral-300" />
                <p className="text-xs md:text-sm text-neutral-500">
                  Seu carrinho está vazio
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="group flex items-center gap-2 md:gap-3 p-3 md:p-4 transition-colors hover:bg-neutral-50"
                  >
                    {/* Info do produto */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm md:text-base font-medium text-neutral-900 truncate">
                        {item.product.name}
                      </h4>
                      <div className="mt-0.5 md:mt-1 flex items-baseline gap-1.5 md:gap-2">
                        <span className="text-xs md:text-sm text-neutral-600">
                          {item.quantity}x
                        </span>
                        <span className="text-xs md:text-sm font-semibold text-[var(--color-brand-primary-dark)]">
                          R$ {item.product.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>

                    {/* Total do item + botão remover */}
                    <div className="flex items-center gap-2 md:gap-3">
                      {/* Preço total do item */}
                      <span className="text-sm md:text-base font-bold text-neutral-900 whitespace-nowrap">
                        R${' '}
                        {(item.product.price * item.quantity)
                          .toFixed(2)
                          .replace('.', ',')}
                      </span>

                      {/* Botão remover - sempre visível no mobile, hover no desktop */}
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className={cn(
                          'flex items-center justify-center rounded-full p-1.5 md:p-2',
                          'text-neutral-400 hover:text-red-600 hover:bg-red-50',
                          // Mobile: sempre visível | Desktop: aparece no hover
                          'opacity-100 md:opacity-0 md:group-hover:opacity-100',
                          'transition-all active:scale-95'
                        )}
                        aria-label={`Remover ${item.product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer com total e botão continuar */}
          {!isEmpty && (
            <div className="border-t border-neutral-200 bg-neutral-50 p-3 md:p-4">
              <div className="mb-3 md:mb-4 flex items-center justify-between">
                <span className="text-sm md:text-base font-semibold text-neutral-700">Total:</span>
                <span className="font-display text-xl md:text-2xl font-bold text-[var(--color-brand-primary-dark)]">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <button
                onClick={onContinue}
                className="w-full rounded-lg bg-[var(--color-brand-primary)] py-2.5 md:py-3 text-sm md:text-base font-semibold text-white transition-all hover:bg-[var(--color-brand-primary-dark)] active:scale-95"
              >
                Continuar
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
