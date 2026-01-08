"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Modal reutilizável para criação rápida de entidades
 * Usado para criar prescritores/representantes inline
 */

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'number' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, any>) => void | Promise<void>;
  title: string;
  fields: FormField[];
  isSaving?: boolean;
  className?: string;
}

export function QuickCreateModal({
  isOpen,
  onClose,
  onSave,
  title,
  fields,
  isSaving = false,
  className
}: QuickCreateModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Valida formulário
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} é obrigatório`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submete formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await onSave(formData);
      // Reset form
      setFormData({});
      setErrors({});
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  // Atualiza campo
  const updateField = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpa erro ao digitar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Renderiza campo baseado no tipo
  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.name,
      value: formData[field.name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        updateField(field.name, e.target.value),
      placeholder: field.placeholder,
      required: field.required,
      className: cn(errors[field.name] && "border-red-500 focus:ring-red-500")
    };

    switch (field.type) {
      case 'select':
        return (
          <select {...commonProps} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">Selecionar...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={3}
            className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        );
      
      default:
        return <Input {...commonProps} type={field.type} />;
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
          "w-full max-w-lg bg-white rounded-xl shadow-2xl",
          "max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition-colors"
            disabled={isSaving}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderField(field)}
              {errors[field.name] && (
                <p className="text-xs text-red-600">{errors[field.name]}</p>
              )}
            </div>
          ))}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? 'Salvando...' : 'Salvar e Selecionar'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
