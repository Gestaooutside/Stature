// Componente de pagamento via PIX
// Exibe QR Code e código copia e cola

'use client';

import { useState } from 'react';
import { Smartphone, Copy, Check, QrCode, Clock } from 'lucide-react';
import { AsaasPixResponse } from '@/lib/types/payment';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PixPaymentProps {
  pixData: AsaasPixResponse;
  value: number;
  onContinue?: () => void;
}

/**
 * Componente de pagamento PIX
 * Exibe QR Code e código para copiar e colar
 */
export function PixPayment({ pixData, value, onContinue }: PixPaymentProps) {
  const [copied, setCopied] = useState(false);
  
  // DEBUG: Log dos dados recebidos pelo componente
  console.log('[PixPayment] ====== COMPONENTE RENDERIZADO ======');
  console.log('[PixPayment] pixData recebido:', pixData);
  console.log('[PixPayment] pixData.encodedImage:', pixData?.encodedImage ? `SIM (${pixData.encodedImage.length} chars)` : 'NÃO');
  console.log('[PixPayment] pixData.payload:', pixData?.payload ? `SIM (${pixData.payload.length} chars)` : 'NÃO');
  console.log('[PixPayment] pixData.expirationDate:', pixData?.expirationDate || 'NÃO');
  console.log('[PixPayment] value:', value);

  /**
   * Copia código PIX para área de transferência
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixData.payload);
      setCopied(true);

      // Reseta estado após 2 segundos
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Erro ao copiar código PIX:', error);
    }
  };

  /**
   * Formata valor em reais
   */
  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  /**
   * Formata data de expiração
   */
  const formatExpirationDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-3 border-b border-neutral-200 pb-3 md:pb-4">
        <Smartphone className="h-5 w-5 md:h-6 md:w-6 text-[var(--color-brand-primary)]" />
        <div>
          <h3 className="text-base md:text-lg lg:text-xl font-semibold text-neutral-900">
            Pagamento via PIX
          </h3>
          <p className="text-xs md:text-sm text-neutral-600">
            Aprovação instantânea após o pagamento
          </p>
        </div>
      </div>

      {/* Valor */}
      <div className="rounded-xl md:rounded-2xl bg-gradient-to-br from-[#355E3B]/10 to-[#9CAF88]/20 p-4 md:p-6 border-2 border-[#355E3B]/30">
        <div className="flex items-center justify-between">
          <span className="text-sm md:text-base font-medium text-[#355E3B]">
            Valor a pagar:
          </span>
          <span className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-[#355E3B]">
            {formatCurrency(value)}
          </span>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center gap-3 md:gap-4">
        <div className="rounded-xl md:rounded-2xl bg-white p-3 md:p-4 lg:p-6 shadow-xl border-2 border-neutral-200">
          {pixData.encodedImage ? (
            <div className="relative">
              <Image
                src={`data:image/png;base64,${pixData.encodedImage}`}
                alt="QR Code PIX"
                width={200}
                height={200}
                className="w-40 h-40 md:w-56 md:h-56 lg:w-64 lg:h-64"
              />
              {/* Ícone PIX no centro */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white shadow-lg">
                  <QrCode className="h-5 w-5 md:h-6 md:w-6 text-[#355E3B]" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-40 w-40 md:h-56 md:w-56 lg:h-64 lg:w-64 items-center justify-center bg-neutral-100 rounded-lg">
              <QrCode className="h-12 w-12 md:h-16 md:w-16 text-neutral-400" />
            </div>
          )}
        </div>

        <p className="text-xs md:text-sm text-center text-neutral-600 max-w-md">
          Abra o app do seu banco e escaneie o QR Code acima ou copie o código
          PIX abaixo
        </p>
      </div>

      {/* Código copia e cola */}
      <div className="space-y-2 md:space-y-3">
        <label className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-neutral-700">
          <Copy className="h-3.5 w-3.5 md:h-4 md:w-4" />
          Código PIX Copia e Cola
        </label>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={pixData.payload}
              readOnly
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 md:px-4 md:py-3 pr-10 text-xs md:text-sm font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#355E3B]/40"
            />
          </div>

          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1.5 md:gap-2 rounded-lg px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold transition-all duration-300 active:scale-95 whitespace-nowrap',
              copied
                ? 'bg-green-500 text-white'
                : 'bg-[#355E3B] text-white hover:bg-[#355E3B]/90'
            )}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instruções */}
      <div className="rounded-lg md:rounded-xl bg-gradient-to-br from-[#a89a8d]/10 to-[#a89a8d]/5 p-3 md:p-4 border-2 border-[#a89a8d]/20">
        <h4 className="text-sm md:text-base font-semibold text-neutral-900 mb-2 md:mb-3">
          Como pagar com PIX:
        </h4>
        <ol className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-neutral-700">
          <li className="flex gap-2">
            <span className="font-bold">1.</span>
            <span>Abra o aplicativo do seu banco</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">2.</span>
            <span>Escolha pagar com PIX e escaneie o QR Code ou cole o código</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">3.</span>
            <span>Confirme o pagamento</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">4.</span>
            <span>Pronto! O pagamento será confirmado automaticamente</span>
          </li>
        </ol>
      </div>

      {/* Expiração */}
      <div className="flex items-center justify-center gap-2 md:gap-3 rounded-lg bg-orange-50 p-2.5 md:p-3 border border-orange-200">
        <Clock className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
        <p className="text-xs md:text-sm text-orange-800">
          <span className="font-semibold">Válido até:</span>{' '}
          {formatExpirationDate(pixData.expirationDate)}
        </p>
      </div>

      {/* Aviso */}
      <div className="rounded-lg bg-neutral-50 p-3 md:p-4 border border-neutral-200">
        <p className="text-xs md:text-sm text-neutral-700 text-center">
          Após o pagamento, você receberá uma confirmação por email e terá
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
            Já fiz o pagamento
          </button>
          <p className="text-xs md:text-sm text-center text-neutral-500">
            Clique acima após realizar o pagamento para acompanhar o status
          </p>
        </div>
      )}
    </div>
  );
}
