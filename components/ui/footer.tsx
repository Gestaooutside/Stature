/**
 * Footer — Dr. David de Mello
 * Versão institucional com dados de contato, navegação e redes sociais.
 */

"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Instagram, MessageCircle, MapPin, BadgeCheck } from "lucide-react"
import {
  BRAND,
  COLORS,
  CONTACT,
  SOCIAL,
  DEVELOPER,
  FOOTER_CONFIG,
  LOCATION,
  LOGO,
  PROFESSIONAL,
} from "@/lib/config/brand"

// Ícones sociais — só Instagram e WhatsApp
const socialLinks = [
  {
    href: SOCIAL.instagram,
    label: "Instagram",
    icon: Instagram,
  },
  {
    href: CONTACT.whatsappUrl,
    label: "WhatsApp",
    icon: MessageCircle,
  },
]

const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.21, 0.47, 0.32, 0.98],
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
  },
}

export function Footer() {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${COLORS.primaryDarker} 0%, ${COLORS.primaryDark} 50%, ${COLORS.primary} 100%)`,
      }}
    >
      {/* Orbes decorativos */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${COLORS.accent}20` }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${COLORS.secondary}30` }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.45, 0.2] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="relative z-10 py-14 md:py-16 lg:py-20 px-6 md:px-10 lg:px-20">
        {/* Topo — branding + descrição */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 md:mb-14"
        >
          <div className="max-w-lg">
            <Image
              src={LOGO.light}
              alt={LOGO.alt}
              width={LOGO.footerWidth}
              height={LOGO.footerHeight}
              className="h-16 md:h-20 w-auto mb-5"
            />

            <p
              className="text-sm md:text-base italic font-light mb-4"
              style={{ color: COLORS.accent }}
            >
              {BRAND.tagline}
            </p>

          </div>

          {/* Ícones sociais */}
          <div className="flex flex-col items-start lg:items-end gap-4">
            <span className="text-xs uppercase tracking-widest text-white/60 font-semibold">
              Acompanhe
            </span>
            <div className="flex gap-3">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Linha divisória */}
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="relative mb-12 md:mb-14"
        >
          <div
            className="h-px w-full"
            style={{
              background: `linear-gradient(to right, transparent, ${COLORS.accent}60, transparent)`,
            }}
          />
        </motion.div>

        {/* Grid de navegação */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-12 md:mb-14">
          {FOOTER_CONFIG.sections.map((section, index) => (
            <motion.div
              key={section.title}
              variants={itemVariants}
              custom={index}
              className="flex flex-col gap-3"
            >
              <h3 className="uppercase text-white/60 text-xs font-semibold tracking-wider pb-2 border-b border-white/10">
                {section.title}
              </h3>
              {section.links.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-sm md:text-[15px] text-white/70 hover:text-white transition-colors duration-300"
                >
                  {link.name}
                </motion.a>
              ))}
            </motion.div>
          ))}
        </div>

        {/* Bloco de localização */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row items-start md:items-center gap-5 p-5 md:p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm mb-10 md:mb-12"
        >
          <div className="flex items-start gap-3 flex-1">
            <MapPin
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: COLORS.accent }}
            />
            <div>
              <p className="text-sm md:text-base text-white font-medium">
                {LOCATION.hospital}
              </p>
              <p className="text-xs md:text-sm text-white/70">
                {LOCATION.fullAddress}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 flex-1">
            <BadgeCheck
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: COLORS.accent }}
            />
            <div>
              <p className="text-sm md:text-base text-white font-medium">
                {PROFESSIONAL.crm}
              </p>
              <p className="text-xs md:text-sm text-white/70">
                {PROFESSIONAL.specialty}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Rodapé final */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6 border-t border-white/10">
          <p className="text-xs md:text-sm text-white/60">
            © {new Date().getFullYear()} {BRAND.name}. Todos os direitos
            reservados.
          </p>
          <p className="text-xs text-white/40">
            desenvolvido por{" "}
            <a
              href={`https://wa.me/${DEVELOPER.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors duration-300 font-medium"
            >
              {DEVELOPER.name}
            </a>
          </p>
        </div>
      </div>
    </motion.footer>
  )
}
