"use client";

import React, { useState } from "react";
import { Pencil, Trash2, Plus, Check, X, Building, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/admin/phone-input";
import { WhatsAppButton } from "@/components/admin/whatsapp-button";
import { cn } from "@/lib/utils";
import type { Representative } from "@/lib/db/schema";

/**
 * Tabela de gerenciamento de representantes
 * Interface ultra compacta e responsiva com CRUD completo
 */

interface RepresentativesTableProps {
  representatives: Representative[];
  onRepresentativeCreated: () => void;
  onRepresentativeUpdated: () => void;
  onRepresentativeDeleted: () => void;
}

interface FormData {
  name: string;
  phone: string;
  countryCode: string;
  email: string;
  cpfCnpj: string;
  defaultCommission: string;
  entityType: string;
  notes: string;
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  individual: 'Pessoa Física',
  clinic: 'Clínica',
  company: 'Empresa'
};

export default function RepresentativesTable({
  representatives,
  onRepresentativeCreated,
  onRepresentativeUpdated,
  onRepresentativeDeleted
}: RepresentativesTableProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    countryCode: 'BR',
    email: '',
    cpfCnpj: '',
    defaultCommission: '',
    entityType: 'individual',
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
      defaultCommission: '',
      entityType: 'individual',
      notes: ''
    });
    setIsCreating(false);
    setEditingId(null);
  };

  // Preencher formulário para edição
  const handleEdit = (representative: Representative) => {
    setFormData({
      name: representative.name,
      phone: representative.phone,
      countryCode: representative.countryCode,
      email: representative.email || '',
      cpfCnpj: representative.cpfCnpj || '',
      defaultCommission: representative.defaultCommission || '',
      entityType: representative.entityType || 'individual',
      notes: representative.notes || ''
    });
    setEditingId(representative.id);
    setIsCreating(false);
  };

  // Salvar representante (criar ou atualizar)
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Nome e telefone são obrigatórios');
      return;
    }

    setIsSaving(true);

    try {
      const url = editingId
        ? `/api/admin/representatives/${editingId}`
        : '/api/admin/representatives';

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
          defaultCommission: formData.defaultCommission ? Number(formData.defaultCommission) : null,
          entityType: formData.entityType,
          notes: formData.notes.trim() || null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar representante');
      }

      resetForm();
      editingId ? onRepresentativeUpdated() : onRepresentativeCreated();
    } catch (error) {
      console.error('Erro:', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar representante');
    } finally {
      setIsSaving(false);
    }
  };

  // Deletar representante
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este representante?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/representatives/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao deletar representante');
      }

      onRepresentativeDeleted();
    } catch (error) {
      console.error('Erro:', error);
      alert(error instanceof Error ? error.message : 'Erro ao deletar representante');
    }
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
          Novo Representante
        </Button>
      )}

      {/* Formulário de criação/edição */}
      {(isCreating || editingId) && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-sm text-neutral-700">
            {editingId ? 'Editar Representante' : 'Novo Representante'}
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
                placeholder="Nome do representante"
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
                placeholder="5.00"
              />
            </div>

            {/* Tipo de Entidade */}
            <div className="space-y-1">
              <Label htmlFor="entityType" className="text-xs">
                Tipo de Entidade
              </Label>
              <select
                id="entityType"
                value={formData.entityType}
                onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="individual">Pessoa Física</option>
                <option value="clinic">Clínica</option>
                <option value="company">Empresa</option>
              </select>
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
                  Tipo
                </th>
                <th className="px-3 py-2 text-left font-medium text-neutral-700 text-xs">
                  Nome
                </th>
                <th className="px-3 py-2 text-left font-medium text-neutral-700 text-xs">
                  Contato
                </th>
                <th className="px-3 py-2 text-left font-medium text-neutral-700 text-xs">
                  Comissão
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
              {representatives.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-neutral-500 text-xs">
                    Nenhum representante cadastrado
                  </td>
                </tr>
              ) : (
                representatives.map((rep) => (
                  <tr
                    key={rep.id}
                    className={cn(
                      "border-b border-neutral-100 hover:bg-neutral-50 transition-colors",
                      editingId === rep.id && "bg-blue-50"
                    )}
                  >
                    {/* Tipo */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {rep.entityType === 'individual' ? (
                          <User className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Building className="h-4 w-4 text-purple-600" />
                        )}
                        <span className="text-xs text-neutral-600">
                          {ENTITY_TYPE_LABELS[rep.entityType || 'individual']}
                        </span>
                      </div>
                    </td>

                    {/* Nome */}
                    <td className="px-3 py-2">
                      <div className="font-medium text-neutral-900 text-xs">{rep.name}</div>
                      {rep.cpfCnpj && (
                        <div className="text-[10px] text-neutral-500">{rep.cpfCnpj}</div>
                      )}
                    </td>

                    {/* Contato */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-neutral-700 truncate">{rep.phone}</div>
                          {rep.email && (
                            <div className="text-[10px] text-neutral-500 truncate">{rep.email}</div>
                          )}
                        </div>
                        <WhatsAppButton phone={rep.phone} size="xs" />
                      </div>
                    </td>

                    {/* Comissão */}
                    <td className="px-3 py-2">
                      {rep.defaultCommission ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          {rep.defaultCommission}%
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400">Não definida</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                          rep.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-neutral-100 text-neutral-700"
                        )}
                      >
                        {rep.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(rep)}
                          className="h-7 w-7 p-0"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(rep.id)}
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
