"use client";

import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Componente de Gestão de Repasses
 * Gerencia pagamentos de comissões a prescritores e representantes
 */

interface Payout {
  id: string;
  entityType: 'prescriber' | 'representative';
  entityId: string;
  entityName?: string;
  amount: string;
  periodStart: string;
  periodEnd: string;
  status: 'pending' | 'paid' | 'cancelled';
  paidAt: string | null;
  paymentMethod: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
}

interface EntityBalance {
  entityId: string;
  entityType: 'prescriber' | 'representative';
  entityName: string;
  totalCommissionsEarned: number;
  totalPaid: number;
  totalPending: number;
  balance: number;
}

export function PayoutsManager() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [balances, setBalances] = useState<EntityBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<EntityBalance | null>(null);

  useEffect(() => {
    fetchPayouts();
    fetchBalances();
  }, []);

  const fetchPayouts = async () => {
    try {
      const response = await fetch('/api/admin/payouts');
      const data = await response.json();
      if (response.ok) {
        setPayouts(data.payouts || []);
      }
    } catch (error) {
      console.error('Erro ao buscar repasses:', error);
    }
  };

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/payouts/balances');
      const data = await response.json();
      if (response.ok) {
        setBalances(data.balances || []);
      }
    } catch (error) {
      console.error('Erro ao buscar saldos:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePayoutStatus = async (
    payoutId: string, 
    status: 'paid' | 'cancelled',
    paymentMethod?: string,
    notes?: string
  ) => {
    try {
      const response = await fetch(`/api/admin/payouts/${payoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          paidAt: status === 'paid' ? new Date().toISOString() : null,
          paymentMethod,
          notes
        })
      });

      if (response.ok) {
        await fetchPayouts();
        await fetchBalances();
      }
    } catch (error) {
      console.error('Erro ao atualizar repasse:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-3 w-3" /> },
      paid: { label: 'Pago', class: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-3 w-3" /> },
      cancelled: { label: 'Cancelado', class: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" /> }
    };
    const badge = badges[status as keyof typeof badges];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${badge.class}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Saldo Devedor */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
        <div className="p-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Saldo Devedor</h3>
          <p className="text-sm text-neutral-600">Comissões a pagar por entidade</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Entidade</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Tipo</th>
                <th className="text-right py-3 px-4 font-semibold text-neutral-700">Comissões Geradas</th>
                <th className="text-right py-3 px-4 font-semibold text-neutral-700">Já Pago</th>
                <th className="text-right py-3 px-4 font-semibold text-neutral-700">Pendente</th>
                <th className="text-right py-3 px-4 font-semibold text-neutral-700">Saldo Devedor</th>
                <th className="text-center py-3 px-4 font-semibold text-neutral-700">Ação</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-neutral-500">
                    Carregando...
                  </td>
                </tr>
              ) : balances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-neutral-500">
                    Nenhuma comissão pendente
                  </td>
                </tr>
              ) : (
                balances.map((balance) => (
                  <tr key={`${balance.entityType}-${balance.entityId}`} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4 font-medium text-neutral-900">
                      {balance.entityName}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        balance.entityType === 'prescriber' 
                          ? 'bg-violet-100 text-violet-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {balance.entityType === 'prescriber' ? 'Prescritor' : 'Representante'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-700">
                      R$ {(balance.totalCommissionsEarned || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600">
                      R$ {(balance.totalPaid || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-yellow-600">
                      R$ {(balance.totalPending || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-neutral-900">
                      R$ {(balance.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {balance.balance > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEntity(balance);
                            setShowCreateModal(true);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Criar Repasse
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Histórico de Repasses */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
        <div className="p-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Histórico de Repasses</h3>
          <p className="text-sm text-neutral-600">Todos os repasses registrados</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Data</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Entidade</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Período</th>
                <th className="text-right py-3 px-4 font-semibold text-neutral-700">Valor</th>
                <th className="text-center py-3 px-4 font-semibold text-neutral-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Método</th>
                <th className="text-center py-3 px-4 font-semibold text-neutral-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-neutral-500">
                    Nenhum repasse registrado
                  </td>
                </tr>
              ) : (
                payouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4 text-neutral-600">
                      {new Date(payout.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-neutral-900">{payout.entityName || 'N/A'}</div>
                      <div className="text-xs text-neutral-500">
                        {payout.entityType === 'prescriber' ? 'Prescritor' : 'Representante'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-600 text-xs">
                      {new Date(payout.periodStart).toLocaleDateString('pt-BR')} - {new Date(payout.periodEnd).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-neutral-900">
                      R$ {Number(payout.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(payout.status)}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 capitalize">
                      {payout.paymentMethod || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {payout.status === 'pending' && (
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updatePayoutStatus(payout.id, 'paid', 'pix')}
                            className="text-green-600 hover:bg-green-50"
                          >
                            Marcar Pago
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updatePayoutStatus(payout.id, 'cancelled')}
                            className="text-red-600 hover:bg-red-50"
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
