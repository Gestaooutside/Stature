// Seletor de método de pagamento
// Permite escolher entre PIX, Boleto e Cartão de Crédito
// Verifica disponibilidade do Pix antes de permitir seleção

'use client';

import { Smartphone, FileText, CreditCard, Check, AlertCircle, Info } from 'lucide-react';
import { BillingType } from '@/lib/types/payment';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/stores/cart-store';

interface PaymentMethodSelectorProps {
  selectedMethod?: BillingType;
  onSelect: (method: BillingType) => void;
}

interface PixAvailability {
  available: boolean;
  reason?: string;
  message?: string;
}

interface PaymentMethod {
  type: BillingType;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
  color: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    type: 'PIX',
    icon: Smartphone,
    title: 'PIX',
    description: 'Aprovação instantânea',
    badge: 'Mais rápido',
    color: 'from-[#355E3B] to-[#9CAF88]', // Verde do produto Dia
  },
  {
    type: 'BOLETO',
    icon: FileText,
    title: 'Boleto Bancário',
    description: 'Até 1 dia útil para compensar',
    color: 'from-[#8d7f72] to-[#a89a8d]', // Marrom da marca
  },
  {
    type: 'CREDIT_CARD',
    icon: CreditCard,
    title: 'Cartão de Crédito',
    description: 'Aprovação em minutos',
    color: 'from-[#1a365d] to-[#553c9a]', // Azul do produto Noite
  },
];

/**
 * Componente de seleção de método de pagamento
 * Exibe cartões clicáveis para cada método disponível
 * Verifica disponibilidade do Pix ao montar o componente
 */
export function PaymentMethodSelector({
  selectedMethod,
  onSelect,
}: PaymentMethodSelectorProps) {
  // Obtém métodos disponíveis do store (considerando cupons recorrentes)
  const { getAvailablePaymentMethods, isRecurringCoupon } = useCartStore();
  const availableMethods = getAvailablePaymentMethods();
  const isRecurring = isRecurringCoupon();

  const [pixAvailability, setPixAvailability] = useState<PixAvailability>({
    available: true, // Assume disponível até verificar
  });
  const [checkingPix, setCheckingPix] = useState(true);

  // Verifica disponibilidade do Pix ao montar o componente
  useEffect(() => {
    async function checkPixAvailability() {
      try {
        const response = await fetch('/api/asaas/pix-key');
        if (response.ok) {
          const data = await response.json();
          setPixAvailability({
            available: data.available || false,
            reason: data.reason,
            message: data.message,
          });
        }
      } catch (error) {
        console.error('Erro ao verificar disponibilidade do Pix:', error);
        // Em caso de erro, assume disponível para não bloquear usuário
        setPixAvailability({ available: true });
      } finally {
        setCheckingPix(false);
      }
    }

    checkPixAvailability();
  }, []);

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-3 border-b border-neutral-200 pb-3 md:pb-4">
        <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-[var(--color-brand-primary)]" />
        <div>
          <h3 className="text-base md:text-lg lg:text-xl font-semibold text-neutral-900">
            Método de Pagamento
          </h3>
          <p className="text-xs md:text-sm text-neutral-600">
            Escolha como deseja pagar
          </p>
        </div>
      </div>

      {/* Aviso de cupom recorrente */}
      {isRecurring && (
        <div className="rounded-lg md:rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100/50 p-3 md:p-4 border-2 border-blue-200">
          <div className="flex items-start gap-2 md:gap-3">
            <Info className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs md:text-sm text-blue-900 font-semibold">
                Cupom de Assinatura Recorrente
              </p>
              <p className="text-xs md:text-sm text-blue-800 mt-1">
                Este cupom ativa uma assinatura mensal e requer pagamento com cartão de crédito.
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Você será cobrado mensalmente até solicitar o cancelamento.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid de métodos */}
      <div className={cn(
        "grid gap-2 md:gap-3 lg:gap-4",
        // Ajusta layout baseado na quantidade de métodos disponíveis
        availableMethods.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"
      )}>
        {PAYMENT_METHODS.filter(method => availableMethods.includes(method.type)).map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.type;

          // Verifica se o método está desabilitado (apenas PIX)
          const isDisabled = method.type === 'PIX' && !pixAvailability.available && !checkingPix;

          return (
            <button
              key={method.type}
              onClick={() => !isDisabled && onSelect(method.type)}
              disabled={isDisabled}
              className={cn(
                'group relative flex flex-col items-start gap-2 md:gap-3 rounded-xl md:rounded-2xl border-2 p-3 md:p-4 lg:p-6 transition-all',
                !isDisabled && 'hover:shadow-lg active:scale-95',
                isSelected
                  ? 'border-[var(--color-brand-primary)] bg-gradient-to-br from-[var(--color-brand-primary)]/5 to-[var(--color-brand-primary)]/10 shadow-md'
                  : isDisabled
                  ? 'border-neutral-200 bg-neutral-50 opacity-60 cursor-not-allowed'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              )}
            >
              {/* Badge (se houver) ou indicador de indisponível */}
              {isDisabled ? (
                <div className="absolute right-2 top-2 md:right-3 md:top-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-2 py-0.5 md:px-2.5 md:py-1">
                  <span className="text-[10px] md:text-xs font-bold text-white">
                    Indisponível
                  </span>
                </div>
              ) : (
                method.badge && (
                  <div className="absolute right-2 top-2 md:right-3 md:top-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 px-2 py-0.5 md:px-2.5 md:py-1">
                    <span className="text-[10px] md:text-xs font-bold text-white">
                      {method.badge}
                    </span>
                  </div>
                )
              )}

              {/* Ícone com gradiente */}
              <div
                className={cn(
                  'flex h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 items-center justify-center rounded-lg md:rounded-xl bg-gradient-to-br',
                  method.color,
                  'shadow-md transition-transform group-hover:scale-110'
                )}
              >
                <Icon className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" />
              </div>

              {/* Textos */}
              <div className="flex-1 text-left">
                <h4 className="text-sm md:text-base lg:text-lg font-semibold text-neutral-900">
                  {method.title}
                </h4>
                <p className="mt-0.5 md:mt-1 text-xs md:text-sm text-neutral-600">
                  {method.description}
                </p>
              </div>

              {/* Indicador de seleção */}
              {isSelected && (
                <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-[var(--color-brand-primary)] shadow-md">
                  <Check className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              )}

              {/* Animação de fundo ao hover */}
              <div
                className={cn(
                  'absolute inset-0 -z-10 rounded-xl md:rounded-2xl bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-5',
                  method.color
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Aviso se Pix estiver indisponível */}
      {!pixAvailability.available && !checkingPix && (
        <div className="rounded-lg md:rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 p-3 md:p-4 border-2 border-orange-200">
          <div className="flex items-start gap-2 md:gap-3">
            <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs md:text-sm text-orange-900 font-semibold">
                Pix temporariamente indisponível
              </p>
              <p className="text-xs md:text-sm text-orange-800 mt-1">
                {pixAvailability.message || 'O Pix não está disponível no momento.'}
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Por favor, escolha outro método de pagamento ou entre em contato com o suporte.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Informações adicionais */}
      <div className="rounded-lg md:rounded-xl bg-gradient-to-br from-[#a89a8d]/10 to-[#a89a8d]/5 p-3 md:p-4 border-2 border-[#a89a8d]/20">
        <p className="text-xs md:text-sm text-neutral-700">
          <span className="font-semibold">💳 Pagamento seguro:</span> Todos os
          pagamentos são processados de forma segura através do Asaas, com
          certificado SSL e criptografia de ponta a ponta.
        </p>
      </div>
    </div>
  );
}
