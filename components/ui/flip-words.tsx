"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * FlipWords - Componente que anima transição entre palavras
 * Utiliza Framer Motion para criar efeito de flip suave entre palavras
 *
 * @param words - Array de palavras para alternar
 * @param duration - Duração em ms que cada palavra fica visível (padrão: 3000)
 * @param className - Classes Tailwind adicionais
 */
export function FlipWords({
  words,
  duration = 3000,
  className,
}: {
  words: string[]
  duration?: number
  className?: string
}) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)

  // Cicla pelas palavras a cada intervalo definido
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length)
    }, duration)

    return () => clearInterval(interval)
  }, [words, duration])

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={words[currentWordIndex]}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={cn("inline-block", className)}
      >
        {words[currentWordIndex]}
      </motion.span>
    </AnimatePresence>
  )
}
