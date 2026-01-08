// Modal para exibir documentos legais (Política de Privacidade, Termos de Uso)
// Baseado em Radix UI Dialog com design system do projeto

"use client"

import { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * Modal reutilizável para exibir documentos legais
 * Responsivo (fullscreen em mobile), scrollável, acessível
 */
export function LegalModal({ isOpen, onClose, title, children }: LegalModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] sm:max-h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header Fixo */}
        <DialogHeader className="border-b border-neutral-200 p-4 sm:p-6 pb-3 sm:pb-4 flex-shrink-0">
          <DialogTitle className="text-xl sm:text-2xl font-light text-neutral-900">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {title}
          </DialogDescription>
        </DialogHeader>

        {/* Conteúdo Scrollável */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="prose prose-sm sm:prose prose-neutral max-w-none">
            {children}
          </div>
        </div>

        {/* Footer Fixo */}
        <div className="border-t border-neutral-200 p-4 sm:p-6 pt-3 sm:pt-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-full bg-[#a89a8d] text-white font-medium hover:bg-[#8d7f72] transition-colors active:scale-95 transform"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
