// Gerencia estado do carrinho de compras com persistência em localStorage
// Dependências: zustand

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { calculateShipping } from '@/lib/config/products';
import {
  BillingType,
  CustomerFormData,
  PaymentState,
} from '@/lib/types/payment';

/**
 * Interface do produto no carrinho
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  badge?: string;
}

/**
 * Interface do item do carrinho (produto + quantidade)
 */
export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Interface do cupom de desconto
 */
export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed'; // Tipo de desconto
  discount: number; // Percentual (ex: 10 = 10%) ou valor fixo (ex: 15.00)
  isRecurring?: boolean; // Se ativa assinatura recorrente
  recurringCycle?: 'WEEKLY' | 'MONTHLY' | 'YEARLY'; // Ciclo de recorrência
}

/**
 * Interface do estado do carrinho
 */
interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  isOpen: boolean;

  // Dados do cliente
  customer: CustomerFormData | null;
  // Contato WhatsApp (não enviado ao Asaas)
  whatsapp: string | null;
  // ID do lead criado no checkout (para vincular ao pedido)
  leadId: string | null;

  // Estado do pagamento
  payment: PaymentState;

  // Ações do carrinho
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Ações do cupom
  applyCoupon: (
    code: string, 
    discountType: 'percentage' | 'fixed', 
    discount: number,
    isRecurring?: boolean,
    recurringCycle?: 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  ) => boolean;
  removeCoupon: () => void;

  // Ações do modal
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Ações do cliente
  setCustomer: (customer: CustomerFormData) => void;
  clearCustomer: () => void;
  resetCheckoutState: () => void;
  finalizeCheckout: () => void;
  // Ações de contato (WhatsApp)
  setWhatsapp: (phone: string) => void;
  // Ações de lead (para vincular ao pedido)
  setLeadId: (id: string) => void;
  clearLeadId: () => void;

  // Ações do pagamento
  setPaymentMethod: (method: BillingType) => void;
  setPaymentLoading: (loading: boolean) => void;
  setPaymentError: (error: string | undefined) => void;
  setPaymentData: (data: Partial<PaymentState>) => void;
  clearPayment: () => void;

  // Getters
  getSubtotal: () => number;
  getDiscount: () => number;
  getShipping: () => number;
  getTotal: () => number;
  getTotalItems: () => number;
  isRecurringCoupon: () => boolean;
  getAvailablePaymentMethods: () => BillingType[];
}

/**
 * Cupons válidos
 * Lista vazia - sem cupons ativos no momento
 */
const VALID_COUPONS: Coupon[] = [];

