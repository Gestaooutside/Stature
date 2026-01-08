"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LogOut,
  Warehouse,
  MinusCircle,
  RefreshCcw,
  ClipboardList,
  ArrowDownUp,
  Package,
} from "lucide-react";
import { adminSidebarLinks } from "@/lib/config/admin-sidebar";

interface InventoryItemResponse {
  productId: string;
  name: string;
  price: number;
  stock: number;
  projectedStock: number;
  lowStockThreshold: number;
  lastReconciledAt: string | null;
  updatedAt: string | null;
  status: "LOW" | "OK";
  pendingSales: {
    units: number;
    orders: number;
    lastOrderDate: string | null;
  };
}

interface InventoryTransactionResponse {
  id: string;
  productId: string;
  productName: string;
  type: string;
  quantity: number;
  note: string | null;
  createdAt: string;
  createdBy: string | null;
}

interface AdjustmentFormState {
  type: "IN" | "OUT";
  quantity: string;
  reason: string;
}

export default function InventoryDashboardPage() {
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
      <InventoryContent />
    </div>
  );
}

const InventoryContent = () => {
  const [inventory, setInventory] = useState<InventoryItemResponse[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [adjustmentForms, setAdjustmentForms] = useState<Record<string, AdjustmentFormState>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/inventory");
      if (!response.ok) throw new Error("Falha ao buscar estoque");
      const data = await response.json();
      setInventory(data.items || []);
      setTransactions(data.transactions || []);

      const defaultForms: Record<string, AdjustmentFormState> = {};
      (data.items || []).forEach((item: InventoryItemResponse) => {
        defaultForms[item.productId] = defaultForms[item.productId] || {
          type: "IN",
          quantity: "",
          reason: "",
        };
      });
      setAdjustmentForms(defaultForms);
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const totalStock = useMemo(
    () => inventory.reduce((sum, item) => sum + item.stock, 0),
    [inventory]
  );
  const pendingUnits = useMemo(
    () => inventory.reduce((sum, item) => sum + item.pendingSales.units, 0),
    [inventory]
  );
  const lowStockItems = useMemo(
    () => inventory.filter((item) => item.status === "LOW").length,
    [inventory]
  );

  const formatDate = (value: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const updateAdjustmentForm = (
    productId: string,
    field: keyof AdjustmentFormState,
    value: string
  ) => {
    setAdjustmentForms((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: field === "quantity" ? value.replace(/\D/g, "") : value,
      },
    }));
  };

  const handleManualAdjustment = async (productId: string) => {
    const form = adjustmentForms[productId];
    if (!form || !form.quantity) return;

    try {
      setActionLoading((prev) => ({ ...prev, [productId]: true }));
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          type: form.type,
          quantity: Number(form.quantity),
          reason: form.reason,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || "Falha ao ajustar estoque");
      }

      const data = await response.json();
      setInventory(data.inventory.items || []);
      setTransactions(data.inventory.transactions || []);
      setFeedback("Ajuste aplicado com sucesso.");
      setAdjustmentForms((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], quantity: "", reason: "" },
      }));
    } catch (error) {
      console.error("Erro ao ajustar estoque:", error);
      setFeedback("Não foi possível aplicar o ajuste. Tente novamente.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleSync = async (productId?: string) => {
    try {
      setSyncLoading(true);
      const response = await fetch("/api/admin/inventory/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || "Falha ao reconciliar estoque");
      }

      const data = await response.json();
      setInventory(data.inventory.items || []);
      setTransactions(data.inventory.transactions || []);
      setFeedback(
        data.updated.length > 0
          ? "Pedidos confirmados descontados do estoque."
          : "Nenhum pedido pendente para descontar."
      );
    } catch (error) {
      console.error("Erro ao reconciliar estoque:", error);
      setFeedback("Não foi possível reconciliar. Verifique e tente novamente.");
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="flex flex-1 overflow-y-auto">
      <div className="p-3 sm:p-6 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-4 flex-1 w-full">
        <div className="mb-2 sm:mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-200">
              Controle de Estoque
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm">
              Monitore níveis, ajuste entradas/saídas e desconte pedidos confirmados.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => handleSync()}
              disabled={syncLoading || pendingUnits === 0}
              className={cn(
                "inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition",
                syncLoading || pendingUnits === 0
                  ? "border-neutral-200 text-neutral-400 bg-neutral-50 cursor-not-allowed"
                  : "border-neutral-800 text-neutral-900 hover:bg-neutral-900 hover:text-white"
              )}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Descontar pedidos pendentes
            </button>
            <button
              onClick={fetchInventory}
              className="inline-flex items-center justify-center rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:border-neutral-900 transition"
            >
              <ArrowDownUp className="h-4 w-4 mr-2" />
              Atualizar dados
            </button>
          </div>
        </div>

        {feedback && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            {feedback}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <SummaryCard
            icon={<Warehouse className="h-5 w-5" />}
            label="Unidades disponíveis"
            value={totalStock}
          />
          <SummaryCard
            icon={<MinusCircle className="h-5 w-5" />}
            label="Pedidos pendentes"
            value={pendingUnits}
            accent="text-amber-600"
          />
          <SummaryCard
            icon={<Package className="h-5 w-5" />}
            label="Produtos em alerta"
            value={lowStockItems}
          />
          <SummaryCard
            icon={<ClipboardList className="h-5 w-5" />}
            label="Últimas movimentações"
            value={transactions.length}
          />
        </div>

        {loading ? (
          <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 animate-pulse">
            <div className="h-6 w-48 bg-neutral-100 rounded mb-4" />
            <div className="h-4 w-full bg-neutral-50 rounded mb-2" />
            <div className="h-4 w-full bg-neutral-50 rounded mb-2" />
            <div className="h-4 w-3/4 bg-neutral-50 rounded" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {inventory.map((item) => (
              <div
                key={item.productId}
                className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">
                      Produto
                    </p>
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {item.name}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Atualizado em {formatDate(item.updatedAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                      item.status === "LOW"
                        ? "bg-amber-100 text-amber-900"
                        : "bg-emerald-100 text-emerald-900"
                    )}
                  >
                    {item.status === "LOW" ? "Estoque Baixo" : "Saudável"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                    <p className="text-xs font-medium text-neutral-500">
                      Estoque atual
                    </p>
                    <p className="text-3xl font-semibold text-neutral-900">
                      {item.stock}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Limite mínimo: {item.lowStockThreshold} un
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                    <p className="text-xs font-medium text-neutral-500">
                      Pedidos pendentes
                    </p>
                    <p className="text-3xl font-semibold text-amber-700">
                      {item.pendingSales.units}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {item.pendingSales.orders} pedido(s) desde{" "}
                      {formatDate(item.lastReconciledAt)}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-dashed border-neutral-200 p-4 text-sm text-neutral-600">
                  Após desconto dos pedidos confirmados, o estoque ficará em{" "}
                  <span
                    className={cn(
                      "font-semibold",
                      item.projectedStock <= item.lowStockThreshold
                        ? "text-amber-700"
                        : "text-neutral-900"
                    )}
                  >
                    {item.projectedStock} un
                  </span>
                  .
                </div>

                <div className="border-t border-neutral-100 pt-4 space-y-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-neutral-600">
                      Ajuste manual
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={adjustmentForms[item.productId]?.type || "IN"}
                        onChange={(e) =>
                          updateAdjustmentForm(
                            item.productId,
                            "type",
                            e.target.value as "IN" | "OUT"
                          )
                        }
                        className="rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      >
                        <option value="IN">Entrada</option>
                        <option value="OUT">Saída</option>
                      </select>
                      <input
                        type="number"
                        min={1}
                        placeholder="Qtd."
                        value={adjustmentForms[item.productId]?.quantity || ""}
                        onChange={(e) =>
                          updateAdjustmentForm(item.productId, "quantity", e.target.value)
                        }
                        className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                      <input
                        type="text"
                        placeholder="Motivo (opcional)"
                        value={adjustmentForms[item.productId]?.reason || ""}
                        onChange={(e) =>
                          updateAdjustmentForm(item.productId, "reason", e.target.value)
                        }
                        className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                    </div>
                    <button
                      onClick={() => handleManualAdjustment(item.productId)}
                      disabled={
                        actionLoading[item.productId] ||
                        !adjustmentForms[item.productId]?.quantity
                      }
                      className={cn(
                        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition",
                        actionLoading[item.productId]
                          ? "bg-neutral-200 text-neutral-500 cursor-wait"
                          : "bg-neutral-900 text-white hover:bg-neutral-800"
                      )}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Aplicar ajuste
                    </button>
                  </div>

                  <button
                    onClick={() => handleSync(item.productId)}
                    disabled={syncLoading || item.pendingSales.units === 0}
                    className={cn(
                      "inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition w-full",
                      syncLoading || item.pendingSales.units === 0
                        ? "border-neutral-200 text-neutral-400 bg-neutral-50 cursor-not-allowed"
                        : "border-amber-500 text-amber-800 hover:bg-amber-500 hover:text-white"
                    )}
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Descontar pedidos recentes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Histórico de movimentações
              </h3>
              <p className="text-xs text-neutral-500">
                Registro completo de entradas, saídas e descontos de vendas.
              </p>
            </div>
            <span className="text-xs text-neutral-400">
              Atualizado {new Date().toLocaleTimeString("pt-BR")}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Produto</th>
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium">Quantidade</th>
                  <th className="px-4 py-3 text-left font-medium">Observação</th>
                  <th className="px-4 py-3 text-right font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                      Nenhuma movimentação registrada ainda.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60"
                    >
                      <td className="px-4 py-3 font-medium text-neutral-900">
                        {tx.productName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                            tx.type === "IN" && "bg-emerald-100 text-emerald-900",
                            tx.type === "OUT" && "bg-neutral-200 text-neutral-900",
                            tx.type === "SALE_DEDUCTION" && "bg-amber-100 text-amber-900"
                          )}
                        >
                          {tx.type === "SALE_DEDUCTION" ? "Venda" : tx.type === "IN" ? "Entrada" : "Saída"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-900">{tx.quantity}</td>
                      <td className="px-4 py-3 text-neutral-500">
                        {tx.note || "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-500">
                        {formatDate(tx.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: string;
}) => {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm flex items-center gap-3">
      <div className="rounded-full bg-neutral-100 p-2 text-neutral-700">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
        <p className={cn("text-2xl font-semibold text-neutral-900", accent)}>{value}</p>
      </div>
    </div>
  );
};

export const Logo = () => {
  return (
    <Link
      href="/admin/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image src="/logo.svg" alt="DUO Logo" width={24} height={24} className="flex-shrink-0" />
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

export const LogoIcon = () => {
  return (
    <Link
      href="/admin/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image src="/logo.svg" alt="DUO Logo" width={24} height={24} className="flex-shrink-0" />
    </Link>
  );
};

