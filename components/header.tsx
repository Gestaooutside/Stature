"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { BRAND, COLORS, CONTACT, LOGO, NAVIGATION } from "@/lib/config/brand"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Bloqueia scroll quando menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md",
        isScrolled
          ? "bg-white/90 border-b border-neutral-200 shadow-sm"
          : "bg-white/30 border-b border-white/20",
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-14 lg:h-20 gap-4">
          {/* Logo (imagem) */}
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <a
              href="#"
              aria-label={`${BRAND.name}, Home`}
              className="flex items-center"
            >
              <Image
                src={LOGO.dark}
                alt={LOGO.alt}
                width={LOGO.headerWidth}
                height={LOGO.headerHeight}
                priority
                className="h-10 md:h-12 lg:h-14 w-auto"
              />
            </a>
          </motion.div>

          {/* Navegação desktop */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAVIGATION.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-neutral-700 hover:text-[color:var(--brand-primary)] transition-colors duration-300"
                style={{ ["--brand-primary" as any]: COLORS.primary }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA WhatsApp desktop */}
          <motion.a
            href={CONTACT.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium shadow-md transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
            }}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            <MessageCircle className="w-4 h-4" />
            Agende sua consulta
          </motion.a>

          {/* Botão mobile */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-neutral-800"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Drawer mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="lg:hidden bg-white border-t border-neutral-200"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col px-6 py-6 gap-4">
              {NAVIGATION.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium text-neutral-800 py-2 border-b border-neutral-100"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-white text-sm font-medium shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                }}
                onClick={() => setMobileOpen(false)}
              >
                <MessageCircle className="w-4 h-4" />
                Agende sua consulta
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
