"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Users, DollarSign, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatsGrid, StatsCard } from '@/components/admin/stats-card';

/**
 * Dashboard de Vendas por Entidade
 * Visualização detalhada de vendas e comissões por prescritor/representante
 */

interface EntitySales {
  entityId: string;
  entityName: string;
  entityType: 'prescriber' | 'representative';
  totalSales: number;
  totalOrders: number;
  totalCommissions: number;
  averageOrderValue: number;
  lastSaleDate: string | null;
}

export function SalesManagementDashboard() {
  const [salesData, setSalesData] = useState<EntitySales[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<'all' | 'prescriber' | 'representative'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Define período padrão (últimos 30 dias)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setDateEnd(end.toISOString().split('T')[0]);
    setDateStart(start.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (dateStart && dateEnd) {
      fetchSalesData();
    }
  }, [dateStart, dateEnd, entityTypeFilter]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: dateStart,
        endDate: dateEnd,
        ...(entityTypeFilter !== 'all' && { entityType: entityTypeFilter })
      });

      const response = await fetch(`/api/admin/sales/by-entity?${params}`);
      const data = await response.json();

      if (response.ok) {
        setSalesData(data.sales || []);
      }
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar por termo de busca
  const filteredData = salesData.filter(s =>
    s.entityName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular totais
  const totals = filteredData.reduce((acc, item) => ({
    sales: acc.sales + item.totalSales,
    orders: acc.orders + item.totalOrders,
    commissions: acc.commissions + item.totalCommissions
  }), { sales: 0, orders: 0, commissions: 0 });

  const exportToCSV = () => {
    const headers = ['Entidade', 'Tipo', 'Total Vendas', 'Pedidos', 'Comissões', 'Ticket Médio', 'Última Venda'];
    const rows = filteredData.map(s => [
      s.entityName,
      s.entityType === 'prescriber' ? 'Prescritor' : 'Representante',
      `R$ ${s.totalSales.toFixed(2)}`,
      s.totalOrders,
      `R$ ${s.totalCommissions.toFixed(2)}`,
      `R$ ${s.averageOrderValue.toFixed(2)}`,
      s.lastSaleDate ? new Date(s.lastSaleDate).toLocaleDateString('pt-BR') : '-'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `vendas_${dateStart}_${dateEnd}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Data Início</label>
            <Input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Data Fim</label>
            <Input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Tipo</label>
            <select
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value as any)}
              className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="all">Todos</option>
              <option value="prescriber">Prescritores</option>
              <option value="representative">Representantes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Buscar</label>
            <Input
              placeholder="Nome da entidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={exportToCSV} disabled={filteredData.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Total em Vendas"
          value={`R$ ${(totals.sales || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle={`${filteredData.length} entidades`}
          icon={DollarSign}
          iconColor="text-emerald-600"
        />
        <StatsCard
          title="Total de Pedidos"
          value={(totals.orders || 0).toString()}
          subtitle={`Média: ${((totals.orders || 0) / (filteredData.length || 1)).toFixed(1)} por entidade`}
          icon={TrendingUp}
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Comissões Geradas"
          value={`R$ ${(totals.commissions || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle={`${(((totals.commissions || 0) / (totals.sales || 1)) * 100 || 0).toFixed(1)}% do total`}
          icon={Users}
          iconColor="text-purple-600"
        />
        <StatsCard
          title="Ticket Médio"
          value={`R$ ${(((totals.sales || 0) / (totals.orders || 1)) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Por pedido"
          icon={Calendar}
          iconColor="text-amber-600"
        />
      </StatsGrid>

      {/* Tabela de Vendas */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Entidade</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Tipo</th>
                <th className="text-right py-3 px-4 font-semibold text-neutral-700">Total Vendas</th>
                <th className="text-center py-3 px-4 font-semibold text-neutral-700">Pedidos</th>
                <th className="text-right py-3 px-4 font-semibold text-neutral-700">Comissões</th>
                <th className="text-right py-3 px-4 font-semibold text-neutral-700">Ticket Médio</th>
                <th className="text-center py-3 px-4 font-semibold text-neutral-700">Última Venda</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-neutral-500">
                    Carregando...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-neutral-500">
                    Nenhuma venda encontrada
                  </td>
                </tr>
              ) : (
                filteredData
                  .sort((a, b) => b.totalSales - a.totalSales)
                  .map((sale) => (
                    <tr key={sale.entityId} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4 font-medium text-neutral-900">
                        {sale.entityName}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          sale.entityType === 'prescriber'
                            ? 'bg-violet-100 text-violet-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {sale.entityType === 'prescriber' ? 'Prescritor' : 'Representante'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-neutral-900">
                        R$ {(sale.totalSales || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center text-neutral-700">
                        {sale.totalOrders || 0}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        R$ {(sale.totalCommissions || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-neutral-700">
                        R$ {(sale.averageOrderValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center text-neutral-600 text-xs">
                        {sale.lastSaleDate
                          ? new Date(sale.lastSaleDate).toLocaleDateString('pt-BR')
                          : '-'}
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
