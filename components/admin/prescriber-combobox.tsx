/**
 * Combobox de Prescritor com Criação Inline
 * 
 * Features:
 * - Busca com autocomplete enquanto digita
 * - Sugestões filtradas baseadas nos prescritores existentes
 * - Opção "Criar novo" se não houver correspondência exata
 * - Dialog inline para completar dados obrigatórios
 */

"use client";

import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toTitleCase } from "@/lib/utils/text-formatting";
import { PhoneInput } from "@/components/admin/phone-input";

interface Prescriber {
  id: string;
  name: string;
  phone?: string;
  representativeId?: string | null;
}

interface PrescriberComboboxProps {
  prescribers: Prescriber[];
  value: string;
  onChange: (prescriberId: string) => void;
  onPrescriberCreated?: () => void;
}

export function PrescriberCombobox({
  prescribers,
  value,
  onChange,
  onPrescriberCreated,
}: PrescriberComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPrescriberData, setNewPrescriberData] = useState({
    name: "",
    phone: "",
    countryCode: "+55",
  });

  // Prescritor selecionado
  const selectedPrescriber = prescribers.find((p) => p.id === value);

  // Filtrar prescritores baseado na busca
  const filteredPrescribers = useMemo(() => {
    if (!search) return prescribers;
    
    const searchLower = search.toLowerCase();
    return prescribers.filter((p) =>
      p.name.toLowerCase().includes(searchLower)
    );
  }, [prescribers, search]);

  // Verifica se há match exato
  const hasExactMatch = filteredPrescribers.some(
    (p) => p.name.toLowerCase() === search.toLowerCase()
  );

  // Abre dialog para criar novo prescritor
  const handleCreateNew = () => {
    setNewPrescriberData({
      name: toTitleCase(search),
      phone: "",
      countryCode: "+55",
    });
    setShowCreateDialog(true);
    setOpen(false);
  };

  // Cria novo prescritor
  const handleConfirmCreate = async () => {
    if (!newPrescriberData.name || !newPrescriberData.phone) {
      alert("Nome e telefone são obrigatórios");
      return;
    }

    setCreating(true);

    try {
      const response = await fetch("/api/admin/prescribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPrescriberData.name,
          phone: newPrescriberData.phone,
          countryCode: newPrescriberData.countryCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar prescritor");
      }

      const data = await response.json();
      
      // Seleciona o novo prescritor
      onChange(data.prescriber.id);
      
      // Fecha dialog
      setShowCreateDialog(false);
      setSearch("");
      
      // Notifica que foi criado (para recarregar lista)
      onPrescriberCreated?.();
      
    } catch (error) {
      console.error("Erro ao criar prescritor:", error);
      alert("Erro ao criar prescritor");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      {/* Combobox Principal */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            "w-full flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm",
            "hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20",
            !value && "text-neutral-500"
          )}
        >
          <span className="truncate">
            {selectedPrescriber?.name || "Selecionar prescritor..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg">
            {/* Campo de busca */}
            <div className="p-2 border-b border-neutral-100">
              <Input
                placeholder="Buscar prescritor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8"
                autoFocus
              />
            </div>

            {/* Lista de resultados */}
            <div className="max-h-[200px] overflow-y-auto p-1">
              {filteredPrescribers.length === 0 && !search && (
                <div className="px-3 py-2 text-xs text-neutral-500 text-center">
                  Nenhum prescritor cadastrado
                </div>
              )}

              {filteredPrescribers.map((prescriber) => (
                <button
                  key={prescriber.id}
                  type="button"
                  onClick={() => {
                    onChange(prescriber.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full flex items-center justify-between rounded px-3 py-2 text-sm text-left",
                    "hover:bg-neutral-100 transition-colors",
                    value === prescriber.id && "bg-neutral-100"
                  )}
                >
                  <span>{prescriber.name}</span>
                  {value === prescriber.id && (
                    <Check className="h-4 w-4 text-[var(--color-brand-primary)]" />
                  )}
                </button>
              ))}

              {/* Opção "Criar novo" se houver busca e não houver match exato */}
              {search && !hasExactMatch && (
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="w-full flex items-center gap-2 rounded px-3 py-2 text-sm text-left hover:bg-blue-50 transition-colors text-blue-600 font-medium border-t border-neutral-100 mt-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Criar novo: "{toTitleCase(search)}"</span>
                </button>
              )}
            </div>

            {/* Botão fechar */}
            <div className="p-2 border-t border-neutral-100">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  setSearch("");
                }}
                className="w-full text-xs"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog de Criação Rápida */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Criar Novo Prescritor</h3>
              <button
                type="button"
                onClick={() => setShowCreateDialog(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nome */}
              <div>
                <Label htmlFor="new-name" className="text-sm">
                  Nome *
                </Label>
                <Input
                  id="new-name"
                  value={newPrescriberData.name}
                  onChange={(e) =>
                    setNewPrescriberData({
                      ...newPrescriberData,
                      name: toTitleCase(e.target.value),
                    })
                  }
                  placeholder="Nome do prescritor"
                  autoFocus
                />
              </div>

              {/* Telefone */}
              <div>
                <Label htmlFor="new-phone" className="text-sm">
                  Telefone *
                </Label>
                <PhoneInput
                  value={newPrescriberData.phone}
                  onChange={(phone, countryCode) =>
                    setNewPrescriberData({
                      ...newPrescriberData,
                      phone,
                      countryCode,
                    })
                  }
                  defaultCountry={newPrescriberData.countryCode}
                  required
                />
              </div>

              <p className="text-xs text-neutral-500">
                Outros dados podem ser adicionados depois na gestão de
                prescritores
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={creating}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleConfirmCreate}
                disabled={creating || !newPrescriberData.name || !newPrescriberData.phone}
                className="flex-1"
              >
                {creating ? "Criando..." : "Criar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
