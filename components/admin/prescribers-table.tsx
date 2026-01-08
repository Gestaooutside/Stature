"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/admin/phone-input";
import { WhatsAppButton } from "@/components/admin/whatsapp-button";
import { EntityCombobox } from "@/components/admin/entity-combobox";
import { cn } from "@/lib/utils";
import { toTitleCase } from "@/lib/utils/text-formatting";
import type { Prescriber, Representative } from "@/lib/db/schema";

/**
 * Tabela de gerenciamento de prescritores/influencers
 * Interface ultra compacta e responsiva com CRUD completo
 */

interface PrescribersTableProps {
  prescribers: Prescriber[];
  representatives: Representative[];
  onPrescriberCreated: () => void;
  onPrescriberUpdated: () => void;
  onPrescriberDeleted: () => void;
}

interface FormData {
  name: string;
  phone: string;
  countryCode: string;
  email: string;
  cpfCnpj: string;
  representativeId: string | null;
  defaultCommission: string;
  notes: string;
}

export default function PrescribersTable({
  prescribers,
  representatives,
  onPrescriberCreated,
  onPrescriberUpdated,
  onPrescriberDeleted
}: PrescribersTableProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    countryCode: 'BR',
    email: '',
    cpfCnpj: '',
    representativeId: null,
    defaultCommission: '',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      countryCode: 'BR',
      email: '',
      cpfCnpj: '',
      representativeId: null,
      defaultCommission: '',
      notes: ''
    });
    setIsCreating(false);
    setEditingId(null);
  };

  // Preencher formulário para edição
  const handleEdit = (prescriber: Prescriber) => {
    setFormData({
      name: prescriber.name,
      phone: prescriber.phone,
      countryCode: prescriber.countryCode,
      email: prescriber.email || '',
      cpfCnpj: prescriber.cpfCnpj || '',
      representativeId: prescriber.representativeId || null,
      defaultCommission: prescriber.defaultCommission || '',
      notes: prescriber.notes || ''
    });
    setEditingId(prescriber.id);
    setIsCreating(false);
  };

  // Salvar prescritor (criar ou atualizar)
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Nome e telefone são obrigatórios');
      return;
    }

    setIsSaving(true);

    try {
      const url = editingId
        ? `/api/admin/prescribers/${editingId}`
        : '/api/admin/prescribers';

      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone,
          countryCode: formData.countryCode,
          email: formData.email.trim() || null,
          cpfCnpj: formData.cpfCnpj.trim() || null,
          representativeId: formData.representativeId || null,
          defaultCommission: formData.defaultCommission ? Number(formData.defaultCommission) : null,
          notes: formData.notes.trim() || null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar prescritor');
      }

      resetForm();
      editingId ? onPrescriberUpdated() : onPrescriberCreated();
    } catch (error) {
      console.error('Erro:', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar prescritor');
    } finally {
      setIsSaving(false);
    }
  };

  // Deletar prescritor
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este prescritor?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/prescribers/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao deletar prescritor');
      }

      onPrescriberDeleted();
    } catch (error) {
      console.error('Erro:', error);
      alert(error instanceof Error ? error.message : 'Erro ao deletar prescritor');
    }
  };

  // Busca representante por ID
  const getRepresentativeName = (repId: string | null) => {
    if (!repId) return null;
    const rep = representatives.find(r => r.id === repId);
    return rep?.name || null;
  };

  return (
    <div className="space-y-4">
      {/* Botão criar novo */}
      {!isCreating && !editingId && (
        <Button
          onClick={() => setIsCreating(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Prescritor
        </Button>
      )}

      {/* Formulário de criação/edição */}
      {(isCreating || editingId) && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-sm text-neutral-700">
            {editingId ? 'Editar Prescritor' : 'Novo Prescritor'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nome */}
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="name" className="text-xs">
                Nome *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do prescritor/influencer"
                required
              />
            </div>

            {/* Telefone */}
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs">
                Telefone *
              </Label>
              <PhoneInput
                value={formData.phone}
                onChange={(phone, countryCode) => 
                  setFormData({ ...formData, phone, countryCode })
                }
                defaultCountry={formData.countryCode}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>

            {/* CPF/CNPJ */}
            <div className="space-y-1">
              <Label htmlFor="cpfCnpj" className="text-xs">
                CPF/CNPJ
              </Label>
              <Input
                id="cpfCnpj"
                value={formData.cpfCnpj}
                onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>

            {/* Comissão Padrão */}
            <div className="space-y-1">
              <Label htmlFor="defaultCommission" className="text-xs">
                Comissão Padrão (%)
              </Label>
              <Input
                id="defaultCommission"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.defaultCommission}
                onChange={(e) => setFormData({ ...formData, defaultCommission: e.target.value })}
                placeholder="10.00"
              />
            </div>

            {/* Representante */}
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="representative" className="text-xs">
                Representante (opcional)
              </Label>
              <EntityCombobox
                entities={representatives.map(r => ({ id: r.id, name: r.name }))}
                value={formData.representativeId}
                onChange={(id) => setFormData({ ...formData, representativeId: id })}
                placeholder="Selecionar representante..."
                searchPlaceholder="Buscar representante..."
                emptyMessage="Nenhum representante encontrado"
              />
              <p className="text-[10px] text-neutral-500">
                O prescritor herdará o representante selecionado para comissões em cascata
              </p>
            </div>

            {/* Observações */}
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="notes" className="text-xs">
                Observações
              </Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionais..."
                rows={2}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={isSaving}
              size="sm"
            >
              <X className="h-3 w-3 mr-1" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
            >
              <Check className="h-3 w-3 mr-1" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-neutral-700 text-xs">
                  Nome
                </th>
                <th className="px-3 py-2 text-left font-medium text-neutral-700 text-xs">
                  Contato
                </th>
                <th className="px-3 py-2 text-left font-medium text-neutral-700 text-xs">
                  Representante
                </th>
                <th className="px-3 py-2 text-left font-medium text-neutral-700 text-xs">
                  Comissão
                </th>
                <th className="px-3 py-2 text-left font-medium text-neutral-700 text-xs">
                  Observações
                </th>
                <th className="px-3 py-2 text-center font-medium text-neutral-700 text-xs">
                  Status
                </th>
                <th className="px-3 py-2 text-center font-medium text-neutral-700 text-xs w-[100px]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {prescribers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-neutral-500 text-xs">
                    Nenhum prescritor cadastrado
                  </td>
                </tr>
              ) : (
                prescribers.map((prescriber) => (
                  <tr
                    key={prescriber.id}
                    className={cn(
                      "border-b border-neutral-100 hover:bg-neutral-50 transition-colors",
                      editingId === prescriber.id && "bg-blue-50"
                    )}
                  >
                    {/* Nome */}
                    <td className="px-3 py-2">
                      <div className="font-medium text-neutral-900 text-xs">{prescriber.name}</div>
                      {prescriber.cpfCnpj && (
                        <div className="text-[10px] text-neutral-500">{prescriber.cpfCnpj}</div>
                      )}
                    </td>

                    {/* Contato */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-neutral-700 truncate">{prescriber.phone}</div>
                          {prescriber.email && (
                            <div className="text-[10px] text-neutral-500 truncate">{prescriber.email}</div>
                          )}
                        </div>
                        <WhatsAppButton phone={prescriber.phone} size="xs" />
                      </div>
                    </td>

                    {/* Representante */}
                    <td className="px-3 py-2">
                      {prescriber.representativeId ? (
                        <span className="text-xs text-neutral-700 truncate block">
                          {getRepresentativeName(prescriber.representativeId)}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400">Sem representante</span>
                      )}
                    </td>

                    {/* Comissão */}
                    <td className="px-3 py-2">
                      {prescriber.defaultCommission ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {prescriber.defaultCommission}%
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400">Não definida</span>
                      )}
                    </td>

                    {/* Observações */}
                    <td className="px-3 py-2">
                      {prescriber.notes ? (
                        <span
                          className="text-xs text-neutral-600 truncate block"
                          title={prescriber.notes}
                        >
                          {prescriber.notes.length > 30
                            ? `${prescriber.notes.substring(0, 30)}...`
                            : prescriber.notes
                          }
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                          prescriber.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-neutral-100 text-neutral-700"
                        )}
                      >
                        {prescriber.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(prescriber)}
                          className="h-7 w-7 p-0"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(prescriber.id)}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
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
