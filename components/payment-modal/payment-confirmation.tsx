// Componente de confirmação de pagamento
// Exibe status e próximos passos após criação do pagamento

'use client';

import { CheckCircle, Clock, Mail, Download } from 'lucide-react';
import { BillingType, PaymentStatus } from '@/lib/types/payment';
import { cn } from '@/lib/utils';

interface PaymentConfirmationProps {
  billingType: BillingType;
  status: PaymentStatus;
  value: number;
  customerEmail: string;
  onClose?: () => void;
}

/**
 * Componente de confirmação de pagamento
 * Exibe mensagem de sucesso e próximos passos
 */
export function PaymentConfirmation({
  billingType,
  status,
  value,
  customerEmail,
  onClose,
}: PaymentConfirmationProps) {
  /**
   * Formata valor em reais
   */
  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  /**
   * Retorna informações baseadas no método de pagamento
   */
  const getPaymentInfo = () => {
    switch (billingType) {
      case 'PIX':
        return {
          title: 'Aguardando Pagamento PIX',
          icon: Clock,
          iconColor: 'text-[#355E3B]',
          bgColor: 'from-[#355E3B]/10 to-[#9CAF88]/20',
          borderColor: 'border-[#355E3B]/30',
          message:
            'O QR Code PIX foi gerado com sucesso. Assim que o pagamento for confirmado, você receberá um email de confirmação.',
          nextSteps: [
            'Realize o pagamento via PIX usando o QR Code ou código copia-e-cola',
            'O pagamento será confirmado automaticamente',
            'Você receberá um email com os dados de acesso',
            'Acesso liberado imediatamente após confirmação',
          ],
        };

      case 'BOLETO':
        return {
          title: 'Boleto Gerado com Sucesso',
          icon: CheckCircle,
          iconColor: 'text-[#8d7f72]',
          bgColor: 'from-[#8d7f72]/10 to-[#a89a8d]/20',
          borderColor: 'border-[#8d7f72]/30',
          message:
            'Seu boleto foi gerado e enviado para seu email. O pagamento será confirmado em até 1 dia útil após a compensação.',
          nextSteps: [
            'Pague o boleto em qualquer banco, lotérica ou internet banking',
            'A compensação ocorre em até 1 dia útil',
            'Você receberá um email de confirmação após o pagamento',
            'Acesso liberado após confirmação do pagamento',
          ],
        };

      case 'CREDIT_CARD':
        return {
          title: 'Pagamento Processado',
          icon: CheckCircle,
          iconColor: 'text-[#1a365d]',
          bgColor: 'from-[#1a365d]/10 to-[#553c9a]/20',
          borderColor: 'border-[#1a365d]/30',
          message:
            'Seu pagamento está sendo processado. Você receberá um email de confirmação em breve.',
          nextSteps: [
            'Aguarde alguns minutos para confirmação do pagamento',
            'Você receberá um email com os dados de acesso',
            'Acesso liberado automaticamente após aprovação',
            'Em caso de dúvidas, entre em contato com nosso suporte',
          ],
        };

      default:
        return {
          title: 'Pagamento Recebido',
          icon: CheckCircle,
          iconColor: 'text-green-600',
          bgColor: 'from-green-50 to-green-100',
          borderColor: 'border-green-200',
          message: 'Seu pagamento foi recebido com sucesso.',
          nextSteps: [],
        };
    }
  };

  const info = getPaymentInfo();
  const Icon = info.icon;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header com ícone */}
      <div className="flex flex-col items-center gap-3 md:gap-4 text-center">
        {/* Ícone animado */}
        <div
          className={cn(
            'flex h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 items-center justify-center rounded-full bg-gradient-to-br shadow-lg',
            info.bgColor,
            'animate-in zoom-in duration-300'
          )}
        >
          <Icon
            className={cn(
              'h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12',
              info.iconColor
            )}
          />
        </div>

        {/* Título */}
        <div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900">
            {info.title}
          </h2>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-neutral-600">
            {info.message}
          </p>
        </div>
      </div>

      {/* Valor pago */}
      <div
        className={cn(
          'rounded-xl md:rounded-2xl bg-gradient-to-br p-4 md:p-6 lg:p-8 border-2',
          info.bgColor,
          info.borderColor
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm md:text-base font-medium text-neutral-700">
            Valor:
          </span>
          <span className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900">
            {formatCurrency(value)}
          </span>
        </div>
      </div>

      {/* Email de confirmação */}
      <div className="rounded-lg md:rounded-xl bg-neutral-50 p-3 md:p-4 border border-neutral-200">
        <div className="flex items-start gap-2 md:gap-3">
          <Mail className="h-4 w-4 md:h-5 md:w-5 text-neutral-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs md:text-sm font-semibold text-neutral-900">
              Confirmação enviada para:
            </p>
            <p className="mt-0.5 md:mt-1 text-xs md:text-sm text-neutral-700 break-all">
              {customerEmail}
            </p>
          </div>
        </div>
      </div>

      {/* Próximos passos */}
      {info.nextSteps.length > 0 && (
        <div className="rounded-lg md:rounded-xl bg-gradient-to-br from-[#a89a8d]/10 to-[#a89a8d]/5 p-3 md:p-4 lg:p-6 border-2 border-[#a89a8d]/20">
          <h4 className="text-sm md:text-base font-semibold text-neutral-900 mb-2 md:mb-3">
            Próximos Passos:
          </h4>
          <ol className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-neutral-700">
            {info.nextSteps.map((step, index) => (
              <li key={index} className="flex gap-2">
                <span className="font-bold">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Informação adicional */}
      <div className="rounded-lg bg-neutral-50 p-3 md:p-4 border border-neutral-200">
        <p className="text-xs md:text-sm text-neutral-700 text-center">
          <span className="font-semibold">Precisa de ajuda?</span> Entre em
          contato com nosso suporte através do email contato@duonatural.com.br
        </p>
      </div>

      {/* Botão de fechar */}
      {onClose && (
        <button
          onClick={onClose}
          className="w-full rounded-full bg-[var(--color-brand-primary)] px-4 py-3 md:px-6 md:py-4 text-sm md:text-base font-semibold text-white transition-all hover:bg-[var(--color-brand-primary-dark)] active:scale-95"
        >
          Fechar
        </button>
      )}
    </div>
  );
}
