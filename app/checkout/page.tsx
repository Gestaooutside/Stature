// Página dedicada de checkout
// Reutiliza todos os componentes do modal PaymentModal

'use client';

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CheckoutHeader } from '@/components/checkout/checkout-header';
import { SessionWarning } from '@/components/checkout/session-warning';
import { StepIndicator } from '@/components/payment-modal/step-indicator';
import { ProductSelector } from '@/components/payment-modal/product-selector';
import { CartButton } from '@/components/payment-modal/cart-button';
import { CartDropdown } from '@/components/payment-modal/cart-dropdown';
import { DiscountInput } from '@/components/payment-modal/discount-input';
import { OrderSummary } from '@/components/payment-modal/order-summary';
import { PaymentStep } from '@/components/payment-modal/payment-step';
import { PaymentConfirmation } from '@/components/payment-modal/payment-confirmation';
import { RecurrenceConfirmation } from '@/components/payment-modal/recurrence-confirmation';
import { useCartStore } from '@/lib/stores/cart-store';
import { useCheckoutSession } from '@/hooks/use-checkout-session';
import { useStorageSync } from '@/hooks/use-storage-sync';

/**
 * Componente isolado para gerenciar parâmetros de URL (cupons)
 * Envolvido em Suspense para evitar de-opt do Static Rendering
 */
function CheckoutUrlManager() {
  const searchParams = useSearchParams();
  const { coupon, applyCoupon } = useCartStore();
  
  // Ref para prevenir múltiplas tentativas de aplicação
  const couponFromUrlAppliedRef = useRef(false);

  /**
   * Aplica cupom automaticamente se presente na URL
   * Parâmetros suportados: cupom, coupon, utm_coupon
   * Exemplo: /checkout?cupom=DESCONTO10
   */
  useEffect(() => {
    // Evita aplicar múltiplas vezes
    if (couponFromUrlAppliedRef.current) return;
    
    // Já tem cupom aplicado? Não sobrescreve
    if (coupon) return;

    // Busca cupom da URL (suporta múltiplos parâmetros)
    const couponCode = 
      searchParams.get('cupom') || 
      searchParams.get('coupon') || 
      searchParams.get('utm_coupon');

    if (!couponCode) return;

    // Marca como já tentado
    couponFromUrlAppliedRef.current = true;

    // Aplica o cupom via API
    const applyCouponFromUrl = async () => {
      try {
        const subtotal = useCartStore.getState().getSubtotal();
        
        const response = await fetch('/api/coupons/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: couponCode.trim().toUpperCase(),
            subtotal,
          }),
        });

        const data = await response.json();

        if (data.valid) {
          // Aplica cupom validado no store
          applyCoupon(
            couponCode.trim().toUpperCase(),
            data.discountType,
            data.discount,
            data.isRecurring,
            data.recurringCycle
          );
          console.log(`[Checkout] Cupom "${couponCode}" aplicado automaticamente da URL`);
        } else {
          console.warn(`[Checkout] Cupom "${couponCode}" da URL inválido: ${data.message}`);
        }
      } catch (error) {
        console.error('[Checkout] Erro ao aplicar cupom da URL:', error);
      }
    };

    applyCouponFromUrl();
  }, [searchParams, coupon, applyCoupon]);

  return null;
}

/**
 * Steps do checkout (mesma estrutura do modal)
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
 * Página principal de checkout
 * Reutiliza todos os componentes do modal mas em formato de página
 */
