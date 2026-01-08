"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Check, X, Settings2, Copy, MessageCircle } from "lucide-react";
import { EntityCombobox } from "@/components/admin/entity-combobox";
import { PrescriberAutocomplete } from "@/components/admin/prescriber-autocomplete";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Coupon, Prescriber, Representative } from "@/lib/db/schema";

/**
 * Componente de tabela para gerenciar cupons com sistema multinível
 * Integrado com prescritores e representantes
 * Inclui seletor de colunas visíveis com persistência no localStorage
 */

// Definição das colunas disponíveis
const AVAILABLE_COLUMNS = [
  { id: 'code', label: 'Código', alwaysVisible: true },
  { id: 'description', label: 'Descrição', defaultVisible: true },
  { id: 'observations', label: 'Observações', defaultVisible: false },
  { id: 'discount', label: 'Desconto', defaultVisible: true },
  { id: 'discountType', label: 'Tipo Desconto', defaultVisible: false },
  { id: 'prescriber', label: 'Prescritor', defaultVisible: true },
  { id: 'representative', label: 'Representante', defaultVisible: true },
  { id: 'prescriberCommission', label: 'Com. Prescritor (%)', defaultVisible: true },
  { id: 'representativeCommission', label: 'Com. Representante (%)', defaultVisible: true },
  { id: 'prescriberWhatsapp', label: 'WhatsApp Prescritor', defaultVisible: false },
  { id: 'representativeWhatsapp', label: 'WhatsApp Representante', defaultVisible: false },
  { id: 'maxUses', label: 'Limite Uso', defaultVisible: false },
  { id: 'expiresAt', label: 'Validade', defaultVisible: false },
  { id: 'minPurchaseAmount', label: 'Compra Mín.', defaultVisible: false },
  { id: 'status', label: 'Status', defaultVisible: true },
  { id: 'actions', label: 'Ações', alwaysVisible: true },
];

interface CouponsTableProps {
  initialCoupons: any[];
}

