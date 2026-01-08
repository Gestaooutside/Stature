// Seção de testimonials com efeito marquee infinito
// Duplica automaticamente os cards para criar loop contínuo
// Animação inicia apenas quando seção está visível (economia de recursos)

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

/**
 * Seção de testimonials com animação marquee horizontal
 * Duplica cards 4x para garantir loop suave e contínuo
 * Animação controlada por visibilidade (Intersection Observer)
 */
export function TestimonialsSection({
  title,
  description,
  testimonials,
  className
}: TestimonialsSectionProps) {
  // Ref para detectar visibilidade da seção
  const sectionRef = useRef<HTMLDivElement>(null)

  // Hook que detecta quando seção está 20% visível no viewport
  const isInView = useInView(sectionRef, {
    threshold: 0.2,      // Trigger quando 20% visível
    rootMargin: "50px"   // Começa 50px antes de entrar na view
  })

  return (
    <section
      ref={sectionRef}
      className={cn(
      "bg-background text-foreground",
      "py-12 sm:py-24 md:py-32 px-0",
      className
    )}>
      <div className="mx-auto flex max-w-container flex-col items-center text-center">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20 px-4">
          <div className="inline-block px-8 py-3 rounded-full bg-[#a89a8d]/10 border border-[#a89a8d]/20 mb-8">
            <span className="text-base font-semibold text-neutral-700 uppercase tracking-wider">
              +10.000 vidas transformadas
            </span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-light text-neutral-900 mb-8 tracking-tight leading-[1.1]">
            {title}
          </h2>
          <p className="text-xl lg:text-2xl text-neutral-600 max-w-3xl mx-auto leading-relaxed font-light">
            {description}
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex overflow-hidden p-2 [--gap:2rem] flex-row [--duration:55s]">
            {/* Grupo 1 - Animação inicia quando visível */}
            <div
              className={cn(
                "flex shrink-0 [gap:var(--gap)] flex-row",
                "group-hover:[animation-play-state:paused]",
                isInView && "animate-marquee"
              )}
            >
              {testimonials.map((testimonial, i) => (
                <TestimonialCard key={`group1-${i}`} {...testimonial} />
              ))}
            </div>
            {/* Grupo 2 */}
            <div
              className={cn(
                "flex shrink-0 [gap:var(--gap)] flex-row",
                "group-hover:[animation-play-state:paused]",
                isInView && "animate-marquee"
              )}
            >
              {testimonials.map((testimonial, i) => (
                <TestimonialCard key={`group2-${i}`} {...testimonial} />
              ))}
            </div>
            {/* Grupo 3 */}
            <div
              className={cn(
                "flex shrink-0 [gap:var(--gap)] flex-row",
                "group-hover:[animation-play-state:paused]",
                isInView && "animate-marquee"
              )}
            >
              {testimonials.map((testimonial, i) => (
                <TestimonialCard key={`group3-${i}`} {...testimonial} />
              ))}
            </div>
            {/* Grupo 4 */}
            <div
              className={cn(
                "flex shrink-0 [gap:var(--gap)] flex-row",
                "group-hover:[animation-play-state:paused]",
                isInView && "animate-marquee"
              )}
            >
              {testimonials.map((testimonial, i) => (
                <TestimonialCard key={`group4-${i}`} {...testimonial} />
              ))}
            </div>
            {/* Grupo 5 */}
            <div
              className={cn(
                "flex shrink-0 [gap:var(--gap)] flex-row",
                "group-hover:[animation-play-state:paused]",
                isInView && "animate-marquee"
              )}
            >
              {testimonials.map((testimonial, i) => (
                <TestimonialCard key={`group5-${i}`} {...testimonial} />
              ))}
            </div>
            {/* Grupo 6 */}
            <div
              className={cn(
                "flex shrink-0 [gap:var(--gap)] flex-row",
                "group-hover:[animation-play-state:paused]",
                isInView && "animate-marquee"
              )}
            >
              {testimonials.map((testimonial, i) => (
                <TestimonialCard key={`group6-${i}`} {...testimonial} />
              ))}
            </div>
          </div>

          {/* Gradientes de fade nas bordas para efeito premium */}
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-background sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-background sm:block" />
        </div>
      </div>
    </section>
  )
}
