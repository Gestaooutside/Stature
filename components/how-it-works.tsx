"use client"

import { motion } from "framer-motion"
import { Sun, Sunset, Moon, Sunrise } from "lucide-react"
import Image from "next/image"
import { Reveal } from "./reveal"
import { MagneticButton } from "./ui/magnetic-button"

const timeline = [
  {
    id: "manha",
    time: "Manhã",
    icon: Sunrise,
    title: "Tome 1 a 2 cápsulas",
    description: "Fórmula DIA começa a atuar, regulando neurotransmissores para controlar ansiedade e apetite ao longo do dia.",
    color: "#355E3B",
    image: "/howto-1.jpg",
  },
  {
    id: "tarde",
    time: "Tarde",
    icon: Sun,
    title: "Controle sustentado",
    description: "Ação contínua durante período de maior estresse. Você mantém clareza mental e controle sobre impulsos alimentares.",
    color: "#9CAF88",
    image: "/howto-2.jpg",
  },
  {
    id: "noite",
    time: "Noite",
    icon: Sunset,
    title: "Prepare-se para dormir",
    description: "30 minutos antes de dormir, 2 a 5 gotas da Fórmula NOITE induzem relaxamento natural e regulam hormônios do sono.",
    color: "#1a365d",
    image: "/howto-3.jpg",
  },
  {
    id: "madrugada",
    time: "Madrugada",
    icon: Moon,
    title: "Sono reparador",
    description: "Seu corpo regula cortisol, grelina e leptina, hormônios que controlam seu apetite e humor no dia seguinte.",
    color: "#553c9a",
    image: "/howto-4.jpg",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#dad7ce]/10 via-transparent to-[#dad7ce]/10" />

      <div className="container-custom relative z-10">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-12 md:mb-16 lg:mb-20 xl:mb-24 px-4">
            <div className="inline-block px-4 py-1.5 md:px-6 md:py-2 rounded-full bg-[#a89a8d]/10 border border-[#a89a8d]/20 mb-4 md:mb-6">
              <span className="text-xs md:text-sm font-medium text-neutral-700 uppercase tracking-wider">Sistema 360º</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-neutral-900 mb-4 md:mb-5 lg:mb-6 tracking-tight">
              Como <span className="italic font-normal">DUO</span> funciona
            </h2>
            <p className="text-base md:text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Enquanto outros produtos focam apenas sintomas, DUO NATURAL atua 24 horas na raiz do problema: regulando neurotransmissores e hormônios essenciais.
            </p>
          </div>
        </Reveal>

        {/* Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-8">
          {timeline.map((step, index) => {
            const Icon = step.icon
            return (
              <Reveal key={step.id} delay={index * 0.15}>
                <motion.div
                  className="relative group"
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                >
                  {/* Card */}
                  <div className="relative p-5 md:p-6 lg:p-7 rounded-2xl border-2 border-neutral-200 bg-white hover:border-[#a89a8d]/40 transition-all duration-500 h-full flex flex-col lg:min-h-[520px]">
                    {/* Icon & Time */}
                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                      <div
                        className="p-2.5 md:p-3.5 rounded-full"
                        style={{ backgroundColor: `${step.color}20` }}
                      >
                        <Icon className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" style={{ color: step.color }} strokeWidth={1.5} />
                      </div>
                      <span className="text-sm md:text-base font-medium uppercase tracking-wider" style={{ color: step.color }}>
                        {step.time}
                      </span>
                    </div>

                    {/* Product Image */}
                    <div className="relative w-full h-28 md:h-32 lg:h-36 mb-3 md:mb-4">
                      <Image
                        src={step.image}
                        alt={step.title}
                        fill
                        className="object-contain"
                      />
                      {/* Gradiente branco na parte inferior para transição suave */}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg md:text-xl lg:text-2xl font-medium text-neutral-900 mb-2 md:mb-3">{step.title}</h3>
                    <p className="text-neutral-600 leading-relaxed text-sm md:text-base flex-grow">{step.description}</p>

                    {/* Step Number */}
                    <div className="absolute top-3 md:top-4 right-3 md:right-4 w-7 h-7 md:w-9 md:h-9 rounded-full bg-neutral-100 flex items-center justify-center text-xs md:text-sm font-bold text-neutral-400">
                      {index + 1}
                    </div>

                    {/* Bottom accent */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ backgroundColor: step.color }}
                    />
                  </div>

                  {/* Connector Arrow (hidden on last item and mobile) */}
                  {index < timeline.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14m-6-6l6 6-6 6" stroke="#a89a8d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              </Reveal>
            )
          })}
        </div>

        {/* Bottom Text */}
        <Reveal>
          <div className="text-center mt-12 md:mt-14 lg:mt-16 xl:mt-20 max-w-3xl mx-auto px-4">
            <div className="p-5 md:p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-[#dad7ce]/30 to-[#a89a8d]/10 border border-[#a89a8d]/20">
              <p className="text-sm md:text-base lg:text-lg text-neutral-700 leading-relaxed italic">
                "Este ciclo virtuoso se repete diariamente, criando uma transformação profunda e duradoura. Não é sobre suprimir sintomas. É sobre restaurar o equilíbrio natural do seu corpo."
              </p>
              <p className="text-xs md:text-sm font-medium text-neutral-600 mt-3 md:mt-4">— DUO NATURAL</p>

              {/* CTA integrado à citação */}
              <div className="mt-5 md:mt-6">
                <MagneticButton distance={0.4}>
                  <motion.a
                    href="#featured-products"
                    className="inline-block px-6 py-3 rounded-full bg-[#a89a8d] text-white text-sm font-medium hover:bg-[#8d7f72] transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Experimentar DUO Natural
                  </motion.a>
                </MagneticButton>
              </div>
            </div>
          </div>
        </Reveal>

        </div>
    </section>
  )
}
