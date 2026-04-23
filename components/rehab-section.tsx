"use client"

import { motion } from "framer-motion"
import { Reveal } from "./reveal"
import { rehabMilestones } from "@/data/rehab-milestones"
import { COPY } from "@/lib/config/brand"

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

export function RehabSection() {
  return (
    <section
      id="recuperacao"
      className="relative py-32 md:py-40 lg:py-48"
      style={{ background: "#F5EFE4" }}
    >
      <span className="hairline-gold absolute top-0 left-0 right-0" />

      <div className="container-custom max-w-6xl">
        <Reveal>
          <div className="text-center mb-20 md:mb-24 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-5 mb-10">
              <span className="eyebrow text-[#3A5243]">{COPY.rehab.badge}</span>
              <span className="font-display italic text-[#D9C89E]/80 text-sm">Cap. 05</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-8 tracking-[-0.02em] text-[#0F2A1D] leading-[1.02]">
              {COPY.rehab.title} <span className="italic">{COPY.rehab.titleItalic}</span>
            </h2>
            <span className="hairline-gold w-24 mx-auto block mb-10" />
            <p className="text-base md:text-lg text-[#0F2A1D]/75 leading-[1.85] font-light">
              {COPY.rehab.description}
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-6 border-t border-[#3A5243]/20">
          {rehabMilestones.map((m, i) => {
            const Icon = m.icon
            return (
              <motion.div
                key={m.id}
                className="relative flex flex-col pt-10 md:pt-12 px-4 md:px-6 md:border-r md:last:border-r-0 border-[#3A5243]/15"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1, delay: i * 0.12, ease: EASE }}
              >
                <span className="font-display italic text-[#D9C89E] text-sm mb-4">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <Icon className="w-7 h-7 text-[#3A5243] mb-5" strokeWidth={1} />

                <div className="eyebrow text-[#3A5243]/70 mb-3">{m.when}</div>

                <h3 className="font-display text-xl md:text-2xl font-light text-[#0F2A1D] leading-tight mb-4">
                  {m.title}
                </h3>

                <span className="hairline-gold w-10 block mb-5" />

                <p className="text-sm md:text-[15px] text-[#0F2A1D]/70 leading-[1.75] font-light">
                  {m.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
