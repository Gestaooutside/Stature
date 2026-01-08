"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LogOut, ShoppingBag, DollarSign, TrendingUp, Activity } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { adminSidebarLinks } from "@/lib/config/admin-sidebar";

/**
 * Dashboard Admin - Área administrativa do DUO
 * Protegida por autenticação (middleware)
 */
export default function AdminDashboard() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Handler para logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
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
      <Dashboard />
    </div>
  );
}

// Logo expandido
export const Logo = () => {
  return (
    <Link
      href="/admin/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image
        src="/logo.svg"
        alt="DUO Logo"
        width={24}
        height={24}
        className="flex-shrink-0"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        DUO Admin
      </motion.span>
    </Link>
  );
};

// Logo colapsado (ícone apenas)
export const LogoIcon = () => {
  return (
    <Link
      href="/admin/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image
        src="/logo.svg"
        alt="DUO Logo"
        width={24}
        height={24}
        className="flex-shrink-0"
      />
    </Link>
  );
};

// Componente Dashboard com métricas reais e gráficos
const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          console.error('Falha ao carregar dados do dashboard');
        }
      } catch (error) {
        console.error('Erro de conexão:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  /**
   * Traduz status do pedido para português e aplica cores adequadas
   */
  const getStatusConfig = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      PAID: { label: "Pago", className: "bg-emerald-100 text-emerald-800" },
      CONFIRMED: { label: "Confirmado", className: "bg-emerald-100 text-emerald-800" },
      RECEIVED: { label: "Recebido", className: "bg-emerald-100 text-emerald-800" },
      PENDING: { label: "Pendente", className: "bg-amber-100 text-amber-800" },
      AWAITING_PAYMENT: { label: "Aguardando Pagamento", className: "bg-amber-100 text-amber-800" },
      OVERDUE: { label: "Vencido", className: "bg-orange-100 text-orange-800" },
      REFUNDED: { label: "Reembolsado", className: "bg-sky-100 text-sky-800" },
      CANCELLED: { label: "Cancelado", className: "bg-red-100 text-red-800" },
      FAILED: { label: "Falhou", className: "bg-red-100 text-red-800" },
    };
    return statusConfig[status] || { 
      label: status.replace(/_/g, " ").toLowerCase(), 
      className: "bg-neutral-100 text-neutral-800" 
    };
  };

  const metrics = data?.summary || {
    totalOrders: 0,
    paidOrders: 0,
    awaitingOrders: 0,
    ordersToday: 0,
    revenueMonth: 0,
    revenueToday: 0,
    conversionRate: "0.0",
    ticketAverage: 0,
  };

  return (
    <div className="flex flex-1 overflow-y-auto">
      <div className="p-3 sm:p-6 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-3 sm:gap-4 md:gap-2 flex-1 w-full">
        {/* Header */}
        <div className="mb-2 sm:mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            Dashboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm">
            Bem-vindo à área administrativa do DUO
          </p>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <KpiCard 
            title="Pedidos Pagos"
            value={loading ? "..." : metrics.paidOrders.toString()}
            icon={<ShoppingBag className="w-5 h-5 text-[#8d7f72]" />}
            subtext="Confirmados"
            loading={loading}
          />
          <KpiCard 
            title="Pedidos Hoje"
            value={loading ? "..." : metrics.ordersToday.toString()}
            icon={<Activity className="w-5 h-5 text-blue-600" />}
            subtext="Criados no dia"
            loading={loading}
          />
          <KpiCard 
            title="Receita do Mês"
            value={loading ? "..." : formatCurrency(metrics.revenueMonth)}
            icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
            subtext="Confirmada"
            loading={loading}
          />
          <KpiCard 
            title="Ticket Médio"
            value={loading ? "..." : formatCurrency(metrics.ticketAverage || 0)}
            icon={<TrendingUp className="w-5 h-5 text-violet-600" />}
            subtext={`Conversão ${metrics.conversionRate}%`}
            loading={loading}
          />
        </div>

        {/* Gráficos */}
        <DashboardCharts data={data?.chartData || []} isLoading={loading} />

        {/* Tabela de Vendas Recentes */}
        {data?.recentOrders && data.recentOrders.length > 0 && (
          <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-neutral-900">Últimos Pedidos</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 border-b border-neutral-100">
                  <tr>
                    <th className="px-4 py-3 font-medium">Pedido</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Valor</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order: any) => {
                    const customerName = order.metadata?.customerSnapshot?.name || "Cliente DUO";
                    return (
                      <tr key={order.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-neutral-600 text-xs">{order.id.slice(0, 8)}</td>
                        <td className="px-4 py-3 font-medium text-neutral-900">{customerName}</td>
                        <td className="px-4 py-3 text-neutral-900">{formatCurrency(order.total)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusConfig(order.status).className}`}>
                            {getStatusConfig(order.status).label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-500">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente Card de KPI reutilizável
const KpiCard = ({ title, value, icon, subtext, loading }: { title: string; value: string; icon: React.ReactNode; subtext: string; loading: boolean }) => (
  <div className="p-4 sm:p-6 rounded-xl bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-neutral-50 rounded-lg">
        {icon}
      </div>
      <span className="text-xs font-medium text-neutral-500 bg-neutral-50 px-2 py-1 rounded-full">
        {subtext}
      </span>
    </div>
    <div>
      <h3 className="text-xs sm:text-sm font-medium text-neutral-500 uppercase tracking-wide mb-1">
        {title}
      </h3>
      {loading ? (
        <div className="h-8 w-24 bg-neutral-100 rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-neutral-900 tracking-tight">
          {value}
        </p>
      )}
    </div>
  </div>
);