export default function CouponsTable({ initialCoupons }: CouponsTableProps) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [prescribers, setPrescribers] = useState<Prescriber[]>([]);
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null); // Dados originais para validação de duplicata
  const [query, setQuery] = useState("");

  // Estado do seletor de colunas (carrega do localStorage)
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (typeof window === 'undefined') return AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
    const saved = localStorage.getItem('coupons-visible-columns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
      }
    }
    return AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
  });

  // Estados do formulário
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discount: 0,
    description: "",
    observations: "",
    isActive: true,
    expiresAt: "",
    maxUses: "",
    minPurchaseAmount: "",
    prescriberId: "",
    prescriberCommissionOverride: "",
    representativeCommissionOverride: "",
    isRecurring: false,
    recurringCycle: "MONTHLY" as "MONTHLY",
  });

  // Carregar prescritores e representantes
  useEffect(() => {
    fetchPrescribers();
    fetchRepresentatives();
  }, []);

  const fetchPrescribers = async () => {
    try {
      const response = await fetch('/api/admin/prescribers');
      const data = await response.json();
      if (response.ok) {
        setPrescribers(data.prescribers || []);
      }
    } catch (error) {
      console.error('Erro ao buscar prescritores:', error);
    }
  };

  const fetchRepresentatives = async () => {
    try {
      const response = await fetch('/api/admin/representatives');
      const data = await response.json();
      if (response.ok) {
        setRepresentatives(data.representatives || []);
      }
    } catch (error) {
      console.error('Erro ao buscar representantes:', error);
    }
  };

  // Toggle de visibilidade de coluna
  const toggleColumn = (columnId: string) => {
    setVisibleColumns(prev => {
      const newColumns = prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId];

      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('coupons-visible-columns', JSON.stringify(newColumns));
      }

      return newColumns;
    });
  };

  // Verificar se coluna está visível
  const isColumnVisible = (columnId: string) => {
    const column = AVAILABLE_COLUMNS.find(col => col.id === columnId);
    if (column?.alwaysVisible) return true;
    return visibleColumns.includes(columnId);
  };

  // Recarregar dados
  const loadData = () => {
    fetchPrescribers();
    fetchRepresentatives();
    window.location.reload();
  };

  // Filtrar cupons
  const filteredCoupons = React.useMemo(() => {
    if (!query) return coupons;
    const q = query.toLowerCase();
    return coupons.filter((c: any) =>
      c.coupon.code.toLowerCase().includes(q) ||
      c.coupon.description.toLowerCase().includes(q) ||
      c.prescriber?.name.toLowerCase().includes(q)
    );
  }, [coupons, query]);

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
      prescriberId: "",
      prescriberCommissionOverride: "",
      representativeCommissionOverride: "",
      isRecurring: false,
      recurringCycle: "MONTHLY",
    });
    setIsCreating(false);
    setEditingId(null);
    setIsDuplicating(false);
    setOriginalData(null);
  };

  const startEdit = (couponData: any) => {
    const { coupon } = couponData;
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType || "percentage",
      discount: Number(coupon.discount),
      description: coupon.description,
      observations: coupon.observations || "",
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split("T")[0] : "",
      maxUses: coupon.maxUses?.toString() || "",
      minPurchaseAmount: coupon.minPurchaseAmount?.toString() || "",
      prescriberId: coupon.prescriberId || "",
      prescriberCommissionOverride: coupon.prescriberCommissionOverride?.toString() || "",
      representativeCommissionOverride: coupon.representativeCommissionOverride?.toString() || "",
      isRecurring: coupon.isRecurring || false,
      recurringCycle: coupon.recurringCycle || "MONTHLY",
    });
    setEditingId(coupon.id);
    setIsCreating(false);
    setIsDuplicating(false);
    setOriginalData(null);
  };

  // Duplicar cupom - preenche formulário com dados do cupom original
  const startDuplicate = (couponData: any) => {
    const { coupon } = couponData;
    const duplicatedFormData = {
      code: coupon.code,
      discountType: coupon.discountType || "percentage",
      discount: Number(coupon.discount),
      description: coupon.description,
      observations: coupon.observations || "",
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split("T")[0] : "",
      maxUses: coupon.maxUses?.toString() || "",
      minPurchaseAmount: coupon.minPurchaseAmount?.toString() || "",
      prescriberId: coupon.prescriberId || "",
      prescriberCommissionOverride: coupon.prescriberCommissionOverride?.toString() || "",
      representativeCommissionOverride: coupon.representativeCommissionOverride?.toString() || "",
      isRecurring: coupon.isRecurring || false,
      recurringCycle: coupon.recurringCycle || "MONTHLY",
    };

    setFormData(duplicatedFormData);
    setOriginalData(duplicatedFormData); // Salva dados originais para validação
    setIsDuplicating(true);
    setIsCreating(true);
    setEditingId(null);
  };

  const handleSave = async () => {
    try {
      // Validação anti-duplicata: se está duplicando e nada foi modificado
      if (isDuplicating && originalData) {
        const isIdentical =
          formData.code === originalData.code &&
          formData.discountType === originalData.discountType &&
          formData.discount === originalData.discount &&
          formData.description === originalData.description &&
          formData.observations === originalData.observations &&
          formData.isActive === originalData.isActive &&
          formData.expiresAt === originalData.expiresAt &&
          formData.maxUses === originalData.maxUses &&
          formData.minPurchaseAmount === originalData.minPurchaseAmount &&
          formData.prescriberId === originalData.prescriberId &&
          formData.prescriberCommissionOverride === originalData.prescriberCommissionOverride &&
          formData.representativeCommissionOverride === originalData.representativeCommissionOverride &&
          formData.isRecurring === originalData.isRecurring &&
          formData.recurringCycle === originalData.recurringCycle;

        if (isIdentical) {
          alert("Erro: Você está tentando criar um cupom idêntico ao original. Por favor, modifique pelo menos um campo antes de salvar.");
          return;
        }
      }

      const endpoint = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons";
      const method = editingId ? "PATCH" : "POST";

      const payload = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discount: Number(formData.discount),
        description: formData.description,
        observations: formData.observations || null,
        isActive: formData.isActive,
        expiresAt: formData.expiresAt || null,
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        minPurchaseAmount: formData.minPurchaseAmount ? Number(formData.minPurchaseAmount) : null,
        prescriberId: formData.prescriberId || null,
        prescriberCommissionOverride: formData.prescriberCommissionOverride ? Number(formData.prescriberCommissionOverride) : null,
        representativeCommissionOverride: formData.representativeCommissionOverride ? Number(formData.representativeCommissionOverride) : null,
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

      // Recarregar lista
      window.location.reload();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar cupom");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este cupom?")) return;

    try {
      const response = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (response.ok) {
        setCoupons((prev: any) => prev.filter((c: any) => c.coupon.id !== id));
      } else {
        alert("Erro ao deletar cupom");
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  // Buscar representante do prescritor selecionado
  const selectedPrescriber = prescribers.find(p => p.id === formData.prescriberId);
  const selectedRepresentative = selectedPrescriber?.representativeId || null;

  return (
    <div className="space-y-4">
      {/* Busca, Seletor de Colunas e Novo */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Buscar cupom..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
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
            {AVAILABLE_COLUMNS.map((column) => (
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

        {!isCreating && !editingId && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cupom
          </Button>
        )}
      </div>

      {/* Formulário de Criação/Edição */}
      {(isCreating || editingId) && (
        <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold">
            {editingId ? "Editar Cupom" : isDuplicating ? "Duplicando Cupom" : "Novo Cupom"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Código</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="PROMO10"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Tipo Desconto</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="percentage">Porcentagem</option>
                <option value="fixed">Valor Fixo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Desconto {formData.discountType === "percentage" ? "(%)" : "(R$)"}
              </label>
              <Input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Descrição</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do cupom"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Observações</label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Observações internas sobre este cupom"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm resize-none"
              rows={3}
            />
          </div>

          {/* Prescritor com Autocomplete */}
          <div>
            <label className="block text-xs font-medium mb-1">Prescritor/Influencer</label>
            <PrescriberAutocomplete
              prescribers={prescribers}
              value={formData.prescriberId}
              onChange={(prescriberId) => setFormData({ ...formData, prescriberId })}
              onPrescriberCreated={loadData}
            />
          </div>

          {/* Informação do Representante (somente leitura) */}
          {formData.prescriberId && selectedRepresentative && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-900">
                    Representante Vinculado
                  </p>
                  <p className="text-sm font-semibold text-blue-800 truncate">
                    {representatives.find(r => r.id === selectedRepresentative)?.name || 'Carregando...'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-1.5">
                Detectado automaticamente do cadastro do prescritor
              </p>
            </div>
          )}

          {/* Comissões */}
          {formData.prescriberId && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Comissão Prescritor (%)
                </label>
                <Input
                  type="number"
                  value={formData.prescriberCommissionOverride}
                  onChange={(e) => setFormData({ ...formData, prescriberCommissionOverride: e.target.value })}
                  placeholder="0"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Vazio = 0% de comissão
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Comissão Representante (%)
                </label>
                <Input
                  type="number"
                  value={formData.representativeCommissionOverride}
                  onChange={(e) => setFormData({ ...formData, representativeCommissionOverride: e.target.value })}
                  placeholder="0"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Vazio = 0% de comissão
                </p>
              </div>
            </div>
          )}

          {/* Campos extras */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Data Expiração</label>
              <Input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Máx. Usos</label>
              <Input
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                placeholder="Ilimitado"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Compra Mín. (R$)</label>
              <Input
                type="number"
                value={formData.minPurchaseAmount}
                onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          {/* Recorrência */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="rounded"
            />
            <label className="text-sm">Cupom para assinatura recorrente</label>
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <Button onClick={handleSave}>
              <Check className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button variant="outline" onClick={resetForm}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                {isColumnVisible('code') && (
                  <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Código</th>
                )}
                {isColumnVisible('description') && (
                  <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Descrição</th>
                )}
                {isColumnVisible('observations') && (
                  <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Observações</th>
                )}
                {isColumnVisible('discountType') && (
                  <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Tipo</th>
                )}
                {isColumnVisible('discount') && (
                  <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Desconto</th>
                )}
                {isColumnVisible('prescriber') && (
                  <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Prescritor</th>
                )}
                {isColumnVisible('representative') && (
                  <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Representante</th>
                )}
                {isColumnVisible('prescriberCommission') && (
                  <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Com. Prescritor</th>
                )}
                {isColumnVisible('representativeCommission') && (
                  <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Com. Representante</th>
                )}
                {isColumnVisible('prescriberWhatsapp') && (
                  <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">WhatsApp Prescritor</th>
                )}
                {isColumnVisible('representativeWhatsapp') && (
                  <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">WhatsApp Representante</th>
                )}
                {isColumnVisible('maxUses') && (
                  <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Limite Uso</th>
                )}
                {isColumnVisible('expiresAt') && (
                  <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Validade</th>
                )}
                {isColumnVisible('minPurchaseAmount') && (
                  <th className="text-left py-3 px-4 font-semibold whitespace-nowrap">Compra Mín.</th>
                )}
                {isColumnVisible('status') && (
                  <th className="text-center py-3 px-4 font-semibold whitespace-nowrap">Status</th>
                )}
                {isColumnVisible('actions') && (
                  <th className="text-center py-3 px-4 font-semibold whitespace-nowrap">Ações</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={AVAILABLE_COLUMNS.length} className="text-center py-8 text-neutral-500">
                    Nenhum cupom encontrado
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((item: any) => (
                  <tr key={item.coupon.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    {/* Código */}
                    {isColumnVisible('code') && (
                      <td className="py-3 px-4 font-mono font-semibold">{item.coupon.code}</td>
                    )}

                    {/* Descrição */}
                    {isColumnVisible('description') && (
                      <td className="py-3 px-4">{item.coupon.description}</td>
                    )}

                    {/* Observações */}
                    {isColumnVisible('observations') && (
                      <td className="py-3 px-4">
                        {item.coupon.observations ? (
                          <span className="text-sm text-neutral-600" title={item.coupon.observations}>
                            {item.coupon.observations.length > 50
                              ? `${item.coupon.observations.substring(0, 50)}...`
                              : item.coupon.observations
                            }
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-xs">—</span>
                        )}
                      </td>
                    )}

                    {/* Tipo Desconto */}
                    {isColumnVisible('discountType') && (
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 rounded bg-neutral-100">
                          {item.coupon.discountType === "percentage" ? "%" : "R$"}
                        </span>
                      </td>
                    )}

                    {/* Desconto */}
                    {isColumnVisible('discount') && (
                      <td className="py-3 px-4">
                        {item.coupon.discountType === "percentage"
                          ? `${item.coupon.discount}%`
                          : `R$ ${Number(item.coupon.discount).toFixed(2)}`}
                      </td>
                    )}

                    {/* Prescritor */}
                    {isColumnVisible('prescriber') && (
                      <td className="py-3 px-4">
                        {item.prescriber ? (
                          <span className="font-medium text-sm">{item.prescriber.name}</span>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>
                    )}

                    {/* Representante */}
                    {isColumnVisible('representative') && (
                      <td className="py-3 px-4">
                        {item.representative ? (
                          <span className="text-sm">{item.representative.name}</span>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>
                    )}

                    {/* Comissão Prescritor */}
                    {isColumnVisible('prescriberCommission') && (
                      <td className="py-3 px-4">
                        {item.prescriber ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
                            {item.coupon.prescriberCommissionOverride || '0'}%
                          </span>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>
                    )}

                    {/* Comissão Representante */}
                    {isColumnVisible('representativeCommission') && (
                      <td className="py-3 px-4">
                        {item.representative ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
                            {item.coupon.representativeCommissionOverride || '0'}%
                          </span>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>
                    )}

                    {/* WhatsApp Prescritor */}
                    {isColumnVisible('prescriberWhatsapp') && (
                      <td className="py-3 px-4">
                        {item.prescriber?.phone ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-neutral-600">{item.prescriber.phone}</span>
                            <a
                              href={`https://wa.me/${item.prescriber.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
                              title="Conversar no WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4 text-green-600" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-xs">Sem telefone</span>
                        )}
                      </td>
                    )}

                    {/* WhatsApp Representante */}
                    {isColumnVisible('representativeWhatsapp') && (
                      <td className="py-3 px-4">
                        {item.representative?.phone ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-neutral-600">{item.representative.phone}</span>
                            <a
                              href={`https://wa.me/${item.representative.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
                              title="Conversar no WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4 text-green-600" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-xs">Sem telefone</span>
                        )}
                      </td>
                    )}

                    {/* Limite de Uso */}
                    {isColumnVisible('maxUses') && (
                      <td className="py-3 px-4">
                        {item.coupon.maxUses ? (
                          <span className="text-sm">{item.coupon.maxUses}</span>
                        ) : (
                          <span className="text-neutral-400 text-xs">Ilimitado</span>
                        )}
                      </td>
                    )}

                    {/* Validade */}
                    {isColumnVisible('expiresAt') && (
                      <td className="py-3 px-4">
                        {item.coupon.expiresAt ? (
                          <span className="text-sm">
                            {new Date(item.coupon.expiresAt).toLocaleDateString('pt-BR')}
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-xs">Sem limite</span>
                        )}
                      </td>
                    )}

                    {/* Compra Mínima */}
                    {isColumnVisible('minPurchaseAmount') && (
                      <td className="py-3 px-4">
                        {item.coupon.minPurchaseAmount ? (
                          <span className="text-sm">
                            R$ {Number(item.coupon.minPurchaseAmount).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-xs">Nenhuma</span>
                        )}
                      </td>
                    )}

                    {/* Status */}
                    {isColumnVisible('status') && (
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleActive(item.coupon.id, item.coupon.isActive)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            item.coupon.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {item.coupon.isActive ? "Ativo" : "Inativo"}
                        </button>
                      </td>
                    )}

                    {/* Ações */}
                    {isColumnVisible('actions') && (
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(item)}
                            title="Editar cupom"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startDuplicate(item)}
                            title="Duplicar cupom"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.coupon.id)}
                            title="Deletar cupom"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    )}
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
