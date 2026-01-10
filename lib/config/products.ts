// Configuração de produtos com preços vindos de variáveis de ambiente
// Permite alterar preços facilmente e testar com valores menores

import { Product } from '@/lib/stores/cart-store';

/**
 * Lê preço de variável de ambiente com fallback
 * @param envVar - Nome da variável de ambiente
 * @param fallback - Valor padrão se variável não existir
 */
function getPrice(envVar: string, fallback: number): number {
  const value = process.env[envVar];
  if (!value) return fallback;

  const price = parseFloat(value);
  return isNaN(price) ? fallback : price;
}

/**
 * Preços dos produtos vindos de variáveis de ambiente
 * Valores padrão caso variáveis não estejam definidas
 */
export const PRODUCT_PRICES = {
  DUO_DIA: getPrice('NEXT_PUBLIC_PRICE_DUO_DIA', 179.99),
  DUO_NOITE: getPrice('NEXT_PUBLIC_PRICE_DUO_NOITE', 179.99),
  DUO_ENERGY: getPrice('NEXT_PUBLIC_PRICE_DUO_ENERGY', 249.99),
  DUO_COMPLETO: getPrice('NEXT_PUBLIC_PRICE_DUO_COMPLETO', 524.99),
} as const;

/**
 * Configuração de frete
 * ⚠️ FUNCIONALIDADE DESATIVADA: Frete grátis acima do threshold
 * Atualmente cobra frete fixo em todos os pedidos
 * Para reativar: descomentar a lógica em calculateShipping()
 */
export const SHIPPING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 249.99, // Usado apenas se reativar frete grátis
  SHIPPING_FEE: 25.00,
} as const;

/**
 * Mapeamento de ID do produto para preço
 * Usado para validação no backend
 */
export const PRODUCT_PRICE_MAP: Record<string, number> = {
  'duo-dia': PRODUCT_PRICES.DUO_DIA,
  'duo-noite': PRODUCT_PRICES.DUO_NOITE,
  'duo-energy': PRODUCT_PRICES.DUO_ENERGY,
  'duo-completo': PRODUCT_PRICES.DUO_COMPLETO,
};

/**
 * Lista de produtos disponíveis com preços dinâmicos
 */
export const PRODUCTS: Product[] = [
  {
    id: 'duo-dia',
    name: 'DUO DIA',
    price: PRODUCT_PRICES.DUO_DIA,
    image: '/duo-dia-2.jpg',
    badge: 'Novo',
  },
  {
    id: 'duo-noite',
    name: 'DUO NOITE',
    price: PRODUCT_PRICES.DUO_NOITE,
    image: '/duo-noite-2.jpg',
    badge: 'Novo',
  },
  {
    id: 'duo-energy',
    name: 'DUO ENERGY',
    price: PRODUCT_PRICES.DUO_ENERGY,
    image: '/duo-noite-2.jpg',
    badge: 'Novo',
  },
  {
    id: 'duo-completo',
    name: 'Kit DUO Completo',
    price: PRODUCT_PRICES.DUO_COMPLETO,
    image: '/duo-dia-noite-2.jpg',
    badge: 'Limitado',
  },
];

const KIT_PRODUCT_ID = 'duo-completo';

export const PHYSICAL_PRODUCTS: Product[] = PRODUCTS.filter((product) => product.id !== KIT_PRODUCT_ID);
export const PHYSICAL_PRODUCT_IDS = PHYSICAL_PRODUCTS.map((product) => product.id);

export function isPhysicalProduct(productId: string): boolean {
  return PHYSICAL_PRODUCT_IDS.includes(productId);
}

/**
 * Produtos compostos (kits) são decompostos em itens físicos reais
 */
export const PRODUCT_COMPOSITIONS: Record<string, Array<{ productId: string; quantity: number }>> = {
  'duo-completo': [
    { productId: 'duo-dia', quantity: 1 },
    { productId: 'duo-noite', quantity: 1 },
    { productId: 'duo-energy', quantity: 1 },
  ],
};

const PRODUCT_LOOKUP = new Map(PRODUCTS.map((product) => [product.id, product]));

export function getProductById(productId: string) {
  return PRODUCT_LOOKUP.get(productId);
}

/**
 * Valida se produto existe
 * @param productId - ID do produto
 * @returns true se produto válido
 */
export function isValidProduct(productId: string): boolean {
  return productId in PRODUCT_PRICE_MAP;
}

/**
 * Status de disponibilidade de um produto
 */
export interface ProductAvailability {
  productId: string;
  available: boolean;
  reason?: string;
}

/**
 * Verifica disponibilidade de produtos no carrinho
 * Retorna lista de produtos indisponíveis (se houver)
 * @param items - Array de {productId, quantity}
 * @returns Array de produtos indisponíveis com motivo
 */
