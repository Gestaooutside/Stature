"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { useRef, useState, useEffect } from "react"
import { MessageCircle, ArrowDown } from "lucide-react"
import { BRAND, COLORS, IMAGES, LOGO, COPY, CONTACT } from "@/lib/config/brand"

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80])

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen overflow-hidden"
      aria-label={`${BRAND.name}, ${BRAND.tagline}`}
    >
      {/* Background Sólido */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: COLORS.primaryDarker }}
      />
      
      {/* Imagem — quadrada 1:1 ancorada à direita, preservando a composição */}
      <div
        className="absolute top-0 right-0 h-full aspect-square pointer-events-none"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 25%, black 55%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 25%, black 55%, black 100%)",
        }}
      >
        <Image
          src={isMobile ? IMAGES.hero.mobile : IMAGES.hero.desktop}
          alt={`${BRAND.tagline} - ${BRAND.name}`}
          fill
          priority
          quality={100}
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 100vh"
        />
      </div>

      {/* Overlay com teal do brand — agora mais translúcido para exibir a imagem */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(105deg, ${COLORS.primaryDarker}d9 0%, ${COLORS.primaryDark}a6 35%, ${COLORS.primary}4d 70%, transparent 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      {/* Glow sutil no canto superior direito para profundidade */}
      <div
        className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ backgroundColor: COLORS.accent }}
      />

      {/* Conteúdo */}
      <motion.div
        className="relative z-10 min-h-screen flex items-center will-change-transform py-24 md:py-28 lg:py-32"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 lg:px-12 w-full">
          <div className="max-w-3xl">
            {/* Badge superior */}
            <motion.div
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/25 backdrop-blur-md bg-white/[0.08] mb-7 shadow-[0_2px_12px_rgba(0,0,0,0.12)]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{
                  backgroundColor: COLORS.accent,
                  boxShadow: `0 0 10px ${COLORS.accent}`,
                }}
              />
              <span className="text-[11px] md:text-xs font-semibold text-white/95 tracking-[0.18em] uppercase">
                {COPY.hero.highlight}
              </span>
            </motion.div>

            {/* Título — logo grande (h1 semântico com texto acessível) */}
            <motion.h1
              className="mb-6 md:mb-8"
              initial={{ opacity: 0, y: 20, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <span className="sr-only">
                {BRAND.name}, {BRAND.tagline}
              </span>
              <Image
                src={LOGO.light}
                alt={LOGO.alt}
                width={LOGO.heroWidth}
                height={LOGO.heroHeight}
                priority
                className="h-20 md:h-28 lg:h-32 xl:h-36 w-auto"
                style={{
                  filter:
                    "drop-shadow(0 10px 30px rgba(0,0,0,0.35)) drop-shadow(0 4px 12px rgba(0,0,0,0.25))",
                }}
              />
            </motion.h1>

            {/* Subtítulos */}
            <motion.div
              className="mb-5 md:mb-7 space-y-1.5 md:space-y-2 max-w-2xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <p className="text-lg md:text-xl lg:text-[1.5rem] font-light text-white leading-[1.3] tracking-tight">
                {COPY.hero.subtitle1}
              </p>
              <p className="text-lg md:text-xl lg:text-[1.5rem] font-light text-white/85 leading-[1.3] tracking-tight">
                {COPY.hero.subtitle2}
              </p>
            </motion.div>

            {/* Descrição */}
            <motion.p
              className="text-sm md:text-base lg:text-[1.0625rem] text-white/75 mb-7 md:mb-9 leading-relaxed max-w-xl font-light"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              {COPY.hero.description}
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 md:gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <motion.a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 md:px-9 md:py-[18px] bg-white text-sm md:text-base font-semibold rounded-full transition-all duration-200 tracking-wide"
                style={{
                  color: COLORS.primaryDark,
                  boxShadow:
                    "0 10px 40px -12px rgba(0,0,0,0.4), 0 4px 16px -6px rgba(0,0,0,0.25)",
                }}
                whileHover={{ scale: 1.025, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                {COPY.hero.cta}
              </motion.a>

              <motion.a
                href="#procedimento"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 md:px-9 md:py-[18px] border border-white/60 text-white text-sm md:text-base font-medium rounded-full transition-all duration-200 hover:bg-white/10 hover:border-white/80 tracking-wide backdrop-blur-sm"
                whileHover={{ scale: 1.025 }}
                whileTap={{ scale: 0.98 }}
              >
                {COPY.hero.ctaSecondary}
                <ArrowDown className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              </motion.a>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator — ancorado à viewport (não cresce com a seção) */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-20 hidden md:block pointer-events-none"
        style={{ top: "calc(100vh - 60px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
      >
        <motion.div
          className="w-[26px] h-[42px] border border-white/50 rounded-full flex justify-center pt-2 backdrop-blur-sm"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div className="w-[3px] h-2 bg-white/70 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
