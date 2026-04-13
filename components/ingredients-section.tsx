"use client"

import { motion } from "framer-motion"
import { Reveal } from "./reveal"
import { differentials } from "@/data/differentials"
import { COLORS, COPY } from "@/lib/config/brand"

export function IngredientsSection() {
  return (
    <section id="tecnica" className="py-20 md:py-24 lg:py-32 bg-white">
      <div className="container-custom max-w-6xl">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-14 md:mb-16 lg:mb-20">
            <div
              className="inline-block px-5 py-2 rounded-full border mb-5"
              style={{
                backgroundColor: `${COLORS.surface}`,
                borderColor: `${COLORS.accent}80`,
              }}
            >
              <span
                className="text-xs md:text-sm font-semibold uppercase tracking-wider"
                style={{ color: COLORS.primaryDark }}
              >
                Técnica & Diferenciais
              </span>
            </div>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-light mb-5 tracking-tight"
              style={{ color: COLORS.primaryDark }}
            >
              {COPY.ingredients.title}{" "}
              <span className="italic font-normal">{COPY.ingredients.titleItalic}</span>
            </h2>
            <p className="text-base md:text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              {COPY.ingredients.description}
            </p>
          </div>
        </Reveal>

        {/* Grid de diferenciais */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {differentials.map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                }}
                whileHover={{ y: -4 }}
                className="p-6 md:p-7 rounded-2xl border-2 bg-white transition-all duration-500 group"
                style={{ borderColor: `${COLORS.accent}50` }}
              >
                <div className="flex items-start gap-4 mb-3">
                  <div
                    className="p-3 rounded-full flex-shrink-0 transition-colors duration-300"
                    style={{ backgroundColor: `${COLORS.accent}30` }}
                  >
                    <Icon
                      className="w-6 h-6 md:w-7 md:h-7"
                      style={{ color: COLORS.primary }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-base md:text-lg font-medium transition-colors duration-300"
                      style={{ color: COLORS.primaryDark }}
                    >
                      {item.name}
                    </h3>
                  </div>
                </div>
                <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
                  {item.benefit}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Nota científica */}
        <Reveal>
          <div className="mt-14 md:mt-16 lg:mt-20 text-center">
            <div
              className="inline-block p-6 md:p-7 rounded-2xl border max-w-3xl"
              style={{
                background: `linear-gradient(135deg, ${COLORS.surface} 0%, ${COLORS.accent}20 100%)`,
                borderColor: `${COLORS.accent}80`,
              }}
            >
              <p
                className="text-sm md:text-base font-semibold mb-2 leading-relaxed"
                style={{ color: COLORS.primaryDark }}
              >
                {COPY.ingredients.scienceNote}
              </p>
              <p className="text-xs md:text-sm text-neutral-600">
                {COPY.ingredients.scienceFooter}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
