"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Componente ProductImage - Wrapper para imagens de produtos
 * Adiciona automaticamente disclaimer "Imagem ilustrativa" de forma elegante e discreta
 */

interface ProductImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  showDisclaimer?: boolean; // Permite desabilitar em contextos específicos
  disclaimerPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function ProductImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  showDisclaimer = true,
  disclaimerPosition = 'bottom-right'
}: ProductImageProps) {
  const positionClasses = {
    'bottom-right': 'bottom-0 right-0 rounded-tl-md',
    'bottom-left': 'bottom-0 left-0 rounded-tr-md',
    'top-right': 'top-0 right-0 rounded-bl-md',
    'top-left': 'top-0 left-0 rounded-br-md'
  };

  return (
    <div className="relative group">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        className={className}
        priority={priority}
      />
      {showDisclaimer && (
        <div
          className={cn(
            "absolute bg-black/50 backdrop-blur-sm text-white/90",
            "text-[10px] sm:text-xs px-2 py-1 z-10",
            "transition-opacity duration-200",
            "group-hover:opacity-70", // Reduz opacidade no hover para não atrapalhar
            positionClasses[disclaimerPosition]
          )}
          role="note"
          aria-label="Imagem ilustrativa do produto"
        >
          Imagem ilustrativa
        </div>
      )}
    </div>
  );
}
