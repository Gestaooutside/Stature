// Componente de pagamento via Boleto Bancário
// Exibe link para PDF e instruções de pagamento

'use client';

import { FileText, Download, Calendar, Printer, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BoletoPaymentProps {
  bankSlipUrl: string;
  value: number;
  dueDate: string;
  barcode?: string;
  onContinue?: () => void;
}

/**
 * Componente de pagamento via Boleto
 * Exibe link para PDF do boleto e instruções de pagamento
 */
export function BoletoPayment({
  bankSlipUrl,
  value,
  dueDate,
  barcode,
  onContinue,
}: BoletoPaymentProps) {
  /**
   * Formata valor em reais
   */
  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  /**
   * Formata data de vencimento
   */
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  /**
   * Abre boleto em nova aba
   */
  const handleOpenBoleto = () => {
    window.open(bankSlipUrl, '_blank');
  };

  /**
   * Imprime boleto
   */
  const handlePrintBoleto = () => {
    const printWindow = window.open(bankSlipUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-3 border-b border-neutral-200 pb-3 md:pb-4">
        <FileText className="h-5 w-5 md:h-6 md:w-6 text-[var(--color-brand-primary)]" />
        <div>
          <h3 className="text-base md:text-lg lg:text-xl font-semibold text-neutral-900">
            Pagamento via Boleto Bancário
          </h3>
          <p className="text-xs md:text-sm text-neutral-600">
            Compensação em até 1 dia útil
          </p>
        </div>
      </div>

      {/* Valor e Vencimento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="rounded-xl md:rounded-2xl bg-gradient-to-br from-[#8d7f72]/10 to-[#a89a8d]/20 p-4 md:p-6 border-2 border-[#8d7f72]/30">
          <div className="flex flex-col gap-1 md:gap-2">
            <span className="text-xs md:text-sm font-medium text-[#8d7f72]">
              Valor do Boleto:
            </span>
            <span className="font-display text-2xl md:text-3xl font-bold text-[#8d7f72]">
              {formatCurrency(value)}
            </span>
          </div>
        </div>

        <div className="rounded-xl md:rounded-2xl bg-gradient-to-br from-[#a89a8d]/10 to-[#a89a8d]/5 p-4 md:p-6 border-2 border-[#a89a8d]/20">
          <div className="flex flex-col gap-1 md:gap-2">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-neutral-700" />
              <span className="text-xs md:text-sm font-medium text-neutral-700">
                Vencimento:
              </span>
            </div>
            <span className="text-base md:text-lg font-bold text-neutral-900">
              {formatDueDate(dueDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
        <button
          onClick={handleOpenBoleto}
          className="flex items-center justify-center gap-2 md:gap-3 rounded-lg bg-[#8d7f72] px-4 py-3 md:px-6 md:py-4 text-sm md:text-base font-semibold text-white transition-all duration-300 hover:bg-[#a89a8d] active:scale-95 shadow-md"
        >
          <Download className="h-4 w-4 md:h-5 md:w-5" />
          Baixar Boleto (PDF)
        </button>

        <button
          onClick={handlePrintBoleto}
          className="flex items-center justify-center gap-2 md:gap-3 rounded-lg border-2 border-[#8d7f72]/40 bg-white px-4 py-3 md:px-6 md:py-4 text-sm md:text-base font-semibold text-[#8d7f72] transition-all duration-300 hover:border-[#8d7f72] hover:bg-[#8d7f72]/5 active:scale-95"
        >
          <Printer className="h-4 w-4 md:h-5 md:w-5" />
          Imprimir Boleto
        </button>
      </div>

      {/* Código de barras (se disponível) */}
      {barcode && (
        <div className="space-y-2 md:space-y-3">
          <label className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700">
            Código de Barras
          </label>
          <div className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 md:px-4 md:py-3">
            <code className="text-xs md:text-sm font-mono text-neutral-900 break-all">
              {barcode}
            </code>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="rounded-lg md:rounded-xl bg-gradient-to-br from-[#a89a8d]/10 to-[#a89a8d]/5 p-3 md:p-4 border-2 border-[#a89a8d]/20">
        <h4 className="text-sm md:text-base font-semibold text-neutral-900 mb-2 md:mb-3">
          Como pagar o boleto:
        </h4>
        <ol className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-neutral-700">
          <li className="flex gap-2">
            <span className="font-bold">1.</span>
            <span>Baixe ou imprima o boleto usando os botões acima</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">2.</span>
            <span>
              Pague em qualquer banco, lotérica, caixa eletrônico ou pelo
              internet banking
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">3.</span>
            <span>A compensação acontece em até 1 dia útil</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">4.</span>
            <span>
              Você receberá um email de confirmação após o pagamento ser
              confirmado
            </span>
          </li>
        </ol>
      </div>

      {/* Aviso importante */}
      <div className="rounded-lg bg-gradient-to-br from-[#8d7f72]/10 to-[#a89a8d]/5 p-3 md:p-4 border-2 border-[#8d7f72]/20">
        <div className="flex gap-2 md:gap-3">
          <Calendar className="h-4 w-4 md:h-5 md:w-5 text-[#8d7f72] flex-shrink-0 mt-0.5" />
          <div className="space-y-1 md:space-y-2">
            <p className="text-xs md:text-sm font-semibold text-[#8d7f72]">
              Atenção ao vencimento
            </p>
            <p className="text-xs md:text-sm text-neutral-700">
              Pague até a data de vencimento para garantir seu acesso. Após o
              vencimento, o boleto não poderá mais ser pago.
            </p>
          </div>
        </div>
      </div>

      {/* Link direto */}
      <div className="rounded-lg bg-neutral-50 p-3 md:p-4 border border-neutral-200">
        <div className="flex items-start gap-2 md:gap-3">
          <ExternalLink className="h-4 w-4 md:h-5 md:w-5 text-neutral-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-neutral-700 mb-1 md:mb-2">
              Link direto do boleto:
            </p>
            <a
              href={bankSlipUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs md:text-sm text-[var(--color-brand-primary)] hover:underline break-all"
            >
              {bankSlipUrl}
            </a>
          </div>
        </div>
      </div>

      {/* Aviso final */}
      <div className="rounded-lg bg-neutral-50 p-3 md:p-4 border border-neutral-200">
        <p className="text-xs md:text-sm text-neutral-700 text-center">
          Guarde o comprovante de pagamento. Após a confirmação, você terá
          acesso imediato ao conteúdo.
        </p>
      </div>

      {/* Botão Continuar */}
      {onContinue && (
        <div className="flex flex-col gap-2 md:gap-3 pt-2 md:pt-4">
          <button
            onClick={onContinue}
            className="w-full rounded-lg bg-[var(--color-brand-primary)] px-6 py-3 md:py-4 text-base md:text-lg font-semibold text-white transition-all hover:bg-[var(--color-brand-primary-dark)] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            Continuar
          </button>
          <p className="text-xs md:text-sm text-center text-neutral-500">
            Você pode pagar o boleto depois e acompanhar o status do pedido
          </p>
        </div>
      )}
    </div>
  );
}
