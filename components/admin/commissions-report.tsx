"use client";

import React, { useState, useEffect } from 'react';
import { Search, Download, TrendingUp, DollarSign, Users, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatsGrid, StatsCard } from '@/components/admin/stats-card';

/**
 * Componente de Relatório de Comissões
 * Dashboard interativo para visualização e análise de comissões
 */

interface CommissionRecord {
  id: string;
  orderId: string;
  couponCode: string;
  prescriberName: string | null;
  representativeName: string | null;
  saleAmount: number;
  prescriberCommissionRate: number | null;
  prescriberCommissionAmount: number | null;
  representativeCommissionRate: number | null;
  representativeCommissionAmount: number | null;
  createdAt: string;
}

interface CommissionSummary {
  totalSales: number;
  totalPrescriberCommissions: number;
  totalRepresentativeCommissions: number;
  totalCommissions: number;
  recordCount: number;
}

export function CommissionsReport() {
  const [records, setRecords] = useState<CommissionRecord[]>([]);
  const [summary, setSummary] = useState<CommissionSummary>({
    totalSales: 0,
    totalPrescriberCommissions: 0,
    totalRepresentativeCommissions: 0,
    totalCommissions: 0,
    recordCount: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<'none' | 'prescriber' | 'representative' | 'month'>('none');

  // Define período padrão (últimos 90 dias para garantir visualização)
  useEffect(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999); // Final do dia de hoje
    const start = new Date();
    start.setDate(start.getDate() - 90); // Últimos 90 dias
    start.setHours(0, 0, 0, 0); // Início do dia
    
    setDateEnd(end.toISOString().split('T')[0]);
    setDateStart(start.toISOString().split('T')[0]);
  }, []);

  // Busca dados quando os filtros mudam
  useEffect(() => {
    if (dateStart && dateEnd) {
      fetchCommissions();
    }
  }, [dateStart, dateEnd, groupBy]);

  const processExistingOrders = async () => {
    if (!confirm('Processar todos os pedidos pagos sem comissão registrada?\n\nIsso pode levar alguns minutos dependendo da quantidade de pedidos.')) {
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch('/api/admin/commissions/process-existing', {
        method: 'POST'
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Processamento concluído!\n\n` +
          `• Processados: ${data.summary.processed}\n` +
          `• Ignorados: ${data.summary.skipped}\n` +
          `• Erros: ${data.summary.errors}\n\n` +
          `Os dados serão atualizados automaticamente.`);
        
        // Recarrega dados
        await fetchCommissions();
      } else {
        throw new Error(data.error || 'Erro ao processar pedidos');
      }
    } catch (error) {
      console.error('Erro ao processar pedidos:', error);
      alert('❌ Erro ao processar pedidos. Verifique o console.');
    } finally {
      setProcessing(false);
    }
  };

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: dateStart,
        endDate: dateEnd,
        ...(groupBy !== 'none' && { groupBy })
      });

      const response = await fetch(`/api/admin/commissions/report?${params}`);
      const data = await response.json();

      if (response.ok) {
        // Mapeia os dados do relatório para o formato esperado
        const mappedRecords = (data.report || []).map((item: any) => {
          if (item.commissionRecord) {
            // Formato sem agrupamento
            return {
              id: item.commissionRecord.id,
              orderId: item.commissionRecord.orderId,
              couponCode: item.order?.metadata?.couponCode || '-',
              prescriberName: item.prescriber?.name || null,
              representativeName: item.representative?.name || null,
              saleAmount: Number(item.commissionRecord.saleAmount || 0),
              prescriberCommissionRate: Number(item.commissionRecord.prescriberCommissionRate || 0),
              prescriberCommissionAmount: Number(item.commissionRecord.prescriberCommissionAmount || 0),
              representativeCommissionRate: Number(item.commissionRecord.representativeCommissionRate || 0),
              representativeCommissionAmount: Number(item.commissionRecord.representativeCommissionAmount || 0),
              createdAt: item.commissionRecord.createdAt
            };
          }
          return item;
        });

        setRecords(mappedRecords);
        
        // Calcula totais se não vieram no summary
        const summary = data.summary || {
          totalSales: 0,
          totalPrescriberCommissions: 0,
          totalRepresentativeCommissions: 0,
          totalCommissions: 0,
          recordCount: 0
        };

        // Recalcula totalCommissions
        summary.totalCommissions = summary.totalPrescriberCommissions + summary.totalRepresentativeCommissions;

        setSummary(summary);
      }
    } catch (error) {
      console.error('Erro ao buscar comissões:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Data',
      'Pedido',
      'Cupom',
      'Prescritor',
      'Valor Venda',
      'Taxa Prescritor',
      'Comissão Prescritor',
      'Representante',
      'Taxa Representante',
      'Comissão Representante'
    ];

    const rows = filteredRecords.map(r => [
      new Date(r.createdAt).toLocaleDateString('pt-BR'),
      r.orderId.slice(0, 8),
      r.couponCode || '-',
      r.prescriberName || '-',
      `R$ ${r.saleAmount.toFixed(2)}`,
      r.prescriberCommissionRate ? `${r.prescriberCommissionRate}%` : '-',
      r.prescriberCommissionAmount ? `R$ ${r.prescriberCommissionAmount.toFixed(2)}` : '-',
      r.representativeName || '-',
      r.representativeCommissionRate ? `${r.representativeCommissionRate}%` : '-',
      r.representativeCommissionAmount ? `R$ ${r.representativeCommissionAmount.toFixed(2)}` : '-'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `comissoes_${dateStart}_${dateEnd}.csv`;
    link.click();
  };

  // Filtrar registros por termo de busca
  const filteredRecords = records.filter(r => {
    const term = searchTerm.toLowerCase();
    return (
      r.prescriberName?.toLowerCase().includes(term) ||
      r.representativeName?.toLowerCase().includes(term) ||
      r.couponCode?.toLowerCase().includes(term)
    );
  });

  const viewAllRecords = () => {
    // Define período amplo (últimos 365 dias)
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setDate(start.getDate() - 365);
    start.setHours(0, 0, 0, 0);
    
    setDateEnd(end.toISOString().split('T')[0]);
    setDateStart(start.toISOString().split('T')[0]);
  };

  // Debug: Log quando buscar dados
  useEffect(() => {
    console.log('📅 Filtros de data:', { dateStart, dateEnd, groupBy });
  }, [dateStart, dateEnd, groupBy]);

  return (
    <div className="space-y-6">
      {/* Ações Rápidas */}
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={viewAllRecords}
          className="gap-2"
        >
          <Calendar className="h-4 w-4" />
          Ver Últimos 12 Meses
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={processExistingOrders}
          disabled={processing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
          {processing ? 'Processando...' : 'Processar Pedidos Existentes'}
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Período */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Data Início
            </label>
            <Input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Data Fim
            </label>
            <Input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Agrupamento */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Agrupar por
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="none">Sem agrupamento</option>
              <option value="prescriber">Prescritor</option>
              <option value="representative">Representante</option>
              <option value="month">Mês</option>
            </select>
          </div>

          {/* Busca */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Prescritor, representante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Botão Exportar */}
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={filteredRecords.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Total de Vendas"
          value={`R$ ${(summary.totalSales || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle={`${summary.recordCount || 0} pedidos`}
          icon={DollarSign}
          iconColor="text-emerald-600"
        />
        <StatsCard
          title="Comissões Prescritores"
          value={`R$ ${(summary.totalPrescriberCommissions || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle={`${(((summary.totalPrescriberCommissions || 0) / (summary.totalSales || 1)) * 100 || 0).toFixed(1)}% do total`}
          icon={Users}
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Comissões Representantes"
          value={`R$ ${(summary.totalRepresentativeCommissions || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle={`${(((summary.totalRepresentativeCommissions || 0) / (summary.totalSales || 1)) * 100 || 0).toFixed(1)}% do total`}
          icon={TrendingUp}
          iconColor="text-purple-600"
        />
        <StatsCard
          title="Total Comissões"
          value={`R$ ${(summary.totalCommissions || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle={`${(((summary.totalCommissions || 0) / (summary.totalSales || 1)) * 100 || 0).toFixed(1)}% do total`}
          icon={Calendar}
          iconColor="text-amber-600"
        />
      </StatsGrid>

      {/* Tabela de Registros */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Data</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Pedido</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Cupom</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Prescritor</th>
                <th className="text-right py-3 px-4 font-semibold text-neutral-700">Venda</th>
                <th className="text-right py-3 px-4 font-semibold text-neutral-700">Com. Presc.</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Representante</th>
                <th className="text-right py-3 px-4 font-semibold text-neutral-700">Com. Rep.</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-neutral-500">
                    Carregando...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-neutral-500">
                    Nenhum registro encontrado
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4 text-neutral-600">
                      {new Date(record.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-neutral-600">
                      {record.orderId.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-4">
                      {record.couponCode ? (
                        <span className="inline-block px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs font-medium">
                          {record.couponCode}
                        </span>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-700">
                      {record.prescriberName || <span className="text-neutral-400">-</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-neutral-900">
                      R$ {(record.saleAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {record.prescriberCommissionAmount ? (
                        <div>
                          <div className="font-semibold text-green-600">
                            R$ {Number(record.prescriberCommissionAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {record.prescriberCommissionRate || 0}%
                          </div>
                        </div>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-700">
                      {record.representativeName || <span className="text-neutral-400">-</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {record.representativeCommissionAmount ? (
                        <div>
                          <div className="font-semibold text-blue-600">
                            R$ {Number(record.representativeCommissionAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {record.representativeCommissionRate || 0}%
                          </div>
                        </div>
                      ) : (
                        <span className="text-neutral-400">-</span>
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
