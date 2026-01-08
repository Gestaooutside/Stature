"use client";

import React, { useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  LogOut,
  RefreshCcw,
  DollarSign,
  Truck,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShoppingBag,
  Receipt,
  Package,
  Settings2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { OrdersFilters } from "@/components/admin/orders-filters";
import { adminSidebarLinks } from "@/lib/config/admin-sidebar";
import { WhatsAppButton } from "@/components/admin/whatsapp-button";

interface OrderSummary {
  awaiting: number;
  paid: number;
  revenueMonth: number;
}

interface OrderListItem {
  id: string;
  status: string;
  deliveryStatus: string;
  total: number;
  billingType: string | null;
  createdAt: string;
  metadata: any;
  paymentStatus: string | null;
  paymentValue: number | null;
  paymentPaidAt: string | null;
}

// Definição das colunas disponíveis na tabela de pedidos
const AVAILABLE_ORDER_COLUMNS = [
  { id: 'pedido', label: 'Pedido', alwaysVisible: true },
  { id: 'cliente', label: 'Cliente', defaultVisible: true },
  { id: 'whatsapp', label: 'WhatsApp', defaultVisible: true },
  { id: 'valor', label: 'Valor', defaultVisible: true },
  { id: 'cupom', label: 'Cupom', defaultVisible: true },
  { id: 'entrega', label: 'Entrega', defaultVisible: true },
  { id: 'status', label: 'Status', defaultVisible: true },
  { id: 'data', label: 'Data', defaultVisible: true },
];

export default function OrdersPage() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const links = adminSidebarLinks;

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-900 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700",
        "min-h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center justify-start gap-2 group/sidebar py-3 md:py-2 text-left touch-manipulation"
            >
              <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
              <motion.span
                animate={{
                  display: open ? "inline-block" : "none",
                  opacity: open ? 1 : 0,
                }}
                className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
              >
                Sair
              </motion.span>
            </button>
            <SidebarLink
              link={{
                label: "Admin",
                href: "#",
                icon: (
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-white flex items-center justify-center text-neutral-900 text-sm font-bold border border-neutral-200">
                    A
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <OrdersContent />
    </div>
  );
}

const OrdersContent = () => {
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [ordersData, setOrdersData] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderListItem | null>(null);

  // Estado do seletor de colunas (carrega do localStorage)
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (typeof window === 'undefined') return AVAILABLE_ORDER_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
    const saved = localStorage.getItem('orders-visible-columns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return AVAILABLE_ORDER_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
      }
    }
    return AVAILABLE_ORDER_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
  });
  
  // Carregar filtros do localStorage
  const [filters, setFilters] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('duo_admin_orders_filters');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          console.error('Erro ao carregar filtros:', e);
        }
      }
    }
    return {
      deliveryStatus: '',
      billingType: '',
      paymentStatus: '',
      startDate: '',
      endDate: '',
    };
  });

  // Salvar filtros no localStorage sempre que mudarem
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('duo_admin_orders_filters', JSON.stringify(filters));
    }
  }, [filters]);

  // Toggle de visibilidade de coluna
  const toggleColumn = (columnId: string) => {
    setVisibleColumns(prev => {
      const newColumns = prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId];

      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('orders-visible-columns', JSON.stringify(newColumns));
      }

      return newColumns;
    });
  };

  // Verificar se coluna está visível
  const isColumnVisible = (columnId: string) => {
    const column = AVAILABLE_ORDER_COLUMNS.find(col => col.id === columnId);
    if (column?.alwaysVisible) return true;
    return visibleColumns.includes(columnId);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.deliveryStatus) params.append('deliveryStatus', filters.deliveryStatus);
      if (filters.billingType) params.append('billingType', filters.billingType);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Falha ao carregar pedidos");
      }
      const data = await response.json();
      setSummary(data.summary);
      setOrdersData(data.orders);
      setSelectedOrder(data.orders?.[0] || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  /**
   * Traduz status do pedido para português e aplica cores adequadas
   * Status do Asaas: PENDING, AWAITING_PAYMENT, PAID, CONFIRMED, CANCELLED, REFUNDED
   */
  const updateDeliveryStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryStatus: status }),
      });

      if (!response.ok) throw new Error('Falha ao atualizar status');

      const updatedOrder = await response.json();
      
      setOrdersData(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, deliveryStatus: status }
          : order
      ));
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, deliveryStatus: status } : null);
      }
    } catch (error) {
      console.error('Erro ao atualizar status de entrega:', error);
      alert('Erro ao atualizar status de entrega');
    }
  };

  const statusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      // Status de sucesso (verde)
      PAID: { 
        label: "Pago", 
        className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" 
      },
      CONFIRMED: { 
        label: "Confirmado", 
        className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" 
      },
      RECEIVED: { 
        label: "Recebido", 
        className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" 
      },
      RECEIVED_IN_CASH: { 
        label: "Recebido em Dinheiro", 
        className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" 
      },
      
      // Status pendente (amarelo/laranja)
      PENDING: { 
        label: "Pendente", 
        className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" 
      },
      AWAITING_PAYMENT: { 
        label: "Aguardando Pagamento", 
        className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" 
      },
      AUTHORIZED: { 
        label: "Autorizado", 
        className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" 
      },
      OVERDUE: { 
        label: "Vencido", 
        className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" 
      },
      AWAITING_RISK_ANALYSIS: { 
        label: "Em Análise", 
        className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" 
      },
      
      // Status de reembolso (azul)
      REFUNDED: { 
        label: "Reembolsado", 
        className: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300" 
      },
      REFUND_REQUESTED: { 
        label: "Reembolso Solicitado", 
        className: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300" 
      },
      
      // Status de cancelamento/erro (vermelho)
      CANCELLED: { 
        label: "Cancelado", 
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" 
      },
      FAILED: { 
        label: "Falhou", 
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" 
      },
      
      // Status de chargeback (roxo)
      CHARGEBACK_REQUESTED: { 
        label: "Chargeback Solicitado", 
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" 
      },
      CHARGEBACK_DISPUTE: { 
        label: "Disputa de Chargeback", 
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" 
      },
      AWAITING_CHARGEBACK_REVERSAL: { 
        label: "Aguardando Reversão", 
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" 
      },
      
      // Status de cobrança (cinza/neutro)
      DUNNING_REQUESTED: { 
        label: "Cobrança Enviada", 
        className: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300" 
      },
      DUNNING_RECEIVED: { 
        label: "Cobrança Recebida", 
        className: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300" 
      },
    };

    const config = statusConfig[status] || { 
      label: status.replace(/_/g, " ").toLowerCase(), 
      className: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300" 
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const deliveryStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      PENDING: {
        label: "Pendente",
        className: "bg-gray-100 text-gray-700 border border-gray-200",
        icon: <Clock className="w-3 h-3" />
      },
      PREPARING: {
        label: "Preparando",
        className: "bg-blue-50 text-blue-700 border border-blue-200",
        icon: <Package className="w-3 h-3" />
      },
      SHIPPED: {
        label: "Enviado",
        className: "bg-purple-50 text-purple-700 border border-purple-200",
        icon: <Truck className="w-3 h-3" />
      },
      DELIVERED: {
        label: "Entregue",
        className: "bg-green-50 text-green-700 border border-green-200",
        icon: <CheckCircle2 className="w-3 h-3" />
      },
      RETURNED: {
        label: "Devolvido",
        className: "bg-red-50 text-red-700 border border-red-200",
        icon: <AlertCircle className="w-3 h-3" />
      },
    };

    const statusConfig = config[status] || config.PENDING;

    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-transparent", statusConfig.className)}>
        {statusConfig.icon}
        {statusConfig.label}
      </span>
    );
  };

  return (
    <div className="flex flex-1 overflow-y-auto">
      <div className="p-4 sm:p-6 md:p-10 rounded-tl-2xl border border-neutral-200 bg-white flex flex-col gap-4 flex-1 w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">Pedidos</h1>
            <p className="text-neutral-500 text-sm">Controle completo dos pedidos confirmados e pendentes.</p>
          </div>
          <div className="flex items-center gap-3">
            <OrdersFilters
              activeFilters={filters}
              onFilterChange={setFilters}
            />

            {/* Seletor de Colunas Visíveis */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Colunas Visíveis</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {AVAILABLE_ORDER_COLUMNS.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={isColumnVisible(column.id)}
                    onCheckedChange={() => toggleColumn(column.id)}
                    disabled={column.alwaysVisible}
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={fetchOrders}
              className="inline-flex items-center rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition bg-white"
            >
              <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Atualizar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <SummaryCard
            icon={<ShoppingBag className="h-5 w-5" />}
            label="Pagos"
            value={summary ? summary.paid : 0}
            loading={loading}
          />
          <SummaryCard
            icon={<Receipt className="h-5 w-5" />}
            label="Aguardando"
            value={summary ? summary.awaiting : 0}
            loading={loading}
            accent="text-amber-600"
          />
          <SummaryCard
            icon={<DollarSign className="h-5 w-5" />}
            label="Receita (mês)"
            value={summary ? formatCurrency(summary.revenueMonth) : "R$ 0,00"}
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Detalhes do Pedido - Aparece primeiro no mobile */}
          <div className="order-first xl:order-last rounded-xl border border-neutral-200 bg-white shadow-sm p-5 max-h-[400px] xl:max-h-[calc(100vh-280px)] overflow-y-auto">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">Detalhes do Pedido</h3>
            {selectedOrder ? (
              <div className="space-y-5 text-sm">
                {/* Código e Status */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div>
                    <p className="text-neutral-500 text-xs uppercase">Código</p>
                    <p className="font-mono text-neutral-900 text-xs">{selectedOrder.id}</p>
                  </div>
                  {statusBadge(selectedOrder.status)}
                </div>

                {/* Status de Entrega */}
                <div>
                  <p className="text-neutral-500 text-xs uppercase mb-2">Status de Entrega</p>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedOrder.deliveryStatus || 'PENDING'}
                      onChange={(e) => updateDeliveryStatus(selectedOrder.id, e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
                    >
                      <option value="PENDING">Pendente</option>
                      <option value="PREPARING">Preparando</option>
                      <option value="SHIPPED">Enviado</option>
                      <option value="DELIVERED">Entregue</option>
                      <option value="RETURNED">Devolvido</option>
                    </select>
                  </div>
                </div>

                {/* Dados do Cliente */}
                <div className="space-y-3">
                  <p className="text-neutral-500 text-xs uppercase font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-primary)]"></span>
                    Cliente
                  </p>
                  <div className="bg-neutral-50 rounded-lg p-3 space-y-2">
                    <p className="text-neutral-900 font-medium">
                      {selectedOrder.metadata?.customerSnapshot?.name || "Cliente DUO"}
                    </p>
                    {selectedOrder.metadata?.customerSnapshot?.email && (
                      <p className="text-neutral-600 text-xs">{selectedOrder.metadata.customerSnapshot.email}</p>
                    )}
                    {selectedOrder.metadata?.customerSnapshot?.cpfCnpj && (
                      <p className="text-neutral-500 text-xs font-mono">
                        CPF/CNPJ: {selectedOrder.metadata.customerSnapshot.cpfCnpj}
                      </p>
                    )}
                    {selectedOrder.metadata?.customerSnapshot?.phone && (
                      <p className="text-neutral-500 text-xs">
                        Tel: {selectedOrder.metadata.customerSnapshot.phone}
                      </p>
                    )}
                  </div>
                  {selectedOrder.metadata?.customerSnapshot?.phone && (
                    <div className="mt-2">
                      <WhatsAppButton
                        phone={selectedOrder.metadata.customerSnapshot.phone}
                        size="sm"
                        label="Chamar no WhatsApp"
                        variant="outline"
                        className="w-full justify-center"
                      />
                    </div>
                  )}
                </div>

                {/* Endereço */}
                {(selectedOrder.metadata?.customerSnapshot?.address || selectedOrder.metadata?.customerSnapshot?.city) && (
                  <div className="space-y-3">
                    <p className="text-neutral-500 text-xs uppercase font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-primary)]"></span>
                      Endereço
                    </p>
                    <div className="bg-neutral-50 rounded-lg p-3 space-y-1">
                      {selectedOrder.metadata?.customerSnapshot?.address && (
                        <p className="text-neutral-900 text-xs">
                          {selectedOrder.metadata.customerSnapshot.address}
                          {selectedOrder.metadata.customerSnapshot.addressNumber && `, ${selectedOrder.metadata.customerSnapshot.addressNumber}`}
                          {selectedOrder.metadata.customerSnapshot.addressComplement && ` - ${selectedOrder.metadata.customerSnapshot.addressComplement}`}
                        </p>
                      )}
                      {(selectedOrder.metadata?.customerSnapshot?.city || selectedOrder.metadata?.customerSnapshot?.state) && (
                        <p className="text-neutral-600 text-xs">
                          {[selectedOrder.metadata.customerSnapshot.city, selectedOrder.metadata.customerSnapshot.state].filter(Boolean).join(' - ')}
                        </p>
                      )}
                      {selectedOrder.metadata?.customerSnapshot?.postalCode && (
                        <p className="text-neutral-500 text-xs font-mono">
                          CEP: {selectedOrder.metadata.customerSnapshot.postalCode}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Valor e Método */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-neutral-500 text-xs uppercase mb-1">Valor</p>
                    <p className="text-neutral-900 font-semibold">{formatCurrency(selectedOrder.total)}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-neutral-500 text-xs uppercase mb-1">Método</p>
                    <p className="text-neutral-900 font-semibold">
                      {selectedOrder.billingType === 'PIX' ? 'PIX' : 
                       selectedOrder.billingType === 'CREDIT_CARD' ? 'Cartão' : 
                       selectedOrder.billingType === 'BOLETO' ? 'Boleto' : 
                       selectedOrder.billingType || "—"}
                    </p>
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div className="space-y-3">
                  <p className="text-neutral-500 text-xs uppercase font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-primary)]"></span>
                    Itens do Pedido
                  </p>
                  <div className="bg-neutral-50 rounded-lg p-3 space-y-2">
                    {(() => {
                      // Mapeamento de IDs para nomes e preços
                      const productInfo: Record<string, { name: string; price: number }> = {
                        'duo-dia': { name: 'DUO DIA', price: 179.99 },
                        'duo-noite': { name: 'DUO NOITE', price: 179.99 },
                        'duo-completo': { name: 'Kit DUO Completo', price: 299.99 },
                      };

                      const items = selectedOrder.metadata?.expandedItems || [];
                      const frete = 25.00; // Frete fixo
                      
                      if (items.length === 0) {
                        return <p className="text-neutral-400 text-xs">Sem detalhes disponíveis</p>;
                      }

                      // Calcula subtotal dos produtos
                      let subtotal = 0;
                      
                      // Verifica se é kit completo (1 duo-dia + 1 duo-noite)
                      const isDiaNoiteKit = items.length === 2 && 
                        items.some((i: any) => i.productId === 'duo-dia' && i.quantity === 1) &&
                        items.some((i: any) => i.productId === 'duo-noite' && i.quantity === 1);

                      return (
                        <>
                          {isDiaNoiteKit ? (
                            // Mostra como Kit Completo
                            <div className="flex items-center justify-between py-1.5 border-b border-neutral-200/60 last:border-0">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-xs font-bold">
                                  1
                                </span>
                                <span className="text-neutral-900 text-sm font-medium">Kit DUO Completo</span>
                              </div>
                              <span className="text-neutral-700 text-sm font-semibold">R$ 299,99</span>
                            </div>
                          ) : (
                            // Mostra itens individuais
                            items.map((item: any, idx: number) => {
                              const info = productInfo[item.productId] || { name: item.productId, price: 0 };
                              const itemTotal = info.price * (item.quantity || 1);
                              subtotal += itemTotal;
                              return (
                                <div key={idx} className="flex items-center justify-between py-1.5 border-b border-neutral-200/60 last:border-0">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-xs font-bold">
                                      {item.quantity || 1}
                                    </span>
                                    <span className="text-neutral-900 text-sm font-medium">{info.name}</span>
                                  </div>
                                  <span className="text-neutral-700 text-sm font-semibold">
                                    R$ {itemTotal.toFixed(2).replace('.', ',')}
                                  </span>
                                </div>
                              );
                            })
                          )}
                          
                          {/* Frete */}
                          <div className="flex items-center justify-between py-1.5 border-t border-neutral-300/60 mt-2 pt-2">
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-neutral-500" />
                              <span className="text-neutral-600 text-sm">Frete</span>
                            </div>
                            <span className="text-neutral-600 text-sm">R$ 25,00</span>
                          </div>
                          
                          {/* Total */}
                          <div className="flex items-center justify-between py-2 border-t border-neutral-300 mt-1">
                            <span className="text-neutral-900 text-sm font-bold">Total</span>
                            <span className="text-neutral-900 text-sm font-bold">
                              {formatCurrency(selectedOrder.total)}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Cupom */}
                <div>
                  <p className="text-neutral-500 text-xs uppercase mb-2">Cupom</p>
                  {selectedOrder.metadata?.couponCode ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800 font-mono">
                      {selectedOrder.metadata.couponCode}
                    </span>
                  ) : (
                    <p className="text-neutral-400">Nenhum</p>
                  )}
                </div>

                {/* Data */}
                <div className="pt-3 border-t border-neutral-100">
                  <p className="text-neutral-500 text-xs uppercase mb-1">Criado em</p>
                  <p className="text-neutral-900">
                    {new Date(selectedOrder.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-neutral-500 text-sm">Selecione um pedido para ver detalhes.</p>
            )}
          </div>

          {/* Tabela de Pedidos */}
          <div className="xl:col-span-2 rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase border-b border-neutral-100">
                  <tr>
                    {isColumnVisible('pedido') && (
                      <th className="px-4 py-3 text-left whitespace-nowrap">Pedido</th>
                    )}
                    {isColumnVisible('cliente') && (
                      <th className="px-4 py-3 text-left whitespace-nowrap">Cliente</th>
                    )}
                    {isColumnVisible('whatsapp') && (
                      <th className="px-4 py-3 text-left whitespace-nowrap">WhatsApp</th>
                    )}
                    {isColumnVisible('valor') && (
                      <th className="px-4 py-3 text-left whitespace-nowrap">Valor</th>
                    )}
                    {isColumnVisible('cupom') && (
                      <th className="px-4 py-3 text-left whitespace-nowrap">Cupom</th>
                    )}
                    {isColumnVisible('entrega') && (
                      <th className="px-4 py-3 text-left whitespace-nowrap">Entrega</th>
                    )}
                    {isColumnVisible('status') && (
                      <th className="px-4 py-3 text-left whitespace-nowrap">Status</th>
                    )}
                    {isColumnVisible('data') && (
                      <th className="px-4 py-3 text-right whitespace-nowrap">Data</th>
                    )}
                  </tr>
                </thead>
              <tbody>
                {ordersData.map((order) => {
                  const customerName = order.metadata?.customerSnapshot?.name || "Cliente DUO";
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <tr
                      key={order.id}
                      className={cn(
                        "border-b border-neutral-100 cursor-pointer transition-all",
                        isSelected
                          ? "bg-[var(--color-brand-primary-light)]/30 border-l-4 border-l-[var(--color-brand-primary)]"
                          : "hover:bg-neutral-50"
                      )}
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Pedido */}
                      {isColumnVisible('pedido') && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-neutral-600">{order.id.slice(0, 8)}</span>
                            {order.metadata?.isRecurring && (
                              <span
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700 border border-purple-200"
                                title="Pedido Recorrente"
                              >
                                <RefreshCcw className="h-2.5 w-2.5 mr-0.5" />
                                REC
                              </span>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Cliente */}
                      {isColumnVisible('cliente') && (
                        <td className="px-4 py-3 text-neutral-900">{customerName}</td>
                      )}

                      {/* WhatsApp */}
                      {isColumnVisible('whatsapp') && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          {order.metadata?.customerSnapshot?.phone ? (
                            <WhatsAppButton phone={order.metadata.customerSnapshot.phone} size="xs" />
                          ) : (
                            <span className="text-neutral-400">-</span>
                          )}
                        </td>
                      )}

                      {/* Valor */}
                      {isColumnVisible('valor') && (
                        <td className="px-4 py-3 text-neutral-900">{formatCurrency(order.total)}</td>
                      )}

                      {/* Cupom */}
                      {isColumnVisible('cupom') && (
                        <td className="px-4 py-3">
                          {order.metadata?.couponCode ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800 font-mono">
                              {order.metadata.couponCode}
                            </span>
                          ) : (
                            <span className="text-neutral-400">-</span>
                          )}
                        </td>
                      )}

                      {/* Entrega */}
                      {isColumnVisible('entrega') && (
                        <td className="px-4 py-3">{deliveryStatusBadge(order.deliveryStatus || 'PENDING')}</td>
                      )}

                      {/* Status */}
                      {isColumnVisible('status') && (
                        <td className="px-4 py-3">{statusBadge(order.status)}</td>
                      )}

                      {/* Data */}
                      {isColumnVisible('data') && (
                        <td className="px-4 py-3 text-right text-neutral-500">
                          {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                      )}
                    </tr>
                  );
                })}
                {ordersData.length === 0 && !loading && (
                  <tr>
                    <td className="px-4 py-6 text-center text-neutral-500" colSpan={AVAILABLE_ORDER_COLUMNS.length}>
                      Nenhum pedido encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({
  icon,
  label,
  value,
  loading,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  loading: boolean;
  accent?: string;
}) => (
  <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm flex items-center gap-3">
    <div className="rounded-full bg-neutral-100 p-2 text-neutral-700">{icon}</div>
    <div>
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      {loading ? (
        <div className="h-6 w-20 bg-neutral-100 rounded animate-pulse" />
      ) : (
        <p className={cn("text-xl font-semibold text-neutral-900", accent)}>{value}</p>
      )}
    </div>
  </div>
);

const Logo = () => {
  return (
    <Link
      href="/admin/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image src="/logo.svg" alt="DUO Logo" width={24} height={24} className="flex-shrink-0" />
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium text-black whitespace-pre">
        DUO Admin
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      href="/admin/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image src="/logo.svg" alt="DUO Logo" width={24} height={24} className="flex-shrink-0" />
    </Link>
  );
};

