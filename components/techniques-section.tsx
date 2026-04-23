"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Check, ShieldCheck } from "lucide-react"
import { Reveal } from "./reveal"
import { techniques, type Technique } from "@/data/techniques"
import { COPY, CONTACT } from "@/lib/config/brand"

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

function TechniqueMedia({ technique }: Readonly<{ technique: Technique }>) {
  const { media } = technique
  const aspectClass =
    media.aspect === "9/16"
      ? "aspect-[9/16]"
      : media.aspect === "16/9"
        ? "aspect-video"
        : media.aspect === "1/1"
          ? "aspect-square"
          : "aspect-[4/5]"

  if (media.kind === "video") {
    return (
      <div className={`relative w-full ${aspectClass} overflow-hidden bg-[#081A12]`}>
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={media.src}
          poster={media.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={media.alt}
        />
      </div>
    )
  }

  return (
    <div className={`relative w-full ${aspectClass} overflow-hidden bg-[#081A12]`}>
      <Image
        src={media.src}
        alt={media.alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 40vw"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,42,29,0.15) 0%, rgba(15,42,29,0.55) 100%)",
        }}
      />
    </div>
  )
}

function FitboneCard({ t }: Readonly<{ t: Technique }>) {
  return (
    <motion.article
      className="relative flex flex-col lg:col-span-7 border border-[#D9C89E]/25 bg-[#0F2A1D]/40 backdrop-blur-sm"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.1, ease: EASE }}
    >
      {/* Top tag ribbon */}
      {t.tag && (
        <div className="absolute -top-px left-8 md:left-10 z-10 px-4 py-1.5 bg-[#D9C89E] text-[#0F2A1D]">
          <span className="eyebrow">{t.tag}</span>
        </div>
      )}

      <TechniqueMedia technique={t} />

      <div className="flex flex-col gap-6 p-8 md:p-12">
        <div className="flex items-center gap-4">
          <span className="font-display italic text-[#D9C89E]/70 text-sm">Técnica A</span>
          <span className="h-px flex-1 bg-[#D9C89E]/20" />
        </div>

        <h3 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-[#EDE4D0] leading-[0.95] tracking-[-0.02em]">
          {t.name}
        </h3>

        {t.credentialBadge && (
          <div className="inline-flex items-center gap-3 self-start px-4 py-2 border border-[#D9C89E]/40">
            <ShieldCheck className="w-4 h-4 text-[#D9C89E]" strokeWidth={1.25} />
            <span className="eyebrow text-[#D9C89E]">{t.credentialBadge}</span>
          </div>
        )}

        <p className="text-base md:text-lg text-[#EDE4D0]/80 leading-[1.85] font-light">
          {t.shortDefinition}
        </p>

        <span className="hairline-gold w-16 block" />

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {t.advantages.map((adv) => (
            <li key={adv} className="flex items-start gap-3 text-sm md:text-[15px] text-[#EDE4D0]/75 font-light leading-relaxed">
              <Check className="w-4 h-4 mt-0.5 text-[#D9C89E] flex-shrink-0" strokeWidth={1.5} />
              <span>{adv}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  )
}

function LonCard({ t }: Readonly<{ t: Technique }>) {
  return (
    <motion.article
      className="relative flex flex-col lg:col-span-5 border border-[#3A5243]/30 bg-[#0F2A1D]/20"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
    >
      <TechniqueMedia technique={t} />

      <div className="flex flex-col gap-5 p-8 md:p-10">
        <div className="flex items-center gap-4">
          <span className="font-display italic text-[#D9C89E]/60 text-sm">Técnica B</span>
          <span className="h-px flex-1 bg-[#D9C89E]/15" />
        </div>

        <h3 className="font-display text-2xl md:text-3xl font-light text-[#EDE4D0] leading-tight">
          {t.name}
        </h3>

        <p className="text-sm md:text-base text-[#EDE4D0]/70 leading-[1.8] font-light">
          {t.shortDefinition}
        </p>

        <span className="hairline-gold w-12 block" />

        <ul className="space-y-2.5">
          {t.advantages.map((adv) => (
            <li key={adv} className="flex items-start gap-3 text-sm text-[#EDE4D0]/65 font-light leading-relaxed">
              <span className="mt-2 w-1 h-1 bg-[#D9C89E]/60 flex-shrink-0" />
              <span>{adv}</span>
            </li>
          ))}
        </ul>

        <div className="pt-4 border-t border-[#D9C89E]/15 mt-2">
          <p className="font-display italic text-[#D9C89E]/75 text-sm leading-relaxed">
            Indicação específica · avaliada caso a caso na consulta.
          </p>
        </div>
      </div>
    </motion.article>
  )
}

export function TechniquesSection() {
  const fitbone = techniques.find((t) => t.id === "fitbone")
  const lon = techniques.find((t) => t.id === "lon")

  return (
    <section
      id="tecnicas"
      className="relative overflow-hidden py-32 md:py-40 lg:py-56"
      style={{ background: "linear-gradient(180deg, #0F2A1D 0%, #1B3A2A 60%, #0F2A1D 100%)" }}
    >
      <div className="absolute inset-0 grain-texture grain-pulse pointer-events-none" />
      <span className="hairline-gold absolute top-0 left-0 right-0" />

      <div className="container-custom relative">
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-20 md:mb-24 items-end">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-5 mb-10">
                <span className="eyebrow text-[#D9C89E]">{COPY.techniques.badge}</span>
                <span className="font-display italic text-[#D9C89E]/70 text-sm">Cap. 02</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light leading-[0.98] tracking-[-0.02em] text-[#EDE4D0]">
                {COPY.techniques.title}{" "}
                <span className="italic text-[#D9C89E]">{COPY.techniques.titleItalic}</span>
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pl-12">
              <span className="hairline-gold w-16 block mb-6" />
              <p className="text-base md:text-lg text-[#EDE4D0]/70 leading-[1.85] font-light">
                {COPY.techniques.description}
              </p>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start">
          {fitbone && <FitboneCard t={fitbone} />}
          {lon && <LonCard t={lon} />}
        </div>

        <Reveal delay={0.3}>
          <div className="mt-20 md:mt-24 text-center">
            <a
              href={CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow inline-block px-10 py-5 border border-[#D9C89E] text-[#D9C89E] hover:bg-[#D9C89E] hover:text-[#0F2A1D] transition-all duration-700 ease-luxe"
            >
              {COPY.techniques.cta}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