export default function CheckoutPage() {
  const router = useRouter();
  const pathname = usePathname();
  // searchParams removido daqui e movido para CheckoutUrlManager
  const {
    getTotalItems,
    closeCart,
    customer,
    payment,
    coupon,
    // applyCoupon movido para CheckoutUrlManager
    removeCoupon,
    isRecurringCoupon,
    getTotal,
    resetCheckoutState,
    finalizeCheckout,
    items
  } = useCartStore();
  
  /**
   * Calcula step inicial baseado no estado persistido
   * Validações robustas para garantir que dados estejam completos
   * Previne que usuário seja levado para step incorreto após refresh
   */
  const derivedInitialStep = useMemo(() => {
    // Step 3: Confirmação - requer pagamento completo + dados do cliente
    // Valida que todos os dados necessários existem antes de ir para confirmação
    const hasValidPaymentForConfirmation = 
      payment.status && 
      payment.billingType && 
      payment.paymentId && // Garante que pagamento foi processado
      customer?.email && // Garante que dados do cliente estão completos
      customer?.name;
    
    if (hasValidPaymentForConfirmation) {
      return 3;
    }
    
    // Step 2: Pagamento - requer cliente criado no Asaas
    // Valida que customerId existe e itens no carrinho
    const hasValidCustomerForPayment = 
      payment.customerId && 
      items.length > 0; // Não faz sentido estar no step 2 com carrinho vazio
    
    if (hasValidCustomerForPayment) {
      return 2;
    }
    
    // Step 1: Seleção de produtos - estado inicial padrão
    return 1;
  }, [customer, payment.billingType, payment.customerId, payment.status, payment.paymentId, items.length]);
  const [currentStep, setCurrentStep] = useState(derivedInitialStep);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [recurrenceConfirmed, setRecurrenceConfirmed] = useState(false);

  // Estado para controlar navegação retroativa
  // Deve ser declarado ANTES de disableGlobalBack que o utiliza
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const historyReadyRef = useRef(false);
  
  // Ref para prevenir múltiplos cliques rápidos nos botões de navegação
  const isNavigatingRef = useRef(false);
  
  // couponFromUrlAppliedRef movido para CheckoutUrlManager

  const totalItems = getTotalItems();

  // useEffect de aplicação de cupom da URL movido para CheckoutUrlManager
  
  // Desabilita botão voltar global quando estamos no step 1 e não há página anterior válida
  const disableGlobalBack =
    currentStep === 1 && (!previousPath || previousPath === pathname);

  // Hook para gerenciar timeout de sessão do checkout
  // Avisa usuário quando sessão está expirando e limpa dados se expirar
  const {
    showWarning: showSessionWarning,
    minutesRemaining,
    resetTimer: resetSessionTimer,
    dismissWarning: dismissSessionWarning,
  } = useCheckoutSession({
    isActive: currentStep < 3, // Sessão ativa apenas antes da confirmação
    onSessionExpired: () => {
      // Limpa dados e redireciona quando sessão expira
      resetCheckoutState();
      router.push('/');
    },
  });

  // Hook para sincronizar estado entre abas do navegador
  // Detecta quando o carrinho é modificado em outra aba
  useStorageSync({
    isActive: currentStep < 3,
    onCartCleared: () => {
      // Outra aba limpou o carrinho - volta para step 1
      if (currentStep > 1) {
        setCurrentStep(1);
        replaceHistoryWithStep(1);
      }
    },
    onCheckoutFinalized: () => {
      // Outra aba finalizou o checkout - redireciona para home
      router.push('/');
    },
  });

  const replaceHistoryWithStep = useCallback((step: number) => {
    if (typeof window === 'undefined') return;
    const state = { ...(window.history.state || {}), duoCheckoutStep: step };
    window.history.replaceState(state, '', window.location.href);
  }, []);

  const pushHistoryWithStep = useCallback((step: number) => {
    if (typeof window === 'undefined') return;
    const state = { ...(window.history.state || {}), duoCheckoutStep: step };
    window.history.pushState(state, '', window.location.href);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedPrev = sessionStorage.getItem('duo-prev-path');
    if (storedPrev && storedPrev !== pathname) {
      setPreviousPath(storedPrev);
    } else {
      setPreviousPath('/');
    }
  }, [pathname]);

  useEffect(() => {
    if (!historyReadyRef.current) {
      replaceHistoryWithStep(currentStep);
      historyReadyRef.current = true;
    }
  }, [currentStep, replaceHistoryWithStep]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = (event: PopStateEvent) => {
      const stepFromHistory = event.state?.duoCheckoutStep;
      if (typeof stepFromHistory === 'number') {
        setCurrentStep(stepFromHistory);
        setIsCartOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (items.length === 0 && currentStep > 1) {
      setCurrentStep(1);
      replaceHistoryWithStep(1);
    }
  }, [items.length, currentStep, replaceHistoryWithStep]);

  useEffect(() => {
    if (derivedInitialStep > currentStep) {
      setCurrentStep(derivedInitialStep);
      replaceHistoryWithStep(derivedInitialStep);
    }
  }, [derivedInitialStep, currentStep, replaceHistoryWithStep]);

  useEffect(() => {
    return () => {
      resetCheckoutState();
    };
  }, [resetCheckoutState]);

  /**
   * Fecha dropdown do carrinho quando componente desmonta
   */
  useEffect(() => {
    return () => {
      setIsCartOpen(false);
      closeCart();
    };
  }, [closeCart]);

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
   * Controla scroll do body quando modal de recorrência está aberto
   */
  useEffect(() => {
    if (showRecurrenceModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showRecurrenceModal]);

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
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      pushHistoryWithStep(nextStep);
      setIsCartOpen(false);
    }
  }, [
    currentStep,
    isRecurringCoupon,
    recurrenceConfirmed,
    totalItems,
    pushHistoryWithStep,
  ]);

  /**
   * Volta para step anterior com proteção contra múltiplos cliques
   */
  const handleBack = useCallback(() => {
    // Proteção contra múltiplos cliques rápidos
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setTimeout(() => { isNavigatingRef.current = false; }, 300);

    if (currentStep > 1) {
      if (typeof window !== 'undefined') {
        window.history.back();
      } else {
        setCurrentStep((prev) => Math.max(1, prev - 1));
      }
      setIsCartOpen(false);
      return;
    }

    const fallbackTarget =
      previousPath && previousPath !== pathname ? previousPath : '/';
    router.push(fallbackTarget);
  }, [currentStep, pathname, previousPath, router]);

  /**
   * Navega para step específico (permite voltar) com proteção contra múltiplos cliques
   */
  const handleStepClick = useCallback(
    (step: number) => {
      // Proteção contra múltiplos cliques rápidos
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;
      setTimeout(() => { isNavigatingRef.current = false; }, 300);

      if (step >= currentStep) return;

      if (typeof window !== 'undefined') {
        window.history.go(step - currentStep);
      } else {
        setCurrentStep(step);
      }
      setIsCartOpen(false);
    },
    [currentStep]
  );

  /**
   * Controla scroll para step atual
   */
  useEffect(() => {
    const element = document.getElementById(`checkout-step-${currentStep}`);
    if (element) {
      const headerHeight = 80; // Altura aproximada do header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Gerenciador de URL (Cupons) */}
      <Suspense fallback={null}>
        <CheckoutUrlManager />
      </Suspense>

      {/* Header fixo */}
      <CheckoutHeader />

      {/* Step Indicator */}
      <div className="sticky top-[3.5rem] md:top-16 z-40 bg-white border-b border-neutral-200 px-3 py-2 md:px-8 md:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 md:gap-4">
          <button
            onClick={handleBack}
            disabled={disableGlobalBack}
            className={cn(
              'flex items-center gap-1.5 md:gap-2 rounded-full border px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold transition-all',
              disableGlobalBack
                ? 'cursor-not-allowed border-neutral-100 text-neutral-300'
                : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:scale-95'
            )}
          >
            ← {currentStep === 1 ? 'Voltar para Loja' : 'Voltar etapa'}
          </button>
          <div className="flex-1">
            <StepIndicator
              steps={CHECKOUT_STEPS}
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />
          </div>
          <div className="relative">
            <CartButton onClick={() => setIsCartOpen(!isCartOpen)} />
            <CartDropdown
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              onContinue={handleNext}
            />
          </div>
        </div>
      </div>

      {/* Conteúdo dos steps */}
      <div className="max-w-6xl mx-auto px-3 py-4 md:px-8 md:py-10">
        {/* Step 1 - Seleção de Produtos */}
        <div id="checkout-step-1" className="space-y-4 md:space-y-8">
          {currentStep === 1 && (
            <div className="space-y-4 md:space-y-8">
              <ProductSelector />

              {/* Cupom e Resumo */}
              <div className="grid grid-cols-1 gap-3 md:gap-5 lg:grid-cols-2 lg:gap-8">
                <DiscountInput />
                <OrderSummary />
              </div>
            </div>
          )}
        </div>

        {/* Step 2 - Pagamento */}
        <div id="checkout-step-2">
          {currentStep === 2 && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-8">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-neutral-900">
                      Dados de Pagamento
                    </h2>
                    <p className="text-sm md:text-base text-neutral-600 mt-1">
                      Preencha suas informações para finalizar a compra
                    </p>
                  </div>
                  <button
                    onClick={handleBack}
                    className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    ← Voltar
                  </button>
                </div>

                <PaymentStep onSuccess={handleNext} onBack={handleBack} />
              </div>
            </div>
          )}
        </div>

        {/* Step 3 - Confirmação */}
        <div id="checkout-step-3">
          {currentStep === 3 && payment.billingType && payment.status && customer ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-6 md:p-8">
                <div className="text-center">
                  <PaymentConfirmation
                    billingType={payment.billingType}
                    status={payment.status}
                    value={payment.value || 0}
                    customerEmail={customer.email}
                    onClose={() => {
                      finalizeCheckout();
                      router.push('/');
                    }}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Footer fixo com botões de navegação - estilo do modal */}
      {currentStep < 3 && (
        <div className="sticky bottom-0 z-30 border-t border-neutral-200 bg-white px-3 py-3 md:px-8 md:py-5">
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
                  {totalItems} {totalItems === 1 ? 'item' : 'itens'} no carrinho
                </span>
              ) : (
                <span className="text-amber-600">Adicione produtos</span>
              )}
            </div>

            {/* Botão Continuar/Finalizar */}
            {currentStep === 1 ? (
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
            ) : (
              <button
                onClick={handleNext}
                disabled={currentStep === CHECKOUT_STEPS.length}
                className={cn(
                  'flex items-center gap-1 md:gap-2 rounded-lg px-6 py-2 md:px-8 md:py-3 text-sm md:text-base font-semibold transition-all',
                  currentStep === CHECKOUT_STEPS.length
                    ? 'cursor-not-allowed bg-neutral-200 text-neutral-400'
                    : 'bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-dark)] active:scale-95'
                )}
              >
                {currentStep === CHECKOUT_STEPS.length - 1 ? 'Finalizar' : 'Continuar'}
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

      {/* Modal de Aviso de Sessão Expirando */}
      <SessionWarning
        isOpen={showSessionWarning}
        minutesRemaining={minutesRemaining}
        onContinue={() => {
          resetSessionTimer();
          dismissSessionWarning();
        }}
        onExit={() => {
          resetCheckoutState();
          router.push('/');
        }}
      />
    </div>
  );
}