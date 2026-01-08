// Componente orquestrador do Step 2 - Pagamento
// Gerencia fluxo de dados do cliente, seleção de método e processamento

'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/stores/cart-store';
import { fetchWithRetry, isOnline } from '@/lib/utils/fetch-with-retry';
import { CustomerForm } from './customer-form';
import { PaymentMethodSelector } from './payment-method-selector';
import { PixPayment } from './pix-payment';
import { BoletoPayment } from './boleto-payment';
import { CreditCardForm } from './credit-card-form';
import { MorphingSpinner } from '@/components/ui/morphing-spinner';
import {
  BillingType,
  CustomerFormData,
  CreditCardData,
  CreditCardHolderInfo,
} from '@/lib/types/payment';

interface PaymentStepProps {
  onSuccess: () => void;
  onBack?: () => void;
}

/**
 * Componente do Step 2 - Pagamento
 * Orquestra coleta de dados, seleção de método e processamento
 */
export function PaymentStep({ onSuccess, onBack }: PaymentStepProps) {
  const {
    customer,
    payment,
    items,
    getTotal,
    getSubtotal,
    coupon,
    isRecurringCoupon,
    getAvailablePaymentMethods,
    setPaymentLoading,
    setPaymentError,
    setPaymentData,
    setPaymentMethod,
    whatsapp,
    leadId,
    setLeadId,
  } = useCartStore();

  const [showPaymentMethod, setShowPaymentMethod] = useState(!!payment.customerId);
  const [selectedMethod, setSelectedMethod] = useState<BillingType | undefined>(
    payment.billingType
  );

  useEffect(() => {
    if (payment.customerId && !showPaymentMethod) {
      setShowPaymentMethod(true);
    }

    if (!payment.customerId && showPaymentMethod) {
      setShowPaymentMethod(false);
      setSelectedMethod(undefined);
    }
  }, [payment.customerId, showPaymentMethod]);

  useEffect(() => {
    if (!payment.billingType) {
      setSelectedMethod(undefined);
    }
  }, [payment.billingType]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center space-y-3">
        <p className="text-sm md:text-base text-amber-900 font-semibold">
          Seu carrinho está vazio. Adicione produtos antes de continuar para o pagamento.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-all active:scale-95"
          >
            Voltar para seleção
          </button>
        )}
      </div>
    );
  }

  /**
   * Manipula submissão do formulário de cliente
   * Cria cliente no Asaas e lead no banco para rastreabilidade
   */
  const handleCustomerSubmit = async (customerData: CustomerFormData) => {
    if (items.length === 0) {
      setPaymentError('Seu carrinho está vazio. Adicione itens para continuar.');
      return;
    }

    // Verifica conexão antes de iniciar
    if (!isOnline()) {
      setPaymentError('Você está sem conexão com a internet. Verifique sua rede e tente novamente.');
      return;
    }

    setPaymentLoading(true);
    setPaymentError(undefined);

    try {
      // 1. Cria cliente no Asaas com retry automático para falhas de rede
      const customerResponse = await fetchWithRetry(
        '/api/asaas/create-customer',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customerData),
        },
        {
          maxRetries: 3,
          onRetry: (attempt) => {
            console.log(`Tentativa ${attempt} de criar cliente...`);
          },
        }
      );

      if (!customerResponse.ok) {
        const error = await customerResponse.json();
        throw new Error(error.message || 'Erro ao criar cliente');
      }

      const asaasCustomer = await customerResponse.json();
      console.log('[PaymentStep] Cliente Asaas criado:', asaasCustomer.id);

      // 2. Cria lead no banco para vincular ao pedido posteriormente
      // Isso garante rastreabilidade completa: Lead → Pedido → Pagamento
      const cartItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const leadResponse = await fetchWithRetry(
        '/api/leads',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceType: 'checkout',
            name: customerData.name,
            whatsapp: whatsapp || customerData.phone,
            email: customerData.email,
            cpfCnpj: customerData.cpfCnpj,
            rg: customerData.rg,
            rgIssuer: customerData.rgIssuer,
            phone: customerData.phone,
            postalCode: customerData.postalCode,
            addressNumber: customerData.addressNumber,
            addressComplement: customerData.addressComplement,
            address: customerData.address,
            city: customerData.city,
            state: customerData.state,
            couponCode: coupon?.code || null,
            cartItems,
          }),
        },
        {
          maxRetries: 2,
          onRetry: (attempt) => {
            console.log(`Tentativa ${attempt} de criar lead...`);
          },
        }
      );

      if (leadResponse.ok) {
        const leadData = await leadResponse.json();
        console.log('[PaymentStep] Lead criado:', leadData.lead?.id);
        // Salva ID do lead no estado para vincular ao pedido
        if (leadData.lead?.id) {
          setLeadId(leadData.lead.id);
        }
      } else {
        // Se falhar ao criar lead, continua mesmo assim (não é crítico)
        console.warn('[PaymentStep] Falha ao criar lead, continuando...');
      }

      // 3. Salva ID do cliente no estado
      setPaymentData({ customerId: asaasCustomer.id });

      // Avança para seleção de método
      setShowPaymentMethod(true);
      setPaymentLoading(false);
    } catch (error: any) {
      // Mensagem amigável para erros de rede
      const isNetworkErr = error.message?.toLowerCase().includes('fetch') || 
                           error.message?.toLowerCase().includes('network');
      const errorMessage = isNetworkErr
        ? 'Erro de conexão. Verifique sua internet e tente novamente.'
        : error.message || 'Erro ao processar dados do cliente';
      
      setPaymentError(errorMessage);
      setPaymentLoading(false);
    }
  };

  /**
   * Manipula seleção do método de pagamento
   * IMPORTANTE: Para PIX/Boleto, ativa loading ANTES de setar o método
   * Isso evita mostrar brevemente a tela de erro durante processamento
   */
  const handleMethodSelect = async (method: BillingType) => {
    // Verifica se o método selecionado é compatível com cupons recorrentes
    const availableMethods = getAvailablePaymentMethods();

    if (!availableMethods.includes(method)) {
      if (isRecurringCoupon()) {
        setPaymentError('Cupons recorrentes só podem ser usados com cartão de crédito.');
        return;
      }
    }

    // CRÍTICO: Para PIX/Boleto, ativa loading ANTES de setar o método
    // Isso garante que o componente mostre loading antes de selectedMethod mudar
    // Evita race condition onde fallback de erro aparece brevemente
    if (method === 'PIX' || method === 'BOLETO') {
      setPaymentLoading(true);
    }

    setSelectedMethod(method);
    setPaymentMethod(method);

    // Inicia processamento do pagamento
    if (method === 'PIX' || method === 'BOLETO') {
      await handleCreatePayment(method);
    }
  };

  /**
   * Cria pedido + pagamento via API interna
   * Verifica disponibilidade dos produtos e conexão antes de processar
   * Implementa retry automático para falhas de rede
   */
  const handleCreatePayment = async (
    billingType: BillingType,
    cardData?: CreditCardData,
    holderInfo?: CreditCardHolderInfo
  ) => {
    if (!payment.customerId) {
      setPaymentError('ID do cliente não encontrado');
      return;
    }

    // Verifica conexão antes de processar pagamento
    if (!isOnline()) {
      setPaymentError('Você está sem conexão com a internet. Verifique sua rede e tente novamente.');
      return;
    }

    // Seta loading para true no início do processamento
    setPaymentLoading(true);
    setPaymentError(undefined);

    try {
      const cartItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const orderPayload: any = {
        customerId: payment.customerId,
        billingType,
        items: cartItems,
        // Vincula pedido ao lead para rastreabilidade completa
        leadId: leadId || undefined,
        description: 'Compra DUO - Suplemento Natural',
        metadata: {
          source: 'checkout',
        },
        customerSnapshot: customer
          ? {
              ...customer,
              whatsapp: whatsapp || undefined,
            }
          : undefined,
      };
      
      console.log('[PaymentStep] Criando pedido com leadId:', leadId);

      if (coupon) {
        orderPayload.couponCode = coupon.code;
        const subtotalValue = getSubtotal();
        const discountPercent =
          coupon.discountType === 'percentage'
            ? coupon.discount
            : subtotalValue > 0
            ? (coupon.discount / subtotalValue) * 100
            : 0;
        orderPayload.discountPercent = Number(discountPercent.toFixed(2));
      }

      if (billingType === 'CREDIT_CARD' && cardData && holderInfo) {
        orderPayload.creditCard = cardData;
        orderPayload.creditCardHolderInfo = holderInfo;
      }

      // Usa fetchWithRetry para maior resiliência a falhas de rede
      // Importante: não fazer retry em pagamentos de cartão (pode causar cobranças duplicadas)
      const retryOptions = billingType === 'CREDIT_CARD' 
        ? { maxRetries: 1 } // Sem retry para cartão
        : { 
            maxRetries: 3, 
            onRetry: (attempt: number) => {
              console.log(`Tentativa ${attempt} de criar pedido...`);
            }
          };

      const response = await fetchWithRetry(
        '/api/orders',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        },
        retryOptions
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar pagamento');
      }

      const orderResponse = await response.json();

      // DEBUG: Log da resposta da API
      console.log('[PaymentStep] Resposta da API recebida');
      console.log('[PaymentStep] PIX Data:', orderResponse.payment?.pix ? 'Presente' : 'Ausente');

      // Salva dados do pagamento no estado
      // IMPORTANTE: Copiar o objeto PIX explicitamente para evitar problemas de referência
      const pixData = orderResponse.payment?.pix ? {
        encodedImage: orderResponse.payment.pix.encodedImage,
        payload: orderResponse.payment.pix.payload,
        expirationDate: orderResponse.payment.pix.expirationDate,
      } : undefined;
      
      // CRÍTICO: Salvar todos os dados incluindo loading: false em uma única chamada
      // Isso evita race conditions entre múltiplas atualizações de estado
      setPaymentData({
        orderId: orderResponse.orderId,
        paymentId: orderResponse.payment?.id,
        status: orderResponse.payment?.status,
        value: orderResponse.payment?.value,
        invoiceUrl: orderResponse.payment?.invoiceUrl,
        bankSlipUrl: orderResponse.payment?.bankSlipUrl,
        qrCode: pixData,
        loading: false, // Incluir loading aqui para atualização atômica
      });

      console.log('[PaymentStep] Dados salvos no estado com sucesso');

      // Para cartão de crédito, avança automaticamente para confirmação
      // Para PIX/Boleto, usuário deve ver QR code/boleto primeiro e clicar em "Continuar"
      if (billingType === 'CREDIT_CARD') {
        onSuccess();
      }
    } catch (error: any) {
      // Mensagem amigável para erros de rede
      const isNetworkErr = error.message?.toLowerCase().includes('fetch') || 
                           error.message?.toLowerCase().includes('network');
      const errorMessage = isNetworkErr
        ? 'Erro de conexão. Verifique sua internet e tente novamente.'
        : error.message || 'Erro ao processar pagamento';
      
      setPaymentError(errorMessage);
      setPaymentLoading(false);
    }
  };

  /**
   * Manipula submissão do formulário de cartão de crédito
   */
  const handleCardSubmit = async (
    cardData: CreditCardData,
    holderInfo: CreditCardHolderInfo
  ) => {
    await handleCreatePayment('CREDIT_CARD', cardData, holderInfo);
  };

  /**
   * Volta para formulário de cliente
   */
  const handleBackToCustomer = () => {
    setShowPaymentMethod(false);
    setSelectedMethod(undefined);
  };

  // Se ainda não preencheu dados do cliente, mostra formulário
  if (!showPaymentMethod) {
    return (
      <div className="mx-auto max-w-3xl">
        <CustomerForm onSubmit={handleCustomerSubmit} onBack={onBack} />
      </div>
    );
  }

  // Se já preencheu cliente mas ainda não selecionou método, mostra seletor
  if (!selectedMethod) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 md:space-y-8">
        <PaymentMethodSelector
          selectedMethod={selectedMethod}
          onSelect={handleMethodSelect}
        />

        {/* Botão voltar */}
        <div className="flex justify-start">
          <button
            onClick={handleBackToCustomer}
            className="rounded-lg border-2 border-neutral-300 bg-white px-4 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-semibold text-neutral-700 transition-all hover:border-neutral-400 hover:bg-neutral-50 active:scale-95"
          >
            Voltar para Dados Pessoais
          </button>
        </div>

        {/* Erro (se houver) */}
        {payment.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm md:text-base text-red-800 font-medium">
              {payment.error}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Mostra componente específico do método selecionado
  return (
    <div className="mx-auto max-w-3xl">
      {/* Loading state - Mostra spinner enquanto processa */}
      {payment.loading && (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-[var(--color-brand-primary)]" />
          <div className="text-center">
            <p className="text-base md:text-lg font-semibold text-neutral-800 mb-2">
              {selectedMethod === 'PIX' ? 'Gerando QR Code PIX...' : 'Processando pagamento...'}
            </p>
            <p className="text-sm md:text-base text-neutral-600">
              Aguarde um instante enquanto preparamos seu pagamento.
            </p>
          </div>
        </div>
      )}

      {/* PIX - Com QR Code disponível */}
      {!payment.loading && selectedMethod === 'PIX' && payment.qrCode && (
        <PixPayment
          pixData={payment.qrCode}
          value={getTotal()}
          onContinue={onSuccess}
        />
      )}

      {/* PIX - Loading state enquanto QR Code está sendo gerado */}
      {!payment.loading &&
        selectedMethod === 'PIX' &&
        !payment.qrCode &&
        !payment.error && (
          <div className="flex flex-col items-center justify-center gap-6 py-12">
            <MorphingSpinner size="lg" />
            <div className="text-center">
              <p className="text-base md:text-lg font-semibold text-neutral-800 mb-2">
                Gerando QR Code PIX...
              </p>
              <p className="text-sm md:text-base text-neutral-600">
                Aguarde um instante enquanto preparamos seu pagamento.
              </p>
            </div>
          </div>
        )}

      {/* Boleto - Apenas se NÃO estiver loading */}
      {!payment.loading && selectedMethod === 'BOLETO' && payment.bankSlipUrl && (
        <BoletoPayment
          bankSlipUrl={payment.bankSlipUrl}
          value={getTotal()}
          dueDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]}
          onContinue={onSuccess}
        />
      )}

      {/* Cartão de Crédito */}
      {!payment.loading && selectedMethod === 'CREDIT_CARD' && customer && (
        <CreditCardForm
          onSubmit={handleCardSubmit}
          customerName={customer.name}
          customerEmail={customer.email}
          customerCpfCnpj={customer.cpfCnpj}
          customerPhone={customer.phone}
          customerPostalCode={customer.postalCode}
          customerAddressNumber={customer.addressNumber}
          loading={payment.loading}
        />
      )}

      {/* Erro (se houver) */}
      {payment.error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm md:text-base text-red-800 font-medium">
            {payment.error}
          </p>
          <button
            onClick={() => {
              setSelectedMethod(undefined);
              setPaymentError(undefined);
            }}
            className="mt-3 text-sm md:text-base text-red-700 hover:text-red-900 font-medium underline"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}
