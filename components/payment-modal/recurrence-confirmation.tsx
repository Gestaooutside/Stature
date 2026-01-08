"use client";

import React, { useState } from 'react';
import { AlertCircle, Clock, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Modal de confirmação de recorrência para cupons
 * Exibe detalhes da assinatura e obtém consentimento do cliente
 */

interface RecurrenceConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  couponCode: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  totalAmount: number;
  recurringCycle?: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

export function RecurrenceConfirmation({
  isOpen,
  onConfirm,
  onCancel,
  couponCode,
  discountType,
  discountValue,
  totalAmount,
  recurringCycle = 'MONTHLY'
}: RecurrenceConfirmationProps) {
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formata ciclo de recorrência
  const formatCycle = (cycle: string) => {
    switch (cycle) {
      case 'WEEKLY':
        return 'semanal';
      case 'MONTHLY':
        return 'mensal';
      case 'YEARLY':
        return 'anual';
      default:
        return 'mensal';
    }
  };

  // Calcula próxima data de cobrança
  const getNextDueDate = () => {
    const date = new Date();
    switch (recurringCycle) {
      case 'WEEKLY':
        date.setDate(date.getDate() + 7);
        break;
      case 'MONTHLY':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'YEARLY':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date.toLocaleDateString('pt-BR');
  };

  const handleSubmit = async () => {
    if (!agreed) return;

    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAgreed(false);
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmação de Assinatura
              </h3>
              <p className="text-sm text-gray-600">
                Você está ativando uma compra recorrente
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-6 py-4 space-y-4">
          {/* Alerta principal */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Atenção!</p>
              <p>Este cupom ativará cobranças automáticas no seu cartão de crédito.</p>
            </div>
          </div>

          {/* Detalhes do desconto */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Detalhes da Assinatura:</h4>

            <div className="space-y-2">
              {/* Cupom aplicado */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cupom:</span>
                <span className="font-mono font-semibold text-gray-900">
                  {couponCode}
                </span>
              </div>

              {/* Desconto */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Desconto:</span>
                <span className="font-semibold text-green-600">
                  {discountType === 'percentage'
                    ? `${discountValue}% OFF`
                    : `R$ ${discountValue.toFixed(2)} OFF`}
                </span>
              </div>

              {/* Ciclo de recorrência */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ciclo:</span>
                <span className="font-semibold text-blue-600">
                  {formatCycle(recurringCycle)}
                </span>
              </div>

              {/* Valor final */}
              <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                <span className="font-medium text-gray-900">Total mensal:</span>
                <span className="font-bold text-lg text-gray-900">
                  R$ {totalAmount.toFixed(2)}
                </span>
              </div>

              {/* Próxima cobrança */}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Próxima cobrança:</span>
                <span className="font-medium">{getNextDueDate()}</span>
              </div>
            </div>
          </div>

          {/* Informações importantes */}
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <CreditCard className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Método de pagamento:</strong> Apenas cartão de crédito aceito.
              </p>
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-600">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Cancelamento:</strong> Entre em contato com nosso suporte para cancelar a assinatura a qualquer momento.
              </p>
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Transparência:</strong> Você receberá um comprovante de cada cobrança por email.
              </p>
            </div>
          </div>

          {/* Checkbox de aceitação - Destaque visual obrigatório */}
          <div 
            className={`
              relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
              ${agreed 
                ? 'bg-green-50 border-green-500 shadow-sm' 
                : 'bg-blue-50 border-blue-400 shadow-md hover:border-blue-500 hover:shadow-lg animate-pulse'
              }
            `}
            onClick={() => setAgreed(!agreed)}
          >
            {/* Badge obrigatório */}
            {!agreed && (
              <span className="absolute -top-2.5 left-4 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                Obrigatório
              </span>
            )}
            
            <div className="flex items-start gap-4">
              <div className={`
                flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
                ${agreed 
                  ? 'bg-green-500 border-green-500' 
                  : 'bg-white border-blue-400'
                }
              `}>
                {agreed && (
                  <CheckCircle className="w-4 h-4 text-white" />
                )}
              </div>
              
              <div className="flex-1">
                <label 
                  htmlFor="agree-terms" 
                  className={`
                    text-sm leading-relaxed cursor-pointer select-none
                    ${agreed ? 'text-green-800' : 'text-blue-900 font-medium'}
                  `}
                >
                  {agreed ? '✓ ' : '👆 Clique aqui para aceitar: '}
                  Eu li e aceito os termos da assinatura recorrente. Entendo que serei cobrado
                  {' '}
                  <span className={`font-bold ${agreed ? 'text-green-700' : 'text-blue-700'}`}>
                    R$ {totalAmount.toFixed(2)} {formatCycle(recurringCycle)}
                  </span>
                  {' '}
                  automaticamente no meu cartão de crédito.
                </label>
              </div>
            </div>
            
            {/* Input hidden para acessibilidade */}
            <input
              type="checkbox"
              id="agree-terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="sr-only"
            />
          </div>
        </div>

        {/* Ações */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!agreed || isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? 'Processando...' : 'Concordar e Prosseguir'}
          </Button>
        </div>
      </div>
    </div>
  );
}