export function checkProductAvailability(
  items: Array<{ productId: string; quantity: number }>
): ProductAvailability[] {
  const unavailableProducts: ProductAvailability[] = [];

  for (const item of items) {
    // Verifica se produto existe no catálogo
    if (!isValidProduct(item.productId)) {
      unavailableProducts.push({
        productId: item.productId,
        available: false,
        reason: 'Produto não encontrado no catálogo',
      });
      continue;
    }

    // Aqui futuramente pode ser adicionada verificação de estoque real
    // Por exemplo: buscar no banco de dados se há estoque suficiente
    // const stock = await getProductStock(item.productId);
    // if (stock < item.quantity) { ... }
  }

  return unavailableProducts;
}

/**
 * Valida items do carrinho e calcula total
 * ÚNICA fonte de verdade para validação e cálculo
 * Lança erros descritivos se houver problemas
 * @param items - Array de {productId, quantity}
 * @returns Valor total calculado
 * @throws Error se validação falhar
 */
export function validateAndCalculateCart(
  items: Array<{ productId: string; quantity: number }>
): number {
  // Valida que items existe e é array
  if (!items || !Array.isArray(items)) {
    throw new Error('Items do carrinho inválidos');
  }

  // Valida que carrinho não está vazio
  if (items.length === 0) {
    throw new Error('Carrinho vazio');
  }

  // Valida cada item individualmente
  for (const item of items) {
    // Valida estrutura do item
    if (!item || typeof item !== 'object') {
      throw new Error('Item do carrinho com formato inválido');
    }

    // Valida que tem productId e quantity
    if (!item.productId || item.quantity === undefined) {
      throw new Error('Item do carrinho com dados incompletos');
    }

    // Valida que produto existe
    if (!isValidProduct(item.productId)) {
      throw new Error(`Produto inválido: ${item.productId}`);
    }

    // Valida quantidade
    if (
      typeof item.quantity !== 'number' ||
      item.quantity <= 0 ||
      item.quantity > 999 ||
      !Number.isInteger(item.quantity)
    ) {
      throw new Error(
        `Quantidade inválida para ${item.productId}: ${item.quantity}`
      );
    }
  }

  // Calcula total usando preços do servidor
  const total = items.reduce((sum, item) => {
    const price = PRODUCT_PRICE_MAP[item.productId];
    return sum + price * item.quantity;
  }, 0);

  // Valida que total é válido
  if (isNaN(total) || total <= 0) {
    throw new Error('Total do carrinho inválido');
  }

  return total;
}

/**
 * Calcula valor total do carrinho baseado em produtos e quantidades
 * Usa preços do servidor (não confia em valores do cliente)
 * @deprecated Use validateAndCalculateCart() para validação + cálculo
 * @param items - Array de {productId, quantity}
 * @returns Valor total calculado
 */
export function calculateCartTotal(
  items: Array<{ productId: string; quantity: number }>
): number {
  return validateAndCalculateCart(items);
}

/**
 * Calcula valor do frete baseado no subtotal do carrinho
 * ⚠️ FUNCIONALIDADE DESATIVADA: Frete grátis acima de threshold
 * Atualmente sempre cobra frete fixo de R$ 25,00
 * 
 * Para reativar frete grátis:
 * 1. Descomentar o bloco condicional abaixo
 * 2. Comentar o return fixo atual
 * 3. Descomentar informação no order-summary.tsx
 * 
 * @param subtotal - Valor total dos produtos
 * @returns Valor do frete (sempre R$ 25.00)
 */
export function calculateShipping(subtotal: number): number {
  // ===== LÓGICA DE FRETE GRÁTIS (DESATIVADA) =====
  // return subtotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD
  //   ? 0
  //   : SHIPPING_CONFIG.SHIPPING_FEE;
  // ===============================================
  
  // Frete fixo em todos os pedidos
  return SHIPPING_CONFIG.SHIPPING_FEE;
}

/**
 * Retorna descrição amigável da composição do produto, se existir
 */
export function getProductCompositionDescription(productId: string): string | null {
  const composition = PRODUCT_COMPOSITIONS[productId];
  if (!composition) return null;

  return composition
    .map(({ productId: componentId, quantity }) => {
      const name = getProductById(componentId)?.name || componentId;
      const prefix = quantity > 1 ? `${quantity}x ` : '1x ';
      return `${prefix}${name}`;
    })
    .join(' + ');
}

/**
 * Expande itens do carrinho para componentes físicos, usado para controle de estoque
 */
export function expandCartItems(
  items: Array<{ productId: string; quantity: number }>
): Array<{ productId: string; quantity: number }> {
  const accumulator: Record<string, number> = {};

  const expandItem = (productId: string, quantity: number) => {
    const composition = PRODUCT_COMPOSITIONS[productId];
    if (!composition) {
      accumulator[productId] = (accumulator[productId] || 0) + quantity;
      return;
    }

    composition.forEach(({ productId: componentId, quantity: componentQuantity }) => {
      expandItem(componentId, componentQuantity * quantity);
    });
  };

  items.forEach(({ productId, quantity }) => expandItem(productId, quantity));

  return Object.entries(accumulator).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}
