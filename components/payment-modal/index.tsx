// Modal principal de pagamento com múltiplos steps
// Integra todos os componentes do fluxo de checkout

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from '@/components/ui/dialog';
import { useCartStore } from '@/lib/stores/cart-store';
import { ProductSelector } from './product-selector';
import { CartButton } from './cart-button';
import { CartDropdown } from './cart-dropdown';
import { DiscountInput } from './discount-input';
import { OrderSummary } from './order-summary';
import { StepIndicator } from './step-indicator';
import { PaymentStep } from './payment-step';
import { PaymentConfirmation } from './payment-confirmation';
import { RecurrenceConfirmation } from './recurrence-confirmation';
import { cn } from '@/lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Steps do checkout
 */
const CHECKOUT_STEPS = [
  {
    number: 1,
    title: 'Produtos',
    description: 'Selecione seus produtos',
  },
  {
    number: 2,
    title: 'Pagamento',
    description: 'Dados de pagamento',
  },
  {
    number: 3,
    title: 'Confirmação',
    description: 'Revisar pedido',
  },
];

/**
 * Modal principal de pagamento
 * Gerencia navegação entre steps e estado global
 */
export function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [recurrenceConfirmed, setRecurrenceConfirmed] = useState(false);

  // Ref para controlar estado do histórico do navegador
  // Evita múltiplos pushState e garante cleanup correto
  const modalHistoryRef = useRef(false);

  // Ref para controlar se o modal já foi inicializado
  // Evita recalcular o step quando o estado de pagamento muda (ex: após criar PIX)
  const hasInitializedRef = useRef(false);

  const {
    getTotalItems,
    closeCart,
    customer,
    payment,
    coupon,
    removeCoupon,
    isRecurringCoupon,
    getTotal,
    resetCheckoutState,
    finalizeCheckout,
    items,
  } = useCartStore();

  const totalItems = getTotalItems();

  // Ref para prevenir múltiplos cliques rápidos nos botões de navegação
  const isNavigatingRef = useRef(false);

  /**
   * Determina step inicial baseado no estado persistido
   * Validações robustas para garantir que dados estejam completos
   */
  const determineInitialStep = useCallback(() => {
    // Step 3: Confirmação - requer pagamento completo + dados do cliente
    const hasValidPaymentForConfirmation = 
      payment.status && 
      payment.billingType && 
      payment.paymentId &&
      customer?.email && 
      customer?.name;
    
    if (hasValidPaymentForConfirmation) {
      return 3;
    }

    // Step 2: Pagamento - requer cliente criado no Asaas + itens no carrinho
    const hasValidCustomerForPayment = 
      payment.customerId && 
      items.length > 0;
    
    if (hasValidCustomerForPayment) {
      return 2;
    }

    return 1;
  }, [customer, payment.billingType, payment.customerId, payment.status, payment.paymentId, items.length]);

  /**
   * Reseta estados auxiliares quando modal fecha e sincroniza step inicial
   * IMPORTANTE: O step só é calculado na PRIMEIRA abertura do modal
   * Não recalcula quando o estado de pagamento muda (ex: após criar PIX)
   * Isso evita pular a exibição do QR Code direto para confirmação
   */
  useEffect(() => {
    if (!isOpen) {
      // Cleanup ao fechar modal
      setIsCartOpen(false);
      setShowRecurrenceModal(false);
      setRecurrenceConfirmed(false);
      closeCart();
      resetCheckoutState();
      // Reset da ref para próxima abertura
      hasInitializedRef.current = false;
      return;
    }

    // Apenas inicializa o step na PRIMEIRA abertura do modal
    // Isso evita que o step pule automaticamente quando payment muda
    if (!hasInitializedRef.current) {
      setCurrentStep(determineInitialStep());
      hasInitializedRef.current = true;
    }
  }, [isOpen, closeCart, determineInitialStep, resetCheckoutState]);

  /**
   * Verifica se precisa mostrar modal de recorrência quando cupom é aplicado
   */
  useEffect(() => {
    const hasRecurringCoupon = isRecurringCoupon();

    // Se tem cupom recorrente e ainda não confirmou, mostra o modal
    if (hasRecurringCoupon && !recurrenceConfirmed) {
      setShowRecurrenceModal(true);
    } else if (!hasRecurringCoupon) {
      // Se removeu o cupom recorrente, reseta o estado
      setShowRecurrenceModal(false);
      setRecurrenceConfirmed(false);
    }
  }, [coupon, isRecurringCoupon, recurrenceConfirmed]);

  /**
   * Controla botão voltar do navegador quando o modal está aberto
   */
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      modalHistoryRef.current = false;
      return;
    }

    const handlePopState = () => {
      if (modalHistoryRef.current) {
        modalHistoryRef.current = false;
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);
    const state = { ...(window.history.state || {}), duoModal: 'checkout' };
    window.history.pushState(state, '', window.location.href);
    modalHistoryRef.current = true;

    return () => {
      window.removeEventListener('popstate', handlePopState);
      modalHistoryRef.current = false;
    };
  }, [isOpen, onClose]);

  const handleRequestClose = useCallback(() => {
    if (typeof window !== 'undefined' && modalHistoryRef.current) {
      window.history.back();
      return;
    }
    onClose();
  }, [onClose]);

  /**
   * Avança para próximo step com proteção contra múltiplos cliques
   * Ordem de validações:
   * 1. Proteção contra clique duplo (debounce de 300ms)
   * 2. Carrinho vazio (bloqueante - não faz sentido validar cupom sem itens)
   * 3. Cupom recorrente sem confirmação (bloqueante - requer aceite do usuário)
   * 4. Avança para próximo step
   */
  const handleNext = useCallback(() => {
    // Proteção contra múltiplos cliques rápidos
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setTimeout(() => { isNavigatingRef.current = false; }, 300);

    // Validação 1: Carrinho vazio no step 1 (deve ser verificado primeiro)
    if (currentStep === 1 && totalItems === 0) {
      return;
    }

    // Validação 2: Cupom recorrente não confirmado
    if (isRecurringCoupon() && !recurrenceConfirmed) {
      setShowRecurrenceModal(true);
      return;
    }

    // Avança para próximo step
    if (currentStep < CHECKOUT_STEPS.length) {
      setCurrentStep(currentStep + 1);
      setIsCartOpen(false);
    }
  }, [currentStep, totalItems, isRecurringCoupon, recurrenceConfirmed]);

  /**
   * Volta para step anterior com proteção contra múltiplos cliques
   */
  const handleBack = useCallback(() => {
    // Proteção contra múltiplos cliques rápidos
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setTimeout(() => { isNavigatingRef.current = false; }, 300);

    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setIsCartOpen(false);
    }
  }, [currentStep]);

  /**
   * Navega para step específico com proteção contra múltiplos cliques
   */
  const handleStepClick = useCallback((step: number) => {
    // Proteção contra múltiplos cliques rápidos
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setTimeout(() => { isNavigatingRef.current = false; }, 300);

    if (step < currentStep) {
      setCurrentStep(step);
      setIsCartOpen(false);
    }
  }, [currentStep]);

  /**
   * Controla scroll do body quando modal está aberto
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleConfirmationClose = useCallback(() => {
    finalizeCheckout();
    handleRequestClose();
  }, [finalizeCheckout, handleRequestClose]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) {
          handleRequestClose();
        }
      }}
    >
      <DialogPortal>
        {/* Overlay customizado com fade discreto */}
        <DialogOverlay className="bg-black/40 backdrop-blur-sm" />

        {/* Conteúdo do modal */}
        <DialogContent
          showCloseButton={false}
          className={cn(
            // Largura responsiva - Mobile fullscreen, Desktop grande
            'w-full h-full md:h-[95vh] md:w-[95vw] lg:h-[90vh] lg:w-[90vw]',
            'md:max-w-[1400px] md:max-h-[900px]',
            // Sobrescreve sm:max-w-lg do DialogContent
            '!sm:max-w-none',
            // Layout
            'overflow-hidden p-0 flex flex-col gap-0',
            // Mobile: sem bordas arredondadas
            'md:rounded-2xl rounded-none'
          )}
        >
          {/* Header fixo */}
          <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white px-4 py-3 md:px-8 md:py-5 lg:px-12 lg:py-6">
            <div className="flex items-center justify-between gap-2 md:gap-4">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.svg"
                  alt="DUO Natural"
                  width={120}
                  height={40}
                  className="h-6 w-auto md:h-8 lg:h-10"
                />
              </div>

              {/* Step Indicator */}
              <div className="flex-1 mx-2 md:mx-8">
                <StepIndicator
                  steps={CHECKOUT_STEPS}
                  currentStep={currentStep}
                  onStepClick={handleStepClick}
                />
              </div>

              {/* Carrinho + Fechar */}
              <div className="flex items-center gap-2 md:gap-3">
                <div className="relative">
                  <CartButton onClick={() => setIsCartOpen(!isCartOpen)} />
                  <CartDropdown
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                    onContinue={handleNext}
                  />
                </div>

                {/* Botão fechar */}
                <button
                  onClick={handleRequestClose}
                  className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-2 border-neutral-200 bg-white transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 active:scale-95"
                  aria-label="Fechar modal"
                >
                  <svg
                    className="h-4 w-4 md:h-5 md:w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo dos steps - Scrollável */}
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-10 lg:px-12 lg:py-12">
            {/* Step 1 - Seleção de Produtos */}
            {currentStep === 1 && (
              <div className="mx-auto max-w-6xl space-y-6 md:space-y-10 lg:space-y-12">
                <ProductSelector />

                {/* Cupom e Resumo */}
                <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2 lg:gap-8">
                  <DiscountInput />
                  <OrderSummary />
                </div>
              </div>
            )}

            {/* Step 2 - Pagamento */}
            {currentStep === 2 && (
              <PaymentStep onSuccess={handleNext} onBack={handleBack} />
            )}

            {/* Step 3 - Confirmação */}
            {currentStep === 3 && payment.billingType && payment.status && customer && (
              <PaymentConfirmation
                billingType={payment.billingType}
                status={payment.status}
                value={payment.value || 0}
                customerEmail={customer.email}
                onClose={handleConfirmationClose}
              />
            )}
          </div>

          {/* Footer fixo com botões de navegação */}
          {currentStep < 3 && (
            <div className="sticky bottom-0 z-20 border-t border-neutral-200 bg-white px-4 py-3 md:px-8 md:py-5 lg:px-12 lg:py-6">
              <div className="mx-auto flex max-w-6xl items-center justify-between">
              {/* Botão Voltar */}
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={cn(
                  'flex items-center gap-1 md:gap-2 rounded-lg px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold transition-all',
                  currentStep === 1
                    ? 'cursor-not-allowed text-neutral-300'
                    : 'text-neutral-700 hover:bg-neutral-100 active:scale-95'
                )}
              >
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">{currentStep === 1 ? 'Início' : 'Voltar'}</span>
              </button>

              {/* Info de itens no carrinho */}
              <div className="text-xs md:text-sm text-neutral-600 hidden sm:block">
                {totalItems > 0 ? (
                  <span>
                    {totalItems} {totalItems === 1 ? 'item' : 'itens'} no
                    carrinho
                  </span>
                ) : (
                  <span className="text-amber-600">
                    Adicione produtos
                  </span>
                )}
              </div>

              {/* Botão Continuar */}
              {currentStep === 1 && (
                <button
                  onClick={handleNext}
                  disabled={totalItems === 0 || (isRecurringCoupon() && !recurrenceConfirmed)}
                  className={cn(
                    'flex items-center gap-1 md:gap-2 rounded-lg px-6 py-2 md:px-8 md:py-3 text-sm md:text-base font-semibold transition-all',
                    totalItems === 0 || (isRecurringCoupon() && !recurrenceConfirmed)
                      ? 'cursor-not-allowed bg-neutral-200 text-neutral-400'
                      : 'bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-dark)] active:scale-95'
                  )}
                >
                  {isRecurringCoupon() && !recurrenceConfirmed ? 'Aguardando Confirmação' : 'Continuar'}
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              )}

              {currentStep > 1 && (
                <button
                  form="customer-form"
                  type="submit"
                  disabled={currentStep === CHECKOUT_STEPS.length}
                  className={cn(
                    'flex items-center gap-1 md:gap-2 rounded-lg px-6 py-2 md:px-8 md:py-3 text-sm md:text-base font-semibold transition-all',
                    currentStep === CHECKOUT_STEPS.length
                      ? 'cursor-not-allowed bg-neutral-200 text-neutral-400'
                      : 'bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-dark)] active:scale-95'
                  )}
                >
                  Continuar
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              )}
              </div>
            </div>
          )}

          {/* Modal de Confirmação de Recorrência */}
          {coupon && (
            <RecurrenceConfirmation
              isOpen={showRecurrenceModal}
              onConfirm={() => {
                setRecurrenceConfirmed(true);
                setShowRecurrenceModal(false);
              }}
              onCancel={() => {
                // Remove o cupom recorrente se usuário não concordar
                removeCoupon();
                setShowRecurrenceModal(false);
                setRecurrenceConfirmed(false);
              }}
              couponCode={coupon.code}
              discountType={coupon.discountType}
              discountValue={coupon.discount}
              totalAmount={getTotal()}
              recurringCycle={coupon.recurringCycle || 'MONTHLY'}
            />
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
