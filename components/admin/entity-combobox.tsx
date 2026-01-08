"use client";

import React, { useState, useCallback } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Combobox genérico para seleção de entidades (prescritores, representantes)
 * Permite busca e criação inline de novas entidades
 */

interface Entity {
  id: string;
  name: string;
  [key: string]: any;
}

interface EntityComboboxProps {
  entities: Entity[];
  value: string | null;
  onChange: (entityId: string | null) => void;
  onCreate?: () => void;
  placeholder?: string;
  searchPlaceholder?: string;
  createLabel?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export function EntityCombobox({
  entities,
  value,
  onChange,
  onCreate,
  placeholder = "Selecionar...",
  searchPlaceholder = "Buscar...",
  createLabel = "Criar novo",
  emptyMessage = "Nenhum resultado encontrado",
  className,
  disabled = false
}: EntityComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Entidade selecionada
  const selectedEntity = entities.find((entity) => entity.id === value);

  // Filtra entidades com base no termo de busca
  const filteredEntities = entities.filter((entity) =>
    entity.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = useCallback((entityId: string) => {
    onChange(entityId);
    setIsOpen(false);
    setSearchTerm("");
  }, [onChange]);

  const handleCreate = useCallback(() => {
    setIsOpen(false);
    setSearchTerm("");
    onCreate?.();
  }, [onCreate]);

  return (
    <div className={cn("relative", className)}>
      {/* Botão principal */}
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className={cn(
          "w-full justify-between font-normal",
          !selectedEntity && "text-muted-foreground"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="truncate">
          {selectedEntity ? selectedEntity.name : placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-[300px] overflow-hidden">
          {/* Campo de busca */}
          <div className="p-2 border-b border-neutral-200">
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9"
              autoFocus
            />
          </div>

          {/* Lista de entidades */}
          <div className="overflow-y-auto max-h-[200px]">
            {filteredEntities.length > 0 ? (
              filteredEntities.map((entity) => (
                <button
                  key={entity.id}
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 flex items-center justify-between transition-colors",
                    value === entity.id && "bg-neutral-50"
                  )}
                  onClick={() => handleSelect(entity.id)}
                >
                  <span className="truncate">{entity.name}</span>
                  {value === entity.id && (
                    <Check className="h-4 w-4 shrink-0 ml-2 text-green-600" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            )}
          </div>

          {/* Botão de criar novo */}
          {onCreate && (
            <div className="p-2 border-t border-neutral-200">
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 flex items-center gap-2 transition-colors rounded font-medium text-primary"
                onClick={handleCreate}
              >
                <Plus className="h-4 w-4" />
                {createLabel}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay para fechar ao clicar fora */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
