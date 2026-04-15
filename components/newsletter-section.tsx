"use client"

import { MapPin, Instagram, Plane, Phone } from "lucide-react"
import { Reveal } from "./reveal"
import { COPY, CONTACT, LOCATION, SOCIAL } from "@/lib/config/brand"

export function NewsletterSection() {
  return (
    <section
      id="contato"
      className="relative overflow-hidden py-32 md:py-40 lg:py-56"
      style={{ background: "linear-gradient(180deg, #0F2A1D 0%, #081A12 100%)" }}
    >
      <div className="absolute inset-0 grain-texture grain-pulse pointer-events-none" />

      {/* Abstract map line art — ambient backdrop */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <g stroke="#D9C89E" strokeWidth="0.8" fill="none">
          <path d="M0 300 C 200 250, 400 380, 600 300 S 1000 220, 1200 300" />
          <path d="M0 360 C 250 320, 450 420, 700 360 S 1050 320, 1200 360" />
          <path d="M0 240 C 180 200, 420 320, 650 240 S 1020 180, 1200 240" />
          <circle cx="300" cy="280" r="3" fill="#D9C89E" />
          <circle cx="720" cy="340" r="3" fill="#D9C89E" />
          <circle cx="980" cy="260" r="3" fill="#D9C89E" />
          <line x1="300" y1="280" x2="720" y2="340" />
          <line x1="720" y1="340" x2="980" y2="260" />
        </g>
      </svg>

      <div className="container-custom relative">
        <Reveal>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20 md:mb-24 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-5 mb-10">
                <span className="eyebrow text-[#D9C89E]">{COPY.contact.badge}</span>
                <span className="font-display italic text-[#D9C89E]/80 text-sm">Cap. 06</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-8 tracking-[-0.02em] text-[#EDE4D0] leading-[1.02]">
                {COPY.contact.titlePrefix}{" "}
                <span className="italic text-[#D9C89E]">{COPY.contact.titleItalic}</span>
              </h2>
              <span className="hairline-gold w-24 mx-auto block mb-10" />
              <p className="text-base md:text-lg text-[#EDE4D0]/70 leading-[1.85] font-light">
                {COPY.contact.description}
              </p>
            </div>

            {/* T-composition: top row 3 contact cells */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-[#D9C89E]/15">
              <ContactCell eyebrow="Consultório" Icon={MapPin} title={LOCATION.hospital} subtitle={`${LOCATION.address} — ${LOCATION.city}, ${LOCATION.state}`} />
              <ContactCell eyebrow="WhatsApp" Icon={Phone} title={CONTACT.phone} subtitle="Atendimento segunda a sexta" href={CONTACT.whatsappUrl} />
              <ContactCell eyebrow="Instagram" Icon={Instagram} title={SOCIAL.instagramHandle} subtitle="Casos e bastidores" href={SOCIAL.instagram} />
            </div>

            {/* Mobilidade full-width strip */}
            <div className="grid grid-cols-1 border-l border-r border-b border-[#D9C89E]/15 p-10 md:p-14 flex flex-col md:flex-row items-start gap-6 md:gap-10">
              <div className="flex items-center gap-4 md:shrink-0">
                <Plane className="w-5 h-5 text-[#D9C89E]" strokeWidth={1} />
                <span className="eyebrow text-[#D9C89E]/80">Mobilidade</span>
              </div>
              <div className="flex-1 md:border-l border-[#D9C89E]/15 md:pl-10">
                <p className="font-display text-xl md:text-2xl text-[#EDE4D0] font-light leading-snug mb-2">
                  Para pacientes de todo o Brasil.
                </p>
                <p className="text-sm md:text-base text-[#EDE4D0]/65 font-light leading-[1.85] max-w-3xl">
                  {COPY.contact.airportNote}
                </p>
              </div>
            </div>

            {/* CTA panel — offset right (8/12) */}
            <div className="grid grid-cols-12 mt-20 md:mt-24">
              <div className="col-span-12 md:col-span-8 md:col-start-5 p-10 md:p-14 border border-[#D9C89E]/20 gold-foil">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-end">
                  <div>
                    <span className="eyebrow text-[#D9C89E] mb-5 block">Próximo Passo</span>
                    <p className="font-display text-2xl md:text-3xl lg:text-[2.25rem] text-[#EDE4D0] font-light leading-[1.15]">
                      Avaliação inicial <span className="italic text-[#D9C89E]">online</span> disponível.
                    </p>
                  </div>
                  <a
                    href={CONTACT.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="eyebrow inline-block text-center px-10 py-5 border border-[#D9C89E] text-[#D9C89E] hover:bg-[#D9C89E] hover:text-[#0F2A1D] transition-all duration-700 ease-luxe whitespace-nowrap"
                  >
                    {COPY.contact.cta}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

interface CellProps {
  eyebrow: string
  title: string
  subtitle: string
  Icon: typeof MapPin
  href?: string
}

function ContactCell({ eyebrow, title, subtitle, Icon, href }: CellProps) {
  const Wrap = href ? "a" : "div"
  const extra = href ? { target: "_blank", rel: "noopener noreferrer", href } : {}
  return (
    <Wrap
      {...(extra as object)}
      className="group block p-10 md:p-12 border-r border-b border-[#D9C89E]/15 transition-colors duration-700 ease-luxe hover:bg-[#1B3A2A]/50"
    >
      <div className="flex items-center gap-3 mb-6">
        <Icon className="w-4 h-4 text-[#D9C89E]" strokeWidth={1} />
        <span className="eyebrow text-[#D9C89E]/80">{eyebrow}</span>
      </div>
      <p className="font-display text-xl md:text-2xl text-[#EDE4D0] font-light leading-snug mb-3 group-hover:text-[#D9C89E] transition-colors duration-700">
        {title}
      </p>
      <span className="w-8 h-px bg-[#D9C89E]/50 block mb-3" />
      <p className="text-sm text-[#EDE4D0]/55 font-light leading-relaxed">{subtitle}</p>
    </Wrap>
  )
}
