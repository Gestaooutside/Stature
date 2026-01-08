"use client";

import { 
  LayoutDashboard, 
  ShoppingBag,
  Package, 
  Ticket, 
  Users,
  UserCheck,
  Building2,
  TrendingUp,
  Wallet,
  BarChart3
} from "lucide-react";

/**
 * Configuração padrão da sidebar para todas as páginas admin
 * Centraliza os links para garantir consistência
 */
export const adminSidebarLinks = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Pedidos",
    href: "/admin/orders",
    icon: <ShoppingBag className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Estoque",
    href: "/admin/products",
    icon: <Package className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Cupons",
    href: "/admin/coupons",
    icon: <Ticket className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Prescritores",
    href: "/admin/prescribers",
    icon: <UserCheck className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Representantes",
    href: "/admin/representatives",
    icon: <Building2 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Comissões",
    href: "/admin/commissions",
    icon: <TrendingUp className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Repasses",
    href: "/admin/payouts",
    icon: <Wallet className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Vendas",
    href: "/admin/sales",
    icon: <BarChart3 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Leads",
    href: "/admin/leads",
    icon: <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
];
