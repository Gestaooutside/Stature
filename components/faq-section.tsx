"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"
import { Reveal } from "./reveal"
import type { FAQItem } from "@/lib/types"
import { MagneticButton } from "./ui/magnetic-button"

const faqs: FAQItem[] = [
  {
    id: "1",
    question: "Quanto tempo até sentir os primeiros resultados?",
    answer: "A maioria dos usuários relata melhorias perceptíveis já nas primeiras duas semanas. No controle da ansiedade, muitos notam mudanças nos primeiros dias. Para resultados completos e duradouros, recomendamos uso contínuo por 30-90 dias.",
  },
  {
    id: "2",
    question: "Posso tomar com outros medicamentos?",
    answer: "DUO NATURAL é composto 100% por ingredientes naturais, mas sempre recomendamos consultar seu médico antes de combinar com medicamentos controlados, especialmente antidepressivos, ansiolíticos ou indutores do sono.",
  },
  {
    id: "3",
    question: "Causa dependência ou efeitos colaterais?",
    answer: "Não. Diferente de medicamentos controlados, DUO NATURAL não causa dependência química. Os ingredientes naturais atuam reequilibrando seu organismo gradualmente, sem criar necessidade de aumento de dose ou sintomas de abstinência.",
  },
  {
    id: "4",
    question: "Preciso de receita médica?",
    answer: "Não é necessário. DUO NATURAL é classificado como suplemento natural e não requer prescrição. No entanto, se você faz tratamento psiquiátrico ou toma medicações controladas, consulte seu médico antes.",
  },
  {
    id: "5",
    question: "Como devo tomar? Existe dosagem ideal?",
    answer: "O ritual é simples e poderoso: pela manhã, tome 2 cápsulas da Fórmula DIA com água para começar o dia com clareza mental. À noite, 30 minutos após escovar os dentes, aplique 2 a 5 gotas da Fórmula NOITE debaixo da língua e deixe absorver. Essa rotina diária cria o ciclo perfeito para transformar seu bem-estar.",
  },
  {
    id: "6",
    question: "Qual a diferença para remédios de tarja preta?",
    answer: "Remédios controlados suprimem sintomas rapidamente mas podem causar dependência, efeitos colaterais e perda de eficácia com o tempo. DUO NATURAL trata a raiz do problema, reequilibrando neurotransmissores naturalmente, sem risco de dependência.",
  },
  {
    id: "7",
    question: "Funciona para qualquer tipo de ansiedade?",
    answer: "DUO NATURAL é eficaz para ansiedade generalizada, ansiedade social, estresse crônico e compulsão alimentar de origem emocional. Para transtornos de pânico ou ansiedade severa, recomendamos acompanhamento médico complementar.",
  },
  {
    id: "8",
    question: "Posso parar de tomar quando melhorar?",
    answer: "Sim. Como não há dependência química, você pode interromper o uso a qualquer momento. No entanto, para manter os resultados a longo prazo, muitos usuários optam por ciclos contínuos de 2-3 meses.",
  },
]

interface FAQSectionProps {
  onOpenPaymentModal?: () => void
}

