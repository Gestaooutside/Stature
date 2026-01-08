/**
 * Footer sofisticado com sticky scroll effect para DUO NATURAL
 *
 * Características principais:
 * - Efeito sticky parallax ativado no scroll
 * - Logo DUO em destaque (2/3 do tamanho da hero section)
 * - Navegação minimalista em 4 colunas
 * - Social media com hover magnético
 * - Design editorial alinhado ao design system
 *
 * Dependências: framer-motion, lucide-react, next/image
 */

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Instagram, Twitter, Facebook, Building2, MessageCircle, Shield, Users } from "lucide-react"
import { LegalModal } from "@/components/legal-modal"
import { PrivacyPolicyContent } from "@/components/legal/privacy-policy"
import { TermsOfUseContent } from "@/components/legal/terms-of-use"

// Variantes de animação para reutilização
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
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
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.21, 0.47, 0.32, 0.98]
    },
  },
}

const linkVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.21, 0.47, 0.32, 0.98]
    },
  },
}

const socialVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10,
    },
  },
}

const backgroundVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 2,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  },
}

// Estrutura de dados do footer para melhor manutenibilidade
const footerData = {
  sections: [
    {
      title: "Produtos",
      links: [
        { name: "Ver Produtos", href: "#featured-products" },
        { name: "Kit Completo", href: "#featured-products" },
        { name: "Como Funciona", href: "#how-it-works" },
      ]
    },
    {
      title: "Ciência",
      links: [
        { name: "Ingredientes", href: "#ingredients" },
        { name: "Pesquisas", href: "#materials" },
        { name: "Depoimentos", href: "#testimonials" },
      ]
    },
    {
      title: "Atendimento",
      links: [
        { name: "Perguntas Frequentes", href: "#faq" },
        { name: "Garantia", href: "#guarantee" },
        { name: "WhatsApp", href: "https://wa.me/5561931688859" },
        { name: "Como Usar", href: "#how-it-works" },
      ]
    },
    {
      title: "Farmácias",
      links: [
        { name: "Zurich Pharma", href: "#accredited-pharmacies" },
        { name: "Viva Farmácia", href: "#accredited-pharmacies" },
        { name: "Credenciamento", href: "#accredited-pharmacies" },
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Política de Privacidade", href: "#privacy", type: "legal" },
        { name: "Termos de Uso", href: "#terms", type: "legal" },
      ]
    },
  ],
  social: [
    { href: "https://www.instagram.com/duonaturall/", label: "Instagram", icon: Instagram },
    { href: "#", label: "Twitter", icon: Twitter },
    { href: "#", label: "Facebook", icon: Facebook },
  ],
  brand: {
    name: "DUO NATURAL",
    tagline: "Equilíbrio natural",
  },
  copyright: new Date().getFullYear(),
}

/**
 * Componente de seção de navegação
 * Renderiza um grupo de links com animações
 */
const NavSection = ({
  title,
  links,
  index,
  onLegalClick
}: {
  title: string
  links: { name: string; href: string; type?: string }[]
  index: number
  onLegalClick?: (type: string) => void
}) => (
  <motion.div variants={itemVariants} custom={index} className="flex flex-col gap-2 md:gap-3">
    <motion.h3
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
      className="mb-1.5 md:mb-2 uppercase text-neutral-400 text-xs md:text-sm font-semibold tracking-wider border-b border-white/5 pb-2 hover:text-[#dad7ce] transition-colors duration-300"
    >
      {title}
    </motion.h3>
    {links.map((link, linkIndex) => (
      <motion.a
        key={linkIndex}
        variants={linkVariants}
        custom={linkIndex}
        href={link.href}
        onClick={(e) => {
          if (link.type === "legal" && onLegalClick) {
            e.preventDefault()
            onLegalClick(link.href)
          }
        }}
        whileHover={{
          x: 8,
          transition: { type: "spring", stiffness: 300, damping: 20 },
        }}
        className="text-neutral-500 hover:text-[#dad7ce] transition-colors duration-300 font-sans text-sm md:text-base group relative cursor-pointer"
      >
        <span className="relative">
          {link.name}
          {/* Linha animada no hover */}
          <motion.span
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#a89a8d] to-[#dad7ce]"
            initial={{ width: 0 }}
            whileHover={{ width: "100%" }}
            transition={{ duration: 0.3 }}
          />
        </span>
      </motion.a>
    ))}
  </motion.div>
)

