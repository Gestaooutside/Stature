"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { BRAND, CONTACT, LOGO, NAVIGATION } from "@/lib/config/brand"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [activeId, setActiveId] = useState<string>("")
  const [mobileOpen, setMobileOpen] = useState(false)

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      setIsCompact(window.scrollY > window.innerHeight * 0.8)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  // Observe sections for active link
  useEffect(() => {
    const ids = NAVIGATION.map((n) => n.href.replace("#", ""))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id)
        })
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const splitMid = Math.ceil(NAVIGATION.length / 2)
  const navLeft = NAVIGATION.slice(0, splitMid)
  const navRight = NAVIGATION.slice(splitMid)

  return (
    <motion.header
      className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-luxe border-b")}
      style={{
        backgroundColor: isScrolled ? "rgba(15, 42, 29, 0.88)" : "rgba(15, 42, 29, 0.55)",
        borderColor: isScrolled ? "rgba(217, 200, 158, 0.2)" : "transparent",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <div className="container-custom">
        <div
          className="relative flex items-center justify-center transition-all duration-700 ease-luxe"
          style={{ height: isCompact ? 64 : 96 }}
        >
          {/* Desktop nav left */}
          <nav className="hidden lg:flex items-center gap-10 absolute left-0">
            {navLeft.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "eyebrow text-[#EDE4D0]/80 hover:text-[#D9C89E] gold-underline transition-colors duration-500",
                  activeId === item.href.replace("#", "") && "text-[#D9C89E] gold-underline-active",
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Centered logo */}
          <a
            href="#"
            aria-label={`${BRAND.name}, Home`}
            className="flex items-center justify-center transition-all duration-700 ease-luxe"
          >
            <Image
              src={LOGO.light}
              alt={LOGO.alt}
              width={LOGO.headerWidth}
              height={LOGO.headerHeight}
              priority
              className={cn(
                "w-auto transition-all duration-700 ease-luxe",
                isCompact ? "h-8 md:h-9" : "h-9 md:h-11 lg:h-14",
              )}
            />
          </a>

          {/* Desktop nav right + CTA */}
          <div className="hidden lg:flex items-center gap-10 absolute right-0">
            {navRight.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "eyebrow text-[#EDE4D0]/80 hover:text-[#D9C89E] gold-underline transition-colors duration-500",
                  activeId === item.href.replace("#", "") && "text-[#D9C89E] gold-underline-active",
                )}
              >
                {item.label}
              </a>
            ))}
            <a
              href={CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow px-6 py-3 border border-[#D9C89E]/70 text-[#D9C89E] hover:bg-[#D9C89E] hover:text-[#0F2A1D] transition-all duration-700 ease-luxe"
            >
              Agendar Consulta
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden absolute right-0 p-2 text-[#EDE4D0]"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X className="w-6 h-6" strokeWidth={1.25} /> : <Menu className="w-6 h-6" strokeWidth={1.25} />}
          </button>
        </div>
      </div>

      {/* Scroll progress bar */}
      <motion.div
        className="h-px origin-left"
        style={{
          scaleX,
          background: "#D9C89E",
          opacity: 0.55,
        }}
      />

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="lg:hidden overflow-hidden border-t"
            style={{
              borderColor: "rgba(217, 200, 158, 0.2)",
              background: "rgba(15, 42, 29, 0.98)",
              backdropFilter: "blur(24px)",
            }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <nav className="flex flex-col px-8 py-10 gap-0">
              {NAVIGATION.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-5 border-b font-display text-2xl font-light text-[#EDE4D0] hover:text-[#D9C89E] transition-colors duration-500"
                  style={{ borderColor: "rgba(217, 200, 158, 0.12)" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.08 * i }}
                >
                  {item.label}
                </motion.a>
              ))}
              <a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="mt-10 text-center eyebrow py-4 border border-[#D9C89E]/70 text-[#D9C89E]"
              >
                Agendar Consulta
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
