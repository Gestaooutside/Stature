"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Reveal } from "./reveal"
import { BRAND, CONTACT, IMAGES, PROFESSIONAL, COPY } from "@/lib/config/brand"

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

export function AboutDoctor() {
  return (
    <section
      id="sobre"
      className="relative overflow-hidden py-32 md:py-40 lg:py-56"
      style={{ background: "#F5EFE4" }}
    >
      {/* Signature serif watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 top-24 hidden md:block font-display italic text-[#0F2A1D]/[0.04] select-none"
        style={{ fontSize: "clamp(180px, 22vw, 380px)", lineHeight: 1, letterSpacing: "-0.04em" }}
      >
        dm
      </div>

      <div className="container-custom relative">
        {/* Section eyebrow */}
        <Reveal>
          <div className="flex items-center gap-5 mb-16 md:mb-24">
            <span className="eyebrow text-[#3A5243]">{COPY.about.badge}</span>
            <span className="h-px flex-1 bg-[#3A5243]/20" />
            <span className="font-display italic text-[#D9C89E] text-sm md:text-base tracking-wide">
              Cap. 01
            </span>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-16 lg:gap-x-16 items-start">
          {/* IMAGE — 5 cols, left-anchored */}
          <motion.div
            className="lg:col-span-5 relative lg:sticky lg:top-28"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 1.2, ease: EASE }}
          >
            {/* Vertical rotated credential rail — editorial touch */}
            <div className="hidden lg:flex absolute -left-12 top-4 h-full flex-col items-center gap-5 z-10">
              <span className="w-px flex-1 bg-[#3A5243]/25" />
              <span
                className="eyebrow text-[#3A5243]/80 whitespace-nowrap"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                {PROFESSIONAL.crm} · {PROFESSIONAL.rqe}
              </span>
              <span className="w-px flex-1 bg-[#3A5243]/25" />
            </div>

            {/* Image with clip-path reveal */}
            <motion.div
              className="relative aspect-[4/5] w-full overflow-hidden"
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              whileInView={{ clipPath: "inset(0 0% 0 0)" }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 1.4, ease: EASE }}
            >
              <Image
                src={IMAGES.doctor}
                alt={`${BRAND.name}, ${PROFESSIONAL.specialty}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(15,42,29,0) 55%, rgba(15,42,29,0.35) 100%)",
                }}
              />
            </motion.div>

            {/* Bottom-left gold corner bracket */}
            <motion.div
              className="absolute -bottom-3 -left-3 pointer-events-none"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
            >
              <span className="block w-20 h-px bg-[#D9C89E]" />
              <span className="block w-px h-20 bg-[#D9C89E]" />
            </motion.div>

            {/* Mobile credential caption */}
            <div className="lg:hidden mt-6 flex items-center gap-4">
              <span className="w-10 h-px bg-[#D9C89E]" />
              <span className="eyebrow text-[#3A5243]">
                {PROFESSIONAL.crm} · {PROFESSIONAL.rqe}
              </span>
            </div>
          </motion.div>

          {/* TEXT — 7 cols */}
          <div className="lg:col-span-7 lg:pl-4 xl:pl-12">
            {/* Headline */}
            <motion.h2
              className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-light leading-[0.95] tracking-[-0.02em] text-[#0F2A1D] mb-10"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
            >
              Dr. David<br />
              <span className="italic text-[#3A5243]">de Mello.</span>
            </motion.h2>

            {/* Subtitle + hairline */}
            <motion.div
              className="flex items-center gap-5 mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3, ease: EASE }}
            >
              <span className="w-16 h-px bg-[#D9C89E]" />
              <p className="font-display italic text-lg md:text-xl text-[#3A5243]">
                {COPY.about.subtitle}
              </p>
            </motion.div>

            {/* Drop-cap intro */}
            <motion.p
              className="text-base md:text-lg text-[#0F2A1D]/78 leading-[1.85] font-light max-w-[56ch] mb-14"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.45, ease: EASE }}
            >
              <span
                className="float-left font-display text-7xl md:text-8xl leading-[0.85] text-[#0F2A1D] mr-3 mt-1"
                style={{ fontStyle: "italic", fontWeight: 300 }}
              >
                M
              </span>
              {COPY.about.description.replace(/^M/, "")}
            </motion.p>

            {/* Numbered highlights — vertical editorial stack */}
            <div className="border-t border-[#3A5243]/20 mb-14">
              {COPY.about.highlights.map((item, i) => (
                <motion.div
                  key={item}
                  className="flex items-baseline gap-8 md:gap-12 py-6 md:py-7 border-b border-[#3A5243]/20"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.12 * i + 0.6, ease: EASE }}
                >
                  <span className="font-display italic text-3xl md:text-4xl font-light text-[#D9C89E] leading-none shrink-0 w-14">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-xl md:text-2xl font-light text-[#0F2A1D] leading-snug">
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Footer row: mini-table + CTA */}
            <motion.div
              className="pt-2"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.9, ease: EASE }}
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] items-end gap-y-10 gap-x-10">
                <div>
                  <span className="eyebrow text-[#3A5243]/80 block mb-3">Atendimento</span>
                  <p className="font-display text-lg md:text-xl text-[#0F2A1D] font-light leading-tight">
                    Cirurgia em 5 capitais
                  </p>
                  <p className="text-sm text-[#0F2A1D]/60 font-light mt-1">
                    SP · BH · Fortaleza · Floripa · Uberlândia · Consulta online nacional
                  </p>
                </div>

                <span className="hidden md:block w-px h-16 bg-[#D9C89E]/60" />

                <div>
                  <span className="eyebrow text-[#3A5243]/80 block mb-3">Registro</span>
                  <p className="font-display text-lg md:text-xl text-[#0F2A1D] font-light leading-tight">
                    {PROFESSIONAL.crm}
                  </p>
                  <p className="text-sm text-[#0F2A1D]/60 font-light mt-1">
                    {PROFESSIONAL.rqe} · Ortopedia
                  </p>
                </div>

                <a
                  href={CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="eyebrow px-8 py-4 border border-[#0F2A1D] text-[#0F2A1D] hover:bg-[#0F2A1D] hover:text-[#D9C89E] transition-all duration-700 inline-block text-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D9C89E] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F5EFE4]"
                >
                  {COPY.about.cta}
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Closing signature hairline */}
        <Reveal delay={0.5}>
          <div className="mt-24 md:mt-32 flex items-center justify-center gap-6">
            <span className="h-px w-16 bg-[#3A5243]/30" />
            <span className="font-display italic text-[#D9C89E] text-sm tracking-wide">
              segue
            </span>
            <span className="h-px w-16 bg-[#3A5243]/30" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
