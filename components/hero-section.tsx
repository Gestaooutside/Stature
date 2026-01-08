"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { useRef, useState, useEffect } from "react"

/**
 * HeroSection - Seção hero editorial com background full-bleed responsivo
 *
 * Design: Background immersive com imagens otimizadas para mobile e desktop.
 * Implementa imagens separadas para mobile (1.5MB) e desktop (3.8MB),
 * economizando ~60% de dados em dispositivos móveis.
 * Logo DUO em SVG vetorial, overlay gradiente e posicionamento sofisticado.
 */
interface HeroSectionProps {
  onOpenPaymentModal?: () => void
}

export function HeroSection({ onOpenPaymentModal }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detecta viewport mobile para carregar imagem otimizada
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // breakpoint md (768px)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  // Fade out do conteúdo durante scroll
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80])

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative h-screen overflow-hidden"
      aria-label="Hero principal - DUO NATURAL"
    >
      {/* Background Image - Versão responsiva otimizada */}
      <div className="absolute inset-0">
        <Image
          src={isMobile ? "/hero-section-mobile.jpg" : "/hero-section.jpg"}
          alt="Equilíbrio e controle - DUO NATURAL"
          fill
          priority
          quality={85}
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Overlay escuro sutil para profundidade e contraste */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 via-50% to-transparent to-75%" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />

      {/* Conteúdo */}
      <motion.div
        className="relative z-10 h-full flex items-center will-change-transform"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-12 w-full">
          <div className="max-w-2xl">
            {/* Logo DUO como h1 semântico com imagem SVG vetorial */}
            <motion.h1
              className="mb-6 md:mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <Image
                src="/duo-logo-light.svg"
                alt="DUO NATURAL - Controle da Ansiedade e Compulsão Alimentar"
                width={400}
                height={225}
                priority
                className="w-[240px] h-[135px] md:w-[320px] md:h-[180px] lg:w-[400px] lg:h-[225px]"
              />
            </motion.h1>

            {/* Subtítulo sofisticado */}
            <motion.div
              className="mb-6 md:mb-8 lg:mb-10 space-y-1 md:space-y-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <p className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light text-white leading-tight">
                Natural. Científico. Seguro.
              </p>
              <p className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light text-white/90 leading-tight">
                O novo padrão no controle do seu corpo e da sua mente
              </p>
            </motion.div>

            {/* Linha descritiva sutil */}
            <motion.p
              className="text-sm md:text-base lg:text-lg text-white/80 mb-6 md:mb-8 lg:mb-10 leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              Sistema natural para controle de ansiedade, compulsão alimentar e sono profundo.
              <span className="block mt-1.5 md:mt-2 text-white font-medium">
                100% natural. Zero dependência. Resultados em 24 horas.
              </span>
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <motion.button
                onClick={onOpenPaymentModal}
                className="px-6 py-3 md:px-8 md:py-3.5 lg:px-10 lg:py-4 bg-gradient-to-r from-neutral-900 via-[#8d7f72] to-neutral-900 bg-size-200 text-white text-sm md:text-base font-medium rounded-full shadow-xl overflow-hidden"
                whileHover={{
                  backgroundPosition: "100% 50%",
                  boxShadow: "0 20px 40px -12px rgba(141, 127, 114, 0.4), 0 0 0 1px rgba(141, 127, 114, 0.2)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{
                  duration: 0.4,
                  ease: [0.21, 0.47, 0.32, 0.98]
                }}
              >
                Iniciar transformação
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center pt-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div className="w-1 h-2 bg-white/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
