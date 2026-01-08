"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ShieldCheck, Award, Zap } from "lucide-react"
import { Reveal } from "./reveal"
import { MagneticButton } from "./ui/magnetic-button"

const trustBadges = [
  {
    icon: ShieldCheck,
    text: "100% natural",
  },
  {
    icon: Award,
    text: "97% aprovação",
  },
  {
    icon: Zap,
    text: "Resultados em 24 horas",
  },
]

interface FinalCTAProps {
  onOpenPaymentModal?: () => void
}

export function FinalCTA({ onOpenPaymentModal }: FinalCTAProps) {
  return (
    <section className="relative py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden bg-gradient-to-br from-[#a89a8d] via-[#8d7f72] to-[#a89a8d]">
      {/* Background with product image */}
      <div className="absolute inset-0 opacity-10">
        <Image
          src="/duo-dia-noite-1.jpg"
          alt="Produtos DUO NATURAL - Sistema completo para controle de ansiedade"
          fill
          className="object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#a89a8d]/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 container-custom px-4">
        <Reveal>
          <div className="text-center max-w-6xl mx-auto">
            {/* Headline */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-light text-white mb-4 md:mb-5 lg:mb-6 tracking-tight leading-tight">
              Retome o controle da sua mente,
              <br className="hidden sm:block" />
              corpo e emoções hoje
            </h2>

            {/* Subheadline */}
            <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-white/90 mb-8 md:mb-10 lg:mb-12 xl:mb-16 font-light leading-relaxed">
              Junte-se a +10.000 pessoas que já transformaram suas vidas com DUO NATURAL
            </p>

            {/* CTA Button */}
            <MagneticButton distance={0.6}>
              <motion.button
                onClick={onOpenPaymentModal}
                className="inline-block px-8 py-3.5 md:px-10 md:py-4 lg:px-12 lg:py-5 rounded-full bg-white text-[#a89a8d] font-semibold text-base md:text-lg hover:bg-neutral-50 transition-all duration-300 shadow-2xl mb-8 md:mb-10 lg:mb-12"
                whileHover={{ scale: 1.08, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                whileTap={{ scale: 0.95 }}
              >
                Quero experimentar o DUO
              </motion.button>
            </MagneticButton>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-5 md:gap-6 lg:gap-8 xl:gap-12">
              {trustBadges.map((badge, index) => {
                const Icon = badge.icon
                return (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2 md:gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.8 + index * 0.1,
                      ease: [0.21, 0.47, 0.32, 0.98],
                    }}
                  >
                    <div className="p-1.5 md:p-2 rounded-full bg-white/20">
                      <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-sm md:text-base text-white font-medium">{badge.text}</span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/50 to-transparent" />
    </section>
  )
}
