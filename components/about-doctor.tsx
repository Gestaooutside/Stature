"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { MapPin, BadgeCheck, Plane, MessageCircle } from "lucide-react"
import { Reveal } from "./reveal"
import { BRAND, COLORS, CONTACT, IMAGES, LOCATION, PROFESSIONAL, COPY } from "@/lib/config/brand"

export function AboutDoctor() {
  return (
    <section
      id="sobre"
      className="py-16 md:py-24 lg:py-32 bg-white relative overflow-hidden"
    >
      {/* Orbes decorativos sutis */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${COLORS.accent}20` }}
      />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${COLORS.surface}` }}
      />

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14 lg:gap-20 items-center">
          {/* Imagem do médico */}
          <Reveal>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.8,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
            >
              <div className="relative aspect-[4/5] max-w-md mx-auto lg:max-w-none overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src={IMAGES.doctor}
                  alt={`${BRAND.name} — ${PROFESSIONAL.specialty}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Overlay suave */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
                />
              </div>

              {/* Badge flutuante com CRM */}
              <motion.div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 lg:left-8 lg:translate-x-0 px-5 py-3 rounded-full shadow-xl backdrop-blur-md border flex items-center gap-2"
                style={{
                  backgroundColor: "rgba(255,255,255,0.95)",
                  borderColor: `${COLORS.accent}80`,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <BadgeCheck className="w-5 h-5" style={{ color: COLORS.primary }} />
                <span className="text-sm font-semibold" style={{ color: COLORS.primaryDark }}>
                  {PROFESSIONAL.crm}
                </span>
              </motion.div>
            </motion.div>
          </Reveal>

          {/* Texto */}
          <Reveal delay={0.15}>
            <div className="space-y-5 md:space-y-6">
              {/* Badge de seção */}
              <div
                className="inline-block px-5 py-2 rounded-full border"
                style={{
                  backgroundColor: `${COLORS.surface}`,
                  borderColor: `${COLORS.accent}60`,
                }}
              >
                <span
                  className="text-xs md:text-sm font-semibold uppercase tracking-wider"
                  style={{ color: COLORS.primaryDark }}
                >
                  {COPY.about.badge}
                </span>
              </div>

              {/* Nome e especialidade */}
              <div>
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-2"
                  style={{ color: COLORS.primaryDark }}
                >
                  {COPY.about.title}
                </h2>
                <p
                  className="text-base md:text-lg font-medium italic"
                  style={{ color: COLORS.secondary }}
                >
                  {COPY.about.subtitle}
                </p>
              </div>

              {/* Biografia */}
              <p className="text-base md:text-lg text-neutral-700 leading-relaxed">
                {COPY.about.description}
              </p>

              {/* Destaques */}
              <ul className="space-y-3 pt-2">
                {COPY.about.highlights.map((item, i) => (
                  <motion.li
                    key={item}
                    className="flex items-start gap-3 text-sm md:text-base text-neutral-700"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * i }}
                  >
                    <span
                      className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${COLORS.accent}40` }}
                    >
                      {i === 0 ? (
                        <Plane className="w-3 h-3" style={{ color: COLORS.primary }} />
                      ) : i === 1 ? (
                        <MapPin className="w-3 h-3" style={{ color: COLORS.primary }} />
                      ) : (
                        <BadgeCheck className="w-3 h-3" style={{ color: COLORS.primary }} />
                      )}
                    </span>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Info do hospital + CTA */}
              <div
                className="p-4 md:p-5 rounded-2xl border"
                style={{
                  backgroundColor: `${COLORS.surface}80`,
                  borderColor: `${COLORS.accent}60`,
                }}
              >
                <p
                  className="text-xs md:text-sm font-semibold uppercase tracking-wider mb-1"
                  style={{ color: COLORS.primaryDark }}
                >
                  Consultório
                </p>
                <p className="text-sm md:text-base text-neutral-700">
                  {LOCATION.hospital}
                </p>
                <p className="text-sm md:text-base text-neutral-600">
                  {LOCATION.fullAddress}
                </p>
              </div>

              {/* CTA WhatsApp */}
              <motion.a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white text-sm md:text-base font-medium shadow-lg transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                {COPY.about.cta}
              </motion.a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
