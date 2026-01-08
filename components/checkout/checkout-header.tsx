// Header elegante para página de checkout
// Inclui logo DUO e botão voltar para página inicial

'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Header da página de checkout
 * Exibe logo DUO e botão voltar elegante
 */
export function CheckoutHeader() {
  return (
    <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white px-4 py-3 md:px-8 md:py-4">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          title="Voltar para página inicial"
        >
          <Image
            src="/logo.svg"
            alt="DUO Natural"
            width={120}
            height={40}
            className="h-6 w-auto md:h-8 transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Botão Voltar */}
        <Link
          href="/"
          className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-all duration-200 border border-transparent hover:border-neutral-200"
          title="Voltar para página inicial"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">Voltar</span>
        </Link>
      </div>
    </div>
  );
}