/**
 * Componente de link social
 * Renderiza ícone social com efeito magnético e hover animado
 */
const SocialLink = ({
  href,
  label,
  icon: Icon,
  index
}: {
  href: string
  label: string
  icon: React.ElementType
  index: number
}) => (
  <motion.a
    variants={socialVariants}
    custom={index}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{
      scale: 1.2,
      rotate: 12,
      transition: { type: "spring", stiffness: 300, damping: 15 },
    }}
    whileTap={{ scale: 0.9 }}
    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 hover:bg-gradient-to-r hover:from-[#a89a8d] hover:to-[#dad7ce] flex items-center justify-center transition-all duration-300 group border border-white/10 hover:border-[#dad7ce]/50"
    aria-label={label}
  >
    <Icon
      size={18}
      className="md:w-5 md:h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors duration-300"
    />
  </motion.a>
)

/**
 * Componente de conteúdo do footer (reutilizável)
 * Contém toda a estrutura de navegação, logo e social media
 */
const FooterContent = ({ onLegalClick }: { onLegalClick: (href: string) => void }) => (
  <>
    {/* Elementos de background animados */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

    {/* Orbe animado superior direito - cor primária da marca */}
    <motion.div
      variants={backgroundVariants}
      className="absolute top-0 right-0 w-96 h-96 bg-[#a89a8d]/10 rounded-full blur-3xl will-change-transform"
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    />

    {/* Orbe animado inferior esquerdo - cor accent da marca */}
    <motion.div
      variants={backgroundVariants}
      className="absolute bottom-0 left-0 w-96 h-96 bg-[#dad7ce]/5 rounded-full blur-3xl will-change-transform"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.5, 0.2],
      }}
      transition={{
        duration: 5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
        delay: 1,
      }}
    />

    {/* Seção de navegação - 4 colunas */}
    <motion.div variants={containerVariants} className="relative z-10 mb-6 md:mb-8 lg:mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
        {footerData.sections.map((section, index) => (
          <NavSection
            key={section.title}
            title={section.title}
            links={section.links}
            index={index}
            onLegalClick={onLegalClick}
          />
        ))}
      </div>
    </motion.div>

    {/* Linha divisória elegante */}
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
      transition={{ delay: 0.6, duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative z-10 mb-8 md:mb-10"
    >
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#a89a8d]/30 to-[#dad7ce]/30" />
      </div>
      {/* Pontos decorativos */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rounded-full bg-gradient-to-r from-[#a89a8d] to-[#dad7ce] shadow-lg" />
    </motion.div>

    {/* Seção inferior - Logo e Social Media */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="flex flex-col md:flex-row justify-between items-start md:items-end relative z-10 gap-6 md:gap-8"
    >
      {/* Logo e branding */}
      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          whileHover={{
            scale: 1.02,
            transition: { type: "spring", stiffness: 300, damping: 20 },
          }}
          className="mb-3 md:mb-4 lg:mb-6"
        >
          {/* Logo DUO NATURAL - Otimizado para mobile */}
          <Image
            src="/duo-logo-light.svg"
            alt="DUO NATURAL - Sistema natural para controle de ansiedade"
            width={266}
            height={150}
            priority={false}
            className="w-[150px] h-auto sm:w-[180px] md:w-[220px] lg:w-[266px] mb-2 md:mb-3 lg:mb-4 opacity-90 hover:opacity-100 transition-opacity duration-300"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex items-center gap-2 md:gap-3 lg:gap-4 mb-2 md:mb-3"
        >
          {/* Linha decorativa animada */}
          <motion.div
            className="w-8 md:w-10 lg:w-12 h-0.5 bg-gradient-to-r from-[#a89a8d] to-[#dad7ce]"
            animate={{
              scaleX: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="text-neutral-500 text-sm sm:text-sm font-light tracking-wide hover:text-[#dad7ce] transition-colors duration-300"
          >
            {footerData.brand.tagline}
          </motion.p>
        </motion.div>

        {/* Copyright */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className="text-neutral-600 text-xs md:text-sm"
        >
          © {footerData.copyright} DUO NATURAL. Todos os direitos reservados.
        </motion.p>

        {/* Botão Glassmórfico para Farmácias */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="mt-4 md:mt-6"
        >
          <motion.a
            href="https://wa.me/5561993168859?text=Ol%C3%A1%2C%20tudo%20joia%3F%20Vim%20por%20meio%20do%20link%20do%20site%20e%20gostaria%20de%20me%20cadastrar%20como%20Farm%C3%A1cia%20de%20Manipula%C3%A7%C3%A3o%20parceira%20e%20conversar%20a%20respeito%20de%20outras%20poss%C3%ADveis%20parcerias."
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-500 shadow-lg hover:shadow-2xl"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#a89a8d]/20 to-[#dad7ce]/20 rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-300" />

            <Building2 className="w-4 h-4 relative z-10" />
            <span className="text-sm font-medium relative z-10">Seja uma farmácia credenciada</span>

            {/* Animated dots */}
            <div className="flex gap-1 relative z-10">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                className="w-1.5 h-1.5 rounded-full bg-current"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="w-1.5 h-1.5 rounded-full bg-current"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="w-1.5 h-1.5 rounded-full bg-current"
              />
            </div>
          </motion.a>
        </motion.div>

        {/* Assinatura do desenvolvedor */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="text-neutral-400 text-xs mt-3 md:mt-4"
        >
          desenvolvido e assinado por{" "}
          <motion.a
            href="https://wa.me/5561981833315"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-[#a89a8d] transition-colors duration-300 font-medium"
            whileHover={{
              x: 2,
              transition: { type: "spring", stiffness: 300, damping: 20 },
            }}
          >
            vitor coletty
          </motion.a>
        </motion.p>
      </div>

      {/* Social Media */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="text-left md:text-right mb-3 md:mb-4"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
          className="text-neutral-500 text-xs uppercase tracking-widest mb-3 md:mb-4 font-semibold"
        >
          Siga-nos
        </motion.p>

        {/* Ícones sociais com efeito magnético */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 2, staggerChildren: 0.1 }}
          className="flex gap-2 md:gap-3"
        >
          {footerData.social.map((social, index) => (
            <SocialLink
              key={social.label}
              href={social.href}
              label={social.label}
              icon={social.icon}
              index={index}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  </>
)

/**
 * Footer principal com sticky scroll effect
 * Usa clipPath polygon para criar efeito de revelação suave
 */
export function Footer() {
  const [legalModalOpen, setLegalModalOpen] = useState(false)
  const [legalModalType, setLegalModalType] = useState<"privacy" | "terms">("privacy")

  const handleLegalClick = (href: string) => {
    if (href === "#privacy") {
      setLegalModalType("privacy")
    } else if (href === "#terms") {
      setLegalModalType("terms")
    }
    setLegalModalOpen(true)
  }

  const legalModalTitle = legalModalType === "privacy"
    ? "Política de Privacidade"
    : "Termos de Uso"

  return (
    <>
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        title={legalModalTitle}
      >
        {legalModalType === "privacy" ? <PrivacyPolicyContent /> : <TermsOfUseContent />}
      </LegalModal>

      {/* Footer Mobile - Versão simples sem parallax */}
      <motion.footer
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="md:hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 py-12 px-4 sm:px-6 relative overflow-hidden"
      >
        <FooterContent onLegalClick={handleLegalClick} />
      </motion.footer>

      {/* Footer Desktop - Versão com parallax */}
      <div
        className="hidden md:block relative h-[70vh]"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <div className="relative h-[calc(100vh+70vh)] -top-[100vh]">
          <div className="h-[70vh] sticky top-[calc(100vh-70vh)]">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 py-10 lg:py-12 px-6 md:px-12 lg:px-20 pb-6 md:pb-8 lg:pb-10 h-full w-full flex flex-col justify-between relative overflow-hidden"
            >
            {/* Elementos de background animados */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

            {/* Orbe animado superior direito - cor primária da marca */}
            <motion.div
              variants={backgroundVariants}
              className="absolute top-0 right-0 w-96 h-96 bg-[#a89a8d]/10 rounded-full blur-3xl will-change-transform"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />

            {/* Orbe animado inferior esquerdo - cor accent da marca */}
            <motion.div
              variants={backgroundVariants}
              className="absolute bottom-0 left-0 w-96 h-96 bg-[#dad7ce]/5 rounded-full blur-3xl will-change-transform"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 1,
              }}
            />

            {/* Seção de navegação - 4 colunas */}
            <motion.div variants={containerVariants} className="relative z-10 mb-6 md:mb-8 lg:mb-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
                {footerData.sections.map((section, index) => (
                  <NavSection
                    key={section.title}
                    title={section.title}
                    links={section.links}
                    index={index}
                    onLegalClick={handleLegalClick}
                  />
                ))}
              </div>
            </motion.div>

            {/* Linha divisória elegante */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.6, duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="relative z-10 mb-8 md:mb-10"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#a89a8d]/30 to-[#dad7ce]/30" />
              </div>
              {/* Pontos decorativos */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rounded-full bg-gradient-to-r from-[#a89a8d] to-[#dad7ce] shadow-lg" />
            </motion.div>

            {/* Seção inferior - Logo e Social Media */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="flex flex-col md:flex-row justify-between items-start md:items-end relative z-10 gap-6 md:gap-8"
            >
              {/* Logo e branding */}
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                  whileHover={{
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 300, damping: 20 },
                  }}
                  className="mb-3 md:mb-4 lg:mb-6"
                >
                  {/* Logo DUO NATURAL - Otimizado para mobile */}
                  <Image
                    src="/duo-logo-light.svg"
                    alt="DUO NATURAL - Sistema natural para controle de ansiedade"
                    width={266}
                    height={150}
                    priority={false}
                    className="w-[150px] h-auto sm:w-[180px] md:w-[220px] lg:w-[266px] mb-2 md:mb-3 lg:mb-4 opacity-90 hover:opacity-100 transition-opacity duration-300"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="flex items-center gap-2 md:gap-3 lg:gap-4 mb-2 md:mb-3"
                >
                  {/* Linha decorativa animada */}
                  <motion.div
                    className="w-8 md:w-10 lg:w-12 h-0.5 bg-gradient-to-r from-[#a89a8d] to-[#dad7ce]"
                    animate={{
                      scaleX: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4, duration: 0.5 }}
                    className="text-neutral-500 text-sm sm:text-sm font-light tracking-wide hover:text-[#dad7ce] transition-colors duration-300"
                  >
                    {footerData.brand.tagline}
                  </motion.p>
                </motion.div>

                {/* Copyright */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6, duration: 0.5 }}
                  className="text-neutral-600 text-xs md:text-sm"
                >
                  © {footerData.copyright} DUO NATURAL. Todos os direitos reservados.
                </motion.p>

                {/* Assinatura do desenvolvedor */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8, duration: 0.5 }}
                  className="text-neutral-400 text-xs mt-1 md:mt-2"
                >
                  desenvolvido e assinado por{" "}
                  <motion.a
                    href="https://wa.me/5561981833315"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-[#a89a8d] transition-colors duration-300 font-medium"
                    whileHover={{
                      x: 2,
                      transition: { type: "spring", stiffness: 300, damping: 20 },
                    }}
                  >
                    vitor coletty
                  </motion.a>
                </motion.p>
              </div>

              {/* Social Media */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6, duration: 0.6 }}
                className="text-left md:text-right mb-3 md:mb-4"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8, duration: 0.5 }}
                  className="text-neutral-500 text-xs uppercase tracking-widest mb-3 md:mb-4 font-semibold"
                >
                  Siga-nos
                </motion.p>

                {/* Ícones sociais com efeito magnético */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 2, staggerChildren: 0.1 }}
                  className="flex gap-2 md:gap-3"
                >
                  {footerData.social.map((social, index) => (
                    <SocialLink
                      key={social.label}
                      href={social.href}
                      label={social.label}
                      icon={social.icon}
                      index={index}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      </div>
    </>
  )
}
