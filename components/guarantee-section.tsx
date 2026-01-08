"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Truck, Award } from "lucide-react"
import { Reveal } from "./reveal"
import { MagneticButton } from "./ui/magnetic-button"

const guarantees = [
  {
    icon: Shield,
    title: "100% Seguro",
    description: "Fórmulas aprovadas, sem efeitos colaterais relatados. Certificações de qualidade e pureza.",
  },
  {
    icon: Lock,
    title: "Pagamento Protegido",
    description: "Transações criptografadas e seguras. Seus dados protegidos com tecnologia de ponta.",
  },
  {
    icon: Truck,
    title: "Envio Transparente",
    description: "Receba seu código de rastreio e acompanhe cada passo da sua entrega em tempo real.",
  },
  {
    icon: Award,
    title: "Qualidade Garantida",
    description: "Ingredientes premium com certificação de origem. Produção sob rígidos padrões de qualidade.",
  },
]

interface GuaranteeSectionProps {
  onOpenPaymentModal?: () => void
}

export function GuaranteeSection({ onOpenPaymentModal }: GuaranteeSectionProps) {
  return (
    <section id="guarantee" className="py-16 md:py-24 lg:py-32 bg-[#dad7ce]/20">
      <div className="container-custom">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-12 md:mb-14 lg:mb-16 xl:mb-20 px-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-neutral-900 mb-4 md:mb-5 lg:mb-6 tracking-tight">Sua tranquilidade, <span className="italic font-normal">nosso compromisso</span></h2>
            <p className="text-base md:text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Segurança, privacidade e qualidade em cada detalhe
            </p>
          </div>
        </Reveal>

        {/* Guarantees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7 lg:gap-8 xl:gap-10">
          {guarantees.map((item, index) => {
            const Icon = item.icon
            return (
              <Reveal key={index} delay={index * 0.1}>
                <motion.div
                  className="text-center group"
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                >
                  {/* Icon */}
                  <div className="inline-flex mb-4 md:mb-5 lg:mb-6">
                    <div className="p-3 md:p-4 lg:p-5 rounded-2xl bg-white border-2 border-[#a89a8d]/20 group-hover:border-[#a89a8d]/60 transition-all duration-500 group-hover:shadow-xl">
                      <Icon className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-[#a89a8d]" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg md:text-xl font-medium text-neutral-900 mb-2 md:mb-3">{item.title}</h3>
                  <p className="text-sm md:text-base text-neutral-600 leading-relaxed">{item.description}</p>
                </motion.div>
              </Reveal>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <Reveal>
          <div className="text-center mt-12 md:mt-14 lg:mt-16 xl:mt-20 px-4">
            <div className="inline-block p-5 md:p-6 lg:p-8 rounded-2xl bg-white border-2 border-[#a89a8d]/20 max-w-2xl">
              <p className="text-sm md:text-base lg:text-lg text-neutral-700 leading-relaxed mb-4 md:mb-5 lg:mb-6">
                Mais de <span className="font-semibold text-neutral-900">620.000 cápsulas vendidas</span> e{" "}
                <span className="font-semibold text-neutral-900">97% de aprovação</span>. Junte-se a milhares de pessoas que confiaram no DUO NATURAL.
              </p>
              <MagneticButton distance={0.6}>
                <motion.button
                  onClick={onOpenPaymentModal}
                  className="inline-block px-6 py-3 md:px-8 md:py-4 rounded-full bg-[#a89a8d] text-white font-medium text-sm md:text-base hover:bg-[#8d7f72] transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Experimentar com segurança
                </motion.button>
              </MagneticButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
