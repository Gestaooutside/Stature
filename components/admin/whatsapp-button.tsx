"use client";

import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Componente de botão para contato via WhatsApp
 * Gera link wa.me com número formatado
 */

interface WhatsAppButtonProps {
  phone: string; // Formato: +5511999999999
  message?: string; // Mensagem pré-preenchida
  size?: 'xs' | 'sm' | 'md' | 'lg';
  label?: string; // Texto adicional
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function WhatsAppButton({
  phone,
  message,
  size = 'sm',
  label,
  variant = 'ghost',
  className
}: WhatsAppButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Gera link do WhatsApp
  const generateWhatsAppLink = () => {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Encoda mensagem se fornecida
    const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : '';
    
    return `https://wa.me/${cleanPhone}${encodedMessage}`;
  };

  const sizeClasses = {
    xs: 'h-7 w-7 p-0',
    sm: 'h-8 w-8 p-0',
    md: 'h-10 w-10 p-0',
    lg: 'h-12 w-12 p-0'
  };

  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className="relative inline-block">
      <Button
        size={size}
        variant={variant}
        title={`WhatsApp: ${phone}`}
        className={cn(
          label ? '' : sizeClasses[size],
          "transition-all hover:scale-110 active:scale-95",
          className
        )}
        onClick={() => window.open(generateWhatsAppLink(), '_blank')}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <MessageCircle 
          className={cn(
            iconSizes[size],
            "text-green-600"
          )} 
        />
        {label && <span className="ml-2">{label}</span>}
      </Button>
      
      {/* Tooltip customizado */}
      {showTooltip && !label && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded whitespace-nowrap z-50">
          WhatsApp
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900"></div>
        </div>
      )}
    </div>
  );
}
