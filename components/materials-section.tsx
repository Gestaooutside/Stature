"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Reveal } from "./reveal"
import { cn } from "@/lib/utils"

const materials = [
  {
    id: "natural",
    name: "Natural",
    description: "Com a combinação de compostos naturais, o DUO NATURAL atua diretamente nos gatilhos da ansiedade e compulsão alimentar, promovendo um equilíbrio sem depender de substâncias artificiais ou sedativas.",
    backgroundImage: "/duo-dia-1.jpg", // Produto DUO DIA - iluminação natural
    tint: "bg-green-50",
  },
  {
    id: "cientifica",
    name: "Científica",
    description: "Baseado em estudos e evidências científicas, o DUO NATURAL usa substâncias como L-Teanina, Triptofano e Melatonina, comprovadas para reduzir a ansiedade e controlar os hormônios que impactam o apetite e o humor.",
    backgroundImage: "/duo-noite-1.jpg", // Produto DUO NOITE - iluminação noturna
    tint: "bg-blue-50",
  },
  {
    id: "segura",
    name: "Segura",
    description: "Fórmulas 100% naturais, sem efeitos colaterais, sem risco de dependência e com absorção rápida, proporcionando alívio sem comprometer a saúde. O DUO NATURAL é uma escolha segura e eficaz para quem busca equilíbrio emocional e físico.",
    backgroundImage: "/duo-dia-noite-1.jpg", // Produto DUO completo - iluminação mista
    tint: "bg-neutral-50",
  },
]

export function MaterialsSection() {
  const [activeMaterial, setActiveMaterial] = useState("natural")

  // Timer automático para rotação de imagens a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMaterial((current) => {
        const currentIndex = materials.findIndex((m) => m.id === current)
        const nextIndex = (currentIndex + 1) % materials.length
        return materials[nextIndex].id
      })
    }, 5000) // Alterna a cada 5 segundos

    return () => clearInterval(interval)
  }, [])

  const activeMaterialData = materials.find((m) => m.id === activeMaterial) || materials[0]

  const AnimatedText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
    return (
      <span>
        {text.split("").map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: delay + index * 0.03,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            style={{ display: char === " " ? "inline" : "inline-block" }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </span>
    )
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden" id="materials">
      <div className="absolute inset-0 z-0">
        {materials.map((material) => (
          <motion.div
            key={material.id}
            className="absolute inset-0"
            initial={{ opacity: material.id === activeMaterial ? 1 : 0 }}
            animate={{ opacity: material.id === activeMaterial ? 1 : 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <Image
              src={material.backgroundImage || "/placeholder.svg"}
              alt={`${material.name} interior scene`}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="absolute top-[80px] md:top-[100px] lg:top-[120px] left-0 right-0 z-10">
        <div className="max-w-[1000px] mx-auto px-4 md:px-6 text-white">
          <Reveal>
            <div>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={activeMaterial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="font-bold mb-8 lg:mb-12 text-5xl lg:text-6xl"
                >
                  <AnimatedText text={activeMaterialData.name} delay={0.2} />
                </motion.h2>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeMaterial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="text-lg text-white/90 leading-relaxed max-w-2xl"
                >
                  {activeMaterialData.description}
                </motion.p>
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 z-10 max-w-md hidden">
        <Reveal delay={0.3}>
          <blockquote className="pl-0 py-4">
            <p className="text-xl text-white leading-relaxed italic lg:text-base font-medium">
              "Acreditamos em soluções que vão além do sintoma — que tratam a raiz do problema e transformam vidas de forma natural e sustentável."
            </p>
            <footer className="mt-4 text-sm text-white/70">— DUO NATURAL</footer>
          </blockquote>
        </Reveal>
      </div>

      <div className="absolute bottom-8 left-0 right-0 z-10">
        <div className="max-w-[1000px] mx-auto px-6">
          <Reveal delay={0.1}>
            <div className="flex flex-wrap justify-center gap-3">
              {materials.map((material) => (
                <motion.button
                  key={material.id}
                  className={cn(
                    "px-6 py-3 rounded-full font-medium transition-all duration-300 backdrop-blur-md",
                    activeMaterial === material.id
                      ? "bg-white text-neutral-900"
                      : "bg-white/20 text-white hover:bg-white/30",
                  )}
                  onClick={() => setActiveMaterial(material.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {material.name}
                </motion.button>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
