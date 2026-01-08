"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Componente de input de telefone com seleção de país
 * Valida e formata automaticamente baseado no país selecionado
 */

interface Country {
  code: string;
  name: string;
  dial: string;
  flag: string;
  placeholder: string;
  pattern: RegExp;
}

const COUNTRIES: Country[] = [
  {
    code: 'BR',
    name: 'Brasil',
    dial: '+55',
    flag: '🇧🇷',
    placeholder: '(11) 99999-9999',
    pattern: /^\+55\d{2}\d{9}$/
  },
  {
    code: 'US',
    name: 'EUA',
    dial: '+1',
    flag: '🇺🇸',
    placeholder: '(555) 555-5555',
    pattern: /^\+1\d{10}$/
  },
  {
    code: 'PT',
    name: 'Portugal',
    dial: '+351',
    flag: '🇵🇹',
    placeholder: '912 345 678',
    pattern: /^\+351\d{9}$/
  },
  {
    code: 'ES',
    name: 'Espanha',
    dial: '+34',
    flag: '🇪🇸',
    placeholder: '612 34 56 78',
    pattern: /^\+34\d{9}$/
  }
];

interface PhoneInputProps {
  value: string; // Formato: +5511999999999
  onChange: (value: string, countryCode: string) => void;
  defaultCountry?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  defaultCountry = 'BR',
  placeholder,
  required = false,
  error,
  className
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find(c => c.code === defaultCountry) || COUNTRIES[0]
  );

  // Formata telefone conforme país
  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return '';
    
    // Remove tudo exceto números
    const numbers = phone.replace(/\D/g, '');
    
    // Formata baseado no país
    if (selectedCountry.code === 'BR') {
      // Remove código do país se presente
      const localNumber = numbers.replace(/^55/, '');
      
      // Formato: (11) 99999-9999
      if (localNumber.length >= 11) {
        return `(${localNumber.slice(0, 2)}) ${localNumber.slice(2, 7)}-${localNumber.slice(7, 11)}`;
      } else if (localNumber.length >= 7) {
        return `(${localNumber.slice(0, 2)}) ${localNumber.slice(2, 7)}-${localNumber.slice(7)}`;
      } else if (localNumber.length >= 2) {
        return `(${localNumber.slice(0, 2)}) ${localNumber.slice(2)}`;
      }
      return localNumber;
    }
    
    // Para outros países, apenas retorna os números
    return numbers.replace(selectedCountry.dial.replace('+', ''), '');
  };

  // Normaliza para formato internacional
  const normalizeToInternational = (displayValue: string): string => {
    const numbers = displayValue.replace(/\D/g, '');
    
    // Se já começa com código do país, retorna
    if (numbers.startsWith(selectedCountry.dial.replace('+', ''))) {
      return `+${numbers}`;
    }
    
    // Adiciona código do país
    return `${selectedCountry.dial}${numbers}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const displayValue = e.target.value;
    const internationalValue = normalizeToInternational(displayValue);
    onChange(internationalValue, selectedCountry.code);
  };

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRIES.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      // Reset phone ou converte para novo país
      onChange('', countryCode);
    }
  };

  const displayValue = formatPhoneDisplay(value);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex gap-2">
        {/* Seletor de país */}
        <select
          value={selectedCountry.code}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="w-[90px] px-2 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.dial}
            </option>
          ))}
        </select>

        {/* Input de telefone */}
        <Input
          type="tel"
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder || selectedCountry.placeholder}
          required={required}
          className={cn(
            "flex-1",
            error && "border-red-500 focus:ring-red-500"
          )}
        />
      </div>

      {/* Mensagem de erro */}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {/* Helper text */}
      <p className="text-[10px] text-neutral-500">
        Formato internacional será salvo como: {value || `${selectedCountry.dial}...`}
      </p>
    </div>
  );
}