/**
 * Store do carrinho com persistência em localStorage
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isOpen: false,
      customer: null,
      whatsapp: null,
      leadId: null,
      payment: {
        loading: false,
      },

      /**
       * Adiciona produto ao carrinho ou atualiza quantidade se já existir
       * @param product - Produto a ser adicionado
       * @param quantity - Quantidade a adicionar
       */
      addItem: (product, quantity) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) => item.product.id === product.id
        );

        if (existingItem) {
          // Se produto já existe, atualiza quantidade
          set({
            items: currentItems.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          // Se produto não existe, adiciona ao carrinho
          set({
            items: [...currentItems, { product, quantity }],
          });
        }
      },

      /**
       * Remove produto do carrinho
       * @param productId - ID do produto a ser removido
       */
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        });
      },

      /**
       * Atualiza quantidade de um produto no carrinho
       * Remove o item se quantidade for 0
       * @param productId - ID do produto
       * @param quantity - Nova quantidade (>=0)
       */
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          // Remove item se quantidade for 0 ou negativa
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      /**
       * Limpa todo o carrinho e remove cupom
       */
      clearCart: () => {
        set({ items: [], coupon: null });
      },

      /**
       * Aplica cupom de desconto validado pela API
       * @param code - Código do cupom (uppercase)
       * @param discountType - Tipo de desconto ('percentage' ou 'fixed')
       * @param discount - Valor do desconto (percentual ou fixo)
       * @param isRecurring - Se é recorrente (opcional)
       * @param recurringCycle - Ciclo de recorrência (opcional)
       * @returns true sempre (validação feita pela API)
       */
      applyCoupon: (code, discountType, discount, isRecurring = false, recurringCycle?: 'WEEKLY' | 'MONTHLY' | 'YEARLY') => {
        set({ coupon: {
          code: code.toUpperCase(),
          discountType,
          discount,
          isRecurring,
          recurringCycle
        } });
        return true;
      },

      /**
       * Remove cupom de desconto aplicado
       */
      removeCoupon: () => {
        set({ coupon: null });
      },

      /**
       * Abre o dropdown do carrinho
       */
      openCart: () => {
        set({ isOpen: true });
      },

      /**
       * Fecha o dropdown do carrinho
       */
      closeCart: () => {
        set({ isOpen: false });
      },

      /**
       * Alterna estado do dropdown do carrinho
       */
      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      /**
       * Zera dados sensíveis do checkout sem limpar itens/cupom
       * Usado quando usuário cancela fluxo antes de concluir
       */
      resetCheckoutState: () => {
        set({
          customer: null,
          whatsapp: null,
          leadId: null,
          payment: { loading: false },
        });
      },

      /**
       * Finaliza checkout limpando carrinho, cupom e dados sensíveis
       * Usado quando o pedido é concluído com sucesso
       */
      finalizeCheckout: () => {
        set({
          items: [],
          coupon: null,
          customer: null,
          whatsapp: null,
          leadId: null,
          payment: { loading: false },
        });
      },

      /**
       * Define/atualiza número de WhatsApp para contato (opcional)
       */
      setWhatsapp: (phone) => {
        set({ whatsapp: phone });
      },

      /**
       * Define ID do lead criado no checkout
       * @param id - UUID do lead criado via /api/leads
       */
      setLeadId: (id) => {
        set({ leadId: id });
      },

      /**
       * Limpa ID do lead
       */
      clearLeadId: () => {
        set({ leadId: null });
      },

      /**
       * Calcula subtotal do carrinho (antes do desconto)
       * @returns Valor total em reais
       */
      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      /**
       * Calcula valor do desconto aplicado
       * @returns Valor do desconto em reais
       */
      getDiscount: () => {
        const { coupon, getSubtotal } = get();
        if (!coupon) return 0;

        const subtotal = getSubtotal();

        // Calcula desconto baseado no tipo
        if (coupon.discountType === 'percentage') {
          return (subtotal * coupon.discount) / 100;
        } else {
          // Desconto fixo não pode ser maior que o subtotal
          return Math.min(coupon.discount, subtotal);
        }
      },

      /**
       * Calcula frete baseado no subtotal após desconto
       * @returns Valor do frete em reais
       */
      getShipping: () => {
        const { getSubtotal, getDiscount } = get();
        const subtotal = getSubtotal();
        const discount = getDiscount();
        return calculateShipping(subtotal - discount);
      },

      /**
       * Calcula total do carrinho (subtotal - desconto)
       * @returns Valor total final em reais
       */
      getTotal: () => {
        const { getSubtotal, getDiscount, getShipping } = get();
        return getSubtotal() - getDiscount() + getShipping();
      },

      /**
       * Retorna quantidade total de itens no carrinho
       * @returns Soma de todas as quantidades
       */
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      /**
       * Verifica se o cupom aplicado é recorrente
       * @returns true se cupom for recorrente
       */
      isRecurringCoupon: () => {
        const { coupon } = get();
        return coupon?.isRecurring || false;
      },

      /**
       * Retorna métodos de pagamento disponíveis baseado no cupom
       * @returns Lista de métodos permitidos
       */
      getAvailablePaymentMethods: () => {
        const { isRecurringCoupon } = get();

        // Se cupom recorrente, apenas cartão de crédito é permitido
        if (isRecurringCoupon()) {
          return ['CREDIT_CARD'];
        }

        // Caso contrário, todos os métodos são permitidos
        return ['PIX', 'BOLETO', 'CREDIT_CARD'];
      },

      /**
       * Define dados do cliente
       * @param customer - Dados do formulário de cliente
       */
      setCustomer: (customer) => {
        set({ customer });
      },

      /**
       * Limpa dados do cliente
       */
      clearCustomer: () => {
        set({ customer: null });
      },

      /**
       * Define método de pagamento selecionado
       * @param method - Tipo de pagamento (PIX, BOLETO, CREDIT_CARD)
       */
      setPaymentMethod: (method) => {
        set({
          payment: {
            ...get().payment,
            billingType: method,
          },
        });
      },

      /**
       * Define estado de loading do pagamento
       * @param loading - true se processando pagamento
       */
      setPaymentLoading: (loading) => {
        set({
          payment: {
            ...get().payment,
            loading,
          },
        });
      },

      /**
       * Define mensagem de erro do pagamento
       * @param error - Mensagem de erro ou undefined para limpar
       */
      setPaymentError: (error) => {
        set({
          payment: {
            ...get().payment,
            error,
            loading: false,
          },
        });
      },

      /**
       * Atualiza dados do pagamento (customerId, paymentId, QR code, etc)
       * @param data - Dados parciais do pagamento para atualizar
       */
      setPaymentData: (data) => {
        // DEBUG: Log detalhado do que está sendo setado
        console.log('[CartStore] ====== setPaymentData ======');
        console.log('[CartStore] Dados recebidos:', JSON.stringify(data, null, 2));
        console.log('[CartStore] data.qrCode existe?', !!data.qrCode);
        if (data.qrCode) {
          console.log('[CartStore] qrCode.encodedImage:', data.qrCode.encodedImage ? `SIM (${data.qrCode.encodedImage.length})` : 'NÃO');
          console.log('[CartStore] qrCode.payload:', data.qrCode.payload ? `SIM (${data.qrCode.payload.length})` : 'NÃO');
        }
        
        const currentPayment = get().payment;
        console.log('[CartStore] Estado atual de payment:', JSON.stringify(currentPayment, null, 2));
        
        const newPayment = {
          ...currentPayment,
          ...data,
        };
        
        console.log('[CartStore] Novo estado de payment:', JSON.stringify(newPayment, null, 2));
        console.log('[CartStore] newPayment.qrCode existe?', !!newPayment.qrCode);
        
        set({
          payment: newPayment,
        });
        
        // Verificar estado após atualização
        const afterPayment = get().payment;
        console.log('[CartStore] Estado APÓS set:', JSON.stringify(afterPayment, null, 2));
        console.log('[CartStore] afterPayment.qrCode existe?', !!afterPayment.qrCode);
        console.log('[CartStore] ====== FIM setPaymentData ======');
      },

      /**
       * Limpa todos os dados de pagamento
       */
      clearPayment: () => {
        set({
          payment: {
            loading: false,
          },
        });
      },
    }),
    {
      name: 'duo-cart-storage', // Nome da chave no localStorage
      storage: createJSONStorage(() => localStorage),
      // Persiste items, coupon, customer e payment (filtrado), não o estado isOpen
      // IMPORTANTE: Filtra dados sensíveis do payment para não persistir informações de cartão
      partialize: (state) => {
        // Filtra payment para manter apenas campos seguros para persistência
        // Exclui: qrCode (dados PIX expiram), error, loading
        // Mantém: orderId, customerId, paymentId, billingType, status, value (para restaurar fluxo)
        const safePayment = state.payment ? {
          orderId: state.payment.orderId,
          customerId: state.payment.customerId,
          paymentId: state.payment.paymentId,
          billingType: state.payment.billingType,
          status: state.payment.status,
          value: state.payment.value,
          // bankSlipUrl e invoiceUrl são links públicos, seguros para persistir
          bankSlipUrl: state.payment.bankSlipUrl,
          invoiceUrl: state.payment.invoiceUrl,
          loading: false, // Sempre reseta loading ao persistir
        } : { loading: false };

        return {
          items: state.items,
          coupon: state.coupon,
          customer: state.customer,
          payment: safePayment,
          whatsapp: state.whatsapp,
          leadId: state.leadId,
        };
      },
    }
  )
);
