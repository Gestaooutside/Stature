/**
 * Componente de autocomplete para Prescritor com criação inline
 * 
 * Permite:
 * - Buscar prescritores existentes digitando
 * - Criar novo prescritor sem sair do formulário
 * - Auto-aplicação de Title Case no nome
 */

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, UserPlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toTitleCase } from '@/lib/utils/text-formatting';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PhoneInput } from '@/components/admin/phone-input';

interface Prescriber {
  id: string;
  name: string;
  phone: string;
}

interface PrescriberAutocompleteProps {
  prescribers: Prescriber[];
  value: string; // ID do prescritor selecionado
  onChange: (prescriberId: string) => void;
  onPrescriberCreated?: () => void; // Callback para recarregar lista
}

export function PrescriberAutocomplete({
  prescribers,
  value,
  onChange,
  onPrescriberCreated,
}: PrescriberAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Estado do formulário de criação
  const [newPrescriber, setNewPrescriber] = useState({
    name: '',
    phone: '',
    countryCode: '+55',
  });

  // Prescritor selecionado
  const selectedPrescriber = prescribers.find(p => p.id === value);

  // Filtrar prescritores baseado na busca
  const filteredPrescribers = search
    ? prescribers.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : prescribers;

  // Abre dialog de criação com o nome buscado pré-preenchido
  const handleCreateNew = () => {
    setNewPrescriber({
      name: toTitleCase(search),
      phone: '',
      countryCode: '+55',
    });
    setShowCreateDialog(true);
    setOpen(false);
  };

  // Cria novo prescritor
  const handleCreate = async () => {
    if (!newPrescriber.name.trim() || !newPrescriber.phone.trim()) {
      alert('Nome e telefone são obrigatórios');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/admin/prescribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: toTitleCase(newPrescriber.name),
          phone: newPrescriber.phone,
          countryCode: newPrescriber.countryCode,
          representativeId: null,
          defaultCommission: 0,
        }),
      });

      if (!response.ok) throw new Error('Erro ao criar prescritor');

      const data = await response.json();
      
      // Seleciona o novo prescritor
      onChange(data.prescriber.id);
      
      // Fecha dialog
      setShowCreateDialog(false);
      setSearch('');
      
      // Recarrega lista
      if (onPrescriberCreated) {
        onPrescriberCreated();
      }
    } catch (error) {
      console.error('Erro ao criar prescritor:', error);
      alert('Erro ao criar prescritor');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      {/* Campo Principal */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            "w-full flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm",
            "hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20",
            !value && "text-neutral-500"
          )}
        >
          <span className="truncate">
            {selectedPrescriber ? selectedPrescriber.name : "Selecione ou crie prescritor..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>

        {/* Dropdown de sugestões */}
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg">
            {/* Campo de busca */}
            <div className="p-2 border-b border-neutral-100">
              <Input
                ref={inputRef}
                placeholder="Buscar prescritor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-sm"
                autoFocus
              />
            </div>

            {/* Lista de resultados */}
            <div className="max-h-60 overflow-y-auto p-1">
              {filteredPrescribers.length === 0 ? (
                <div className="px-3 py-2 text-sm text-neutral-500 text-center">
                  Nenhum prescritor encontrado
                </div>
              ) : (
                filteredPrescribers.map((prescriber) => (
                  <button
                    key={prescriber.id}
                    type="button"
                    onClick={() => {
                      onChange(prescriber.id);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-neutral-100",
                      value === prescriber.id && "bg-neutral-100 font-medium"
                    )}
                  >
                    <span className="truncate">{prescriber.name}</span>
                    {value === prescriber.id && (
                      <Check className="h-4 w-4 text-[var(--color-brand-primary)]" />
                    )}
                  </button>
                ))
              )}

              {/* Botão criar novo */}
              <button
                type="button"
                onClick={handleCreateNew}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-brand-primary)] font-medium border-t border-neutral-100 mt-1 pt-2 hover:bg-[var(--color-brand-primary)]/5 rounded"
              >
                <UserPlus className="h-4 w-4" />
                Criar novo prescritor
                {search && ` "${toTitleCase(search)}"`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog de criação rápida */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Prescritor</DialogTitle>
            <DialogDescription>
              Cadastro rápido. Você pode adicionar mais detalhes depois.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="quick-name">Nome *</Label>
              <Input
                id="quick-name"
                value={newPrescriber.name}
                onChange={(e) => setNewPrescriber({
                  ...newPrescriber,
                  name: toTitleCase(e.target.value)
                })}
                placeholder="Nome do prescritor"
                autoFocus
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="quick-phone">Telefone *</Label>
              <PhoneInput
                value={newPrescriber.phone}
                onChange={(phone, countryCode) =>
                  setNewPrescriber({ ...newPrescriber, phone, countryCode })
                }
                defaultCountry={newPrescriber.countryCode}
                required
              />
            </div>

            <p className="text-xs text-neutral-500">
              * Campos obrigatórios. Outros detalhes podem ser adicionados depois em Prescritores.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={creating || !newPrescriber.name.trim() || !newPrescriber.phone.trim()}
            >
              {creating ? 'Criando...' : 'Criar e Selecionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Overlay para fechar dropdown ao clicar fora */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
