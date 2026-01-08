"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Componente de paginação elegante e inteligente
 * Inspirado em designs modernos com feedback visual claro
 */
interface ElegantPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

export function ElegantPagination({
  currentPage,
  totalPages,
  total,
  pageSize,
  loading = false,
  onPageChange,
  className
}: ElegantPaginationProps) {
  // Cálculos para mostrar informações úteis
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  // Gera números de página para mostrar (com elipses inteligentes)
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Se tem poucas páginas, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica inteligente para mostrar páginas com elipses
      const leftSide = Math.max(1, currentPage - 2);
      const rightSide = Math.min(totalPages, currentPage + 2);

      // Primeira página sempre visível
      pages.push(1);

      // Elipse esquerda se necessário
      if (leftSide > 2) {
        pages.push('...');
      }

      // Páginas do meio
      for (let i = Math.max(2, leftSide); i <= Math.min(totalPages - 1, rightSide); i++) {
        pages.push(i);
      }

      // Elipse direita se necessário
      if (rightSide < totalPages - 1) {
        pages.push('...');
      }

      // Última página sempre visível (se não for a primeira)
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  // Função para navegar para página específica com validação
  const goToPage = (page: number | string) => {
    if (typeof page === 'number' && page >= 1 && page <= totalPages && !loading) {
      onPageChange(page);
    }
  };

  // Funções de navegação
  const goToPrevious = () => {
    if (currentPage > 1 && !loading) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages && !loading) {
      onPageChange(currentPage + 1);
    }
  };

  // Se só tem uma página, não mostra paginação
  if (totalPages <= 1) {
    return (
      <div className={cn("flex justify-between items-center text-sm text-muted-foreground", className)}>
        <div>
          {total === 0 ? "Nenhum item encontrado" : `Mostrando 1-${total} de ${total} itens`}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col sm:flex-row justify-between items-center gap-4", className)}>
      {/* Informações sobre os itens sendo mostrados */}
      <div className="text-sm text-muted-foreground order-2 sm:order-1">
        {total === 0 ? (
          "Nenhum item encontrado"
        ) : (
          <>
            Mostrando <span className="font-medium">{startItem}-{endItem}</span> de{" "}
            <span className="font-medium">{total}</span> itens
            <span className="hidden sm:inline ml-2">
              • Página <span className="font-medium">{currentPage}</span> de{" "}
              <span className="font-medium">{totalPages}</span>
            </span>
          </>
        )}
      </div>

      {/* Controles de paginação */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Botão Anterior */}
        <Button
          size="sm"
          variant="outline"
          onClick={goToPrevious}
          disabled={currentPage === 1 || loading}
          className="h-8 px-3 gap-1 text-xs font-medium"
          title="Página anterior (←)"
        >
          <ChevronLeft className="h-3 w-3" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {/* Números de página */}
        <div className="flex items-center gap-0.5 mx-1">
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                // Elipse
                <div className="px-2 text-xs text-muted-foreground select-none">...</div>
              ) : (
                // Número de página
                <Button
                  size="sm"
                  variant={page === currentPage ? "default" : "outline"}
                  onClick={() => goToPage(page as number)}
                  disabled={loading}
                  className={cn(
                    "h-8 w-8 p-0 text-xs font-medium transition-all duration-200",
                    page === currentPage && "shadow-sm"
                  )}
                  title={`Ir para página ${page}`}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Botão Próxima */}
        <Button
          size="sm"
          variant="outline"
          onClick={goToNext}
          disabled={currentPage === totalPages || loading}
          className="h-8 px-3 gap-1 text-xs font-medium"
          title="Próxima página (→)"
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Componente simplificado para página única ou fallback
 */
export function SimplePaginationInfo({
  total,
  pageSize,
  className
}: {
  total: number;
  pageSize: number;
  className?: string;
}) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className={cn("text-sm text-muted-foreground", className)}>
      {total === 0 ? (
        "Nenhum item encontrado"
      ) : (
        <>
          Mostrando {Math.min(total, pageSize)} de {total} itens
          {totalPages > 1 && (
            <span className="ml-2">
              ({totalPages} página{totalPages > 1 ? 's' : ''})
            </span>
          )}
        </>
      )}
    </div>
  );
}