"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"
import { Reveal } from "./reveal"
import { faqItems } from "@/data/faq"
import { COPY, CONTACT } from "@/lib/config/brand"

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null)

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }

  return (
    <section id="faq" className="relative py-32 md:py-40 lg:py-56" style={{ background: "#F5EFE4" }}>
      <span className="hairline-gold absolute bottom-0 left-0 right-0" />

      <div className="container-custom max-w-5xl">
        <Reveal>
          <div className="text-center mb-20 md:mb-24 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-5 mb-10">
              <span className="eyebrow text-[#3A5243]">FAQ</span>
              <span className="font-display italic text-[#D9C89E]/80 text-sm">Cap. 05</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-8 tracking-[-0.02em] text-[#0F2A1D] leading-[1.02]">
              {COPY.faq.titlePrefix} <span className="italic">{COPY.faq.titleItalic}</span>
            </h2>
            <span className="hairline-gold w-24 mx-auto block mb-10" />
            <p className="text-base md:text-lg text-[#0F2A1D]/75 leading-[1.85] font-light">
              {COPY.faq.description}
            </p>
          </div>
        </Reveal>

        <div className="border-t border-[#3A5243]/20">
          {faqItems.map((faq, i) => {
            const isOpen = openId === faq.id
            return (
              <Reveal key={faq.id} delay={i * 0.04}>
                <div className="border-b border-[#3A5243]/20">
                  <button
                    className="relative w-full py-8 md:py-9 flex items-start justify-between gap-8 text-left group pl-8 md:pl-10"
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                  >
                    {/* Vertical gold bar */}
                    <motion.span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] bg-[#D9C89E]"
                      animate={{ height: isOpen ? "calc(100% - 2rem)" : "24px" }}
                      transition={{ duration: 0.7, ease: EASE }}
                    />

                    <span
                      className={`font-display text-lg md:text-xl lg:text-[1.5rem] font-light leading-snug transition-[color,padding] duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] flex-1 ${
                        isOpen ? "text-[#0F2A1D] md:pl-4" : "text-[#0F2A1D]/85 group-hover:text-[#0F2A1D]"
                      }`}
                    >
                      {faq.question}
                    </span>

                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.6, ease: EASE }}
                      className="flex-shrink-0 mt-1"
                    >
                      {isOpen ? (
                        <Minus className="w-5 h-5 text-[#D9C89E]" strokeWidth={1} />
                      ) : (
                        <Plus
                          className="w-5 h-5 text-[#3A5243] group-hover:text-[#D9C89E] transition-colors duration-500"
                          strokeWidth={1}
                        />
                      )}
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.7, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="pb-9 pl-8 md:pl-14 pr-12">
                          <p className="text-base md:text-lg text-[#0F2A1D]/70 leading-[1.85] font-light max-w-3xl">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal>
          <div className="text-center mt-20 md:mt-24">
            <p className="eyebrow text-[#3A5243] mb-8">{COPY.faq.ctaQuestion}</p>
            <a
              href={CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow inline-block px-10 py-5 border border-[#0F2A1D] text-[#0F2A1D] hover:bg-[#0F2A1D] hover:text-[#D9C89E] transition-all duration-700 ease-luxe"
            >
              {COPY.faq.cta}
            </a>
          </div>
        </Reveal>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </section>
  )
}
