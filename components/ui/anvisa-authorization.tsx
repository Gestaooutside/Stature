"use client"

import { Awards } from "./award"

/**
 * Componente de autorização da ANVISA para farmácias parceiras
 * Integrado estrategicamente na landing page com design harmonizado
 */
export function AnvisaAuthorization() {
  return (
    <section className="w-full py-16 md:py-20 lg:py-24 bg-white">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Componente Awards elegante - adaptado para mobile */}
          <div className="flex-shrink-0 w-full lg:w-auto flex justify-center lg:justify-start">
            <Awards
              variant="award"
              title="ANVISA"
              subtitle="Certificação de Qualidade"
              recipient="Duo Natural"
              date="2025"
              level="gold"
              className="scale-75 lg:scale-90"
            />
          </div>

          {/* Conteúdo textual otimizado para mobile */}
          <div className="flex-1 flex flex-col justify-center gap-4 lg:gap-6 text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl font-light text-neutral-900 leading-tight">
              Farmácias autorizadas pela <span className="italic font-normal">ANVISA</span>
            </h2>

            <p className="text-neutral-600 leading-relaxed text-base md:text-lg max-w-2xl">
              Todos os medicamentos são produzidos por farmácias parceiras certificadas pela ANVISA.
              A DUO NATURAL garante e audita todos os parceiros, assegurando os mais altos padrões
              de qualidade e segurança em cada etapa do processo de manipulação.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}