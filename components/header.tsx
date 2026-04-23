"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { BRAND, CONTACT, LOGO, NAVIGATION } from "@/lib/config/brand"

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

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
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

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

  const linkClass = (href: string) =>
    cn(
      "eyebrow gold-underline transition-colors duration-[240ms] ease-luxe",
      isScrolled
        ? "text-[#EDE4D0]/80 hover:text-[#D9C89E]"
        : "text-[#0F2A1D]/80 hover:text-[#0F2A1D]",
      activeId === href.replace("#", "") &&
        (isScrolled
          ? "text-[#D9C89E] gold-underline-active"
          : "text-[#0F2A1D] gold-underline-active"),
    )

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-700 ease-luxe border-b",
      )}
      style={{
        backgroundColor: isScrolled ? "rgba(15, 42, 29, 0.88)" : "rgba(245, 239, 228, 0)",
        borderColor: isScrolled ? "rgba(217, 200, 158, 0.2)" : "transparent",
        backdropFilter: isScrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: isScrolled ? "blur(20px)" : "none",
      }}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.1, ease: EASE }}
    >
      <div className="container-custom">
        <div
          className="relative flex items-center justify-center lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-10 transition-[height] duration-700 ease-luxe"
          style={{ height: isCompact ? 64 : 96 }}
        >
          {/* Desktop nav left, right-aligned toward logo */}
          <nav className="hidden lg:flex items-center gap-x-9 justify-self-end">
            {navLeft.map((item) => (
              <a key={item.href} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </a>
            ))}
          </nav>

          {/* Centered logo, dual source, crossfade on scroll */}
          <a
            href="#"
            aria-label={`${BRAND.name}, Home`}
            className="relative flex items-center justify-center lg:justify-self-center"
          >
            <span
              className={cn(
                "relative block w-auto transition-[height] duration-700 ease-luxe",
                isCompact ? "h-8 md:h-9" : "h-9 md:h-11 lg:h-14",
              )}
              style={{ aspectRatio: `${LOGO.headerWidth} / ${LOGO.headerHeight}` }}
            >
              {/* Forest (dark) logo, visible on ivory (top) */}
              <Image
                src={LOGO.dark}
                alt={LOGO.alt}
                fill
                priority
                sizes="300px"
                className={cn(
                  "object-contain transition-opacity duration-700 ease-luxe",
                  isScrolled ? "opacity-0" : "opacity-100",
                )}
              />
              {/* Gold logo, visible on forest (scrolled) */}
              <Image
                src={LOGO.light}
                alt=""
                aria-hidden="true"
                fill
                priority
                sizes="300px"
                className={cn(
                  "object-contain transition-opacity duration-700 ease-luxe",
                  isScrolled ? "opacity-100" : "opacity-0",
                )}
              />
            </span>
          </a>

          {/* Desktop nav right + CTA, left-aligned toward logo */}
          <div className="hidden lg:flex items-center gap-x-9 justify-self-start">
            {navRight.map((item) => (
              <a key={item.href} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </a>
            ))}
            <a
              href={CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="radius-pill ml-2 inline-flex items-center justify-center bg-[#D9C89E] text-[#0F2A1D] hover:bg-[#C5B485] transition-colors duration-[240ms] ease-luxe px-6 py-2.5 text-[0.7rem] font-medium tracking-[0.2em] uppercase whitespace-nowrap"
            >
              Agendar Consulta
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              "lg:hidden absolute right-0 p-2 transition-colors duration-[240ms] ease-luxe",
              isScrolled ? "text-[#EDE4D0]" : "text-[#0F2A1D]",
            )}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? (
              <X className="w-6 h-6" strokeWidth={1.25} />
            ) : (
              <Menu className="w-6 h-6" strokeWidth={1.25} />
            )}
          </button>
        </div>
      </div>

      {/* Scroll progress hairline */}
      <motion.div
        className="h-px origin-left"
        style={{
          scaleX,
          background: "#D9C89E",
          opacity: isScrolled ? 0.55 : 0.35,
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
            transition={{ duration: 0.72, ease: EASE }}
          >
            <nav className="flex flex-col px-8 py-10 gap-0">
              {NAVIGATION.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-5 border-b font-display text-2xl font-light text-[#EDE4D0] hover:text-[#D9C89E] transition-colors duration-[240ms] ease-luxe"
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
                className="radius-pill mt-10 inline-flex items-center justify-center bg-[#D9C89E] text-[#0F2A1D] hover:bg-[#C5B485] transition-colors duration-[240ms] ease-luxe px-6 py-3.5 text-[0.7rem] font-medium tracking-[0.2em] uppercase"
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
