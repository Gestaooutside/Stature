"use client"

import { motion } from "framer-motion"
import { MapPin, MessageCircle, Instagram, Plane, Building2 } from "lucide-react"
import { Reveal } from "./reveal"
import { COLORS, COPY, CONTACT, LOCATION, SOCIAL } from "@/lib/config/brand"

export function NewsletterSection() {
  return (
    <section id="contato" className="py-20 md:py-24 lg:py-32 bg-white">
      <div className="container-custom">
        <Reveal>
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10 md:mb-12 lg:mb-14 px-4">
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
                  {COPY.contact.badge}
                </span>
              </div>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-light mb-4 tracking-tight"
                style={{ color: COLORS.primaryDark }}
              >
                {COPY.contact.titlePrefix}{" "}
                <span className="italic font-normal">{COPY.contact.titleItalic}</span>
              </h2>
              <p className="text-base md:text-lg text-neutral-600 leading-relaxed max-w-3xl mx-auto">
                {COPY.contact.description}
              </p>
            </div>

            {/* Card principal */}
            <div
              className="rounded-3xl overflow-hidden border shadow-xl"
              style={{
                borderColor: `${COLORS.accent}60`,
                background: `linear-gradient(135deg, ${COLORS.surface} 0%, #ffffff 50%, ${COLORS.accent}20 100%)`,
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Coluna esquerda — Informações */}
                <div className="p-8 md:p-10 lg:p-12 space-y-6 md:space-y-7">
                  {/* Endereço */}
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: `${COLORS.accent}40` }}
                    >
                      <Building2
                        className="w-5 h-5 md:w-6 md:h-6"
                        style={{ color: COLORS.primary }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-wider mb-1"
                        style={{ color: COLORS.secondary }}
                      >
                        Consultório
                      </p>
                      <p
                        className="text-base md:text-lg font-medium"
                        style={{ color: COLORS.primaryDark }}
                      >
                        {LOCATION.hospital}
                      </p>
                      <p className="text-sm md:text-base text-neutral-600 mt-0.5">
                        {LOCATION.address}
                      </p>
                      <p className="text-sm md:text-base text-neutral-600">
                        {LOCATION.city}, {LOCATION.state}
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: `${COLORS.accent}40` }}
                    >
                      <MessageCircle
                        className="w-5 h-5 md:w-6 md:h-6"
                        style={{ color: COLORS.primary }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-wider mb-1"
                        style={{ color: COLORS.secondary }}
                      >
                        WhatsApp
                      </p>
                      <a
                        href={CONTACT.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base md:text-lg font-medium transition-colors hover:opacity-80"
                        style={{ color: COLORS.primaryDark }}
                      >
                        {CONTACT.phone}
                      </a>
                      <p className="text-sm text-neutral-600 mt-0.5">
                        Atendimento rápido, segunda a sexta
                      </p>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: `${COLORS.accent}40` }}
                    >
                      <Instagram
                        className="w-5 h-5 md:w-6 md:h-6"
                        style={{ color: COLORS.primary }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-wider mb-1"
                        style={{ color: COLORS.secondary }}
                      >
                        Instagram
                      </p>
                      <a
                        href={SOCIAL.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base md:text-lg font-medium transition-colors hover:opacity-80"
                        style={{ color: COLORS.primaryDark }}
                      >
                        {SOCIAL.instagramHandle}
                      </a>
                      <p className="text-sm text-neutral-600 mt-0.5">
                        Acompanhe bastidores e casos
                      </p>
                    </div>
                  </div>

                  {/* Nota sobre aeroporto */}
                  <div
                    className="flex items-start gap-3 p-4 rounded-xl border"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.6)",
                      borderColor: `${COLORS.accent}60`,
                    }}
                  >
                    <Plane
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: COLORS.primary }}
                    />
                    <p className="text-xs md:text-sm text-neutral-700 leading-relaxed">
                      {COPY.contact.airportNote}
                    </p>
                  </div>
                </div>

                {/* Coluna direita — CTA */}
                <div
                  className="p-8 md:p-10 lg:p-12 flex flex-col justify-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
                  }}
                >
                  {/* Orbes decorativos */}
                  <div
                    className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20 blur-3xl"
                    style={{ backgroundColor: COLORS.accent }}
                  />
                  <div
                    className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10 blur-3xl"
                    style={{ backgroundColor: COLORS.secondary }}
                  />

                  <div className="relative z-10 text-center lg:text-left">
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-white mb-4 tracking-tight">
                      Pronto para o{" "}
                      <span className="italic font-normal">próximo passo?</span>
                    </h3>
                    <p className="text-sm md:text-base text-white/80 mb-7 md:mb-8 leading-relaxed">
                      Fale diretamente comigo pelo WhatsApp. Avaliação inicial
                      online disponível para pacientes de outras cidades.
                    </p>

                    <motion.a
                      href={CONTACT.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-7 py-4 bg-white rounded-full text-sm md:text-base font-semibold shadow-xl transition-all duration-300 w-full sm:w-auto justify-center"
                      style={{ color: COLORS.primaryDark }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <MessageCircle className="w-5 h-5" />
                      {COPY.contact.cta}
                    </motion.a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
