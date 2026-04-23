"use client"

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { BRAND, COPY, CONTACT, IMAGES } from "@/lib/config/brand"

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

function StaggeredWords({
  text,
  delay = 0,
  className,
}: {
  text: string
  delay?: number
  className?: string
}) {
  const words = text.split(" ")
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.72, delay: delay + i * 0.08, ease: EASE }}
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
  const prefersReducedMotion = useReducedMotion()

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

  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 8],
  )

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative overflow-hidden bg-[#F5EFE4]"
      aria-label={`${BRAND.name}, ${BRAND.tagline}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grain-texture grain-pulse opacity-30"
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 min-h-[100dvh]">
        <div className="lg:col-span-5 flex flex-col justify-center px-6 md:px-10 lg:pl-[clamp(1.75rem,6vw,5rem)] lg:pr-10 pt-32 pb-16 lg:py-24">
          <motion.div
            className="mb-10 md:mb-14"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.25, ease: EASE }}
          >
            <span className="font-mono-label uppercase text-[#3A5243]">
              {COPY.hero.highlight}
            </span>
          </motion.div>

          <h1 className="font-display leading-[0.95] tracking-[-0.01em] text-[#0F2A1D] mb-8 md:mb-10 text-[clamp(3rem,5.5vw,5rem)]">
            <StaggeredWords
              text={COPY.hero.headline1}
              delay={0.45}
              className="block font-normal"
            />
            <span className="block italic font-light text-[#0F2A1D]/90">
              <StaggeredWords text={COPY.hero.headline2} delay={0.85} />
            </span>
          </h1>

          <motion.p
            className="text-lg md:text-xl leading-[1.55] text-[#0F2A1D]/78 font-light max-w-[28rem] mb-10 md:mb-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 1.35, ease: EASE }}
          >
            {COPY.hero.description}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 1.55, ease: EASE }}
          >
            <a
              href={CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="radius-pill inline-flex items-center justify-center bg-[#D9C89E] text-[#0F2A1D] hover:bg-[#C5B485] transition-colors ease-luxe duration-[240ms] px-9 py-4 text-sm font-medium tracking-[0.04em]"
            >
              {COPY.hero.cta}
            </a>
            <a
              href="#tecnicas"
              className="eyebrow gold-underline text-[#0F2A1D]/70 hover:text-[#0F2A1D] transition-colors duration-[240ms] py-3"
            >
              {COPY.hero.ctaSecondary}
            </a>
          </motion.div>
        </div>

        <div className="lg:col-span-7 relative min-h-[55vh] lg:min-h-full">
          <motion.div
            className="absolute inset-0"
            style={{ y: imageY }}
            initial={{ scale: 1.04, opacity: 0.85 }}
            animate={{ scale: 1.02, opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.1, ease: EASE }}
          >
            <Image
              src={isMobile ? IMAGES.hero.mobile : IMAGES.hero.desktop}
              alt={`${BRAND.tagline}, paciente em cotidiano`}
              fill
              priority
              quality={95}
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
          </motion.div>

          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#F5EFE4]/60 to-transparent pointer-events-none lg:hidden"
          />
        </div>
      </div>
    </section>
  )
}
