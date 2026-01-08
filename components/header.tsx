"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        "backdrop-blur-md",
        isScrolled
          ? "bg-[#dad7ce]/40 border-b border-[#a89a8d]/20"
          : "bg-white/20 border-b border-white/10",
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <div className="container-custom">
        <div className="flex items-center justify-center h-12 lg:h-16 relative">
          {/* Logo */}
          <motion.div className="flex-shrink-0" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <a href="#" aria-label="DUO NATURAL Home">
              <Image
                src="/duo-logo-light.svg"
                alt="DUO NATURAL"
                width={160}
                height={53}
                className="h-10 lg:h-14 w-auto"
                priority
              />
            </a>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}
