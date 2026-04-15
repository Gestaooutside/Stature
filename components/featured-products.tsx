"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { Reveal } from "./reveal"
import { procedures } from "@/data/procedures"
import { BRAND, URLS, COPY, CONTACT } from "@/lib/config/brand"

const ROMAN = ["I", "II", "III", "IV", "V", "VI"]
const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

export function FeaturedProducts() {
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
                <span className="font-display italic text-[#D9C89E]/70 text-sm">Cap. 02</span>
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-[#D9C89E]/15"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.22 } } }}
        >
          {procedures.map((proc, i) => (
            <motion.article
              key={proc.id}
              variants={{
                hidden: { opacity: 0, y: 26 },
                visible: { opacity: 1, y: 0, transition: { duration: 1.1, ease: EASE } },
              }}
              className="group relative flex flex-col border-b border-[#D9C89E]/15 md:border-b-0 md:border-r md:last:border-r-0 overflow-hidden"
              style={{ borderColor: "rgba(217, 200, 158, 0.15)" }}
            >
              {/* Hover draw hairline */}
              <span className="absolute top-0 left-0 right-0 h-px bg-[#D9C89E] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] z-10" />

              {/* Ghost numeral */}
              <span
                className="absolute top-4 right-6 font-display italic font-light text-[#D9C89E]/[0.09] pointer-events-none select-none z-0"
                style={{ fontSize: "120px", lineHeight: 1 }}
              >
                {ROMAN[i]}
              </span>

              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={proc.image}
                  alt={proc.name}
                  fill
                  className="object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Duotone forest → ivory */}
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
                <div className="absolute top-6 left-6 eyebrow text-[#D9C89E] z-10">
                  {proc.gain}
                </div>
              </div>

              <div className="flex flex-col flex-1 p-8 md:p-10 gap-5 relative z-10">
                <h3 className="font-display text-2xl md:text-3xl font-light text-[#EDE4D0] leading-tight">
                  {proc.name}
                </h3>
                <p className="eyebrow text-[#D9C89E]/80">{proc.duration}</p>
                <span className="hairline-gold w-12 block" />
                <p className="text-sm md:text-base text-[#EDE4D0]/70 leading-[1.8] font-light flex-1">
                  {proc.description}
                </p>

                <ul className="space-y-2 pt-2">
                  {proc.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3 text-sm text-[#EDE4D0]/60 font-light">
                      <span className="mt-2 w-1 h-1 bg-[#D9C89E]/60 flex-shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="eyebrow mt-4 inline-flex items-center gap-2 text-[#D9C89E] hover:text-[#EDE4D0] transition-colors duration-500 gold-underline self-start"
                >
                  Consultar detalhes
                  <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.25} />
                </a>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>

      {proceduresSchema.map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
    </section>
  )
}
