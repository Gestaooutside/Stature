"use client"

import { useEffect, useRef } from "react"
import { animate, motion, useInView, useReducedMotion } from "framer-motion"
import { CREDENTIALS } from "@/lib/config/brand"

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

function splitNumeric(value: string): {
  prefix: string
  number: number | null
  suffix: string
} {
  const match = value.match(/^([^\d]*)(\d+)(.*)$/)
  if (!match) return { prefix: value, number: null, suffix: "" }
  return { prefix: match[1], number: parseInt(match[2], 10), suffix: match[3] }
}

function AnimatedStat({ value, inView }: { value: string; inView: boolean }) {
  const { prefix, number, suffix } = splitNumeric(value)
  const numberRef = useRef<HTMLSpanElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!inView || number === null) return
    const el = numberRef.current
    if (!el) return
    if (prefersReducedMotion) {
      el.textContent = String(number)
      return
    }
    const controls = animate(0, number, {
      duration: 1.2,
      ease: EASE,
      onUpdate(latest) {
        el.textContent = String(Math.floor(latest))
      },
    })
    return () => controls.stop()
  }, [inView, number, prefersReducedMotion])

  if (number === null) {
    return <span>{value}</span>
  }

  return (
    <>
      {prefix}
      <span ref={numberRef}>0</span>
      {suffix}
    </>
  )
}

export function CredentialsStrip() {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: "-80px" })

  return (
    <section
      ref={sectionRef}
      aria-label="Credenciais"
      className="relative py-20 md:py-24 overflow-hidden"
      style={{ background: "#0F2A1D" }}
    >
      <span className="hairline-gold absolute top-0 left-0 right-0" />
      <div
        aria-hidden="true"
        className="absolute inset-0 grain-texture pointer-events-none opacity-40"
      />

      <div className="container-custom relative">
        <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-16">
          <div className="lg:w-40 shrink-0">
            <span className="font-mono-label uppercase text-[#D9C89E]/80">
              Autoridade clínica
            </span>
          </div>

          <motion.div
            className="flex-1 grid grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08, delayChildren: 0.1 },
              },
            }}
          >
            {CREDENTIALS.map((c, i) => (
              <motion.div
                key={c.id}
                className={`flex flex-col items-start py-6 lg:py-2 px-0 lg:px-8 ${
                  i > 0 ? "lg:border-l lg:border-[#3A5243]/55" : ""
                }`}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: EASE } },
                }}
              >
                <div className="font-mono-stat text-[#EDE4D0] text-[clamp(2.5rem,5vw,4rem)]">
                  <AnimatedStat value={c.value} inView={inView} />
                </div>
                <div className="font-display italic font-light text-sm md:text-base text-[#EDE4D0]/70 mt-3 leading-[1.45] max-w-[26ch]">
                  {c.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <span className="hairline-gold absolute bottom-0 left-0 right-0" />
    </section>
  )
}
