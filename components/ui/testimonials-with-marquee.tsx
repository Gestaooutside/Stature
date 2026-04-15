"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"
import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card"
import { useInView } from "@/hooks/use-in-view"

interface TestimonialsSectionProps {
  title: string
  description: string
  testimonials: Array<{
    author: TestimonialAuthor
    text: string
    href?: string
  }>
  className?: string
}

export function TestimonialsSection({
  title,
  description,
  testimonials,
  className,
}: TestimonialsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { threshold: 0.15, rootMargin: "80px" })

  return (
    <section
      ref={sectionRef}
      className={cn(
        "py-28 md:py-36 lg:py-44 relative overflow-hidden",
        className,
      )}
      style={{
        background: "linear-gradient(180deg, #081A12 0%, #0F2A1D 50%, #081A12 100%)",
      }}
    >
      <div className="absolute inset-0 grain-texture opacity-30 pointer-events-none" />

      <div className="mx-auto flex max-w-7xl flex-col items-center text-center relative">
        <div className="text-center mb-16 md:mb-20 px-6 max-w-3xl">
          <span className="eyebrow text-[#D9C89E]">Testemunhos</span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-[#EDE4D0] mt-5 mb-6 tracking-[-0.01em] leading-[1.02]">
            {title}
          </h2>
          <span className="hairline-gold w-24 mx-auto block mb-8" />
          <p className="text-base md:text-lg text-[#EDE4D0]/70 max-w-2xl mx-auto leading-[1.8] font-light">
            {description}
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex overflow-hidden [--gap:2rem] flex-row [--duration:90s]">
            {[1, 2, 3, 4, 5, 6].map((group) => (
              <div
                key={group}
                className={cn(
                  "flex shrink-0 [gap:var(--gap)] flex-row",
                  "group-hover:[animation-play-state:paused]",
                  isInView && "animate-marquee",
                )}
              >
                {testimonials.map((testimonial, i) => (
                  <TestimonialCard key={`g${group}-${i}`} {...testimonial} />
                ))}
              </div>
            ))}
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/4 sm:block"
            style={{ background: "linear-gradient(to right, #081A12, transparent)" }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/4 sm:block"
            style={{ background: "linear-gradient(to left, #081A12, transparent)" }}
          />
        </div>
      </div>
    </section>
  )
}