export function FAQSection({ onOpenPaymentModal }: FAQSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  // Divide FAQs em 2 colunas balanceadas para melhor uso do espaço
  const leftColumnFaqs = faqs.slice(0, 4) // Perguntas 1-4
  const rightColumnFaqs = faqs.slice(4, 8) // Perguntas 5-8

  // FAQ Schema para SEO
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <section id="faq" className="py-16 md:py-24 lg:py-32 bg-white">
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-12 md:mb-14 lg:mb-16 xl:mb-20 px-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-neutral-900 mb-4 md:mb-5 lg:mb-6 tracking-tight">
              Dúvidas <span className="italic font-normal">frequentes</span>
            </h2>
            <p className="text-base md:text-lg text-neutral-600 leading-relaxed">
              Respostas para as perguntas mais comuns sobre DUO NATURAL
            </p>
          </div>
        </Reveal>

        {/* FAQ Items - Layout 2 colunas no desktop, coluna única no mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
          {/* Coluna Esquerda */}
          <div className="space-y-3 md:space-y-4">
            {leftColumnFaqs.map((faq, index) => (
              <Reveal key={faq.id} delay={index * 0.05}>
                <motion.div
                  className="border border-neutral-200 rounded-2xl overflow-hidden bg-white hover:border-[#a89a8d]/40 transition-colors duration-300"
                  initial={false}
                >
                  {/* Question Button - Removido MagneticButton para melhor UX em accordions */}
                  <button
                    className="w-full px-4 md:px-5 lg:px-6 xl:px-8 py-4 md:py-5 lg:py-6 flex items-center justify-between gap-3 md:gap-4 text-left group"
                    onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  >
                    <span className="text-sm md:text-base lg:text-lg font-medium text-neutral-900 group-hover:text-[#a89a8d] transition-colors duration-300">
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: openId === faq.id ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                      className="flex-shrink-0"
                    >
                      {openId === faq.id ? (
                        <Minus className="w-4 h-4 md:w-5 md:h-5 text-[#a89a8d]" />
                      ) : (
                        <Plus className="w-4 h-4 md:w-5 md:h-5 text-neutral-400 group-hover:text-[#a89a8d] transition-colors duration-300" />
                      )}
                    </motion.div>
                  </button>

                  {/* Answer */}
                  <AnimatePresence initial={false}>
                    {openId === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 md:px-5 lg:px-6 xl:px-8 pb-4 md:pb-5 lg:pb-6">
                          <div className="pt-3 md:pt-4 border-t border-neutral-100">
                            <p className="text-sm md:text-base text-neutral-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* Coluna Direita */}
          <div className="space-y-3 md:space-y-4">
            {rightColumnFaqs.map((faq, index) => (
              <Reveal key={faq.id} delay={index * 0.05}>
                <motion.div
                  className="border border-neutral-200 rounded-2xl overflow-hidden bg-white hover:border-[#a89a8d]/40 transition-colors duration-300"
                  initial={false}
                >
                  {/* Question Button - Removido MagneticButton para melhor UX em accordions */}
                  <button
                    className="w-full px-4 md:px-5 lg:px-6 xl:px-8 py-4 md:py-5 lg:py-6 flex items-center justify-between gap-3 md:gap-4 text-left group"
                    onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  >
                    <span className="text-sm md:text-base lg:text-lg font-medium text-neutral-900 group-hover:text-[#a89a8d] transition-colors duration-300">
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: openId === faq.id ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                      className="flex-shrink-0"
                    >
                      {openId === faq.id ? (
                        <Minus className="w-4 h-4 md:w-5 md:h-5 text-[#a89a8d]" />
                      ) : (
                        <Plus className="w-4 h-4 md:w-5 md:h-5 text-neutral-400 group-hover:text-[#a89a8d] transition-colors duration-300" />
                      )}
                    </motion.div>
                  </button>

                  {/* Answer */}
                  <AnimatePresence initial={false}>
                    {openId === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 md:px-5 lg:px-6 xl:px-8 pb-4 md:pb-5 lg:pb-6">
                          <div className="pt-3 md:pt-4 border-t border-neutral-100">
                            <p className="text-sm md:text-base text-neutral-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Reveal>
          <div className="text-center mt-10 md:mt-12 lg:mt-16 px-4">
            <p className="text-sm md:text-base text-neutral-600 mb-4 md:mb-6">E agora, pronto para continuar?</p>
            <MagneticButton distance={0.6}>
              <motion.button
                onClick={onOpenPaymentModal}
                className="inline-block px-6 py-3 md:px-8 md:py-4 rounded-full border-2 border-[#a89a8d] text-[#a89a8d] font-medium text-sm md:text-base hover:bg-[#a89a8d] hover:text-white transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Fazer meu pedido
              </motion.button>
            </MagneticButton>
          </div>
        </Reveal>
      </div>

      {/* FAQ Schema Markup para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  )
}
