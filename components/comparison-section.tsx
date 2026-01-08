"use client"

import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { Reveal } from "./reveal"
import { MagneticButton } from "./ui/magnetic-button"

const features = [
  { feature: "Ação Rápida", common: false, prescription: true, duo: true },
  { feature: "Absorção Eficiente", common: false, prescription: false, duo: true },
  { feature: "Controle da Ansiedade", common: false, prescription: true, duo: true },
  { feature: "Combate à Compulsão", common: false, prescription: true, duo: true },
  { feature: "Sono Restaurador", common: false, prescription: false, duo: true },
  { feature: "Ativos 100% Naturais", common: true, prescription: false, duo: true },
  { feature: "Zero Dependência", common: true, prescription: false, duo: true },
  { feature: "Sem Contraindicações", common: true, prescription: false, duo: true },
]

interface ComparisonSectionProps {
  onOpenPaymentModal?: () => void
}

export function ComparisonSection({ onOpenPaymentModal }: ComparisonSectionProps) {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-neutral-50 via-white to-neutral-50 relative overflow-hidden">
      <div className="container-custom max-w-6xl relative">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-neutral-900 mb-4 md:mb-6 lg:mb-8 tracking-tight leading-[1.1]">
              Por que <span className="italic font-normal">usar DUO?</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-neutral-600 max-w-3xl mx-auto leading-relaxed font-light px-4">
              Compare e veja a diferença
            </p>
          </div>
        </Reveal>

        {/* Comparison Table */}
        <div className="overflow-x-auto relative">
          {/* Shadow lateral sutil para profundidade na coluna DUO */}
          <div className="absolute top-0 bottom-0 right-0 w-1/4 pointer-events-none hidden lg:block">
            <div className="h-full bg-gradient-to-l from-[#a89a8d]/8 via-[#a89a8d]/3 to-transparent rounded-r-2xl" />
          </div>

          <table className="w-full relative">
            {/* Header */}
            <thead>
              <tr className="border-b-2 border-neutral-200">
                <th className="text-left py-3 md:py-4 lg:py-6 px-2 md:px-3 lg:px-6">
                  <span className="text-xs md:text-sm font-medium text-neutral-500 uppercase tracking-wider">
                    Característica
                  </span>
                </th>
                <th className="text-center py-3 md:py-4 lg:py-6 px-2 md:px-3 lg:px-6">
                  <div className="text-xs md:text-sm font-medium text-neutral-700">Métodos Comuns</div>
                  <div className="text-[10px] md:text-xs text-neutral-500 mt-0.5 md:mt-1">Chás, suplementos</div>
                </th>
                <th className="text-center py-3 md:py-4 lg:py-6 px-2 md:px-3 lg:px-6">
                  <div className="text-xs md:text-sm font-medium text-neutral-700">Tarja Preta</div>
                  <div className="text-[10px] md:text-xs text-neutral-500 mt-0.5 md:mt-1">Medicamentos</div>
                </th>

                {/* Coluna DUO - Header Premium */}
                <th className="text-center py-3 md:py-4 lg:py-6 px-2 md:px-3 lg:px-6 relative bg-gradient-to-b from-[#dad7ce]/25 via-[#dad7ce]/15 to-[#dad7ce]/10 rounded-t-2xl border-l-2 border-r-2 border-t-2 border-[#a89a8d]/35">
                  <div className="text-sm md:text-base font-bold text-[#8d7f72]">DUO NATURAL</div>
                  <div className="text-[10px] md:text-xs text-neutral-700 mt-0.5 md:mt-1 font-medium">Sistema 360º</div>
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {features.map((item, index) => {
                const isLastRow = index === features.length - 1

                return (
                  <motion.tr
                    key={index}
                    className="border-b border-neutral-100 hover:bg-[#dad7ce]/5 transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <td className="py-3 md:py-4 lg:py-5 px-2 md:px-3 lg:px-6 font-medium text-neutral-900 text-xs md:text-sm lg:text-base">
                      {item.feature}
                    </td>

                    {/* Métodos Comuns */}
                    <td className="py-3 md:py-4 lg:py-5 px-2 md:px-3 lg:px-6 text-center">
                      {item.common ? (
                        <Check className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 mx-auto" strokeWidth={2.5} />
                      ) : (
                        <X className="w-4 h-4 md:w-5 md:h-5 text-neutral-300 mx-auto" strokeWidth={2.5} />
                      )}
                    </td>

                    {/* Tarja Preta */}
                    <td className="py-3 md:py-4 lg:py-5 px-2 md:px-3 lg:px-6 text-center">
                      {item.prescription ? (
                        <Check className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 mx-auto" strokeWidth={2.5} />
                      ) : (
                        <X className="w-4 h-4 md:w-5 md:h-5 text-neutral-300 mx-auto" strokeWidth={2.5} />
                      )}
                    </td>

                    {/* Coluna DUO - Células Premium */}
                    <td className={`py-3 md:py-4 lg:py-5 px-2 md:px-3 lg:px-6 text-center relative bg-gradient-to-b from-[#dad7ce]/12 to-transparent border-l-2 border-r-2 border-[#a89a8d]/25 ${
                      isLastRow ? 'border-b-2 border-[#a89a8d]/35 rounded-b-2xl' : ''
                    }`}>
                      {item.duo ? (
                        <motion.div
                          className="inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-br from-[#8d7f72] to-[#a89a8d] shadow-md"
                          whileHover={{ scale: 1.15 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" strokeWidth={3} />
                        </motion.div>
                      ) : (
                        <X className="w-4 h-4 md:w-5 md:h-5 text-neutral-300 mx-auto" strokeWidth={2.5} />
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <Reveal>
          <div className="text-center mt-8 md:mt-10 lg:mt-12 xl:mt-16 px-4">
            <MagneticButton distance={0.6}>
              <motion.button
                onClick={onOpenPaymentModal}
                className="inline-block px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 rounded-full bg-gradient-to-r from-[#a89a8d] to-[#8d7f72] text-white font-semibold text-sm md:text-base lg:text-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Quero provar a diferença
              </motion.button>
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
