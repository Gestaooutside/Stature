import type { Metadata } from 'next'
import Link from 'next/link'
import { BRAND } from '@/lib/config/brand'

export const metadata: Metadata = {
  title: `Página não encontrada | ${BRAND.name}`,
  description: `A página que você procura não existe. Retorne para a página inicial do ${BRAND.name}.`,
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-neutral-50 px-4">
      <div className="text-center max-w-2xl">
        {/* Número 404 grande */}
        <h1 className="text-8xl md:text-9xl font-bold text-[#a89a8d]/20 mb-4">404</h1>

        {/* Mensagem principal */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-neutral-900 mb-4 md:mb-6">
          Ops! <span className="italic font-normal">Página não encontrada</span>
        </h2>

        {/* Descrição */}
        <p className="text-base md:text-lg text-neutral-600 mb-8 md:mb-10 leading-relaxed max-w-lg mx-auto">
          Parece que a página que você procura não existe ou foi movida. Não se preocupe, você pode retornar à nossa página inicial.
        </p>

        {/* Botão de retorno */}
        <Link
          href="/"
          className="inline-block px-8 py-4 rounded-full bg-[#a89a8d] text-white font-medium hover:bg-[#8d7f72] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        >
          Voltar para a página inicial
        </Link>

        {/* Links úteis */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-neutral-200">
          <p className="text-sm text-neutral-500 mb-4">Ou explore:</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link href="/#featured-products" className="text-sm text-[#a89a8d] hover:text-[#8d7f72] transition-colors">
              Nossos Produtos
            </Link>
            <Link href="/#ingredients" className="text-sm text-[#a89a8d] hover:text-[#8d7f72] transition-colors">
              Ingredientes
            </Link>
            <Link href="/#faq" className="text-sm text-[#a89a8d] hover:text-[#8d7f72] transition-colors">
              FAQ
            </Link>
            <Link href="/#guarantee" className="text-sm text-[#a89a8d] hover:text-[#8d7f72] transition-colors">
              Garantia
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
