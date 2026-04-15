"use client"

import { motion } from "framer-motion"
import { Reveal } from "./reveal"
import { trustItems } from "@/data/trust-items"

const ROMAN = ["I", "II", "III", "IV", "V", "VI"]
const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

export function TrustBar() {
  return (
    <section className="relative py-24 md:py-32 lg:py-40" style={{ background: "#F5EFE4" }}>
      <span className="hairline-gold absolute top-0 left-0 right-0" />

      <div className="container-custom">
        <Reveal>
          <div className="text-center mb-20 md:mb-28">
            <span className="eyebrow text-[#3A5243]">In Confidence</span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light mt-8 text-[#0F2A1D] tracking-[-0.01em] leading-[1.05]">
              Uma prática, <span className="italic">quatro pilares.</span>
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-16 gap-x-8 md:gap-x-12">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="text-center flex flex-col items-center px-2"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: index * 0.15, ease: EASE }}
            >
              <span className="font-display italic text-2xl md:text-3xl text-[#D9C89E] font-light mb-5">
                {ROMAN[index]}
              </span>
              <motion.span
                className="w-10 h-px bg-[#D9C89E] mb-6 origin-center"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, delay: index * 0.15 + 0.2, ease: EASE }}
              />
              <div className="font-display text-xl md:text-2xl lg:text-[1.75rem] font-light text-[#0F2A1D] leading-tight mb-3">
                {item.title}
              </div>
              <div className="eyebrow text-[#3A5243]/75">{item.subtitle}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
