"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Home, ShoppingBag, Workflow, Leaf, Microscope, ShieldCheck, HelpCircle } from "lucide-react"

// Define as sections com seus respectivos ícones e labels
const navItems = [
  { id: "hero", icon: Home, label: "Início" },
  { id: "featured-products", icon: ShoppingBag, label: "Produtos" },
  { id: "how-it-works", icon: Workflow, label: "Sistema 360º" },
  { id: "ingredients", icon: Leaf, label: "Ingredientes" },
  { id: "materials", icon: Microscope, label: "Ciência" },
  { id: "guarantee", icon: ShieldCheck, label: "Garantias" },
  { id: "faq", icon: HelpCircle, label: "FAQ" },
]

export function SideNav() {
  const [activeSection, setActiveSection] = useState("hero")

  // Intersection Observer para detectar qual section está visível
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5, // Section precisa estar 50% visível para ser considerada ativa
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Observa todas as sections
    navItems.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      navItems.forEach((item) => {
        const element = document.getElementById(item.id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [])

  // Função de navegação smooth scroll
  const handleNavClick = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  // Calcula a posição Y do seletor baseado no índice da section ativa
  const activeIndex = navItems.findIndex((item) => item.id === activeSection)
  const selectorY = activeIndex * 56 // 56px é o espaçamento entre ícones (h-14 = 56px)

  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
      <div className="relative">
        {/* Container glassmórfico elegante com tom terroso */}
        <div className="backdrop-blur-xl bg-[#8d7f72]/20 border border-[#dad7ce]/40 rounded-full p-3">
          <div className="relative flex flex-col gap-0">
            {/* Seletor animado - pill highlight com tom bege */}
            <motion.div
              className="absolute left-0 w-full h-14 bg-[#dad7ce]/40 rounded-full"
              animate={{
                y: selectorY,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            />

            {/* Ícones de navegação com contorno duplo */}
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="relative group h-14 w-14 flex items-center justify-center transition-all duration-300"
                  aria-label={item.label}
                >
                  <Icon
                    className={`w-5 h-5 text-white transition-all duration-300 ${
                      isActive ? "scale-110" : "scale-100 group-hover:scale-105"
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  {/* Tooltip em hover sofisticado com tom terroso */}
                  <div className="absolute right-full mr-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="backdrop-blur-lg bg-[#8d7f72]/95 border border-[#dad7ce]/30 rounded-lg px-3 py-2 whitespace-nowrap">
                      <span className="text-sm font-medium text-white">{item.label}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
