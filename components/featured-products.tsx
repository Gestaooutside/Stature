"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { Reveal } from "./reveal"
import { procedures, type ProcedureItem } from "@/data/procedures"
import { BRAND, URLS, COPY, CONTACT } from "@/lib/config/brand"

const ROMAN = ["I", "II", "III", "IV", "V", "VI"]
const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

interface ProcedureCardProps {
  proc: ProcedureItem
  index: number
  variant: "feature" | "brief"
  mediaAspect: "4/5" | "16/9"
}

function ProcedureCard({ proc, index, variant, mediaAspect }: Readonly<ProcedureCardProps>) {
  const isFeature = variant === "feature"
  const aspectClass = mediaAspect === "16/9" ? "aspect-video" : "aspect-[4/5]"

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 26 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: EASE } },
      }}
      className="group relative flex flex-col border border-[#D9C89E]/15 overflow-hidden h-full bg-[#0F2A1D]/20"
    >
      {/* Hover draw-hairline */}
      <span className="absolute top-0 left-0 right-0 h-px bg-[#D9C89E] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] z-10" />

      {/* Ghost numeral */}
      <span
        className="absolute top-4 right-6 font-display italic font-light text-[#D9C89E]/[0.09] pointer-events-none select-none z-0"
        style={{ fontSize: isFeature ? "160px" : "96px", lineHeight: 1 }}
      >
        {ROMAN[index]}
      </span>

      <div className={`relative ${aspectClass} overflow-hidden`}>
        <Image
          src={proc.image}
          alt={proc.name}
          fill
          className="object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.04]"
          sizes={
            isFeature
              ? "(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 66vw"
              : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
        />
        <div
          className="absolute inset-0 mix-blend-color"
          style={{
            background: "linear-gradient(180deg, #0F2A1D 0%, #3A5243 100%)",
            opacity: 0.55,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(15,42,29,0.2) 0%, rgba(15,42,29,0.75) 100%)",
          }}
        />
        <div
          className={`absolute top-6 left-6 font-mono-label text-[#D9C89E] z-10 uppercase ${
            isFeature ? "" : "text-[12px]"
          }`}
        >
          {proc.gain}
        </div>
      </div>

      <div
        className={`flex flex-col flex-1 gap-5 relative z-10 ${
          isFeature ? "p-10 md:p-14" : "p-7 md:p-8"
        }`}
      >
        <h3
          className={`font-display font-light text-[#EDE4D0] leading-tight ${
            isFeature
              ? "text-3xl md:text-4xl lg:text-5xl tracking-[-0.01em]"
              : "text-xl md:text-2xl"
          }`}
        >
          {proc.name}
        </h3>
        <p className="font-mono-label text-[#D9C89E]/80 uppercase">{proc.duration}</p>
        <span className="hairline-gold w-12 block" />
        <p
          className={`text-[#EDE4D0]/70 font-light ${
            isFeature ? "text-base md:text-lg leading-[1.85]" : "text-sm leading-[1.75]"
          }`}
        >
          {proc.description}
        </p>

        <ul className="space-y-2 pt-2">
          {proc.highlights.map((h) => (
            <li
              key={h}
              className="flex items-start gap-3 text-sm text-[#EDE4D0]/60 font-light"
            >
              <span className="mt-2 w-1 h-1 bg-[#D9C89E]/60 flex-shrink-0" />
              <span>{h}</span>
            </li>
          ))}
        </ul>

        {isFeature ? (
          <a
            href={CONTACT.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="radius-pill mt-auto inline-flex items-center justify-center self-start gap-2 bg-[#D9C89E] text-[#0F2A1D] hover:bg-[#C5B485] transition-colors ease-luxe duration-[240ms] px-8 py-3.5 text-sm font-medium tracking-[0.04em]"
          >
            Consultar detalhes
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.25} />
          </a>
        ) : (
          <a
            href={CONTACT.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow mt-auto inline-flex items-center gap-2 text-[#D9C89E]/85 hover:text-[#EDE4D0] transition-colors duration-[240ms] gold-underline self-start"
          >
            Saber mais
            <ArrowUpRight className="w-3 h-3" strokeWidth={1.25} />
          </a>
        )}
      </div>
    </motion.article>
  )
}

export function FeaturedProducts() {
  const [feature, ...briefs] = procedures

  const proceduresSchema = procedures.map((proc) => ({
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: proc.name,
    description: proc.description,
    image: `${URLS.domain}${proc.image}`,
    provider: { "@type": "Physician", name: BRAND.name },
  }))

  return (
    <section
      id="procedimento"
      className="relative overflow-hidden py-32 md:py-40 lg:py-56"
      style={{ background: "linear-gradient(180deg, #0F2A1D 0%, #1B3A2A 60%, #0F2A1D 100%)" }}
    >
      <div className="absolute inset-0 grain-texture grain-pulse pointer-events-none" />
      <span className="hairline-gold absolute bottom-0 left-0 right-0" />

      <div className="container-custom relative">
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-20 md:mb-28 items-end">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-5 mb-10">
                <span className="eyebrow text-[#D9C89E]">Procedimentos</span>
                <span className="font-display italic text-[#D9C89E]/70 text-sm">Cap. 03</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light leading-[0.98] tracking-[-0.02em] text-[#EDE4D0]">
                {COPY.products.title}{" "}
                <span className="italic text-[#D9C89E]">{COPY.products.titleItalic}</span>
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pl-12">
              <span className="hairline-gold w-16 block mb-6" />
              <p className="text-base md:text-lg text-[#EDE4D0]/70 leading-[1.85] font-light">
                {COPY.products.description}
              </p>
            </div>
          </div>
        </Reveal>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-stretch"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.18 } },
          }}
        >
          {/* Card 1, feature (most common procedure, visual anchor) */}
          <div className="lg:col-span-8">
            <ProcedureCard proc={feature} index={0} variant="feature" mediaAspect="4/5" />
          </div>

          {/* Brief group: mobile stack · tablet 2-col side-by-side · desktop stacked in sidebar */}
          <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5 md:gap-6">
            <ProcedureCard proc={briefs[0]} index={1} variant="brief" mediaAspect="4/5" />
            <ProcedureCard proc={briefs[1]} index={2} variant="brief" mediaAspect="4/5" />
          </div>
        </motion.div>
      </div>

      {proceduresSchema.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </section>
  )
}
