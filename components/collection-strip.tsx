"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { Reveal } from "./reveal"

const collections = [
  {
    id: "controle-ansiedade",
    name: "CONTROLE DA ANSIEDADE",
    image: "/benefits-1.jpg", // Mulher com ansiedade visível (mão na testa)
    count: "Fórmula Dia",
  },
  {
    id: "compulsao",
    name: "BLOQUEIO COMPULSÃO",
    image: "/benefits-2.jpg", // Pessoa comendo pizza na cama = compulsão alimentar
    count: "Ação 24h",
  },
  {
    id: "sono-profundo",
    name: "SONO PROFUNDO",
    image: "/benefits-3.jpg", // Mulher dormindo tranquilamente abraçada ao travesseiro
    count: "Fórmula Noite",
  },
  {
    id: "natural",
    name: "100% NATURAL",
    image: "/benefits-4.jpg", // Produtos naturais com plantas e folhagens
    count: "Sem efeitos colaterais",
  },
  {
    id: "resultados",
    name: "RESULTADOS RÁPIDOS",
    image: "/benefits-5.jpg", // Mulher correndo/exercitando-se = resultados visíveis
    count: "Em 15 dias",
  },
  {
    id: "seguranca",
    name: "SEGURANÇA GARANTIDA",
    image: "/benefits-6.jpg", // Segurança e confiabilidade do produto
    count: "Zero riscos",
  },
]

export function CollectionStrip() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.4", "end start"],
  })

  const x = useTransform(scrollYProgress, [0, 1], [0, -600])

  const itemWidth = 320 // 320px (w-80) + 32px gap = 352px per item
  const totalWidth = collections.length * (itemWidth + 32) - 32 // subtract last gap
  const containerWidth = typeof window !== "undefined" ? window.innerWidth : 1200
  const maxDrag = Math.max(0, totalWidth - containerWidth + 48) // add padding

  return (
    <section ref={containerRef} className="py-24 lg:py-40 overflow-hidden">
      <div className="mb-16 lg:mb-20">
        <Reveal>
          <div className="container-custom text-center">
            <h2 className="text-neutral-900 mb-4 text-4xl lg:text-5xl font-normal">Benefícios DUO</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Descubra todos os benefícios do sistema DUO NATURAL. A solução completa para ansiedade, compulsão alimentar e sono de qualidade.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="relative">
        <motion.div
          className="flex gap-8 px-6"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -maxDrag, right: 0 }}
          dragElastic={0.1}
        >
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              className="flex-shrink-0 w-80 group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4">
                <motion.div
                  className="relative w-full h-full"
                  whileHover={{ filter: "blur(1px)" }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={collection.image || "/placeholder.svg"}
                    alt={collection.name}
                    fill
                    className="object-cover"
                    sizes="320px"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />
                </motion.div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="text-center text-white"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-3xl font-bold tracking-wider mb-2">{collection.name}</h3>
                    <p className="text-sm opacity-90">{collection.count}</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-neutral-500">← Arraste para explorar os benefícios →</p>
      </div>
    </section>
  )
}
