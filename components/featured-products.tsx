"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { MessageCircle, ArrowRight } from "lucide-react"
import { Reveal } from "./reveal"
import { procedures } from "@/data/procedures"
import { BRAND, URLS, COPY, COLORS, CONTACT } from "@/lib/config/brand"

export function FeaturedProducts() {
  // Schema SEO — cada procedimento vira um MedicalProcedure
  const proceduresSchema = procedures.map((proc) => ({
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: proc.name,
    description: proc.description,
    image: `${URLS.domain}${proc.image}`,
    provider: {
      "@type": "Physician",
      name: BRAND.name,
    },
  }))

  return (
    <section
      id="procedimento"
      className="py-16 md:py-20 lg:py-24 xl:py-32"
      style={{ backgroundColor: "#fbfcfc" }}
    >
      <div className="container-custom">
        <Reveal>
          <div className="text-center md:text-left mb-12 md:mb-16 lg:mb-20 px-4 max-w-3xl">
            <div
              className="inline-block px-5 py-2 rounded-full border mb-5"
              style={{
                backgroundColor: `${COLORS.surface}`,
                borderColor: `${COLORS.accent}80`,
              }}
            >
              <span
                className="text-xs md:text-sm font-semibold uppercase tracking-wider"
                style={{ color: COLORS.primaryDark }}
              >
                Procedimentos
              </span>
            </div>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light mb-4 tracking-tight"
              style={{ color: COLORS.primaryDark }}
            >
              {COPY.products.title}{" "}
              <span className="italic font-normal">{COPY.products.titleItalic}</span>
            </h2>
            <p className="text-base md:text-lg text-neutral-600 leading-relaxed">
              {COPY.products.description}
            </p>
          </div>
        </Reveal>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 },
            },
          }}
        >
          {procedures.map((proc) => (
            <motion.div
              key={proc.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.8,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  },
                },
              }}
              className="group flex flex-col rounded-3xl overflow-hidden border bg-white shadow-sm hover:shadow-2xl transition-all duration-500"
              style={{ borderColor: `${COLORS.accent}60` }}
              whileHover={{ y: -6 }}
            >
              {/* Imagem */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={proc.image}
                  alt={proc.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `linear-gradient(180deg, transparent 0%, ${COLORS.primaryDark}80 100%)`,
                  }}
                />
                {/* Badge ganho */}
                <div
                  className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold text-white backdrop-blur-md border border-white/30"
                  style={{ backgroundColor: `${COLORS.primary}E0` }}
                >
                  {proc.gain}
                </div>
              </div>

              {/* Conteúdo */}
              <div className="flex flex-col flex-1 p-6 md:p-7">
                <h3
                  className="text-xl md:text-2xl font-medium mb-2"
                  style={{ color: COLORS.primaryDark }}
                >
                  {proc.name}
                </h3>

                <div className="flex items-center gap-3 text-xs md:text-sm text-neutral-600 mb-4">
                  <span className="font-medium">{proc.duration}</span>
                </div>

                <p className="text-sm md:text-base text-neutral-700 leading-relaxed mb-5 flex-1">
                  {proc.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {proc.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2 text-xs md:text-sm text-neutral-600"
                    >
                      <span
                        className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: COLORS.secondary }}
                      />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <motion.a
                  href={CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-white text-sm font-medium transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Saiba mais
                  <ArrowRight className="w-4 h-4" />
                </motion.a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Schema SEO */}
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
