"use client"

import { motion } from "framer-motion"
import { Reveal } from "./reveal"
import { differentials } from "@/data/differentials"
import { COPY } from "@/lib/config/brand"

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

export function IngredientsSection() {
  return (
    <section id="tecnica" className="relative py-32 md:py-40 lg:py-56" style={{ background: "#F5EFE4" }}>
      <span className="hairline-gold absolute top-0 left-0 right-0" />

      <div className="container-custom max-w-6xl">
        <Reveal>
          <div className="text-center mb-20 md:mb-28 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-5 mb-10">
              <span className="eyebrow text-[#3A5243]">Técnica &amp; Diferenciais</span>
              <span className="font-display italic text-[#D9C89E]/80 text-sm">Cap. 04</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-8 tracking-[-0.02em] text-[#0F2A1D] leading-[1.02]">
              {COPY.ingredients.title}{" "}
              <span className="italic">{COPY.ingredients.titleItalic}</span>
            </h2>
            <span className="hairline-gold w-24 mx-auto block mb-10" />
            <p className="text-base md:text-lg text-[#0F2A1D]/75 leading-[1.85] font-light">
              {COPY.ingredients.description}
            </p>
          </div>
        </Reveal>

        {/* Interleaved asymmetric flow */}
        <div className="space-y-14 md:space-y-20">
          {differentials.map((item, i) => {
            const isLeft = i % 2 === 0
            const Icon = item.icon
            return (
              <motion.div
                key={item.id}
                className={`grid grid-cols-12 gap-6 md:gap-10 items-start ${isLeft ? "" : "text-right"}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1.1, ease: EASE }}
              >
                <div className={`col-span-12 md:col-span-7 ${isLeft ? "md:col-start-1" : "md:col-start-6"} relative`}>
                  {/* Oversize ghost numeral */}
                  <span
                    className={`absolute font-display italic font-light text-[#D9C89E]/25 pointer-events-none select-none leading-[0.8] ${
                      isLeft ? "-top-3 -left-2" : "-top-3 -right-2"
                    }`}
                    style={{ fontSize: "clamp(80px, 10vw, 120px)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className={`relative z-10 ${isLeft ? "pl-16 md:pl-24" : "pr-16 md:pr-24"}`}>
                    <div className={`flex items-center gap-3 mb-5 ${isLeft ? "" : "justify-end"}`}>
                      <Icon className="w-4 h-4 text-[#3A5243]" strokeWidth={1} />
                      <span className="eyebrow text-[#3A5243]/70">Princípio</span>
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl lg:text-[2.25rem] font-light text-[#0F2A1D] leading-[1.1] mb-5">
                      {item.name}
                    </h3>
                    <span className={`w-12 h-px bg-[#D9C89E] block mb-5 ${isLeft ? "" : "ml-auto"}`} />
                    <p className="text-base md:text-lg text-[#0F2A1D]/70 leading-[1.85] font-light max-w-[52ch] inline-block">
                      {item.benefit}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <Reveal>
          <div className="mt-28 md:mt-36 max-w-3xl mx-auto text-center px-8 py-12 md:p-14 border border-[#3A5243]/20 gold-foil relative">
            <span className="eyebrow text-[#3A5243] block mb-6">Nota Científica</span>
            <p className="font-display italic text-xl md:text-2xl text-[#0F2A1D] leading-snug mb-5 font-light">
              {COPY.ingredients.scienceNote}
            </p>
            <span className="hairline-gold w-16 mx-auto block my-6" />
            <p className="text-xs md:text-sm text-[#3A5243] leading-[1.85] font-light">
              {COPY.ingredients.scienceFooter}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
