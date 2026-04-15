"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { useRef, useState, useEffect } from "react"
import { BRAND, IMAGES, COPY, CONTACT } from "@/lib/config/brand"

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

function StaggeredWords({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const words = text.split(" ")
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1, delay: delay + i * 0.14, ease: EASE }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen overflow-hidden"
      aria-label={`${BRAND.name}, ${BRAND.tagline}`}
    >
      {/* Forest gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #0F2A1D 0%, #1B3A2A 55%, #0F2A1D 100%)",
        }}
      />

      {/* Cinematic parallax image */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: imageY }}>
        <Image
          src={isMobile ? IMAGES.hero.mobile : IMAGES.hero.desktop}
          alt={`${BRAND.tagline} - ${BRAND.name}`}
          fill
          priority
          quality={100}
          className="object-cover object-center opacity-40"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(15,42,29,0.72) 0%, rgba(15,42,29,0.55) 40%, rgba(8,26,18,0.9) 100%)",
          }}
        />
        <div className="absolute inset-0 grain-texture grain-pulse mix-blend-overlay" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 min-h-screen flex items-center justify-center text-center px-6 md:px-10 lg:px-16 py-28"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <div className="w-full max-w-4xl">
          {/* Eyebrow */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-12 md:mb-16"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: EASE }}
          >
            <span className="hidden md:block w-20 h-px bg-[#D9C89E]/60" />
            <span className="eyebrow text-[#D9C89E]">{COPY.hero.highlight}</span>
            <span className="hidden md:block w-20 h-px bg-[#D9C89E]/60" />
          </motion.div>

          {/* Display headline with staggered word reveals */}
          <h1 className="font-display text-[#D9C89E] font-light leading-[0.95] tracking-[-0.02em] text-5xl md:text-7xl lg:text-8xl mb-10 md:mb-12">
            <StaggeredWords text="Elevação." delay={0.5} className="block" />
            <span className="italic font-normal text-[#EDE4D0]/95 block">
              <StaggeredWords text="Ciência. Presença." delay={0.85} />
            </span>
          </h1>

          {/* Subtitle */}
          <motion.p
            className="font-display italic text-xl md:text-2xl lg:text-[1.75rem] text-[#EDE4D0]/85 leading-snug max-w-2xl mx-auto mb-6 md:mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 1.4, ease: EASE }}
          >
            {COPY.hero.subtitle1}
          </motion.p>

          {/* Description */}
          <motion.p
            className="text-sm md:text-base text-[#EDE4D0]/65 max-w-xl mx-auto leading-[1.85] font-light mb-12 md:mb-16"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 1.6, ease: EASE }}
          >
            {COPY.hero.description}
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 1.8, ease: EASE }}
          >
            <a
              href={CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow px-10 py-5 border border-[#D9C89E] text-[#D9C89E] hover:bg-[#D9C89E] hover:text-[#0F2A1D] transition-all duration-700 ease-luxe min-w-[240px]"
            >
              {COPY.hero.cta}
            </a>
            <a
              href="#procedimento"
              className="eyebrow px-10 py-5 text-[#EDE4D0]/75 hover:text-[#D9C89E] transition-colors duration-500 inline-flex items-center gap-3 gold-underline"
            >
              {COPY.hero.ctaSecondary}
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Asymmetric gold hairlines — bottom horizontal + right vertical (stops before bottom) */}
      <motion.div
        className="absolute bottom-16 left-6 md:left-10 lg:left-16 right-6 md:right-10 lg:right-16 h-px bg-[#D9C89E]/30 pointer-events-none origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.6, delay: 1.2, ease: EASE }}
      />
      <motion.div
        className="absolute top-28 right-6 md:right-10 lg:right-16 w-px bg-[#D9C89E]/30 pointer-events-none origin-top"
        style={{ bottom: 140 }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.6, delay: 1.4, ease: EASE }}
      />

      {/* Bottom-right corner scroll indicator */}
      <motion.div
        className="absolute bottom-24 right-10 lg:right-16 z-20 hidden md:flex items-center gap-4 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 2 }}
      >
        <span
          className="eyebrow text-[#D9C89E]/60"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Scroll
        </span>
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-[#D9C89E]/70 to-transparent"
          animate={{ scaleY: [0.3, 1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "top" }}
        />
      </motion.div>
    </section>
  )
}
