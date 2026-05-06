"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Instagram, MessageCircle } from "lucide-react"
import {
  BRAND,
  CONTACT,
  SOCIAL,
  DEVELOPER,
  FOOTER_CONFIG,
  LOCATION,
  LOGO,
  PROFESSIONAL,
} from "@/lib/config/brand"

const socialLinks = [
  { href: SOCIAL.instagram, label: "Instagram", icon: Instagram },
  { href: CONTACT.whatsappUrl, label: "WhatsApp", icon: MessageCircle },
]

export function Footer() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "#081A12", color: "#EDE4D0" }}
    >
      <div className="absolute inset-0 grain-texture opacity-30 pointer-events-none" />

      <div className="relative z-10 container-custom py-20 md:py-24 lg:py-32">
        {/* Top — signature mark + social */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, ease: [0.22, 0.61, 0.36, 1] }}
          className="flex flex-col items-center text-center mb-20 md:mb-24"
        >
          <Image
            src={LOGO.light}
            alt={LOGO.alt}
            width={LOGO.footerWidth}
            height={LOGO.footerHeight}
            className="h-20 md:h-24 w-auto"
          />
          <div className="flex items-center gap-5 mt-8">
            <span className="w-12 md:w-16 h-px bg-[#D9C89E]/50" />
            <p className="font-display italic text-sm md:text-base text-[#D9C89E]/80 tracking-wide whitespace-nowrap">
              est. 2026, Brasil
            </p>
            <span className="w-12 md:w-16 h-px bg-[#D9C89E]/50" />
          </div>
          <p className="font-display italic text-lg md:text-xl text-[#D9C89E]/80 mt-6 max-w-md leading-relaxed">
            {BRAND.tagline}
          </p>
          <span className="hairline-gold w-24 block mt-8" />
        </motion.div>

        {/* Navigation grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-20 md:mb-24">
          {FOOTER_CONFIG.sections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.22, 0.61, 0.36, 1] }}
              className="flex flex-col gap-5"
            >
              <h3 className="eyebrow text-[#D9C89E] pb-4 border-b border-[#D9C89E]/15">
                {section.title}
              </h3>
              <div className="flex flex-col gap-4">
                {section.links.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-sm md:text-[15px] text-[#EDE4D0]/60 hover:text-[#D9C89E] transition-colors duration-500 font-light"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coverage + credentials bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 py-10 md:py-12 border-y border-[#D9C89E]/15 mb-12 md:mb-16">
          <div>
            <span className="eyebrow text-[#D9C89E]/70 block mb-3">Atendimento</span>
            <p className="font-display text-lg md:text-xl text-[#EDE4D0] font-light leading-snug">
              Cirurgia em 5 capitais
            </p>
            <p className="text-sm text-[#EDE4D0]/55 font-light mt-1">
              São Paulo · Belo Horizonte · Brasília · Fortaleza · Florianópolis
            </p>
            <p className="text-sm text-[#D9C89E]/70 font-light mt-2 italic">
              Consulta 100% online para qualquer cidade do Brasil
            </p>
          </div>
          <div className="md:text-right">
            <span className="eyebrow text-[#D9C89E]/70 block mb-3">Responsável Técnico</span>
            <p className="font-display text-lg md:text-xl text-[#EDE4D0] font-light leading-snug">
              Dr. {PROFESSIONAL.fullName}
            </p>
            <p className="text-sm text-[#EDE4D0]/55 font-light mt-1">
              {PROFESSIONAL.registry}
            </p>
            <p className="text-xs text-[#D9C89E]/60 font-light mt-2 italic">
              Pioneiro no Brasil em alongamento ósseo estético
            </p>
          </div>
        </div>

        {/* Social */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-[#D9C89E]/10">
          <div className="flex items-center gap-5">
            <span className="eyebrow text-[#D9C89E]/60">Acompanhe</span>
            <div className="flex gap-4">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-11 h-11 border border-[#D9C89E]/30 flex items-center justify-center text-[#D9C89E] hover:bg-[#D9C89E] hover:text-[#0F2A1D] transition-all duration-700"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.25} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Credit line */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8">
          <p className="text-xs text-[#EDE4D0]/45 font-light tracking-wide">
            © {new Date().getFullYear()} {BRAND.name}. Todos os direitos reservados.
          </p>
          <p className="text-[#EDE4D0]/30 text-[10px] uppercase tracking-widest transform scale-[0.5] origin-center md:origin-right">
            Desenvolvido por{" "}
            <a
              href={`https://wa.me/${DEVELOPER.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D9C89E]/70 hover:text-[#D9C89E] transition-colors duration-500"
            >
              {DEVELOPER.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
