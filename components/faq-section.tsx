"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus, MessageCircle } from "lucide-react"
import { Reveal } from "./reveal"
import { faqItems } from "@/data/faq"
import { COPY, COLORS, CONTACT } from "@/lib/config/brand"

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null)

  const half = Math.ceil(faqItems.length / 2)
  const leftColumn = faqItems.slice(0, half)
  const rightColumn = faqItems.slice(half)

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }

  const renderFaqItem = (faq: (typeof faqItems)[number], index: number) => (
    <Reveal key={faq.id} delay={index * 0.04}>
      <motion.div
        className="border rounded-2xl overflow-hidden bg-white transition-colors duration-300"
        style={{ borderColor: `${COLORS.accent}60` }}
      >
        <button
          className="w-full px-4 md:px-5 lg:px-6 py-4 md:py-5 flex items-center justify-between gap-3 text-left group"
          onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
          aria-expanded={openId === faq.id}
        >
          <span
            className="text-sm md:text-base font-medium transition-colors duration-300"
            style={{
              color: openId === faq.id ? COLORS.primary : COLORS.primaryDark,
            }}
          >
            {faq.question}
          </span>
          <motion.div
            animate={{ rotate: openId === faq.id ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0"
          >
            {openId === faq.id ? (
              <Minus className="w-4 h-4 md:w-5 md:h-5" style={{ color: COLORS.primary }} />
            ) : (
              <Plus
                className="w-4 h-4 md:w-5 md:h-5 text-neutral-400 group-hover:text-[color:var(--brand-primary)] transition-colors duration-300"
                style={{ ["--brand-primary" as any]: COLORS.primary }}
              />
            )}
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {openId === faq.id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="overflow-hidden"
            >
              <div className="px-4 md:px-5 lg:px-6 pb-4 md:pb-5">
                <div
                  className="pt-3 md:pt-4 border-t"
                  style={{ borderColor: `${COLORS.accent}30` }}
                >
                  <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Reveal>
  )

  return (
    <section id="faq" className="py-16 md:py-24 lg:py-32 bg-white">
      <div className="container-custom max-w-7xl">
        <Reveal>
          <div className="text-center mb-12 md:mb-14 lg:mb-16 px-4">
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
                FAQ
              </span>
            </div>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-light mb-4 md:mb-5 tracking-tight"
              style={{ color: COLORS.primaryDark }}
            >
              {COPY.faq.titlePrefix}{" "}
              <span className="italic font-normal">{COPY.faq.titleItalic}</span>
            </h2>
            <p className="text-base md:text-lg text-neutral-600 leading-relaxed">
              {COPY.faq.description}
            </p>
          </div>
        </Reveal>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
          <div className="space-y-3 md:space-y-4">
            {leftColumn.map((faq, i) => renderFaqItem(faq, i))}
          </div>
          <div className="space-y-3 md:space-y-4">
            {rightColumn.map((faq, i) => renderFaqItem(faq, i))}
          </div>
        </div>

        {/* CTA final */}
        <Reveal>
          <div className="text-center mt-12 md:mt-14 lg:mt-16 px-4">
            <p className="text-sm md:text-base text-neutral-600 mb-5 md:mb-6">
              {COPY.faq.ctaQuestion}
            </p>
            <motion.a
              href={CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white text-sm md:text-base font-medium shadow-lg transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
              }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
              {COPY.faq.cta}
            </motion.a>
          </div>
        </Reveal>
      </div>

      {/* Schema SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  )
}
