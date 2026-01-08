"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import { Reveal } from "./reveal"
import type { Testimonial } from "@/lib/types"
import { MagneticButton } from "./ui/magnetic-button"

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Larissa",
    age: 29,
    city: "São Paulo",
    quote: "Nunca mais ataquei a geladeira à noite. Sinto muito mais controle sobre minhas escolhas.",
    problem: "Compulsão alimentar noturna e ansiedade diurna",
    result: "Controle total em 3 semanas. Perdi 6kg sem fazer dieta restritiva.",
    rating: 5,
  },
  {
    id: "2",
    name: "Robson",
    age: 34,
    city: "Rio de Janeiro",
    quote: "Tomei por 15 dias e já durmo melhor. Acordo com mais disposição e sem aquele peso de culpa.",
    problem: "Insônia crônica e falta de disposição matinal",
    result: "Sono profundo desde a primeira semana. Produtividade triplicou.",
    rating: 5,
  },
  {
    id: "3",
    name: "Cláudia",
    age: 42,
    city: "Belo Horizonte",
    quote: "Foi o fim da ansiedade que me fazia comer sem perceber. Me sinto no comando novamente.",
    problem: "Ansiedade generalizada e compulsão alimentar inconsciente",
    result: "Ansiedade controlada, voltei a me reconhecer no espelho.",
    rating: 5,
  },
  {
    id: "4",
    name: "Fernando",
    age: 38,
    city: "Curitiba",
    quote: "Trabalho sob pressão todos os dias. DUO Natural me devolveu o equilíbrio que eu achava impossível.",
    problem: "Estresse profissional alto e ataques de ansiedade",
    result: "Clareza mental mesmo em situações de pressão extrema.",
    rating: 5,
  },
  {
    id: "5",
    name: "Juliana",
    age: 31,
    city: "Porto Alegre",
    quote: "Tentei tudo: terapia, dietas, apps de meditação. DUO foi o único que realmente funcionou.",
    problem: "Tentativas frustradas com outros métodos",
    result: "Finalmente uma solução que entrega o que promete.",
    rating: 5,
  },
  {
    id: "6",
    name: "Ricardo",
    age: 45,
    city: "Brasília",
    quote: "Parei de depender de remédios para dormir. Meu corpo voltou a funcionar naturalmente.",
    problem: "Dependência de medicamentos para dormir",
    result: "Sono natural sem química. Zero efeitos colaterais.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  // Estados para controlar animação circular
  const [translateX, setTranslateX] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // Constantes da animação
  const SPEED = 67.78 // pixels por segundo (2440px em 36s)
  const RESET_POINT = -2440 // largura de 1 conjunto completo (6 cards + gaps)

  // Animação circular contínua com requestAnimationFrame
  useEffect(() => {
    const animate = (currentTime: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime
      }

      const deltaTime = (currentTime - lastTimeRef.current) / 1000
      lastTimeRef.current = currentTime

      if (!isPaused) {
        setTranslateX((prev) => {
          const newX = prev - SPEED * deltaTime
          // Quando atinge o ponto de reset, volta para 0 (reset invisível)
          return newX <= RESET_POINT ? 0 : newX
        })
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPaused])

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-[#dad7ce]/20 via-white to-[#dad7ce]/10">
      <div className="container-custom">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-12 md:mb-16 lg:mb-20 xl:mb-24 px-4">
            <div className="inline-block px-4 py-1.5 md:px-6 md:py-2 rounded-full bg-[#a89a8d]/10 border border-[#a89a8d]/20 mb-4 md:mb-6">
              <span className="text-xs md:text-sm font-medium text-neutral-700 uppercase tracking-wider">
                +10.000 vidas transformadas
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-neutral-900 mb-4 md:mb-5 lg:mb-6 tracking-tight">
              Quem experimentou, <span className="italic font-normal">não volta atrás</span>
            </h2>
            <p className="text-base md:text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Histórias reais de pessoas que recuperaram o controle sobre ansiedade, compulsão e sono.
            </p>
          </div>
        </Reveal>

        {/* Testimonials Infinite Scroll */}
        <div className="relative group">
          {/* Fade gradients nas bordas */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#dad7ce]/20 via-[#dad7ce]/10 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#dad7ce]/20 via-[#dad7ce]/10 to-transparent z-10 pointer-events-none" />

          {/* Container com overflow hidden */}
          <div className="overflow-hidden">
            {/* Flex container com animação JavaScript circular - movimento contínuo sem reset visível */}
            <div
              className="flex gap-8"
              style={{
                transform: `translateX(${translateX}px)`,
                willChange: 'transform'
              }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Renderiza cards 2x - quando animação chega em -2440px, conjunto 2 está na posição exata do conjunto 1 inicial */}
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <motion.div
                  key={`${testimonial.id}-${index}`}
                  className="relative p-8 rounded-2xl bg-white border border-neutral-200 hover:border-[#a89a8d]/40 transition-all duration-500 group/card flex-shrink-0 w-[380px] flex flex-col"
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                >
                  {/* Quote Icon */}
                  <div className="absolute top-6 right-6 opacity-10 group-hover/card:opacity-20 transition-opacity duration-500">
                    <Quote className="w-12 h-12 text-[#a89a8d]" strokeWidth={1.5} />
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#a89a8d] text-[#a89a8d]" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-neutral-700 leading-relaxed mb-6 flex-grow italic">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Problem & Result */}
                  <div className="space-y-3 mb-6 text-sm">
                    <div>
                      <span className="font-medium text-neutral-900">Antes: </span>
                      <span className="text-neutral-600">{testimonial.problem}</span>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-900">Depois: </span>
                      <span className="text-neutral-600">{testimonial.result}</span>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="pt-4 border-t border-neutral-200">
                    <div className="font-medium text-neutral-900">{testimonial.name}, {testimonial.age} anos</div>
                    <div className="text-sm text-neutral-500">{testimonial.city}</div>
                  </div>

                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r from-[#a89a8d] to-[#b8a592] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <Reveal>
          <div className="text-center mt-16 lg:mt-20">
            <p className="text-neutral-600 mb-6">
              Junte-se a milhares de pessoas que já transformaram suas vidas
            </p>
            <MagneticButton distance={0.6}>
              <motion.a
                href="#featured-products"
                className="inline-block px-8 py-4 rounded-full bg-[#a89a8d] text-white font-medium hover:bg-[#8d7f72] transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Experimentar DUO NATURAL
              </motion.a>
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
