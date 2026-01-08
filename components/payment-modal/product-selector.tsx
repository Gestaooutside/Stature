// Componente de seleção de produtos com quantidade para o carrinho
// Exibe grid de produtos com imagens, preços e seletor de quantidade

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';
import { useCartStore, type Product } from '@/lib/stores/cart-store';
import { PRODUCTS } from '@/lib/config/products';
import { cn } from '@/lib/utils';

/**
 * Componente de card de produto individual
 */
interface ProductCardProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

function ProductCard({ product, quantity, onQuantityChange }: ProductCardProps) {
  /**
   * Decrementa quantidade (mínimo 0)
   */
  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(quantity - 1);
    }
  };

  /**
   * Incrementa quantidade
   */
  const handleIncrement = () => {
    onQuantityChange(quantity + 1);
  };

  return (
    <div className="group relative flex flex-col gap-2 md:gap-4 lg:gap-5 rounded-2xl border border-neutral-200 bg-white p-3 md:p-6 lg:p-8 transition-all hover:border-[var(--color-brand-primary)] hover:shadow-lg">
      {/* Badge */}
      {product.badge && (
        <div className="absolute -right-1 -top-1 md:-right-2 md:-top-2 z-10">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-medium uppercase tracking-wide text-white shadow-md',
              product.badge === 'Limitado'
                ? 'bg-[var(--color-dia-primary)]'
                : 'bg-[var(--color-brand-primary-dark)]'
            )}
          >
            {product.badge}
          </span>
        </div>
      )}

      {/* Imagem do produto */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Nome do produto */}
      <div className="flex flex-col gap-0.5 md:gap-1">
        <h3 className="font-display text-base md:text-xl lg:text-2xl font-semibold text-neutral-900">
          {product.name}
        </h3>
        <p className="text-lg md:text-2xl lg:text-3xl font-bold text-[var(--color-brand-primary-dark)]">
          R$ {product.price.toFixed(2).replace('.', ',')}
        </p>
      </div>

      {/* Seletor de quantidade */}
      <div className="flex items-center justify-between gap-2 md:gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-1.5 md:p-2">
        <button
          onClick={handleDecrement}
          disabled={quantity === 0}
          className={cn(
            'flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-md transition-all',
            quantity === 0
              ? 'cursor-not-allowed bg-neutral-100 text-neutral-300'
              : 'bg-white text-neutral-900 hover:bg-[var(--color-brand-primary)] hover:text-white active:scale-95'
          )}
          aria-label="Diminuir quantidade"
        >
          <Minus className="h-4 w-4 md:h-5 md:w-5" />
        </button>

        <span className="min-w-[3ch] text-center text-base md:text-lg font-semibold text-neutral-900">
          {quantity}
        </span>

        <button
          onClick={handleIncrement}
          className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-md bg-[var(--color-brand-primary)] text-white transition-all hover:bg-[var(--color-brand-primary-dark)] active:scale-95"
          aria-label="Aumentar quantidade"
        >
          <Plus className="h-4 w-4 md:h-5 md:w-5" />
        </button>
      </div>

      {/* Feedback visual quando item é adicionado */}
      {quantity > 0 && (
        <div className="absolute inset-0 pointer-events-none rounded-2xl ring-2 ring-[var(--color-dia-primary)] ring-offset-2 transition-opacity" />
      )}
    </div>
  );
}

/**
 * Componente principal de seleção de produtos
 * Grid responsivo com 3 produtos
 */
export function ProductSelector() {
  const { items, addItem, updateQuantity } = useCartStore();

  // Estado local de quantidades antes de adicionar ao carrinho
  const [quantities, setQuantities] = useState<Record<string, number>>({
    'duo-dia': 0,
    'duo-noite': 0,
    'duo-completo': 0,
  });

  // Sincroniza estado local com itens do carrinho ao montar o componente
  useEffect(() => {
    const initialQuantities: Record<string, number> = {
      'duo-dia': 0,
      'duo-noite': 0,
      'duo-completo': 0,
    };

    // Popula com quantidades do carrinho
    items.forEach((item) => {
      initialQuantities[item.product.id] = item.quantity;
    });

    setQuantities(initialQuantities);
  }, [items]); // Re-sincroniza quando items mudam

  /**
   * Atualiza quantidade local e sincroniza com carrinho
   */
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    // Atualiza estado local
    setQuantities((prev) => ({ ...prev, [productId]: newQuantity }));

    // Sincroniza com carrinho
    const currentItem = items.find((item) => item.product.id === productId);

    if (newQuantity === 0) {
      // Remove do carrinho se quantidade for 0
      if (currentItem) {
        updateQuantity(productId, 0);
      }
    } else if (currentItem) {
      // Atualiza quantidade se item já existe
      updateQuantity(productId, newQuantity);
    } else {
      // Adiciona ao carrinho se não existe
      addItem(product, newQuantity);
    }
  };

  return (
    <div className="w-full">
      <h2 className="mb-4 md:mb-6 lg:mb-8 font-display text-xl md:text-2xl lg:text-3xl font-semibold text-neutral-900">
        Selecione seus produtos
      </h2>

      {/* Grid de produtos - Responsivo */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={quantities[product.id] || 0}
            onQuantityChange={(quantity) =>
              handleQuantityChange(product.id, quantity)
            }
          />
        ))}
      </div>
    </div>
  );
}
