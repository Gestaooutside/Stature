/**
 * Timeline - Componente de linha do tempo vertical para DUO NATURAL
 *
 * Apresenta conteúdo sequencial com scroll-triggered animations.
 * Adaptado para o design system DUO com cores da marca e tipografia Montserrat.
 *
 * Features:
 * - Linha vertical com gradiente da marca
 * - Scroll progress indicator
 * - Sticky positioning para títulos
 * - GPU acceleration para smoothness
 * - Layout editorial com white space generoso
 */

"use client"

import {
  useScroll,
  useTransform,
  motion,
} from "framer-motion"
import React, { useEffect, useRef, useState } from "react"

interface TimelineEntry {
  title: string
  content: React.ReactNode
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setHeight(rect.height)
    }
  }, [ref])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  })

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height])
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1])

  return (
    <div
      className="w-full bg-white font-sans md:px-10"
      ref={containerRef}
    >
      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
          >
            {/* Título sticky à esquerda */}
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              {/* Dot indicator */}
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-[#dad7ce] border border-[#a89a8d] p-2" />
              </div>

              {/* Título do problema - sticky */}
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-light text-neutral-400 tracking-tight">
                {item.title}
              </h3>
            </div>

            {/* Conteúdo à direita */}
            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              {/* Título mobile */}
              <h3 className="md:hidden block text-2xl mb-4 text-left font-light text-neutral-400">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}

        {/* Linha vertical com gradiente */}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          {/* Progress indicator com cores da marca */}
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-b from-[#8d7f72] via-[#a89a8d] to-[#dad7ce] rounded-full will-change-transform"
          />
        </div>
      </div>
    </div>
  )
}
