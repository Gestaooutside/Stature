'use client';

import { useState } from 'react';
import { Filter, X, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FiltersState {
  deliveryStatus: string;
  billingType: string;
  paymentStatus: string;
  startDate: string;
  endDate: string;
}

interface OrdersFiltersProps {
  onFilterChange: (filters: FiltersState) => void;
  activeFilters: FiltersState;
}

export function OrdersFilters({ onFilterChange, activeFilters }: OrdersFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClear = () => {
    onFilterChange({
      deliveryStatus: '',
      billingType: '',
      paymentStatus: '',
      startDate: '',
      endDate: '',
    });
    setIsOpen(false);
  };

  const handleChange = (key: keyof FiltersState, value: string) => {
    onFilterChange({
      ...activeFilters,
      [key]: value,
    });
  };

  const hasActiveFilters = Object.values(activeFilters).some(Boolean);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors",
          hasActiveFilters || isOpen
            ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary-dark)]"
            : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
        )}
      >
        <Filter className="w-4 h-4" />
        Filtros
        {hasActiveFilters && (
          <span className="flex items-center justify-center w-5 h-5 ml-1 text-xs text-white bg-[var(--color-brand-primary)] rounded-full">
            {Object.values(activeFilters).filter(Boolean).length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-20" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-30 w-72 mt-2 bg-white rounded-xl shadow-xl border border-neutral-200 p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-900">Filtrar Pedidos</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Status de Entrega */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 uppercase mb-1.5">
                  Status de Entrega
                </label>
                <select
                  value={activeFilters.deliveryStatus}
                  onChange={(e) => handleChange('deliveryStatus', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
                >
                  <option value="">Todos</option>
                  <option value="PENDING">Pendente</option>
                  <option value="PREPARING">Preparando</option>
                  <option value="SHIPPED">Enviado</option>
                  <option value="DELIVERED">Entregue</option>
                  <option value="RETURNED">Devolvido</option>
                </select>
              </div>

              {/* Método de Pagamento */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 uppercase mb-1.5">
                  Método de Pagamento
                </label>
                <select
                  value={activeFilters.billingType}
                  onChange={(e) => handleChange('billingType', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
                >
                  <option value="">Todos</option>
                  <option value="PIX">Pix</option>
                  <option value="CREDIT_CARD">Cartão de Crédito</option>
                  <option value="BOLETO">Boleto</option>
                </select>
              </div>

              {/* Status de Pagamento */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 uppercase mb-1.5">
                  Status de Pagamento
                </label>
                <select
                  value={activeFilters.paymentStatus}
                  onChange={(e) => handleChange('paymentStatus', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
                >
                  <option value="">Todos</option>
                  <option value="PAID">Pago</option>
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="PENDING">Pendente</option>
                  <option value="AWAITING_PAYMENT">Aguardando Pagamento</option>
                  <option value="CANCELLED">Cancelado</option>
                  <option value="REFUNDED">Reembolsado</option>
                </select>
              </div>

              {/* Data De/Até */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-neutral-500 uppercase">
                  Data de Criação
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="date"
                      value={activeFilters.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-[var(--color-brand-primary)]"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      value={activeFilters.endDate}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-[var(--color-brand-primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="pt-2 border-t border-neutral-100 flex gap-2">
                <button
                  onClick={handleClear}
                  className="flex-1 px-3 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Limpar
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-[var(--color-brand-primary)] rounded-lg hover:bg-[var(--color-brand-primary-dark)] transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

