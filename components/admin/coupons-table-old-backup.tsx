"use client";

import * as React from "react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Check, X, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Coupon } from "@/lib/db/schema";

/**
 * Componente de tabela para gerenciar cupons de desconto
 * Permite criar, editar, ativar/desativar e deletar cupons
 */

interface CouponsTableProps {
  initialCoupons: Coupon[];
}

export default function CouponsTable({ initialCoupons }: CouponsTableProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Estados do formulário de criação/edição
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discount: 0,
    description: "",
    isActive: true,
    expiresAt: "",
    maxUses: "",
    minPurchaseAmount: "",
    commission: "",
    prescriber: "",
    isRecurring: false,
    recurringCycle: "MONTHLY" as "WEEKLY" | "MONTHLY" | "YEARLY",
  });

  // Filtra cupons pela busca
  const filteredCoupons = React.useMemo(() => {
    if (!query) return coupons;
    const q = query.toLowerCase();
    return coupons.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [coupons, query]);

  // Reseta formulário
  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "percentage",
      discount: 0,
      description: "",
      isActive: true,
      expiresAt: "",
      maxUses: "",
      minPurchaseAmount: "",
      commission: "",
      prescriber: "",
      isRecurring: false,
      recurringCycle: "MONTHLY",
    });
    setIsCreating(false);
    setEditingId(null);
  };

  // Carrega dados de cupom para edição
  const startEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType || "percentage",
      discount: Number(coupon.discount),
      description: coupon.description,
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().split("T")[0]
        : "",
      maxUses: coupon.maxUses?.toString() || "",
      minPurchaseAmount: coupon.minPurchaseAmount?.toString() || "",
      commission: coupon.commission?.toString() || "",
      prescriber: coupon.prescriber || "",
      isRecurring: coupon.isRecurring || false,
      recurringCycle: (coupon.recurringCycle as any) || "MONTHLY",
    });
    setEditingId(coupon.id);
    setIsCreating(false);
  };

  // Salva cupom (criar ou atualizar)
  const handleSave = async () => {
    try {
      const endpoint = editingId
        ? `/api/admin/coupons/${editingId}`
        : "/api/admin/coupons";
      const method = editingId ? "PATCH" : "POST";

      const payload = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discount: Number(formData.discount),
        description: formData.description,
        isActive: formData.isActive,
        expiresAt: formData.expiresAt || null,
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        minPurchaseAmount: formData.minPurchaseAmount
          ? Number(formData.minPurchaseAmount)
          : null,
        commission: formData.commission ? Number(formData.commission) : null,
        prescriber: formData.prescriber || null,
        isRecurring: formData.isRecurring,
        recurringCycle: formData.isRecurring ? formData.recurringCycle : undefined,
      };

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erro ao salvar cupom");
        return;
      }

      // Atualiza lista local
      if (editingId) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === editingId ? data.coupon : c))
        );
      } else {
        setCoupons((prev) => [...prev, data.coupon]);
      }

      resetForm();
      alert(data.message);
    } catch (error) {
      console.error("Erro ao salvar cupom:", error);
      alert("Erro ao salvar cupom");
    }
  };

  // Deleta cupom
  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Tem certeza que deseja deletar o cupom ${code}?`)) return;

    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erro ao deletar cupom");
        return;
      }

      setCoupons((prev) => prev.filter((c) => c.id !== id));
      alert(data.message);
    } catch (error) {
      console.error("Erro ao deletar cupom:", error);
      alert("Erro ao deletar cupom");
    }
  };

  // Alterna status ativo/inativo
  const toggleActive = async (coupon: Coupon) => {
    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erro ao atualizar cupom");
        return;
      }

      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? data.coupon : c))
      );
    } catch (error) {
      console.error("Erro ao atualizar cupom:", error);
      alert("Erro ao atualizar cupom");
    }
  };

  // Duplica cupom existente
  const handleDuplicate = async (coupon: Coupon) => {
    const newCode = `${coupon.code}_COPY`;
    if (!confirm(`Duplicar cupom ${coupon.code} como ${newCode}?`)) return;

    try {
      const payload = {
        code: newCode,
        discountType: coupon.discountType,
        discount: Number(coupon.discount),
        description: `${coupon.description} (cópia)`,
        isActive: coupon.isActive,
        expiresAt: coupon.expiresAt,
        maxUses: coupon.maxUses,
        minPurchaseAmount: coupon.minPurchaseAmount ? Number(coupon.minPurchaseAmount) : null,
        commission: coupon.commission ? Number(coupon.commission) : null,
        prescriber: coupon.prescriber,
        isRecurring: coupon.isRecurring,
        recurringCycle: coupon.isRecurring ? coupon.recurringCycle : undefined,
      };

      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erro ao duplicar cupom");
        return;
      }

      setCoupons((prev) => [...prev, data.coupon]);
      alert("Cupom duplicado com sucesso!");
    } catch (error) {
      console.error("Erro ao duplicar cupom:", error);
      alert("Erro ao duplicar cupom");
    }
  };

  // Formata data para exibição
  const formatDate = (date: Date | null) => {
    if (!date) return "Sem expiração";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <div className="w-full">
      {/* Barra de ações */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <Input
          placeholder="Buscar por código ou descrição..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
        <Button
          onClick={() => {
            resetForm();
            setIsCreating(true);
          }}
          disabled={isCreating || editingId !== null}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Cupom
        </Button>
      </div>

      {/* Formulário de criação/edição */}
      {(isCreating || editingId) && (
        <div className="mb-3 sm:mb-6 p-3 sm:p-6 border rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            {editingId ? "Editar Cupom" : "Novo Cupom"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
            <div>
              <label className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 block">
                Código do Cupom*
              </label>
              <Input
                placeholder="Ex: PROMO10"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                className="text-base sm:text-sm h-11 sm:h-10"
              />
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 block">
                Tipo de Desconto*
              </label>
              <select
                value={formData.discountType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountType: e.target.value as "percentage" | "fixed",
                  })
                }
                className="w-full px-3 py-2 h-11 sm:h-10 text-base sm:text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring touch-manipulation"
              >
                <option value="percentage">Percentual (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 block">
                {formData.discountType === "percentage"
                  ? "Desconto (%)*"
                  : "Desconto (R$)*"}
              </label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                max={formData.discountType === "percentage" ? "100" : undefined}
                placeholder={
                  formData.discountType === "percentage" ? "Ex: 10" : "Ex: 15.00"
                }
                value={formData.discount}
                onChange={(e) =>
                  setFormData({ ...formData, discount: Number(e.target.value) })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 block">
                Descrição*
              </label>
              <Input
                placeholder="Ex: Desconto de 10% para primeira compra"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 block">
                Data de Expiração
              </label>
              <Input
                type="date"
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 block">
                Máximo de Usos
              </label>
              <Input
                type="number"
                min="1"
                placeholder="Deixe vazio para ilimitado"
                value={formData.maxUses}
                onChange={(e) =>
                  setFormData({ ...formData, maxUses: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 block">
                Valor Mínimo (R$)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Deixe vazio para sem mínimo"
                value={formData.minPurchaseAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minPurchaseAmount: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 block">
                Comissão (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="Ex: 5 (para 5% de comissão)"
                value={formData.commission}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commission: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 block">
                Prescritor/Influencer
              </label>
              <Input
                type="text"
                placeholder="Ex: Dr. João Silva ou @influencer"
                value={formData.prescriber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    prescriber: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) =>
                  setFormData({ ...formData, isRecurring: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="isRecurring" className="text-sm font-medium">
                Habilitar Recorrência
              </label>
              {formData.isRecurring && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Cobrança mensal automática no cartão
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Cupom Ativo
              </label>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 mt-3 sm:mt-4">
            <Button onClick={handleSave} className="w-full sm:w-auto h-11 sm:h-10 touch-manipulation">
              <Check className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button variant="outline" onClick={resetForm} className="w-full sm:w-auto h-11 sm:h-10 touch-manipulation">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Tabela de cupons com scroll horizontal em mobile */}
      <div className="border rounded-lg overflow-x-auto -mx-2 sm:mx-0">
        <div className="min-w-[800px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Desconto</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recorrente</TableHead>
              <TableHead>Expira em</TableHead>
              <TableHead>Usos</TableHead>
              <TableHead>Valor Mín.</TableHead>
              <TableHead>Comissão</TableHead>
              <TableHead>Prescritor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCoupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground">
                  Nenhum cupom encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredCoupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-semibold">
                    {coupon.code}
                  </TableCell>
                  <TableCell>
                    {coupon.discountType === "percentage"
                      ? `${Number(coupon.discount)}%`
                      : `R$ ${Number(coupon.discount).toFixed(2)}`}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {coupon.description}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleActive(coupon)}
                      className={cn(
                        "px-2 py-1 rounded-md text-xs font-medium",
                        coupon.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300"
                      )}
                    >
                      {coupon.isActive ? "Ativo" : "Inativo"}
                    </button>
                  </TableCell>
                  <TableCell>
                    {coupon.isRecurring ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        🔄 {coupon.recurringCycle === 'MONTHLY' ? 'Mensal' : coupon.recurringCycle}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300">
                        Único
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(coupon.expiresAt)}</TableCell>
                  <TableCell>
                    {coupon.currentUses}
                    {coupon.maxUses ? ` / ${coupon.maxUses}` : " / ∞"}
                  </TableCell>
                  <TableCell>
                    {coupon.minPurchaseAmount
                      ? `R$ ${Number(coupon.minPurchaseAmount).toFixed(2)}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {coupon.commission
                      ? `${Number(coupon.commission).toFixed(2)}%`
                      : "-"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {coupon.prescriber || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(coupon)}
                        disabled={isCreating || editingId !== null}
                        title="Editar"
                        className="h-10 w-10 p-0 touch-manipulation"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicate(coupon)}
                        disabled={isCreating || editingId !== null}
                        title="Duplicar"
                        className="h-10 w-10 p-0 touch-manipulation"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        disabled={isCreating || editingId !== null}
                        title="Deletar"
                        className="h-10 w-10 p-0 touch-manipulation"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Resumo */}
      <div className="mt-4 text-sm text-muted-foreground">
        Total de cupons: {filteredCoupons.length}
        {query && ` (filtrados de ${coupons.length})`}
      </div>
    </div>
  );
}
