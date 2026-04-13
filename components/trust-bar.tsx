"use client"

import { motion } from "framer-motion"
import { Reveal } from "./reveal"
import { trustItems } from "@/data/trust-items"
import { COLORS } from "@/lib/config/brand"

export function TrustBar() {
  return (
    <section
      className="py-12 md:py-16 lg:py-20 border-y"
      style={{
        backgroundColor: `${COLORS.surface}`,
        borderColor: `${COLORS.accent}60`,
      }}
    >
      <div className="container-custom">
        <Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-12">
            {trustItems.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.id}
                  className="text-center flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                >
                  <div
                    className="p-4 rounded-full mb-3"
                    style={{ backgroundColor: `${COLORS.accent}40` }}
                  >
                    <Icon
                      className="w-6 h-6 md:w-7 md:h-7"
                      style={{ color: COLORS.primary }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div
                    className="text-sm md:text-base font-semibold mb-1 leading-tight"
                    style={{ color: COLORS.primaryDark }}
                  >
                    {item.title}
                  </div>
                  <div className="text-xs md:text-sm text-neutral-600 font-medium">
                    {item.subtitle}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
