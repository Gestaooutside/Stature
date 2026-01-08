/**
 * SolutionIntro - Seção de introdução à solução DUO NATURAL
 *
 * Section dedicada e estreita que apresenta a proposta de valor
 * antes de detalhar os problemas específicos. Layout minimalista
 * com foco no conteúdo e hierarquia tipográfica.
 */

"use client"

import { motion } from "framer-motion"
import { Reveal } from "./reveal"
import { MagneticButton } from "./ui/magnetic-button"
import { FlipWords } from "./ui/flip-words"

interface SolutionIntroProps {
  onOpenPaymentModal?: () => void
}

export function SolutionIntro({ onOpenPaymentModal }: SolutionIntroProps) {
  return (
    <section className="py-16 md:py-24 lg:py-32 xl:py-40 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-12">
        <Reveal>
          {/* Badge "A solução" alinhado à esquerda */}
          <div className="mb-6 md:mb-8">
            <div className="inline-block px-4 py-1.5 md:px-6 md:py-2 rounded-full bg-[#dad7ce]/40 border border-[#a89a8d]/20">
              <span className="text-xs md:text-sm font-medium text-neutral-700 uppercase tracking-wider">
                A solução
              </span>
            </div>
          </div>

          {/* Título editorial grande - uma linha só */}
          <div className="mb-8 md:mb-10 lg:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-5xl xl:text-7xl 2xl:text-8xl font-light text-neutral-900 leading-[1.1] tracking-tight">
              E se existisse uma forma{" "}
              <FlipWords
                words={["natural", "simples", "segura", "efetiva"]}
                duration={3000}
                className="inline-block italic font-bold text-[#8d7f72]"
              />{" "}
              de retomar o controle?
            </h2>
          </div>

          {/* Descrição e CTA alinhados à esquerda */}
          <div className="max-w-3xl">
            <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-neutral-600 leading-relaxed mb-6 md:mb-8 lg:mb-10 font-light">
              DUO NATURAL atua na raiz do problema: reequilibrando os neurotransmissores que regulam ansiedade, apetite e sono. Sem mascarar sintomas. Sem criar dependência. Apenas devolvendo o que seu corpo já sabe fazer.
            </p>

            <MagneticButton distance={0.6}>
              <motion.button
                onClick={onOpenPaymentModal}
                className="inline-block px-6 py-3 md:px-8 md:py-4 rounded-full bg-[#a89a8d] text-white font-medium text-sm md:text-base hover:bg-[#8d7f72] transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Conhecer o sistema
              </motion.button>
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
